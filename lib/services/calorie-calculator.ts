/**
 * Calorie calculation service using Mifflin-St Jeor Equation
 */

import { ActivityLevel, ActivityLevelInfo, Gender, UserGoal } from '@/lib/types/models';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const ACTIVITY_LEVELS: ActivityLevelInfo[] = [
  { value: 'sedentary',  label: 'Sedentary',         description: 'Little or no exercise',                          multiplier: 1.2   },
  { value: 'light',      label: 'Lightly Active',     description: 'Exercise 1-3 times/week',                        multiplier: 1.375 },
  { value: 'moderate',   label: 'Moderately Active',  description: 'Exercise 4-5 times/week',                        multiplier: 1.55  },
  { value: 'active',     label: 'Very Active',        description: 'Daily exercise or intense exercise 3-4 times/week', multiplier: 1.725 },
  { value: 'veryActive', label: 'Extra Active',       description: 'Intense exercise 6-7 times/week',                multiplier: 1.9   },
];

function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateDailyCalorieGoal(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: UserGoal = 'keep_fit'
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

  if (goal === 'lose_weight') return Math.round(tdee - 500);
  if (goal === 'gain_muscle') return Math.round(tdee + 300);
  return tdee;
}

export function calculateCalorieProgress(consumed: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((consumed / target) * 100);
}

export function calculateRemainingCalories(consumed: number, target: number): number {
  return target - consumed;
}
