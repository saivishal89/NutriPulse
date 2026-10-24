# NutriPulse Pro — UI/UX Architecture & Customization Guide

This document provides a complete blueprint of the UI/UX architecture, component hierarchy, design tokens, charts, and styling systems across **NutriPulse Pro**. Use this guide to customize themes, modify layouts, alter typography, or rebrand any component.

---

## 1. Design System & Tokens

### Color Palette (Tailwind CSS v4 & Hex Variables)
The application uses a high-contrast athletic dark aesthetic built with glassmorphism and radiant biometric status accents:

| Token / Role | Hex Code | Tailwind Utility | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#090d16` | `bg-[#090d16]` | Base deep obsidian backdrop with radial mesh gradient |
| **Card Surface (Default)** | `#121620` / `rgba(15,23,42,0.75)` | `bg-slate-900/90`, `glass-panel` | Primary cards, panels, and modal content |
| **Card Surface (Deep)** | `#0b0f19` / `rgba(0,0,0,0.4)` | `bg-black/40`, `bg-slate-950` | Inner inset tables, inputs, data displays |
| **Brand Primary (Accent)** | `#ff5500` / `#f97316` | `text-[#ff5500]`, `bg-[#ff5500]` | CTAs, active tab badges, calorie rings |
| **Hydration & BMI Cyan** | `#06b6d4` / `#22d3ee` | `text-cyan-400`, `border-cyan-500` | Water tracker, BMI trajectory curves, protein highlight |
| **Success & Target Emerald** | `#10b981` / `#34d399` | `text-emerald-400`, `bg-emerald-500` | Weight line, goal milestones, normal BMI zone |
| **Carbs & Alert Amber** | `#f59e0b` / `#fbbf24` | `text-amber-400`, `border-amber-500` | Complex carbohydrates, goal target reference lines |
| **Fats & Alerts Rose** | `#f43f5e` / `#fb7185` | `text-rose-400`, `border-rose-500` | Fat grams, high BMI / obese threshold indicators |

### Typography
- **Primary Body & Headings**: `Plus Jakarta Sans` (weights: 400, 500, 600, 700, 800)
- **Biometric, Numbers & Timers**: `JetBrains Mono` (weights: 500, 600, 700)
- **Defined in**: `/src/index.css` via:
  ```css
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  ```

### Custom CSS Classes (`src/index.css`)
- `.bg-mesh`: Radial ambient lighting in the background (cyan, emerald, and indigo ambient orbs).
- `.glass-panel`: Translucent card surface with `backdrop-filter: blur(12px)`.
- `.glow-emerald`, `.glow-cyan`, `.glow-amber`: Subtle glowing drop-shadows for biometric status badges.

---

## 2. Component Architecture & File Map

```
/src
├── App.tsx                     # Main root state, tab router & LocalStorage sync
├── index.css                   # Global theme tokens, typography, and scrollbars
├── types/index.ts              # Data contracts (UserProfile, FoodLogEntry, WeightLogEntry, etc.)
├── data/mockData.ts            # Default starter data (profiles, meal plans, workouts, weigh-ins)
├── utils/
│   ├── calculator.ts           # Mifflin-St Jeor TDEE, BMI, macros & hydration algorithms
│   └── sound.ts                # Web Audio API sound effects (water drops, timer beeps, chimes)
└── components/
    ├── Header.tsx              # Sticky top bar: NutriPulse logo, streak badges, Google Sign-In & tabs
    ├── GoogleAuthButton.tsx    # Official Google Sign-In button, profile avatar & account dropdown
    ├── Dashboard.tsx           # Command center: Calorie Ring, 4 Macros, Weight/BMI chart switcher, Today's Journal
    ├── WeightTracker.tsx       # Recharts weight progress line chart & goal setting drawer
    ├── BmiTrajectoryChart.tsx  # Recharts clinical BMI chart, WHO spectrum gauge & health velocity insights
    ├── AiPhotoScanner.tsx      # Gemini 3.8 Flash camera/gallery photo food scanner & quick test presets
    ├── MealPrepPlanner.tsx     # 7-day meal schedule, recipes, batch cooking guide & grocery checklist
    ├── WaterTracker.tsx        # 2.5L water tracker, 10 interactive glasses & scheduled notification reminders
    ├── WorkoutPlanner.tsx      # 15-30 min routines, live workout player, set checkoff & audio rest timer
    ├── StreaksAndMilestones.tsx# Gamified discipline hub: food/water/workout streaks, Titan XP level progression
    ├── WeeklyReports.tsx       # 7-day adherence bar chart, macro balance & Printable Plan for 2026
    ├── ProfileModal.tsx        # Physical assessment modal (BMI gauge, calorie slider, body fat roadmap)
    └── ManualFoodModal.tsx     # Quick search database of fitness foods or custom macro input
```

---

## 3. How to Customize Common UI/UX Elements

### A. How to Change the Color Theme
If you want to shift from Electric Orange (`#ff5500`) to another brand accent (e.g. Neon Emerald `#10b981` or Electric Blue `#3b82f6`):
1. In `src/components/Header.tsx`, locate:
   ```tsx
   <div className="bg-gradient-to-r from-[#ff5500] to-amber-500 ...">
   ```
   Replace `#ff5500` with your desired hex.
2. In `src/components/Dashboard.tsx`, locate the Calorie Ring:
   ```tsx
   className="stroke-[#ff5500] transition-all duration-700 ease-out"
   ```
   Change `#ff5500` to `#10b981` or `#3b82f6`.
3. In `src/components/ProfileModal.tsx`, locate the slider accent and CTA buttons:
   ```tsx
   className="accent-[#ff5500]"
   className="bg-[#ff5500] hover:bg-[#ff6a1a]"
   ```

### B. Customizing the Recharts Charts
Both `src/components/WeightTracker.tsx` and `src/components/BmiTrajectoryChart.tsx` use **Recharts**.

#### 1. Weight Tracker (`src/components/WeightTracker.tsx`):
- **Line Color & Stroke**:
  ```tsx
  <Line
    type="monotone"
    dataKey="weight"
    stroke="#10b981"          // Change to any color
    strokeWidth={3}
    dot={{ r: 4, fill: '#10b981', stroke: '#090d16', strokeWidth: 2 }}
    activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
  />
  ```
- **Goal Reference Line**:
  ```tsx
  <ReferenceLine 
    y={targetWeight} 
    stroke="#f59e0b"          // Dashed target line color
    strokeDasharray="4 4" 
    strokeWidth={1.5}
  />
  ```

#### 2. BMI Trajectory (`src/components/BmiTrajectoryChart.tsx`):
- **Clinical Thresholds**:
  - `y={24.9}`: Upper threshold for WHO Normal weight (Green line).
  - `y={goalBmi}`: User's goal weight BMI (Amber line).
- **Tooltip Styling**:
  Modify the `CustomBmiTooltip` function to add or rearrange metrics (e.g., body fat %, weekly delta, calorie notes).

### C. Modifying Navigation & Tab Bar
To add or reorder tabs, edit the `tabs` array in `src/components/Header.tsx`:
```tsx
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'scanner', label: 'AI Food Scanner', icon: Camera, highlight: true },
  { id: 'mealprep', label: '7-Day Meal Prep', icon: Calendar },
  { id: 'water', label: 'Water & Reminders', icon: Droplet },
  { id: 'workout', label: 'Workout Split', icon: Dumbbell },
  { id: 'streaks', label: 'Streaks & Milestones', icon: Award },
  { id: 'reports', label: 'Weekly Report', icon: Sparkles },
];
```

### D. Adjusting Default Health Profile & Mock Data
To adjust default starting weights, targets, or workout routines:
- Open `src/data/mockData.ts`.
- Edit `initialProfile`:
  ```ts
  export const initialProfile: UserProfile = {
    name: 'Alex Hunter',
    age: 28,
    heightCm: 178,
    weightKg: 88.8,
    targetWeightKg: 74.0,
    targetCalories: 1573,
    waterTargetMl: 2500,
    ...
  };
  ```
- Clear your browser's local storage key `nutripulse_profile` (or click *Reset* in the UI) to see the new defaults instantly.

---

## 4. LocalStorage State Management
All application state automatically synchronizes to `localStorage` in `src/App.tsx`:

| LocalStorage Key | Type | Description |
| :--- | :--- | :--- |
| `nutripulse_profile` | `UserProfile` | User physiological data, target calories, macros |
| `nutripulse_weight_logs` | `WeightLogEntry[]` | Daily weigh-ins history (used for Recharts) |
| `nutripulse_food_logs` | `FoodLogEntry[]` | Today's logged meals (scanned or manual) |
| `nutripulse_water_log` | `WaterLog` | Daily intake in ml, timestamps, glasses |
| `nutripulse_water_reminders` | `WaterReminder[]` | Configurable reminder schedule (8:00 AM, etc.) |
| `nutripulse_meal_plan` | `WeeklyMealPlan` | 7-day personalized meal prep & grocery checklist |
| `nutripulse_workout_plan` | `WeeklyWorkoutPlan` | 7-day workout split, exercises, sets, and reps |
| `nutripulse_streaks` | `StreakState` | Food, water, and workout consecutive days + XP |
| `nutripulse_milestones` | `Milestone[]` | Unlocked badges and progress percentages |

---

## 5. Web Audio API Sound Effects
Sound effects are generated programmatically without external MP3 files in `src/utils/sound.ts`:
- `sounds.playWaterDrop()`: Played when logging a water glass or checking off an item.
- `sounds.playTimerBeep(isFinal)`: Countdown beeps for the workout rest timer.
- `sounds.playSuccessChime()`: Four-tone chord played when completing a workout, scanning a meal, or saving weigh-ins.
You can adjust pitch frequencies or durations inside `src/utils/sound.ts`.
