// Claude API integration for AI-generated workout plans
const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

export async function generateWorkoutPlan({ fitnessLevel, trainingDays, currentWeek, goalLbs, currentLbs }) {
  const levelText = { none: 'complete beginner', little: 'some light activity', some: 'exercises once or twice a week', regular: 'exercises 3+ times a week' }[fitnessLevel] || 'beginner';
  const lostSoFar = currentLbs && goalLbs ? Math.round(currentLbs - goalLbs) : null;

  const prompt = `You are a personal trainer generating a structured 4-week workout plan for a fitness app.

User profile:
- Fitness level: ${levelText}
- Training days per week: ${trainingDays}
- Currently on week ${currentWeek} of their programme
${lostSoFar ? `- Working toward losing weight` : ''}

Generate a 4-week progressive workout plan. Each week should have ${trainingDays} workouts.
Each workout should be one of: run, gym, or hiit.
For gym workouts, choose exercises from this list ONLY: goblet_squat, romanian_deadlift, lunge, dumbbell_bench, press_up, shoulder_press, lat_pulldown, dumbbell_row, bicep_curl, plank, dead_bug, mountain_climber, thruster, glute_bridge, lateral_raise.
For hiit workouts, choose from: burpee, high_knees, star_jump, mountain_climber, press_up, jump_squat.

Respond with ONLY valid JSON in this exact format, no other text:
{
  "weeks": [
    {
      "week": 1,
      "theme": "Foundation",
      "workouts": [
        {
          "day": 1,
          "type": "gym",
          "name": "Full Body A",
          "exercises": [
            { "id": "goblet_squat", "sets": 3, "reps": "10", "rest_secs": 90 }
          ]
        },
        {
          "day": 3,
          "type": "run",
          "name": "Easy Run"
        },
        {
          "day": 5,
          "type": "hiit",
          "name": "Cardio Burn",
          "moves": ["high_knees", "star_jump", "mountain_climber"],
          "work_secs": 30,
          "rest_secs": 30,
          "rounds": 4
        }
      ]
    }
  ]
}`;

  try {
    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.log('AI plan generation failed:', e.message);
    return null;
  }
}

export async function getWorkoutSuggestion({ completedWorkouts, fitnessLevel, availableTime }) {
  const prompt = `You are a personal trainer. Suggest ONE workout for someone with:
- Fitness level: ${fitnessLevel}
- Available time: ${availableTime} minutes
- Recent workouts: ${completedWorkouts.slice(-3).join(', ') || 'none yet'}

Respond with ONLY valid JSON:
{
  "name": "Quick Core Blast",
  "reason": "You haven't done core work this week",
  "type": "hiit",
  "moves": ["plank", "mountain_climber", "dead_bug"],
  "work_secs": 30,
  "rest_secs": 20,
  "rounds": 3
}`;

  try {
    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    return null;
  }
}
