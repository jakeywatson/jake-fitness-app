// ─── Supabase ─────────────────────────────────────────────────────────────────
export const SUPABASE_URL = "https://wkgqvekoinagrswusjhq.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZ3F2ZWtvaW5hZ3Jzd3VzamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzYzMjAsImV4cCI6MjA5MjIxMjMyMH0.zjjUkOACStdhFVRiyflMchnBnN119qg6pf8ttI34w_o";

// ─── RevenueCat ───────────────────────────────────────────────────────────────
export const REVENUECAT_API_KEY_ANDROID = "goog_REPLACE_WITH_YOUR_KEY";

// ─── Google OAuth ─────────────────────────────────────────────────────────────
// Get from: console.cloud.google.com → Create OAuth 2.0 Client ID → Android
// Then add to Supabase: Authentication → Providers → Google
export const GOOGLE_CLIENT_ID_ANDROID = "REPLACE_WITH_ANDROID_CLIENT_ID.apps.googleusercontent.com";
export const GOOGLE_CLIENT_ID_WEB = "REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com";

// ─── Strava ───────────────────────────────────────────────────────────────────
// Get from: strava.com/settings/api
export const STRAVA_CLIENT_ID = "REPLACE_WITH_STRAVA_CLIENT_ID";
export const STRAVA_CLIENT_SECRET = "REPLACE_WITH_STRAVA_CLIENT_SECRET";
export const STRAVA_REDIRECT_URI = "jakefitness://strava-auth";

// ─── Products ─────────────────────────────────────────────────────────────────
export const ENTITLEMENT_PREMIUM = "premium";
export const PRODUCT_MONTHLY = "jake_fitness_monthly";
export const PRODUCT_ANNUAL = "jake_fitness_annual";

// ─── Free tier limits ─────────────────────────────────────────────────────────
export const FREE_RUN_WEEKS = 2;
export const FREE_GYM_EXERCISES = 3;
export const FREE_HIIT_WORKOUTS = 2;

// ─── Calorie constants ────────────────────────────────────────────────────────
// MET values (Metabolic Equivalent of Task) for calorie calculation
export const MET_VALUES = {
  run_easy: 8.0,        // jogging < 10 min/mile
  run_moderate: 10.0,   // running 6-7 mph
  hiit: 9.0,            // vigorous circuit training
  gym_strength: 5.0,    // weight training moderate
  gym_circuit: 6.5,     // circuit training vigorous
  walk: 3.5,            // brisk walking
};

// Average calories burned: MET × weight(kg) × duration(hours)
// TDEE multipliers by activity level
export const TDEE_MULTIPLIERS = {
  sedentary: 1.2,       // desk job, no exercise
  light: 1.375,         // 1-3 days/week
  moderate: 1.55,       // 3-5 days/week  
  active: 1.725,        // 6-7 days/week
};

// Safe deficit for weight loss (calories/day)
export const SAFE_DEFICIT = 500; // ~0.5kg/week loss
export const LBS_PER_CALORIE_DEFICIT = 1 / 3500; // 3500 cal deficit ≈ 1 lb fat
