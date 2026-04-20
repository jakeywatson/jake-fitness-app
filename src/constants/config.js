// ─── Supabase ─────────────────────────────────────────────────────────────────
export const SUPABASE_URL = "https://wkgqvekoinagrswusjhq.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZ3F2ZWtvaW5hZ3Jzd3VzamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzYzMjAsImV4cCI6MjA5MjIxMjMyMH0.zjjUkOACStdhFVRiyflMchnBnN119qg6pf8ttI34w_o";

// ─── RevenueCat ───────────────────────────────────────────────────────────────
export const REVENUECAT_API_KEY_ANDROID = "test_TlXxqqUPXzfxjOpuEjkccPbXUkO";

// ─── Google OAuth ─────────────────────────────────────────────────────────────
// Web client ID (type 3) from google-services.json — used for OAuth sign-in
export const GOOGLE_WEB_CLIENT_ID = "32155407115-tfn9srk14nd2n2the3rrv7db5dm9n2rm.apps.googleusercontent.com";

// ─── Strava ───────────────────────────────────────────────────────────────────
export const STRAVA_CLIENT_ID = "228019";
export const STRAVA_CLIENT_SECRET = "REPLACE_WITH_STRAVA_CLIENT_SECRET";
export const STRAVA_REDIRECT_URI = "zerotofit://strava-auth";

// ─── Products ─────────────────────────────────────────────────────────────────
export const ENTITLEMENT_PREMIUM = "premium";
export const PRODUCT_MONTHLY = "zerotofit_monthly";
export const PRODUCT_ANNUAL = "zerotofit_annual";

// ─── Free tier limits ─────────────────────────────────────────────────────────
export const FREE_RUN_WEEKS = 2;
export const FREE_GYM_EXERCISES = 3;
export const FREE_HIIT_WORKOUTS = 2;

// ─── Calorie constants ────────────────────────────────────────────────────────
export const MET_VALUES = {
  run_easy: 8.0,
  run_moderate: 10.0,
  hiit: 9.0,
  gym_strength: 5.0,
  gym_circuit: 6.5,
  walk: 3.5,
};

export const TDEE_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const SAFE_DEFICIT = 500;
export const LBS_PER_CALORIE_DEFICIT = 1 / 3500;
