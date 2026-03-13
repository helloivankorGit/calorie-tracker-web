'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeFoodImage, analyzeFoodText, analyzeFoodWithCorrection } from '@/lib/services/food-analyzer';
import { saveMeal } from '@/lib/services/storage';
import { MealEntry } from '@/lib/types/models';

type Mode = 'select' | 'photo' | 'text';

export default function AddMeal() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [correctionText, setCorrectionText] = useState('');
  const [correcting, setCorrecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');

    try {
      let analysis = null;
      if (mode === 'photo') {
        if (!selectedFile) { setError('Please select an image first'); return; }
        analysis = await analyzeFoodImage(selectedFile);
      } else {
        if (!textInput.trim()) { setError('Please describe your meal first'); return; }
        analysis = await analyzeFoodText(textInput.trim());
      }
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze food. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCorrection = async () => {
    if (!correctionText.trim() || !result) return;
    setCorrecting(true);
    setError('');
    try {
      const updated = await analyzeFoodWithCorrection(result, correctionText.trim(), selectedFile ?? null);
      if (updated) {
        setResult(updated);
        setCorrectionText('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply correction. Please try again.');
    } finally {
      setCorrecting(false);
    }
  };

  const handleSave = () => {
    if (!result) return;

    const meal: MealEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      calories: result.calories,
      description: result.foodItems?.join(', ') ?? result.description ?? 'Unknown meal',
      portions: result.portions,
      confidence: result.confidence ?? 'Medium',
      nutritionInfo: result.nutritionInfo,
      createdAt: new Date().toISOString(),
    };

    saveMeal(meal);
    router.push('/');
  };

  const handleReset = () => {
    setResult(null);
    setPreview('');
    setSelectedFile(null);
    setTextInput('');
    setError('');
    setCorrectionText('');
    setMode('select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add Meal</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">

          {/* Mode Selection */}
          {mode === 'select' && !result && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">How would you like to add your meal?</p>
              <button
                onClick={() => setMode('photo')}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-5xl mb-3">📸</div>
                <div className="text-lg font-medium text-gray-700">Take or upload a photo</div>
                <div className="text-sm text-gray-500 mt-1">AI will analyze the food in the image</div>
              </button>
              <button
                onClick={() => setMode('text')}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <div className="text-5xl mb-3">✏️</div>
                <div className="text-lg font-medium text-gray-700">Describe your meal</div>
                <div className="text-sm text-gray-500 mt-1">e.g. 2 bananas and a glass of milk</div>
              </button>
            </div>
          )}

          {/* Photo Mode */}
          {mode === 'photo' && !result && (
            <div className="mb-6">
              <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
                ← Back
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!preview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">📸</div>
                    <div className="text-lg font-medium text-gray-700 mb-2">Select a food image</div>
                    <div className="text-sm text-gray-500">Click to choose a photo from your device</div>
                  </div>
                </button>
              ) : (
                <>
                  <img src={preview} alt="Food preview" className="w-full h-64 object-cover rounded-xl mb-4" />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setPreview(''); setSelectedFile(null); setError(''); }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze Food'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Text Mode */}
          {mode === 'text' && !result && (
            <div className="space-y-4">
              <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-700 inline-block">
                ← Back
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your meal
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. 2 bananas, a bowl of oatmeal with honey, glass of orange juice"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-black placeholder-gray-400 resize-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !textInput.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Meal'}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="space-y-6">
              {preview && (
                <img src={preview} alt="Food" className="w-full h-64 object-cover rounded-xl" />
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {result.foodItems?.join(', ') ?? result.name ?? 'Analysis Result'}
                </h2>
                {result.description && (
                  <p className="text-gray-600 mb-4">{result.description}</p>
                )}
                {result.portions && (
                  <p className="text-sm text-gray-500">Portions: {result.portions}</p>
                )}
              </div>

              {/* Nutrition Facts */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Nutrition Facts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{result.calories}</div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {result.nutritionInfo?.protein ?? result.protein ?? '—'}g
                    </div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.nutritionInfo?.carbs ?? result.carbs ?? '—'}g
                    </div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.nutritionInfo?.fat ?? result.fat ?? '—'}g
                    </div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </div>

              {/* Correction */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-yellow-800">✏️ Something wrong? Correct it</p>
                <textarea
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder='e.g. "It was 2 servings" or "the sauce was cream-based, not tomato"'
                  rows={2}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none bg-white"
                />
                <button
                  onClick={handleCorrection}
                  disabled={correcting || !correctionText.trim()}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-200 disabled:text-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {correcting ? 'Recalculating...' : 'Recalculate'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Save Meal
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
