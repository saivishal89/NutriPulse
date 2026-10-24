import { UserProfile, WeeklyMealPlan, WeeklyWorkoutPlan, Milestone, WaterReminder, FoodLogEntry, WeightLogEntry } from '../types';

export const initialProfile: UserProfile = {
  name: 'Alex Hunter',
  age: 28,
  gender: 'male',
  heightCm: 178,
  weightKg: 88.8,
  targetWeightKg: 74.0,
  activityLevel: 'moderate',
  goal: 'shred',
  dietaryPreference: 'high_protein',
  equipment: 'gym',
  experienceLevel: 'intermediate',
  allergies: 'None',
  targetCalories: 1573, // Matches user screenshot 3!
  waterTargetMl: 2500,  // Matches user screenshot 1 & 3! (2.5 L)
  proteinGrams: 140,
  carbsGrams: 140,
  fatGrams: 45,
  fiberGrams: 28,
  bmi: 28.02,           // Matches user screenshot 3!
  bmiCategory: 'Overweight',
  nowBodyFat: '20-24%', // Matches user screenshot 2!
  goalBodyFat: '8-10%', // Matches user screenshot 2!
  nowMuscleBars: 2,
  goalMuscleBars: 5,
  createdAt: new Date().toISOString(),
};

export const sampleFoodPhotos = [
  {
    id: 'photo-1',
    name: 'Grilled Salmon & Quinoa Power Bowl',
    calories: 520,
    protein: 42,
    carbs: 45,
    fat: 18,
    fiber: 6,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    tags: ['High Protein', 'Omega 3', 'Clean Grains']
  },
  {
    id: 'photo-2',
    name: 'Avocado Toast with Poached Eggs & Microgreens',
    calories: 410,
    protein: 22,
    carbs: 34,
    fat: 21,
    fiber: 8,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    tags: ['Healthy Fats', 'Fiber Rich', 'Vegetarian']
  },
  {
    id: 'photo-3',
    name: 'Herb-Roasted Chicken Breast & Sweet Potato',
    calories: 490,
    protein: 48,
    carbs: 42,
    fat: 12,
    fiber: 5,
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80',
    tags: ['Lean Muscle', 'Post-Workout', 'Low Fat']
  },
  {
    id: 'photo-4',
    name: 'Greek Yogurt Protein Berry Parfait',
    calories: 280,
    protein: 28,
    carbs: 32,
    fat: 4,
    fiber: 5,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
    tags: ['High Protein', 'Antioxidants', 'Quick Snack']
  },
  {
    id: 'photo-5',
    name: 'Lean Beef & Jasmine Rice Stir Fry',
    calories: 560,
    protein: 44,
    carbs: 58,
    fat: 16,
    fiber: 4,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    tags: ['Strength Fuel', 'High Iron', 'Meal Prep Classic']
  }
];

export const defaultWeeklyMealPlan: WeeklyMealPlan = {
  planTitle: 'Titan Shred & Lean Recomp Plan',
  summary: 'Precision targeted at 1,570 kcal/day with 140g high-bioavailability protein to preserve lean muscle while incinerating stubborn fat.',
  dailyTargetCalories: 1573,
  batchPrepTips: [
    'Sunday Batch Session: Grill 1.2kg chicken breast seasoned with paprika & garlic, roast 800g sweet potato cubes in olive oil spray, and steam 2 heads of broccoli.',
    'Portion into 4 airtight glass meal-prep containers for Monday through Wednesday lunches and dinners.',
    'Wednesday Night 20-min Mini-Prep: Bake salmon fillets and prepare overnight protein oats for Thursday-Saturday.'
  ],
  groceryList: {
    produce: [
      'Baby spinach (500g)',
      'Broccoli crowns (3 large)',
      'Sweet potatoes (1.2 kg)',
      'Avocados (4 medium)',
      'Mixed berries (2 tubs, blueberries & strawberries)',
      'Asparagus spears (2 bundles)',
      'Lemons & fresh garlic'
    ],
    proteins: [
      'Skinless chicken breasts (1.5 kg)',
      'Atlantic salmon fillets (4 x 160g)',
      'Lean ground turkey 93/7 (800g)',
      'Free-range eggs (2 cartons)',
      'Whey or plant protein isolate (1 tub)'
    ],
    grainsAndCarbs: [
      'Rolled oats (1 kg)',
      'Jasmine or basmati brown rice (1 kg)',
      'White quinoa (500g)',
      'Whole grain sourdough bread (1 loaf)'
    ],
    dairyAndAlternative: [
      'Non-fat Greek yogurt (2 x 500g tubs)',
      'Unsweetened almond milk (2 liters)',
      'Low-fat cottage cheese (1 tub)'
    ],
    pantryAndSpices: [
      'Extra virgin olive oil spray',
      'Natural peanut or almond butter',
      'Himalayan pink salt & cracked black pepper',
      'Smoked paprika, cumin, Italian herbs'
    ]
  },
  days: [
    {
      dayName: 'Monday',
      dayGoal: 'Metabolic Ignition & High Energy',
      totalCalories: 1560,
      totalProtein: 142,
      meals: [
        {
          id: 'mon-1',
          type: 'Breakfast',
          name: 'Power Scramble & Sourdough Toast',
          calories: 380,
          protein: 32,
          carbs: 34,
          fat: 14,
          prepMinutes: 10,
          cookMinutes: 8,
          ingredients: ['3 egg whites + 1 whole egg', 'Handful baby spinach', '1 slice toasted sourdough', '1/4 avocado sliced', 'Chili flakes'],
          instructions: 'Whisk eggs with spinach and pinch of salt. Scramble gently in non-stick pan. Serve on warm sourdough topped with sliced avocado.'
        },
        {
          id: 'mon-2',
          type: 'Lunch',
          name: 'Grilled Chicken & Sweet Potato Meal Prep',
          calories: 490,
          protein: 48,
          carbs: 45,
          fat: 12,
          prepMinutes: 5,
          cookMinutes: 0,
          ingredients: ['180g prepped herb chicken breast', '150g roasted sweet potato', '120g steamed broccoli', '1 tsp extra virgin olive oil drizzle'],
          instructions: 'Heat your Sunday batch container for 90 seconds. Drizzle olive oil and squeeze fresh lemon over the broccoli.'
        },
        {
          id: 'mon-3',
          type: 'Dinner',
          name: 'Pan-Seared Salmon with Lemon Asparagus',
          calories: 480,
          protein: 42,
          carbs: 22,
          fat: 24,
          prepMinutes: 10,
          cookMinutes: 12,
          ingredients: ['160g salmon fillet', '150g trimmed asparagus', '80g steamed quinoa', 'Lemon wedge', 'Garlic herb butter (5g)'],
          instructions: 'Sear salmon skin-down for 5 mins until crisp, flip for 3 mins. Sauté asparagus with garlic. Serve with warm quinoa.'
        },
        {
          id: 'mon-4',
          type: 'Snack',
          name: 'Greek Yogurt & Berry Protein Cup',
          calories: 210,
          protein: 20,
          carbs: 22,
          fat: 3,
          prepMinutes: 4,
          ingredients: ['170g 0% Greek yogurt', '1/2 cup fresh blueberries', '10g crushed almonds', 'Cinnamon dusting'],
          instructions: 'Layer yogurt into a bowl, fold in blueberries, top with crunchy sliced almonds and fragrant cinnamon.'
        }
      ]
    },
    {
      dayName: 'Tuesday',
      dayGoal: 'Sustained Hypertrophy & Satiety',
      totalCalories: 1575,
      totalProtein: 144,
      meals: [
        {
          id: 'tue-1',
          type: 'Breakfast',
          name: 'Cinnamon Protein Berry Oatmeal',
          calories: 390,
          protein: 34,
          carbs: 46,
          fat: 8,
          prepMinutes: 5,
          cookMinutes: 5,
          ingredients: ['50g rolled oats', '1 scoop vanilla whey isolate', '1/2 cup almond milk', 'Handful strawberries', '1 tsp chia seeds'],
          instructions: 'Cook oats with almond milk. Let cool for 1 min before stirring in whey protein smoothly. Top with berries and chia.'
        },
        {
          id: 'tue-2',
          type: 'Lunch',
          name: 'Turkey Quinoa Mediterranean Bowl',
          calories: 510,
          protein: 46,
          carbs: 48,
          fat: 14,
          prepMinutes: 10,
          cookMinutes: 10,
          ingredients: ['170g 93% lean turkey mince', '100g cooked quinoa', 'Cherry tomatoes', 'Cucumber', '30g feta light', 'Oregano'],
          instructions: 'Brown lean turkey with oregano and garlic. Toss with cooked quinoa, diced cucumber, tomatoes, and crumbled light feta.'
        },
        {
          id: 'tue-3',
          type: 'Dinner',
          name: 'Spiced Chicken Tenderloins & Zucchini Noodles',
          calories: 470,
          protein: 44,
          carbs: 24,
          fat: 20,
          prepMinutes: 12,
          cookMinutes: 12,
          ingredients: ['180g chicken breast strips', '200g spiralized zucchini noodles', '30g light pesto', 'Pine nuts (5g)'],
          instructions: 'Sauté chicken strips until golden. Flash-cook zucchini noodles in pesto for 2 minutes to keep them crisp.'
        },
        {
          id: 'tue-4',
          type: 'Snack',
          name: 'Cottage Cheese & Apple Slices',
          calories: 205,
          protein: 20,
          carbs: 22,
          fat: 3,
          prepMinutes: 3,
          ingredients: ['150g low-fat cottage cheese', '1 small crisp green apple sliced', 'Cinnamon'],
          instructions: 'Dip crisp tart apple slices into creamy cottage cheese sprinkled with cinnamon.'
        }
      ]
    },
    {
      dayName: 'Wednesday',
      dayGoal: 'Mid-Week Carb Modulation & Recovery',
      totalCalories: 1555,
      totalProtein: 139,
      meals: [
        {
          id: 'wed-1',
          type: 'Breakfast',
          name: 'Green Goddess Protein Omelet',
          calories: 370,
          protein: 30,
          carbs: 18,
          fat: 18,
          prepMinutes: 8,
          cookMinutes: 6,
          ingredients: ['2 whole eggs + 2 whites', 'Baby kale', 'Mushrooms', '1/4 avocado', '1 slice whole wheat bread'],
          instructions: 'Sauté mushrooms and kale, pour beaten eggs over and fold into an omelet. Serve with toasted whole wheat.'
        },
        {
          id: 'wed-2',
          type: 'Lunch',
          name: 'Grilled Herb Chicken & Roasted Squash',
          calories: 500,
          protein: 47,
          carbs: 46,
          fat: 12,
          prepMinutes: 5,
          cookMinutes: 0,
          ingredients: ['180g batch chicken breast', '160g roasted butternut squash', 'Green beans', 'Dijon mustard dressing'],
          instructions: 'Reheat batch box. Dijon dressing adds zest without unnecessary extra calories.'
        },
        {
          id: 'wed-3',
          type: 'Dinner',
          name: 'Asian Sesame Beef & Broccoli Bowl',
          calories: 495,
          protein: 42,
          carbs: 42,
          fat: 17,
          prepMinutes: 12,
          cookMinutes: 10,
          ingredients: ['150g extra lean sirloin strips', '120g broccoli florets', '80g jasmine brown rice', 'Low-sodium tamari', 'Sesame seeds'],
          instructions: 'Flash-sear steak strips in high heat wok. Add broccoli and tamari splash. Serve atop warm fragrant rice.'
        },
        {
          id: 'wed-4',
          type: 'Snack',
          name: 'Whey Protein Shake & Rice Cake with PB',
          calories: 190,
          protein: 20,
          carbs: 16,
          fat: 4,
          prepMinutes: 3,
          ingredients: ['1 scoop protein isolate with cold water', '1 whole grain rice cake', '1 tsp natural peanut butter'],
          instructions: 'Quick shaker post-workout or afternoon pick-me-up.'
        }
      ]
    },
    {
      dayName: 'Thursday',
      dayGoal: 'Clean Fuel for High Intensity Burn',
      totalCalories: 1580,
      totalProtein: 145,
      meals: [
        {
          id: 'thu-1',
          type: 'Breakfast',
          name: 'Blueberry Overnight Protein Oats',
          calories: 385,
          protein: 33,
          carbs: 48,
          fat: 6,
          prepMinutes: 5,
          ingredients: ['45g rolled oats', '1 scoop vanilla whey', '100g Greek yogurt', '1/2 cup almond milk', 'Wild blueberries'],
          instructions: 'Grab ready from the fridge. Stir thoroughly and enjoy cold or gently warmed.'
        },
        {
          id: 'thu-2',
          type: 'Lunch',
          name: 'Wild Tuna & Avocado Whole Wheat Wrap',
          calories: 490,
          protein: 46,
          carbs: 40,
          fat: 15,
          prepMinutes: 10,
          ingredients: ['1 can solid white tuna in springwater', '1 whole wheat tortilla wrap', '1/3 mashed avocado', 'Crisp romaine', 'Dijon'],
          instructions: 'Mix drained tuna with mashed avocado and Dijon. Wrap tight with crunchy romaine lettuce.'
        },
        {
          id: 'thu-3',
          type: 'Dinner',
          name: 'Crispy Lemon Rosemary Chicken Thigh & Asparagus',
          calories: 495,
          protein: 44,
          carbs: 22,
          fat: 23,
          prepMinutes: 10,
          cookMinutes: 18,
          ingredients: ['180g skinless boneless chicken thigh', '150g roasted asparagus', 'Roasted carrot fries', 'Rosemary'],
          instructions: 'Bake seasoned thigh at 200°C for juicy texture. Serve alongside blistered rosemary asparagus.'
        },
        {
          id: 'thu-4',
          type: 'Snack',
          name: 'Hard Boiled Eggs & Cherry Tomatoes',
          calories: 210,
          protein: 22,
          carbs: 8,
          fat: 10,
          prepMinutes: 3,
          ingredients: ['2 large hard boiled eggs', '1 cup ripe cherry tomatoes', 'Sea salt & cracked pepper'],
          instructions: 'Simple, portable, high-protein snack for hunger control.'
        }
      ]
    },
    {
      dayName: 'Friday',
      dayGoal: 'Peak Anabolic Optimization',
      totalCalories: 1565,
      totalProtein: 141,
      meals: [
        {
          id: 'fri-1',
          type: 'Breakfast',
          name: 'Egg White Frittata with Sun-Dried Tomatoes',
          calories: 360,
          protein: 32,
          carbs: 22,
          fat: 14,
          prepMinutes: 8,
          cookMinutes: 12,
          ingredients: ['4 egg whites + 1 whole egg', 'Spinach', 'Chopped sun-dried tomatoes', 'Feta (20g)', '1 slice rye toast'],
          instructions: 'Bake in small skillet until fluffy and set. Golden brown on edges.'
        },
        {
          id: 'fri-2',
          type: 'Lunch',
          name: 'Prepped Chicken, Sweet Potato & Sautéed Greens',
          calories: 495,
          protein: 47,
          carbs: 44,
          fat: 12,
          prepMinutes: 5,
          ingredients: ['180g prepped chicken', '150g baked sweet potato', 'Baby spinach wilted with garlic'],
          instructions: 'Reheat container for an effortless nutrient-dense lunch.'
        },
        {
          id: 'fri-3',
          type: 'Dinner',
          name: 'Pan-Grilled White Fish & Rainbow Slaw',
          calories: 485,
          protein: 42,
          carbs: 32,
          fat: 18,
          prepMinutes: 12,
          cookMinutes: 10,
          ingredients: ['200g cod or sea bass fillet', 'Shredded cabbage and carrot slaw with lime-olive oil dressing', '100g quinoa'],
          instructions: 'Season fish with smoked paprika and lime. Sear 3 mins per side until flakey.'
        },
        {
          id: 'fri-4',
          type: 'Snack',
          name: 'Dark Chocolate Protein Mousse',
          calories: 225,
          protein: 20,
          carbs: 18,
          fat: 7,
          prepMinutes: 5,
          ingredients: ['150g Greek yogurt', '1/2 scoop chocolate protein powder', '1 tsp cacao powder', '1 square 85% dark chocolate grated'],
          instructions: 'Whip yogurt with protein and raw cacao into a rich, guilt-free Friday evening mousse.'
        }
      ]
    },
    {
      dayName: 'Saturday',
      dayGoal: 'Weekend Recovery & Clean Glycogen Refill',
      totalCalories: 1590,
      totalProtein: 140,
      meals: [
        {
          id: 'sat-1',
          type: 'Breakfast',
          name: 'High-Protein Banana Oat Pancakes',
          calories: 420,
          protein: 35,
          carbs: 52,
          fat: 7,
          prepMinutes: 8,
          cookMinutes: 10,
          ingredients: ['1 medium banana', '2 eggs', '35g rolled oats', '1/2 scoop protein powder', 'Sugar-free syrup', 'Berries'],
          instructions: 'Blend batter until smooth. Cook on low heat in skillet until bubbles form, flip for 1 minute.'
        },
        {
          id: 'sat-2',
          type: 'Lunch',
          name: 'Smoked Salmon & Poached Egg Salad',
          calories: 460,
          protein: 38,
          carbs: 24,
          fat: 22,
          prepMinutes: 10,
          ingredients: ['120g wild smoked salmon', '1 soft poached egg', 'Mixed rocket salad', 'Capers', 'Lemon vinaigrette', '1 slice sourdough'],
          instructions: 'Arrange smoked salmon ribbon over crisp peppery rocket, crown with warm poached egg.'
        },
        {
          id: 'sat-3',
          type: 'Dinner',
          name: 'Gourmet Lean Beef Burger Bowl (Bun-less)',
          calories: 520,
          protein: 48,
          carbs: 28,
          fat: 21,
          prepMinutes: 15,
          cookMinutes: 10,
          ingredients: ['180g extra lean beef patty', 'Crisp butter lettuce base', 'Grilled onions', 'Pickles', 'Baked potato wedges (100g)'],
          instructions: 'Sear patty on cast iron. Build over fresh greens with grilled onions and mustard.'
        },
        {
          id: 'sat-4',
          type: 'Snack',
          name: 'Chilled Protein Shake with Almond Butter',
          calories: 190,
          protein: 19,
          carbs: 12,
          fat: 6,
          prepMinutes: 3,
          ingredients: ['Whey isolate', 'Unsweetened almond milk', 'Ice cubes', '1 tsp almond butter'],
          instructions: 'Blend with ice for a thick milkshake consistency.'
        }
      ]
    },
    {
      dayName: 'Sunday',
      dayGoal: 'Weekly Review & Meal Prep Mastery Day',
      totalCalories: 1570,
      totalProtein: 143,
      meals: [
        {
          id: 'sun-1',
          type: 'Breakfast',
          name: 'Sunday Brunch Protein Bowl',
          calories: 395,
          protein: 33,
          carbs: 36,
          fat: 13,
          prepMinutes: 10,
          cookMinutes: 8,
          ingredients: ['2 whole eggs poached', '100g sautéed black beans', '1/4 avocado', 'Salsa fresca', 'Fresh cilantro'],
          instructions: 'Warm black beans with cumin, top with runny poached eggs, fresh salsa and avocado.'
        },
        {
          id: 'sun-2',
          type: 'Lunch',
          name: 'Grilled Lemon Herb Chicken & Brown Rice',
          calories: 490,
          protein: 46,
          carbs: 48,
          fat: 11,
          prepMinutes: 10,
          cookMinutes: 15,
          ingredients: ['Freshly grilled 180g chicken breast (test your prep!)', '120g brown rice', 'Steamed green beans'],
          instructions: 'Enjoy fresh chicken straight off the Sunday prep grill.'
        },
        {
          id: 'sun-3',
          type: 'Dinner',
          name: 'Slow-Cooked Lean Beef Stew with Root Vegetables',
          calories: 480,
          protein: 44,
          carbs: 38,
          fat: 14,
          prepMinutes: 15,
          cookMinutes: 30,
          ingredients: ['160g braised lean beef chuck', 'Carrots', 'Celery', 'Baby potatoes', 'Rich beef bone broth herbs'],
          instructions: 'Hearty warm comfort food packed with collagen and muscle-repairing amino acids.'
        },
        {
          id: 'sun-4',
          type: 'Snack',
          name: 'Greek Yogurt with Crushed Walnuts',
          calories: 205,
          protein: 20,
          carbs: 14,
          fat: 7,
          prepMinutes: 3,
          ingredients: ['150g Greek yogurt', '10g chopped raw walnuts', '1/2 tsp pure honey'],
          instructions: 'Soothing bedtime protein snack providing slow-digesting casein.'
        }
      ]
    }
  ]
};

export const defaultWeeklyWorkoutPlan: WeeklyWorkoutPlan = {
  programName: '15-30 Min High-Intensity Shred Split',
  description: 'Designed to torch visceral fat and sculpt athletic muscle with zero wasted time. Utilizes proven progressive overload principles.',
  weeklyGoal: 'Hit 4 core resistance sessions, 1 active recovery core/stretch, and 2 rest days.',
  days: [
    {
      dayNumber: 1,
      dayName: 'Monday',
      focus: 'Chest, Shoulders & Triceps (Push Power)',
      durationMinutes: 22,
      isRestDay: false,
      completed: true,
      exercises: [
        {
          name: 'Dumbbell Flat Bench Press',
          sets: 3,
          reps: '10-12',
          restSeconds: 60,
          targetMuscle: 'Mid-Pectorals & Front Delts',
          coachingCue: 'Plant feet firm, arch slightly, drive dumbbells with control.',
          weightUsed: '22 kg',
          completedSets: [true, true, true]
        },
        {
          name: 'Incline Dumbbell Flyes',
          sets: 3,
          reps: '12-15',
          restSeconds: 45,
          targetMuscle: 'Upper Chest',
          coachingCue: 'Slight bend in elbows, deep stretch at bottom, squeeze at peak.',
          weightUsed: '14 kg',
          completedSets: [true, true, true]
        },
        {
          name: 'Seated Overhead Dumbbell Press',
          sets: 3,
          reps: '10',
          restSeconds: 60,
          targetMuscle: 'Shoulders & Core',
          coachingCue: 'Lock core, press vertical without flaring ribcage.',
          weightUsed: '16 kg',
          completedSets: [true, true, true]
        },
        {
          name: 'Bench Dips / Tricep Pushdowns',
          sets: 3,
          reps: '15',
          restSeconds: 45,
          targetMuscle: 'Triceps',
          coachingCue: 'Elbows track straight back, full extension lockout.',
          completedSets: [true, true, true]
        }
      ]
    },
    {
      dayNumber: 2,
      dayName: 'Tuesday',
      focus: 'Back, Biceps & Rear Delts (Pull Engine)',
      durationMinutes: 25,
      isRestDay: false,
      completed: true,
      exercises: [
        {
          name: 'Single-Arm Dumbbell Rows',
          sets: 3,
          reps: '10-12 / side',
          restSeconds: 60,
          targetMuscle: 'Lats & Rhomboids',
          coachingCue: 'Pull elbow towards hip pocket, pause 1s at top.',
          weightUsed: '24 kg',
          completedSets: [true, true, true]
        },
        {
          name: 'Lat Pulldowns or Pull-Ups',
          sets: 3,
          reps: '8-10',
          restSeconds: 60,
          targetMuscle: 'Upper Lats & V-Taper',
          coachingCue: 'Lead with chest proud, drive elbows down into ribs.',
          weightUsed: '60 kg',
          completedSets: [true, true, true]
        },
        {
          name: 'Incline Dumbbell Bicep Curls',
          sets: 3,
          reps: '12',
          restSeconds: 45,
          targetMuscle: 'Biceps Long Head',
          coachingCue: 'Full supination at top, eliminate body swing.',
          weightUsed: '12 kg',
          completedSets: [true, true, true]
        },
        {
          name: 'Face Pulls with Rope',
          sets: 3,
          reps: '15',
          restSeconds: 45,
          targetMuscle: 'Rear Delts & Rotator Cuff',
          coachingCue: 'Pull to eye level, flare wrists back for posture.',
          completedSets: [true, true, true]
        }
      ]
    },
    {
      dayNumber: 3,
      dayName: 'Wednesday',
      focus: 'Active Recovery & Core Mobility',
      durationMinutes: 18,
      isRestDay: false,
      completed: false,
      exercises: [
        {
          name: 'Hanging Knee / Leg Raises',
          sets: 3,
          reps: '12-15',
          restSeconds: 45,
          targetMuscle: 'Lower Abs & Hip Flexors',
          coachingCue: 'Posterior pelvic tilt, avoid swinging momentum.'
        },
        {
          name: 'Plank with Shoulder Taps',
          sets: 3,
          reps: '45 seconds',
          restSeconds: 45,
          targetMuscle: 'Deep Transverse Abdominis',
          coachingCue: 'Glutes squeezed tight, keep hips completely steady.'
        },
        {
          name: 'Cat-Cow & Thoracic Rotations',
          sets: 2,
          reps: '10 reps / side',
          restSeconds: 30,
          targetMuscle: 'Spine & Thoracic Mobility',
          coachingCue: 'Sync breathing with movement.'
        }
      ]
    },
    {
      dayNumber: 4,
      dayName: 'Thursday',
      focus: 'Quads, Hamstrings & Calves (Leg Hypertrophy)',
      durationMinutes: 28,
      isRestDay: false,
      completed: false,
      exercises: [
        {
          name: 'Goblet Squats / Barbell Squat',
          sets: 4,
          reps: '10-12',
          restSeconds: 75,
          targetMuscle: 'Quads, Glutes & Adductors',
          coachingCue: 'Break at knees and hips simultaneously, hit parallel depth.'
        },
        {
          name: 'Romanian Dumbbell Deadlifts',
          sets: 3,
          reps: '12',
          restSeconds: 60,
          targetMuscle: 'Hamstrings & Glute-Ham Tie-in',
          coachingCue: 'Hinge back until deep hamstring stretch, flat spine.'
        },
        {
          name: 'Walking Dumbbell Lunges',
          sets: 3,
          reps: '10 / leg',
          restSeconds: 60,
          targetMuscle: 'Unilateral Stability & Quads',
          coachingCue: 'Keep torso upright, 90 degree angle on both knees.'
        },
        {
          name: 'Standing Calf Raises',
          sets: 3,
          reps: '15-20',
          restSeconds: 30,
          targetMuscle: 'Gastrocnemius',
          coachingCue: 'Hold 2-second peak contraction on balls of feet.'
        }
      ]
    },
    {
      dayNumber: 5,
      dayName: 'Friday',
      focus: 'Metabolic Full-Body HIIT Burn',
      durationMinutes: 20,
      isRestDay: false,
      completed: false,
      exercises: [
        {
          name: 'Dumbbell Thrusters (Squat to Press)',
          sets: 4,
          reps: '12',
          restSeconds: 45,
          targetMuscle: 'Full Body Metabolic Engine',
          coachingCue: 'Explosive drive out of the squat directly into overhead press.'
        },
        {
          name: 'Kettlebell / DB Swings',
          sets: 4,
          reps: '15',
          restSeconds: 45,
          targetMuscle: 'Posterior Chain & Cardio',
          coachingCue: 'Violent hip snap, do not squat the bell.'
        },
        {
          name: 'Renegade Rows to Push-Up',
          sets: 3,
          reps: '8 / side',
          restSeconds: 45,
          targetMuscle: 'Core, Chest & Upper Back',
          coachingCue: 'Anti-rotation core brace throughout.'
        },
        {
          name: 'Mountain Climbers Fast Pace',
          sets: 3,
          reps: '40 seconds',
          restSeconds: 30,
          targetMuscle: 'Cardiovascular Burn & Core',
          coachingCue: 'Keep shoulders over hands, drive knees rapidly.'
        }
      ]
    },
    {
      dayNumber: 6,
      dayName: 'Saturday',
      focus: 'Arms, Shoulders & Calisthenics Finisher',
      durationMinutes: 22,
      isRestDay: false,
      completed: false,
      exercises: [
        {
          name: 'Dumbbell Lateral Raises (Drop Set)',
          sets: 4,
          reps: '12 + 6 drop',
          restSeconds: 45,
          targetMuscle: 'Lateral Deltoids (Shoulder Width)',
          coachingCue: 'Lead with elbows, slight forward tilt, controlled descent.'
        },
        {
          name: 'Dumbbell Hammer Curls',
          sets: 3,
          reps: '12',
          restSeconds: 45,
          targetMuscle: 'Brachialis & Forearms',
          coachingCue: 'Thumbs up grip, targets arm thickness.'
        },
        {
          name: 'Overhead Tricep Extension',
          sets: 3,
          reps: '12-15',
          restSeconds: 45,
          targetMuscle: 'Long Head Triceps',
          coachingCue: 'Keep elbows tucked close to ears.'
        }
      ]
    },
    {
      dayNumber: 7,
      dayName: 'Sunday',
      focus: 'Complete Rest & CNS Reset',
      durationMinutes: 0,
      isRestDay: true,
      completed: false,
      exercises: []
    }
  ]
};

export const defaultMilestones: Milestone[] = [
  {
    id: 'm1',
    title: 'First Step to Greatness',
    description: 'Log your first meal in the food journal',
    iconName: 'Flame',
    xpReward: 50,
    unlocked: true,
    unlockedAt: '2 days ago',
    progress: 100
  },
  {
    id: 'm2',
    title: 'Hydration Warrior',
    description: 'Reach 2.5L daily water target 3 days in a row',
    iconName: 'Droplets',
    xpReward: 100,
    unlocked: true,
    unlockedAt: 'Yesterday',
    progress: 100
  },
  {
    id: 'm3',
    title: 'Protein Master',
    description: 'Hit 140g+ protein target in a single day',
    iconName: 'Dumbbell',
    xpReward: 120,
    unlocked: true,
    unlockedAt: 'Today',
    progress: 100
  },
  {
    id: 'm4',
    title: 'Meal Prep Pro',
    description: 'Review your 7-day meal plan and grocery checklist',
    iconName: 'Utensils',
    xpReward: 80,
    unlocked: false,
    progress: 60
  },
  {
    id: 'm5',
    title: 'Iron Discipline (7-Day Streak)',
    description: 'Maintain a 7-day logging streak without breaks',
    iconName: 'Zap',
    xpReward: 250,
    unlocked: false,
    progress: 57 // 4/7 days
  },
  {
    id: 'm6',
    title: 'Fat Shred Catalyst',
    description: 'Complete 5 workout sessions from your plan',
    iconName: 'Award',
    xpReward: 200,
    unlocked: false,
    progress: 40 // 2/5 workouts
  },
  {
    id: 'm7',
    title: 'AI Scanner Pioneer',
    description: 'Use AI photo meal recognition to log nutrition',
    iconName: 'Camera',
    xpReward: 90,
    unlocked: false,
    progress: 0
  }
];

export const defaultWaterReminders: WaterReminder[] = [
  { id: 'rem-1', time: '08:00', label: 'Morning Kickstart Glass', amountMl: 500, enabled: true },
  { id: 'rem-2', time: '11:30', label: 'Mid-Morning Hydration', amountMl: 250, enabled: true },
  { id: 'rem-3', time: '14:30', label: 'Afternoon Focus Boost', amountMl: 500, enabled: true },
  { id: 'rem-4', time: '17:30', label: 'Pre-Workout Fuel', amountMl: 500, enabled: true },
  { id: 'rem-5', time: '20:30', label: 'Evening Balance Refill', amountMl: 250, enabled: true }
];

export const initialFoodLogs: FoodLogEntry[] = [
  {
    id: 'log-1',
    mealType: 'breakfast',
    title: 'Power Scramble & Sourdough Toast',
    calories: 380,
    protein: 32,
    carbs: 34,
    fat: 14,
    fiber: 5,
    loggedAt: '08:15 AM',
    date: new Date().toISOString().slice(0, 10),
    healthScore: 9.3,
    dietaryTags: ['High Protein', 'Whole Grains'],
    insights: 'Excellent balanced protein start. Keeps ghrelin appetite hormones suppressed for 4+ hours.'
  },
  {
    id: 'log-2',
    mealType: 'lunch',
    title: 'Grilled Salmon & Quinoa Power Bowl',
    calories: 520,
    protein: 42,
    carbs: 45,
    fat: 18,
    fiber: 6,
    photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    loggedAt: '01:20 PM',
    date: new Date().toISOString().slice(0, 10),
    healthScore: 9.6,
    dietaryTags: ['Omega-3 Rich', 'Lean Fuel'],
    insights: 'Logged via AI Photo Scanner. Rich in heart-healthy EPA/DHA fatty acids and complete plant quinoa carbs.'
  }
];

export const initialWeightLogs: WeightLogEntry[] = [
  { id: 'w-1', date: '2026-10-09', weightKg: 91.5, note: 'Starting baseline weigh-in' },
  { id: 'w-2', date: '2026-10-11', weightKg: 91.0, note: 'Post morning cardio' },
  { id: 'w-3', date: '2026-10-13', weightKg: 90.6, note: 'Morning fasted' },
  { id: 'w-4', date: '2026-10-15', weightKg: 90.2, note: 'Water weight dropped' },
  { id: 'w-5', date: '2026-10-17', weightKg: 89.8, note: 'End of week 1 deficit' },
  { id: 'w-6', date: '2026-10-19', weightKg: 89.4, note: 'Morning weigh-in' },
  { id: 'w-7', date: '2026-10-21', weightKg: 89.1, note: 'Feeling leaner & energetic' },
  { id: 'w-8', date: '2026-10-23', weightKg: 88.8, note: 'Today: hit sub-89kg milestone!' },
];

