/**
 * Storage service for persisting user data using localStorage
 */

import { MealEntry, UserProfile } from '@/lib/types/models';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'calorie_tracker_user_profile',
  MEALS_PREFIX: 'calorie_tracker_meals_',
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ========== User Profile ==========

export function saveUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): void {
  if (!isBrowser()) return;
  try {
    const existing = getUserProfile();
    const now = new Date().toISOString();
    const fullProfile: UserProfile = {
      ...profile,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(fullProfile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

export function getUserProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// ========== Meals ==========

export function saveMeal(meal: MealEntry): void {
  if (!isBrowser()) return;
  try {
    const key = STORAGE_KEYS.MEALS_PREFIX + meal.date;
    const meals = getMealsForDate(meal.date);
    meals.push(meal);
    localStorage.setItem(key, JSON.stringify(meals));
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}

export function getMealsForDate(date: string): MealEntry[] {
  if (!isBrowser()) return [];
  try {
    const key = STORAGE_KEYS.MEALS_PREFIX + date;
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting meals:', error);
    return [];
  }
}

export function deleteMeal(mealId: string, date: string): void {
  if (!isBrowser()) return;
  try {
    const meals = getMealsForDate(date);
    const filtered = meals.filter(m => m.id !== mealId);
    localStorage.setItem(STORAGE_KEYS.MEALS_PREFIX + date, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

/**
 * Returns a map of date → total calories for all days that have logged meals.
 * Scans localStorage for all keys matching the meals prefix.
 */
export function getAllMealDates(): Record<string, number> {
  if (!isBrowser()) return {};
  const result: Record<string, number> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.MEALS_PREFIX)) {
        const date = key.replace(STORAGE_KEYS.MEALS_PREFIX, '');
        const meals: MealEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
        result[date] = meals.reduce((sum, m) => sum + m.calories, 0);
      }
    }
  } catch (error) {
    console.error('Error reading meal dates:', error);
  }
  return result;
}

// ========== Data Management ==========

export function clearAllData(): void {
  if (!isBrowser()) return;
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}
