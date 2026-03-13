'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, Gender, ActivityLevel, UserGoal } from '@/lib/types/models';
import { saveUserProfile } from '@/lib/services/storage';
import { calculateDailyCalorieGoal, ACTIVITY_LEVELS } from '@/lib/services/calorie-calculator';

const GOALS: { value: UserGoal; emoji: string; label: string; description: string }[] = [
  { value: 'lose_weight', emoji: '🔥', label: 'Lose Weight', description: 'Calorie deficit to shed fat gradually' },
  { value: 'keep_fit',   emoji: '⚖️', label: 'Stay Fit',    description: 'Maintain current weight and health' },
  { value: 'gain_muscle',emoji: '💪', label: 'Gain Muscle', description: 'Calorie surplus to support muscle growth' },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as Gender,
    height: '',
    weight: '',
    activityLevel: 'moderate' as ActivityLevel,
    goal: 'keep_fit' as UserGoal,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    const dailyCalorieGoal = calculateDailyCalorieGoal(
      weight, height, age, formData.gender, formData.activityLevel, formData.goal
    );

    const profile: UserProfile = {
      age,
      gender: formData.gender,
      height,
      weight,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      dailyCalorieGoal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUserProfile(profile);
    router.push('/');
  };

  const canProceed = () => {
    if (step === 1) return formData.name && formData.age && formData.gender;
    if (step === 2) return formData.height && formData.weight;
    if (step === 3) return formData.activityLevel;
    if (step === 4) return formData.goal;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm font-medium text-blue-600">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome! 👋</h2>
              <p className="text-gray-600">Let&apos;s start with some basic information</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-3 px-4 rounded-xl font-medium transition-colors capitalize ${
                      formData.gender === g ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Physical Stats */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Physical Stats 📏</h2>
              <p className="text-gray-600">Help us calculate your calorie needs</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                placeholder="e.g., 175"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                placeholder="e.g., 70"
              />
            </div>
          </div>
        )}

        {/* Step 3: Activity Level */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Level 🏃</h2>
              <p className="text-gray-600">How active are you on average?</p>
            </div>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${
                    formData.activityLevel === level.value ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`font-medium ${formData.activityLevel === level.value ? 'text-white' : 'text-gray-800'}`}>
                    {level.label}
                  </div>
                  <div className={`text-sm ${formData.activityLevel === level.value ? 'text-blue-100' : 'text-gray-500'}`}>
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Goal */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Goal 🎯</h2>
              <p className="text-gray-600">What are you trying to achieve?</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setFormData({ ...formData, goal: g.value })}
                  className={`w-full text-left p-4 rounded-xl transition-colors border-2 ${
                    formData.goal === g.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <div className={`font-semibold ${formData.goal === g.value ? 'text-blue-700' : 'text-gray-800'}`}>
                        {g.label}
                      </div>
                      <div className="text-sm text-gray-500">{g.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            {step === 4 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
