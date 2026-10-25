import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for photo uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Explicitly serve Web Manifest and static icons with CORS for Bubblewrap, PWABuilder, and Web-to-APK converters
app.use(express.static(path.resolve(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (filePath.endsWith('.webmanifest') || filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    }
  }
}));

app.get('/manifest.webmanifest', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.sendFile(path.resolve(__dirname, 'public', 'manifest.webmanifest'));
});

app.get('/manifest.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Multi-Turn AI Nutrition Coach Chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, profile, conversationId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or empty messages array' });
    }

    if (!apiKey) {
      return res.status(503).json({ 
        error: 'Gemini API key is not configured. Please configure GEMINI_API_KEY in your server environment variables or Secrets panel to enable live AI Nutrition Coach responses.',
        code: 'API_KEY_MISSING'
      });
    }

    // Build rich, evidence-based personalized user context
    const userContext = profile ? `
Client Personalized Profile & Biometrics:
- Name: ${profile.name || 'Client'}
- Age: ${profile.age || 'Not specified'} years, Gender: ${profile.gender || 'Not specified'}
- Height: ${profile.heightCm || 'Not specified'} cm, Current Weight: ${profile.weightKg || 'Not specified'} kg, Target Weight: ${profile.targetWeightKg || 'Not specified'} kg
- Current BMI: ${profile.bmi || 'N/A'} (${profile.bmiCategory || 'N/A'})
- Primary Goal: ${profile.goal || 'Health & Wellness'}
- Activity Level: ${profile.activityLevel || 'Moderate'}
- Daily Calorie Target: ${profile.targetCalories || 'Estimated'} kcal
- Daily Macro Targets: Protein ${profile.proteinGrams || 140}g, Carbs ${profile.carbsGrams || 150}g, Fat ${profile.fatGrams || 50}g, Fiber ${profile.fiberGrams || 28}g
- Water Target: ${(profile.waterTargetMl ? profile.waterTargetMl / 1000 : 2.5).toFixed(1)} L
- Dietary Preference: ${profile.dietaryPreference || 'Balanced'}
- Strict Allergies & Intolerances: ${profile.allergies || 'None declared'} ${profile.allergiesList?.length ? `(${profile.allergiesList.join(', ')})` : ''}
- Disliked Foods: ${profile.foodDislikes || 'None'}
- Preferred Cuisine: ${profile.cuisinePreference || 'Universal / Any'}
- Daily Food Budget: ${profile.dailyBudget || 'Moderate'}
- Available Cooking Time: ${profile.cookingTimeMinutes ? `${profile.cookingTimeMinutes} minutes` : 'Flexible'}
- Meals per day: ${profile.mealsPerDay || 3}
- Training Schedule: ${profile.trainingSchedule || 'Flexible'}
` : 'No personalized profile configured yet. Provide evidence-based, general nutrition guidance and mention that answers can be personalized once profile stats are entered.';

    const systemInstruction = `You are NutriPulse AI Coach, an expert clinical & sports nutritionist, registered dietitian consultant, and evidence-grounded wellness mentor.

${userContext}

STRICT PROFESSIONAL RULES:
1. PERSONALIZATION: Always tailor your answers to the client's actual biometrics, specific goal (${profile?.goal || 'wellness'}), target calories (${profile?.targetCalories || 'N/A'} kcal), and exact protein targets (${profile?.proteinGrams || 'N/A'}g). Never return generic canned answers.
2. ALLERGIES & PREFERENCES (CRITICAL): Strictly respect all declared allergies (${profile?.allergies || 'None'}). NEVER recommend any ingredients containing allergens. If the client is Vegetarian, Vegan, or Eggetarian, strictly ensure all meal and snack suggestions adhere to their dietary preference.
3. MATHEMATICAL ACCURACY: Ensure portion sizes and estimated calories/macros add up consistently. Never invent impossible macronutrient numbers (remember: 1g protein = 4 kcal, 1g carb = 4 kcal, 1g fat = 9 kcal).
4. EVIDENCE & SAFETY: Ground advice in peer-reviewed science (e.g. USDA FoodData, ACSM, WHO guidelines). Avoid miracle diets, detoxes, or unproven fat-loss supplements.
5. MEDICAL SCOPE BOUNDARY: You provide expert nutritional coaching and education, not clinical medical diagnosis. For severe medical conditions, pregnancy, or eating disorders, provide cautious general advice and advise consulting a physician or registered dietitian. Never prescribe medications.
6. FORMATTING: Use clean, readable formatting with clear headings, bullet points, and practical recipes/steps. Keep advice actionable and encouraging.`;

    // Map conversation history into Gemini format (last 12 turns)
    const recentMessages = messages.slice(-12);
    const contents = recentMessages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    // Ensure first message has role 'user'
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: 'Hello coach, let us discuss my nutrition plan.' }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const reply = response.text || "I couldn't generate a complete response. Please try rephrasing your question.";
    return res.json({
      reply,
      conversationId: conversationId || `conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate response from AI Nutrition Coach',
      code: 'GENERATION_FAILED',
    });
  }
});

// Endpoint: AI Food Nutrition Photo Estimation
app.post('/api/analyze-meal', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please configure your key in AI Studio Secrets or log meals using the verified nutrition database.',
        code: 'MISSING_API_KEY'
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const cleanMime = mimeType || 'image/jpeg';
    const prompt = `You are an expert sports nutritionist and food visual estimation specialist for an elite fitness app (NutriPulse).
Analyze this food/meal photo carefully.
Identify the dishes, individual ingredients, approximate portion sizes (in grams or standard measurements), and provide accurate estimates for total calories and macronutrients (protein, carbs, fat, fiber).
Consider typical cooking oils, sauces, and cooking methods.
Also provide a health rating score out of 10, relevant dietary tags (e.g. 'High Protein', 'Low Carb', 'Keto', 'Clean Fuel', 'Omega Rich'), and a 2-sentence nutritional insight.
${notes ? `User note: "${notes}". Take this note into consideration.` : ''}

Respond ONLY with valid JSON with this exact structure:
{
  "mealName": "Descriptive title of the meal (e.g. Grilled Salmon with Quinoa & Steamed Broccoli)",
  "confidence": 0.94,
  "items": [
    {
      "name": "Item name",
      "portion": "e.g. 180g / 1 cup",
      "calories": 240,
      "protein": 34,
      "carbs": 0,
      "fat": 11
    }
  ],
  "totalCalories": 580,
  "totalProtein": 42,
  "totalCarbs": 48,
  "totalFat": 22,
  "fiber": 6,
  "healthScore": 9.3,
  "dietaryTags": ["High Protein", "Heart Healthy", "Gluten Free"],
  "nutritionInsights": "Concise 1-2 sentence coach feedback on this meal for fitness goals."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: cleanMime,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error analyzing meal photo with Gemini:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to analyze food photo with AI vision. Please ensure the food is clearly visible and retry.',
      code: 'VISION_ANALYSIS_FAILED'
    });
  }
});

// Endpoint: AI Meal Plan & Weekly Prep Generator
app.post('/api/generate-meal-plan', async (req: Request, res: Response) => {
  try {
    const profile = req.body.profile || req.body;
    if (!profile || (!profile.targetCalories && !profile.calorieTarget)) {
      return res.status(400).json({ error: 'Missing user profile or target calorie requirements' });
    }

    if (!apiKey) {
      return res.status(503).json({ 
        error: 'GEMINI_API_KEY is not configured. Please configure it in AI Studio Secrets to generate personalized AI meal plans.',
        code: 'MISSING_API_KEY'
      });
    }

    const prompt = `You are a world-class dietitian and meal prep coach designing a complete 7-day personalized meal prep plan for a client with this profile:
- Primary Goal: ${profile.goal}
- Daily Calorie Target: ${profile.targetCalories} kcal
- Daily Macros: Protein ${profile.proteinGrams}g, Carbs ${profile.carbsGrams}g, Fat ${profile.fatGrams}g
- Dietary Preference: ${profile.dietaryPreference || 'Balanced / High Protein'}
- Strict Allergies (NEVER INCLUDE): ${profile.allergies || 'None'} ${profile.allergiesList?.length ? `(${profile.allergiesList.join(', ')})` : ''}
- Disliked Foods (AVOID): ${profile.foodDislikes || 'None'}
- Preferred Cuisine / Regional Style: ${profile.cuisinePreference || 'Any / Universal'}
- Daily Food Budget: ${profile.dailyBudget || 'Moderate'}
- Available Cooking Time: ${profile.cookingTimeMinutes || 30} minutes
- Meals per day: ${profile.mealsPerDay || 4}

CRITICAL RULES:
1. If Vegetarian, Vegan, or Eggetarian, NEVER include chicken, beef, pork, fish, or seafood.
2. If Vegan, strictly omit all dairy, eggs, meat, and honey.
3. If allergies are declared, strictly exclude all matching allergens.
4. If cuisine is Indian, incorporate healthy regional staples (e.g. paneer/tofu, moong dal, roti, brown rice, chana, sabzi) while hitting the exact macros.
5. Calorie total of the meals each day must equal approximately ${profile.targetCalories} kcal.

Create a comprehensive 7-day meal plan (Monday to Sunday).
Each day must have 4 meals: Breakfast, Lunch, Dinner, Snack.
For each meal provide: title, calories, protein (g), carbs (g), fat (g), prepTime, cookTime, ingredients list, and simple quick prep instructions.
Also provide a "mealPrepGuide" with batch cooking tips, and a categorized "groceryList" with produce, protein, dairy, pantry items.

Respond ONLY with valid JSON formatted as:
{
  "planTitle": "Custom Plan Title",
  "summary": "Brief encouraging summary",
  "dailyTargetCalories": ${profile.targetCalories},
  "days": [
    {
      "dayName": "Monday",
      "dayGoal": "High Energy Kickoff",
      "meals": [
        {
          "type": "Breakfast",
          "name": "Meal name",
          "calories": 420,
          "protein": 34,
          "carbs": 42,
          "fat": 12,
          "prepMinutes": 10,
          "ingredients": ["1 cup oats", "1 scoop whey", "1/2 cup berries", "1 tbsp peanut butter"],
          "instructions": "Brief instructions"
        },
        { "type": "Lunch", "name": "...", "calories": 520, "protein": 45, "carbs": 48, "fat": 16, "prepMinutes": 15, "ingredients": ["..."], "instructions": "..." },
        { "type": "Dinner", "name": "...", "calories": 550, "protein": 48, "carbs": 40, "fat": 18, "prepMinutes": 20, "ingredients": ["..."], "instructions": "..." },
        { "type": "Snack", "name": "...", "calories": 210, "protein": 18, "carbs": 20, "fat": 6, "prepMinutes": 5, "ingredients": ["..."], "instructions": "..." }
      ]
    }
  ],
  "batchPrepTips": [
    "Cook 1kg chicken breast and 3 cups of brown rice on Sunday evening in 4 glass containers",
    "Pre-portion nuts and snack veggies into zip bags for grab-and-go convenience"
  ],
  "groceryList": {
    "produce": ["Spinach 500g", "Broccoli 2 heads", "Bananas 1 bunch", "Sweet potatoes 1kg", "Berries 2 packs"],
    "proteins": ["Chicken breast 1.5kg", "Lean ground turkey 800g", "Salmon fillets 4x180g", "Eggs 2 dozen"],
    "grainsAndCarbs": ["Rolled oats 1kg", "Brown rice / Quinoa 1kg", "Whole grain wraps"],
    "dairyAndAlternative": ["Greek yogurt 0% 1kg", "Almond milk unsweetened", "Cottage cheese"],
    "pantryAndSpices": ["Olive oil", "Peanut butter", "Mixed seeds", "Garlic powder, Paprika"]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (err: any) {
    console.error('Error generating meal plan with Gemini:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate meal plan' });
  }
});

// Endpoint: AI Custom Workout Split Generator
app.post('/api/generate-workout-plan', async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Missing user profile' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'API key not configured' });
    }

    const prompt = `You are an elite strength & conditioning coach for a high-performance fitness platform (NutriPulse).
Create a structured 7-day workout plan customized for:
- Goal: ${profile.goal} (e.g. Shred Fat, Lean Muscle, Strength)
- Experience Level: ${profile.experienceLevel || 'Beginner to Intermediate'}
- Equipment: ${profile.equipment || 'Full Gym or Home Dumbbells'}
- Target session time: 20-35 minutes per day
- Current BMI: ${profile.bmi || 24}

Provide 7 days of training (including 2 smart recovery/mobility days).
Each active day must have 4-6 high-impact exercises with sets, reps, rest seconds, primary muscles, and key coaching cue.

Respond ONLY with valid JSON structured as:
{
  "programName": "Hyper-Burn Precision Split",
  "description": "Engineered for maximum metabolic burn and lean muscle stimulation in 25-minute sessions.",
  "weeklyGoal": "Target 4-5 active workouts, 1 recovery walk/stretch, and 1 full rest day",
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Monday",
      "focus": "Upper Body Strength & Hypertrophy",
      "durationMinutes": 25,
      "isRestDay": false,
      "exercises": [
        {
          "name": "Dumbbell Bench Press",
          "sets": 3,
          "reps": "10-12",
          "restSeconds": 60,
          "targetMuscle": "Chest & Triceps",
          "coachingCue": "Retract shoulder blades and drive elbows at 45 degrees."
        },
        {
          "name": "Bent-Over Dumbbell Rows",
          "sets": 3,
          "reps": "12",
          "restSeconds": 60,
          "targetMuscle": "Lats & Upper Back",
          "coachingCue": "Hinge at hips, pull elbows past ribs with neutral spine."
        },
        {
          "name": "Dumbbell Overhead Shoulder Press",
          "sets": 3,
          "reps": "10",
          "restSeconds": 60,
          "targetMuscle": "Deltoids",
          "coachingCue": "Brace core tight, press without arching lower back."
        },
        {
          "name": "Push-Ups to Failure",
          "sets": 2,
          "reps": "15-20",
          "restSeconds": 45,
          "targetMuscle": "Chest & Core",
          "coachingCue": "Full lockout at top, chest 1 inch from floor."
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (err: any) {
    console.error('Error generating workout plan with Gemini:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate workout plan' });
  }
});

// Dev vs Prod Vite Integration
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriPulse app running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
