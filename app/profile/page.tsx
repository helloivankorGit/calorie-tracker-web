'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, UserGoal } from '@/lib/types/models';
import { getUserProfile, saveUserProfile, clearAllData } from '@/lib/services/storage';
import { ACTIVITY_LEVELS, calculateDailyCalorieGoal } from '@/lib/services/calorie-calculator';

const GOALS: { value: UserGoal; emoji: string; label: string }[] = [
  { value: 'lose_weight', emoji: '🔥', label: 'Lose Weight' },
  { value: 'keep_fit',   emoji: '⚖️', label: 'Stay Fit' },
  { value: 'gain_muscle',emoji: '💪', label: 'Gain Muscle' },
];

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState<UserGoal>('keep_fit');

  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);
    setLoading(false);
    if (!userProfile) {
      router.push('/onboarding');
    } else {
      setWeight(String(userProfile.weight));
      setActivityLevel(userProfile.activityLevel);
      setGoal(userProfile.goal ?? 'keep_fit');
    }
  }, [router]);

  const handleSave = () => {
    if (!profile) return;

    const newWeight = parseFloat(weight);
    const newActivityLevel = activityLevel as UserProfile['activityLevel'];
    const newGoal = goal;

    const newCalorieGoal = calculateDailyCalorieGoal(
      newWeight,
      profile.height,
      profile.age,
      profile.gender,
      newActivityLevel,
      newGoal
    );

    const updated: UserProfile = {
      ...profile,
      weight: newWeight,
      activityLevel: newActivityLevel,
      goal: newGoal,
      dailyCalorieGoal: newCalorieGoal,
      updatedAt: new Date().toISOString(),
    };

    saveUserProfile(updated);
    setProfile(updated);
    setEditing(false);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      router.push('/onboarding');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const activityInfo = ACTIVITY_LEVELS.find(a => a.value === profile.activityLevel);
  const goalInfo = GOALS.find(g => g.value === (profile.goal ?? 'keep_fit'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

          {/* Avatar */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          </div>

          {/* Static info */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Age</span>
              <span className="font-semibold text-gray-900">{profile.age} years</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Gender</span>
              <span className="font-semibold text-gray-900 capitalize">{profile.gender}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Height</span>
              <span className="font-semibold text-gray-900">{profile.height} cm</span>
            </div>
          </div>

          {/* Editable section */}
          {!editing ? (
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Weight</span>
                <span className="font-semibold text-gray-900">{profile.weight} kg</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Activity Level</span>
                <span className="font-semibold text-gray-900">{activityInfo?.label}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Goal</span>
                <span className="font-semibold text-gray-900">{goalInfo?.emoji} {goalInfo?.label}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5 mb-6">
              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </div>
              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setActivityLevel(level.value)}
                      className={`w-full text-left p-3 rounded-xl transition-colors border-2 ${
                        activityLevel === level.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`font-medium text-sm ${activityLevel === level.value ? 'text-blue-700' : 'text-gray-800'}`}>
                        {level.label}
                      </div>
                      <div className="text-xs text-gray-500">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                <div className="space-y-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      className={`w-full text-left p-3 rounded-xl transition-colors border-2 flex items-center gap-3 ${
                        goal === g.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span className={`font-medium text-sm ${goal === g.value ? 'text-blue-700' : 'text-gray-800'}`}>
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calorie Goal */}
          <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white text-center mb-6">
            <div className="text-sm mb-2 opacity-90">Daily Calorie Goal</div>
            <div className="text-4xl font-bold">{profile.dailyCalorieGoal}</div>
            <div className="text-sm mt-2 opacity-90">calories per day</div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setWeight(String(profile.weight));
                    setActivityLevel(profile.activityLevel);
                    setGoal(profile.goal ?? 'keep_fit');
                    setEditing(false);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
            <button
              onClick={handleClearData}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-600 text-sm">
          <p className="mb-2">🍎 Calorie Tracker Web</p>
          <p>AI-powered food tracking</p>
        </div>
      </main>
    </div>
  );
}
