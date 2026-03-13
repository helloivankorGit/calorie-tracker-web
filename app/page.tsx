'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProfile, MealEntry } from '@/lib/types/models';
import { getUserProfile, getMealsForDate, getTodayDate } from '@/lib/services/storage';
import { calculateCalorieProgress, calculateRemainingCalories } from '@/lib/services/calorie-calculator';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    if (userProfile) {
      const today = getTodayDate();
      const meals = getMealsForDate(today);
      setTodaysMeals(meals);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🍎 Calorie Tracker</h1>
          <p className="text-gray-600 mb-8">
            Track your meals and reach your health goals with AI-powered food analysis.
          </p>
          <Link
            href="/onboarding"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const progress = calculateCalorieProgress(totalCalories, profile.dailyCalorieGoal);
  const remaining = calculateRemainingCalories(totalCalories, profile.dailyCalorieGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🍎 Calorie Tracker</h1>
          <div className="flex items-center gap-4">
            <Link href="/calendar" className="text-blue-600 hover:text-blue-700 font-medium">
              📅 Calendar
            </Link>
            <Link href="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Calorie Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Progress</h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              {/* Progress Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={progress > 100 ? '#EF4444' : '#3B82F6'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - Math.min(progress / 100, 1))}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-900">{totalCalories}</div>
                <div className="text-sm text-gray-500">/ {profile.dailyCalorieGoal}</div>
                <div className="text-xs text-gray-400 mt-1">{progress}%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {remaining >= 0 ? remaining : 0}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {todaysMeals.length}
              </div>
              <div className="text-sm text-gray-600">Meals</div>
            </div>
          </div>
        </div>

        {/* Add Meal Button */}
        <Link
          href="/add-meal"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg mb-6 text-center transition-colors"
        >
          + Add Meal
        </Link>

        {/* Today's Meals */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Meals</h2>
          
          {todaysMeals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No meals logged yet. Start tracking your first meal!
            </p>
          ) : (
            <div className="space-y-4">
              {todaysMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{meal.description}</h3>
                    <span className="text-lg font-bold text-blue-600">
                      {meal.calories} cal
                    </span>
                  </div>
                  {meal.portions && (
                    <p className="text-sm text-gray-600 mb-2">{meal.portions}</p>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(meal.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
