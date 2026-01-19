
import { Project, System, HourlySimResult, Activity } from '../types';
import { DISTRICTS_CLIMATE } from '../constants';

const CP_WATER = 1.163; // Wh/kg·K (or kWh/m³·K)

export function runSimulation(project: Project, system: System): HourlySimResult[] {
  const results: HourlySimResult[] = [];
  const climate = project.customClimate || DISTRICTS_CLIMATE[project.district] || DISTRICTS_CLIMATE['Lisboa'];
  
  // Initial state
  let currentTemp = 45; // Start temp in tank
  const tankMass = system.storage.volume || 1; // Assuming 1L = 1kg
  
  // 8760 hours loop
  for (let h = 0; h < 8760; h++) {
    const dayOfYear = Math.floor(h / 24);
    const month = Math.floor(dayOfYear / 30.42); // Rough month
    const hourOfDay = h % 24;
    const dayOfWeek = dayOfYear % 7; // 0=Sunday if we assume start of year is Sunday
    
    const ambientData = climate[Math.min(month, 11)];
    const t_ambient = ambientData.temp;
    const t_cold_water = 15; // Assumption

    // 1. Demand Calculation (Weekly schedule check)
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
    
    const t_required = hourlyDemand_L > 0 ? weightedTempSum / hourlyDemand_L : 40;
    const q_demand_kWh = (hourlyDemand_L * CP_WATER * (t_required - t_cold_water)) / 1000;

    // 2. Solar Gain
    let q_solar_kWh = 0;
    const solar = system.equipments.find(e => e.type === 'SOLAR');
    if (solar && solar.area) {
      const hourEffect = Math.max(0, Math.sin((hourOfDay - 6) * Math.PI / 12));
      q_solar_kWh = ambientData.radiation * solar.area * (solar.opticalEfficiency || 0.7) * hourEffect / 12;
    }

    // 3. System Gain
    let q_input_kWh = 0;
    let elec_cons = 0;
    let gas_cons = 0;
    
    // Aggregate total available thermal power from all equipments (except solar)
    const totalThermalPowerkW = system.equipments
      .filter(e => e.type !== 'SOLAR')
      .reduce((acc, e) => acc + (e.power || 0), 0);

    // Simple control logic: if tank is below setpoint (T_required + deadband), turn on heat
    const setpoint = Math.max(t_required + 5, 45); // deadband of 5 deg, min 45 deg
    if (currentTemp < setpoint) {
      // Use full power available or what is needed to reach setpoint in 1h
      const energyNeededToSetpoint = (tankMass * CP_WATER * (setpoint - currentTemp)) / 1000;
      q_input_kWh = Math.min(totalThermalPowerkW, energyNeededToSetpoint + q_demand_kWh);

      // Distribute consumption among equipments (Priority: HP -> Electric Tank -> Boiler -> Heater)
      let remainingHeat = q_input_kWh;
      
      const sortPriority = { 'HP': 1, 'ELECTRIC_TANK': 2, 'BOILER': 3, 'HEATER': 4, 'SOLAR': 5 };
      const sortedEquips = [...system.equipments]
        .filter(e => e.type !== 'SOLAR')
        .sort((a, b) => (sortPriority[a.type] || 99) - (sortPriority[b.type] || 99));

      for (const eq of sortedEquips) {
        if (remainingHeat <= 0) break;
        const eqContribution = Math.min(remainingHeat, eq.power || 0);
        if (eq.type === 'HP') {
          elec_cons += eqContribution / (eq.cop || 3.0);
        } else if (eq.type === 'ELECTRIC_TANK') {
          elec_cons += eqContribution / (eq.efficiency || 0.98);
        } else if (eq.type === 'BOILER' || eq.type === 'HEATER') {
          gas_cons += eqContribution / (eq.efficiency || 0.85);
        }
        remainingHeat -= eqContribution;
      }
    }

    // 4. Heat Losses
    const q_loss_kWh = (system.storage.lossFactor * (currentTemp - t_ambient)) / 1000;

    // 5. Energy Balance
    const deltaE = q_input_kWh + q_solar_kWh - q_demand_kWh - q_loss_kWh;
    const deltaT = deltaE / (tankMass * CP_WATER / 1000);
    currentTemp += deltaT;
    currentTemp = Math.max(t_cold_water, Math.min(85, currentTemp));

    const hourlyCost = (elec_cons * project.energy.electricity) + (gas_cons * project.energy.gas);

    results.push({
      hour: h,
      dayOfWeek,
      demand_kWh: q_demand_kWh,
      temp_tank: currentTemp,
      consumed_elec_kWh: elec_cons,
      consumed_gas_kWh: gas_cons,
      solar_gain_kWh: q_solar_kWh,
      cost: hourlyCost
    });
  }

  return results;
}

export function aggregateResults(results: HourlySimResult[]) {
  const annual = {
    elec_kWh: 0, gas_kWh: 0, solar_kWh: 0, demand_kWh: 0, cost: 0
  };
  results.forEach(r => {
    annual.elec_kWh += r.consumed_elec_kWh;
    annual.gas_kWh += r.consumed_gas_kWh;
    annual.solar_kWh += r.solar_gain_kWh;
    annual.demand_kWh += r.demand_kWh;
    annual.cost += r.cost;
  });
  return annual;
}
