/**
 * Core data models for the Calorie Tracker app
 */

// Gender options
export type Gender = 'male' | 'female';

// User goal options
export type UserGoal = 'lose_weight' | 'keep_fit' | 'gain_muscle';

// Activity level options with descriptive labels
export type ActivityLevel = 
  | 'sedentary'      // Little or no exercise
  | 'light'          // Exercise 1-3 times/week
  | 'moderate'       // Exercise 4-5 times/week
  | 'active'         // Daily exercise or intense exercise 3-4 times/week
  | 'veryActive';    // Intense exercise 6-7 times/week

// User profile information
export interface UserProfile {
  name?: string;                  // Display name
  age: number;                    // Years
  height: number;                 // Centimeters
  weight: number;                 // Kilograms
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: UserGoal;                 // User's fitness goal
  dailyCalorieGoal: number;       // Calculated target calories
  createdAt: string;              // ISO date string
  updatedAt: string;              // ISO date string
}

// Individual meal entry
export interface MealEntry {
  id: string;
  date: string;                   // ISO date string (YYYY-MM-DD)
  time: string;                   // Time string (HH:MM)
  calories: number;
  description: string;            // AI-generated food description
  portions?: string;
  confidence: 'High' | 'Medium' | 'Low';
  nutritionInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  createdAt: string;
}

// Activity level metadata for UI
export interface ActivityLevelInfo {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;             // BMR multiplier
}
