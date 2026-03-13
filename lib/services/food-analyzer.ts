/**
 * Food Analysis Service using Google Gemini AI
 * Analyzes food images to estimate calories and nutritional information
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
if (!API_KEY) {
  console.warn('Google AI API key is not defined. Please set NEXT_PUBLIC_GOOGLE_AI_API_KEY.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Food analysis result from AI
export interface FoodAnalysisResult {
  foodItems: string[];              // List of identified food items
  calories: number;                 // Total estimated calories
  description: string;              // Detailed description of the meal
  portions: string;                 // Portion size estimation (e.g., "1 plate", "200g")
  confidence: 'High' | 'Medium' | 'Low'; // AI confidence level
  nutritionInfo?: {                 // Detailed nutrition breakdown
    protein?: number;               // Grams
    carbs?: number;                 // Grams
    fat?: number;                   // Grams
    fiber?: number;                 // Grams
  };
  needsMoreInfo: boolean;           // Whether AI needs clarification
  questions?: string[];             // Follow-up questions if image is unclear
}

/**
 * Convert File or Blob to base64
 */
async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze food from image file
 * @param file - Image file of the food
 * @returns Food analysis result with calorie estimation
 */
export async function analyzeFoodImage(
  file: File | Blob
): Promise<FoodAnalysisResult | null> {
  if (!genAI) {
    throw new Error('Google AI API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest'
    });

    const base64 = await fileToBase64(file);

    const prompt = `You are a nutrition expert. Analyze this food image and provide detailed nutritional information.

IMPORTANT: If the image quality is poor, the food items are unclear, or you need more information about portion sizes or preparation methods, set "needsMoreInfo" to true and ask specific questions.

Provide your analysis in the following JSON format:
{
  "foodItems": ["item 1", "item 2", "item 3"],
  "calories": 500,
  "description": "Detailed description of the meal and its components",
  "portions": "Estimated portion size (e.g., '1 medium plate', '200g', '2 cups')",
  "confidence": "High|Medium|Low",
  "nutritionInfo": {
    "protein": 25,
    "carbs": 60,
    "fat": 15,
    "fiber": 8
  },
  "needsMoreInfo": false,
  "questions": ["Question 1 if needed?", "Question 2 if needed?"]
}

Guidelines:
- Be as accurate as possible with calorie estimation
- If you can see the food clearly and estimate portions, provide the full analysis
- If the image is blurry, dark, or you can't identify items clearly, set needsMoreInfo to true
- Ask specific questions about: portion size, cooking method, ingredients, or any unclear items
- Confidence levels: High (very clear image and familiar foods), Medium (some uncertainty), Low (poor image quality or unfamiliar foods)
- All nutritional values should be in grams
- Provide realistic calorie estimates based on typical portion sizes

Respond ONLY with valid JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type || 'image/jpeg',
          data: base64,
        },
      },
    ]);

    const text = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
}

/**
 * Analyze food from a text description
 * @param description - Text description of the food (e.g. "2 bananas and a glass of milk")
 * @returns Food analysis result with calorie estimation
 */
export async function analyzeFoodText(
  description: string
): Promise<FoodAnalysisResult | null> {
  if (!genAI) {
    throw new Error('Google AI API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest'
    });

    const prompt = `You are a nutrition expert. The user has described a meal in text. Estimate the nutritional information as accurately as possible.

Meal description: "${description}"

Provide your analysis in the following JSON format:
{
  "foodItems": ["item 1", "item 2"],
  "calories": 500,
  "description": "Brief description of the meal",
  "portions": "Portion size as described",
  "confidence": "High|Medium|Low",
  "nutritionInfo": {
    "protein": 25,
    "carbs": 60,
    "fat": 15,
    "fiber": 8
  },
  "needsMoreInfo": false,
  "questions": []
}

Guidelines:
- Use standard nutritional databases for estimates
- If the description is vague about portions, assume a typical serving size
- Confidence: High (specific items and quantities), Medium (general items), Low (very vague)
- All nutritional values should be in grams

Respond ONLY with valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Error analyzing food text:', error);
    throw error;
  }
}
