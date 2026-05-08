/**
 * Mifflin-St Jeor Equation
 * BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + s
 * s is +5 for males and -161 for females
 */
export const calculateTDEE = (profile) => {
  const { weight, height, age, gender, activityLevel } = profile;
  
  if (!weight || !height || !age) return 2000;

  const s = gender === 'male' ? 5 : -161;
  const bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(age) + s;

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};

export const activityLevels = [
  { label: 'Sedentary (Office job)', value: 'sedentary' },
  { label: 'Lightly Active (1-2 days/week)', value: 'light' },
  { label: 'Moderately Active (3-5 days/week)', value: 'moderate' },
  { label: 'Very Active (6-7 days/week)', value: 'active' },
  { label: 'Athlete (2x per day)', value: 'athlete' },
];
