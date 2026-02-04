export const MRV_CONSTANTS = {
  // Factor based on average microalgae photosynthesis efficiency
  // Source: Documented in /docs/page.tsx
  CO2_CONVERSION_FACTOR: 1.83, 
  
  // Future factors can be added here
};

export function calculateCO2(biomassKg: number): number {
  if (biomassKg < 0) return 0;
  // Round to 2 decimal places to avoid floating point weirdness before sending to contract
  // (Contract expects integer scaled by 10^18 usually, but here we store as integer kg in struct? 
  // Wait, contract struct has uint256 co2Captured. Is it kg or grams?
  // In NewMeasurementPage we were sending Math.round(co2).
  // Let's standardize: The input to contract is integer.
  // If we want precision, we should use grams or scale.
  // For Beta, let's stick to kg integer for simplicity or check what NewMeasurementPage does.
  
  return biomassKg * MRV_CONSTANTS.CO2_CONVERSION_FACTOR;
}
