
import { Project, System, HourlySimResult, Activity } from '../types';
import { DISTRICTS_CLIMATE } from '../constants';

const CP_WATER = 1.163; // Wh/kg·K (ou L·K)

export function runSimulation(project: Project, system: System): HourlySimResult[] {
  const results: HourlySimResult[] = [];
  const climate = project.customClimate || DISTRICTS_CLIMATE[project.district] || DISTRICTS_CLIMATE['Lisboa'];
  
  let currentTankTemp = 45; 
  const isInstantaneous = system.hasStorage === false;
  const tankMass = isInstantaneous ? 1 : (system.storage.volume || 1); 
  
  for (let h = 0; h < 8760; h++) {
    const dayOfYear = Math.floor(h / 24);
    const month = Math.floor(dayOfYear / 30.42);
    const hourOfDay = h % 24;
    const dayOfWeek = dayOfYear % 7; 
    
    const ambientData = climate[Math.min(month, 11)];
    const t_ambient = ambientData.temp;
    const t_cold_water = 15;

    // 1. Cálculo da Demanda Terminal
    let hourlyDemand_L = 0;
    let weightedTempSum = 0;
    project.activities.forEach(act => {
      const isDayActive = act.activeDays?.includes(dayOfWeek) ?? true;
      if (isDayActive && act.hours.includes(hourOfDay)) {
        const hVol = act.volume / (act.hours.length || 1);
        hourlyDemand_L += hVol;
        weightedTempSum += hVol * act.tempRequired;
      }
    });
    
    const t_required = hourlyDemand_L > 0 ? weightedTempSum / hourlyDemand_L : 0;
    
    let q_solar_kWh = 0;
    let elec_cons = 0;
    let gas_cons = 0;
    let t_delivered_eff = t_cold_water;
    let q_input_total_kWh = 0;

    if (isInstantaneous) {
      // --- LÓGICA PARA SISTEMA INSTANTÂNEO ---
      if (hourlyDemand_L > 0) {
        // Energia necessária para atingir o t_required instantaneamente
        const energyRequired_kWh = (hourlyDemand_L * CP_WATER * (t_required - t_cold_water)) / 1000;
        
        // Somar potência disponível de todos os equipamentos de apoio
        const sortedEquips = [...system.equipments]
          .filter(e => e.type !== 'SOLAR')
          .sort((a, b) => {
            const priorities = { 'HP': 1, 'ELECTRIC_TANK': 2, 'BOILER': 3, 'HEATER': 4 };
            return (priorities[a.type as keyof typeof priorities] || 99) - (priorities[b.type as keyof typeof priorities] || 99);
          });

        let energyProvided_kWh = 0;
        for (const eq of sortedEquips) {
          const power_available = eq.power || 0; // kW em 1 hora = kWh
          const eqMaxTemp = eq.maxOutputTemp || 60;
          
          // No modo instantâneo, o equipamento só contribui se a sua T.Max for >= t_required
          if (eqMaxTemp >= t_required - 2) {
             const neededFromThis = Math.max(0, energyRequired_kWh - energyProvided_kWh);
             const contribution = Math.min(power_available, neededFromThis);
             
             if (contribution > 0) {
                if (eq.type === 'HP') {
                  const tempCorr = 1 + (t_ambient - 20) * 0.03;
                  const setpointCorr = 1 - (t_required - 45) * 0.015;
                  const dynamicCop = Math.max(1.5, (eq.cop || 3.5) * tempCorr * setpointCorr);
                  elec_cons += contribution / dynamicCop;
                } else if (eq.type === 'ELECTRIC_TANK') {
                  elec_cons += contribution / (eq.efficiency || 0.98);
                } else if (eq.type === 'BOILER' || eq.type === 'HEATER') {
                  gas_cons += contribution / (eq.efficiency || 0.88);
                }
                energyProvided_kWh += contribution;
             }
          }
        }
        
        // Temperatura final de entrega baseada na energia efetivamente providenciada
        t_delivered_eff = t_cold_water + (energyProvided_kWh * 1000 / (hourlyDemand_L * CP_WATER));
        // Se houver misturadora, não entrega mais que o pedido
        if (system.hasMixingValve) t_delivered_eff = Math.min(t_delivered_eff, t_required);
        
        q_input_total_kWh = energyProvided_kWh;
      } else {
        t_delivered_eff = t_cold_water;
      }
      currentTankTemp = t_delivered_eff; // No instantâneo, "tank" reflete a saída

    } else {
      // --- LÓGICA PARA SISTEMA COM ACUMULAÇÃO (TANQUE) ---
      // 2. Ganhos Solares
      const solar = system.equipments.find(e => e.type === 'SOLAR');
      const solarMaxTemp = solar?.maxOutputTemp || 80;
      
      if (solar && solar.area && currentTankTemp < solarMaxTemp) {
        const hourEffect = Math.max(0, Math.sin((hourOfDay - 6) * Math.PI / 12));
        q_solar_kWh = (ambientData.radiation * solar.area * (solar.opticalEfficiency || 0.75) * hourEffect) / 7.63;
        const energyCapacityToMax = (tankMass * CP_WATER * (solarMaxTemp - currentTankTemp)) / 1000;
        q_solar_kWh = Math.min(q_solar_kWh, energyCapacityToMax);
      }

      // 3. Apoio Térmico
      const safetySetpoint = system.hasMixingValve ? Math.max(t_required + 2, 55) : Math.max(t_required + 1, 45);
      
      const sortedEquips = [...system.equipments]
        .filter(e => e.type !== 'SOLAR')
        .sort((a, b) => {
          const priorities = { 'HP': 1, 'ELECTRIC_TANK': 2, 'BOILER': 3, 'HEATER': 4 };
          return (priorities[a.type as keyof typeof priorities] || 99) - (priorities[b.type as keyof typeof priorities] || 99);
        });

      for (const eq of sortedEquips) {
        const eqMaxTemp = eq.maxOutputTemp || 60;
        if (currentTankTemp < eqMaxTemp && currentTankTemp < safetySetpoint) {
          const effectiveTarget = Math.min(safetySetpoint, eqMaxTemp);
          const energyNeeded = (tankMass * CP_WATER * (effectiveTarget - currentTankTemp)) / 1000;
          const contribution = Math.min(eq.power || 0, energyNeeded);
          
          if (contribution > 0) {
            if (eq.type === 'HP') {
              const tempCorr = 1 + (t_ambient - 20) * 0.03;
              const setpointCorr = 1 - (effectiveTarget - 45) * 0.015;
              const dynamicCop = Math.max(1.5, (eq.cop || 3.5) * tempCorr * setpointCorr);
              elec_cons += contribution / dynamicCop;
            } else if (eq.type === 'ELECTRIC_TANK') {
              elec_cons += contribution / (eq.efficiency || 0.98);
            } else if (eq.type === 'BOILER' || eq.type === 'HEATER') {
              gas_cons += contribution / (eq.efficiency || 0.88);
            }
            q_input_total_kWh += contribution;
            currentTankTemp += contribution / (tankMass * CP_WATER / 1000);
          }
        }
      }

      // Adicionar Ganhos Solares à temperatura do tanque
      currentTankTemp += q_solar_kWh / (tankMass * CP_WATER / 1000);

      // Perdas Estáticas
      const q_loss_kWh = (system.storage.lossFactor * Math.max(0, currentTankTemp - t_ambient)) / 1000;
      currentTankTemp -= q_loss_kWh / (tankMass * CP_WATER / 1000);

      // 4. Extração de Demanda
      t_delivered_eff = system.hasMixingValve ? Math.min(currentTankTemp, t_required) : currentTankTemp;
      const q_demand_extracted_kWh = (hourlyDemand_L * CP_WATER * (Math.max(t_delivered_eff, t_cold_water) - t_cold_water)) / 1000;
      currentTankTemp -= q_demand_extracted_kWh / (tankMass * CP_WATER / 1000);
      
      // Limites físicos do tanque
      currentTankTemp = Math.max(t_cold_water, Math.min(95, currentTankTemp));
    }

    const hourlyCost = (elec_cons * project.energy.electricity) + (gas_cons * project.energy.gas);

    results.push({
      hour: h,
      dayOfWeek,
      demand_kWh: (hourlyDemand_L * CP_WATER * (Math.max(t_delivered_eff, t_cold_water) - t_cold_water)) / 1000,
      demand_L: hourlyDemand_L,
      temp_tank: currentTankTemp,
      t_required: t_required,
      t_delivered: t_delivered_eff,
      consumed_elec_kWh: elec_cons,
      consumed_gas_kWh: gas_cons,
      solar_gain_kWh: q_solar_kWh,
      cost: hourlyCost
    });
  }

  return results;
}

export function aggregateResults(results: HourlySimResult[]) {
  const annual = { elec_kWh: 0, gas_kWh: 0, solar_kWh: 0, demand_kWh: 0, cost: 0 };
  results.forEach(r => {
    annual.elec_kWh += r.consumed_elec_kWh;
    annual.gas_kWh += r.consumed_gas_kWh;
    annual.solar_kWh += r.solar_gain_kWh;
    annual.demand_kWh += r.demand_kWh;
    annual.cost += r.cost;
  });
  return annual;
}
