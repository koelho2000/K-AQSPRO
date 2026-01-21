
import { Project, System, HourlySimResult, Activity } from '../types';
import { DISTRICTS_CLIMATE } from '../constants';

const CP_WATER = 1.163; // Wh/kg·K

export function runSimulation(project: Project, system: System): HourlySimResult[] {
  const results: HourlySimResult[] = [];
  const climate = project.customClimate || DISTRICTS_CLIMATE[project.district] || DISTRICTS_CLIMATE['Lisboa'];
  
  let currentTemp = 45; 
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

    // 1. Cálculo do Perfil Consolidado (Soma de todas as atividades ativas na hora h)
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
    
    // Temperatura de mistura necessária baseada no perfil consolidado
    const t_required = hourlyDemand_L > 0 ? weightedTempSum / hourlyDemand_L : 0;
    
    // Temperatura de entrega real:
    // Se misturadora ativa: min(Tanque, Requerido)
    // Se não ativa: Temperatura do Tanque
    let t_delivered = 0;
    if (hourlyDemand_L > 0) {
      if (system.hasMixingValve) {
        t_delivered = Math.min(currentTemp, t_required);
      } else {
        t_delivered = currentTemp;
      }
    }

    const q_demand_kWh = (hourlyDemand_L * CP_WATER * (Math.max(t_delivered, t_cold_water) - t_cold_water)) / 1000;

    // 2. Ganhos Solares (Normalizados)
    let q_solar_kWh = 0;
    const solar = system.equipments.find(e => e.type === 'SOLAR');
    if (solar && solar.area && !isInstantaneous) {
      const hourEffect = Math.max(0, Math.sin((hourOfDay - 6) * Math.PI / 12));
      q_solar_kWh = (ambientData.radiation * solar.area * (solar.opticalEfficiency || 0.75) * hourEffect) / 7.63;
    }

    // 3. Produção de Calor e Consumo de Energia (Ajustado por Eficiência)
    let q_input_kWh = 0;
    let elec_cons = 0;
    let gas_cons = 0;
    
    const totalThermalPowerkW = system.equipments
      .filter(e => e.type !== 'SOLAR')
      .reduce((acc, e) => acc + (e.power || 0), 0);

    const minMaintainTemp = system.hasMixingValve ? 55 : 45;
    const setpoint = Math.max(t_required + 5, minMaintainTemp);
    
    if (currentTemp < setpoint || (isInstantaneous && hourlyDemand_L > 0)) {
      const energyNeededToSetpoint = (tankMass * CP_WATER * (setpoint - currentTemp)) / 1000;
      q_input_kWh = Math.min(totalThermalPowerkW, Math.max(0, energyNeededToSetpoint + q_demand_kWh));

      let remainingHeat = q_input_kWh;
      const sortedEquips = [...system.equipments]
        .filter(e => e.type !== 'SOLAR')
        .sort((a, b) => {
          const priorities = { 'HP': 1, 'ELECTRIC_TANK': 2, 'BOILER': 3, 'HEATER': 4 };
          return (priorities[a.type as keyof typeof priorities] || 99) - (priorities[b.type as keyof typeof priorities] || 99);
        });

      for (const eq of sortedEquips) {
        if (remainingHeat <= 0) break;
        const eqContribution = Math.min(remainingHeat, eq.power || 0);
        
        if (eq.type === 'HP') {
          const tempCorr = 1 + (t_ambient - 20) * 0.03;
          const setpointCorr = 1 - (setpoint - 45) * 0.02;
          const dynamicCop = Math.max(1.3, (eq.cop || 3.5) * tempCorr * setpointCorr);
          elec_cons += eqContribution / dynamicCop;
        } else if (eq.type === 'ELECTRIC_TANK') {
          elec_cons += eqContribution / (eq.efficiency || 0.98);
        } else if (eq.type === 'BOILER' || eq.type === 'HEATER') {
          gas_cons += eqContribution / (eq.efficiency || 0.88);
        }
        remainingHeat -= eqContribution;
      }
    }

    // 4. Perdas Térmicas Estáticas
    const q_loss_kWh = isInstantaneous ? 0 : (system.storage.lossFactor * Math.max(0, currentTemp - t_ambient)) / 1000;

    // 5. Balanço Final de Energia
    const deltaE = q_input_kWh + q_solar_kWh - q_demand_kWh - q_loss_kWh;
    const deltaT = deltaE / (tankMass * CP_WATER / 1000);
    
    currentTemp += deltaT;
    currentTemp = Math.max(t_cold_water, Math.min(85, currentTemp));

    const hourlyCost = (elec_cons * project.energy.electricity) + (gas_cons * project.energy.gas);

    results.push({
      hour: h,
      dayOfWeek,
      demand_kWh: q_demand_kWh,
      demand_L: hourlyDemand_L,
      temp_tank: currentTemp,
      t_required: t_required,
      t_delivered: t_delivered,
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
