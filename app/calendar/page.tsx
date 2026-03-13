'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getAllMealDates, getMealsForDate } from '@/lib/services/storage';
import { UserProfile, MealEntry } from '@/lib/types/models';

type DayStatus = 'good' | 'over' | 'logged' | 'none';

function getDayStatus(date: string, totalCalories: number, goal: number): DayStatus {
  if (totalCalories === 0) return 'none';
  const ratio = totalCalories / goal;
  if (ratio <= 1.05) return 'good';   // within 5% of goal → green ✅
  return 'over';                       // exceeded goal → red ❌
}

const STATUS_STYLES: Record<DayStatus, string> = {
  good:   'bg-green-100 text-green-800 border-green-300 font-semibold',
  over:   'bg-red-100 text-red-800 border-red-300 font-semibold',
  logged: 'bg-blue-50 text-blue-700 border-blue-200',
  none:   'bg-white text-gray-400 border-gray-100',
};

const STATUS_EMOJI: Record<DayStatus, string> = {
  good: '✅',
  over: '❌',
  logged: '•',
  none: '',
};

export default function CalendarPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mealTotals, setMealTotals] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    const p = getUserProfile();
    setProfile(p);
    setMealTotals(getAllMealDates());
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // Build calendar grid
  const { year, month } = currentMonth;
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Pad so Monday is col 0 (shift Sun to end)
  const startOffset = (firstDay + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function handleDayClick(day: number) {
    const d = dateStr(day);
    setSelectedDate(d);
    setSelectedMeals(getMealsForDate(d));
  }

  const prevMonth = () => {
    setCurrentMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
    setSelectedDate(null);
  };

  const goal = profile?.dailyCalorieGoal ?? 2000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">📅 Calendar</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Legend */}
        <div className="flex gap-4 justify-center text-sm text-black">
          <span className="flex items-center gap-1"><span className="text-base">✅</span> Within goal</span>
          <span className="flex items-center gap-1"><span className="text-base">❌</span> Over goal</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> No data</span>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors text-lg"
            >
              ‹
            </button>
            <h2 className="text-lg font-bold text-gray-800">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors text-lg"
            >
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;

              const d = dateStr(day);
              const calories = mealTotals[d] ?? 0;
              const status = d > today ? 'none' : getDayStatus(d, calories, goal);
              const isToday = d === today;
              const isSelected = d === selectedDate;

              return (
                <button
                  key={d}
                  onClick={() => handleDayClick(day)}
                  className={[
                    'relative flex flex-col items-center justify-center rounded-xl border aspect-square text-sm transition-all',
                    STATUS_STYLES[status],
                    isToday ? 'ring-2 ring-blue-400 ring-offset-1' : '',
                    isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : '',
                    d <= today ? 'hover:opacity-80 cursor-pointer' : 'cursor-default opacity-40',
                  ].join(' ')}
                >
                  <span>{day}</span>
                  {status !== 'none' && (
                    <span className="text-xs leading-none">{STATUS_EMOJI[status]}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-gray-800 mb-3">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('default', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </h3>

            {selectedMeals.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No meals logged this day.</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {selectedMeals.map((meal) => (
                    <div key={meal.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{meal.description}</p>
                        <p className="text-xs text-gray-400">{meal.time}</p>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{meal.calories} cal</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className={`font-bold text-lg ${(mealTotals[selectedDate] ?? 0) > goal ? 'text-red-600' : 'text-green-600'}`}>
                    {mealTotals[selectedDate] ?? 0} / {goal} cal
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
