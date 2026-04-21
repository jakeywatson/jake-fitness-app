export const START_LBS = 258;
export const GOAL_LBS = 196;

export const RUN_WEEKS = [
  { week:1,  intervals:[{type:"run",secs:60},{type:"walk",secs:120}], reps:8,  warmup:300, cooldown:300 },
  { week:2,  intervals:[{type:"run",secs:75},{type:"walk",secs:120}], reps:8,  warmup:300, cooldown:300 },
  { week:3,  intervals:[{type:"run",secs:90},{type:"walk",secs:120}], reps:8,  warmup:300, cooldown:300 },
  { week:4,  intervals:[{type:"run",secs:105},{type:"walk",secs:105}],reps:7,  warmup:300, cooldown:300 },
  { week:5,  intervals:[{type:"run",secs:120},{type:"walk",secs:90}], reps:7,  warmup:300, cooldown:300 },
  { week:6,  intervals:[{type:"run",secs:135},{type:"walk",secs:90}], reps:6,  warmup:300, cooldown:300 },
  { week:7,  intervals:[{type:"run",secs:150},{type:"walk",secs:75}], reps:6,  warmup:300, cooldown:300 },
  { week:8,  intervals:[{type:"run",secs:180},{type:"walk",secs:60}], reps:6,  warmup:300, cooldown:300 },
  { week:9,  intervals:[{type:"run",secs:210},{type:"walk",secs:60}], reps:5,  warmup:300, cooldown:300 },
  { week:10, intervals:[{type:"run",secs:240},{type:"walk",secs:45}], reps:5,  warmup:300, cooldown:300 },
  { week:11, intervals:[{type:"run",secs:300},{type:"walk",secs:45}], reps:5,  warmup:300, cooldown:300 },
  { week:12, intervals:[{type:"run",secs:360},{type:"walk",secs:30}], reps:5,  warmup:300, cooldown:300 },
];

export const GYM_EXERCISES = [
  { id:"goblet", name:"Goblet Squat", emoji:"🏋️", muscle:"Legs & glutes", sets:3, reps:"10", startWeight:10, increment:2, unit:"kg dumbbell",
    how:["Hold one dumbbell vertically at your chest, both hands cupped underneath.","Stand feet shoulder-width, toes turned out slightly.","Sit back and down — chest up, like lowering onto a low chair.","Go until thighs are parallel to floor (or as low as comfortable).","Drive through heels to stand. Squeeze glutes at the top."],
    tip:"If heels lift, put a small plate under each heel until ankles loosen up." },
  { id:"bench", name:"Dumbbell Bench Press", emoji:"💪", muscle:"Chest & triceps", sets:3, reps:"10", startWeight:12, increment:2, unit:"kg per hand",
    how:["Lie flat on bench, feet flat on floor.","Dumbbells at chest height, elbows at ~45° from body.","Press up until arms almost fully extended.","Lower slowly — 2 seconds down.","Keep shoulder blades squeezed together throughout."],
    tip:"Don't flare elbows wide — 45° angle protects your shoulders and is stronger." },
  { id:"lat", name:"Lat Pulldown", emoji:"🔽", muscle:"Back & biceps", sets:3, reps:"10", startWeight:30, increment:5, unit:"kg on stack",
    how:["Grip bar wider than shoulder-width, palms facing away.","Tuck knees under the pad. Sit tall.","Pull bar to your upper chest, leading with elbows.","Pause and squeeze your lats.","Let bar rise slowly — 2 seconds up."],
    tip:"If you're swinging backwards, the weight is too heavy. Go lighter." },
  { id:"rdl", name:"Romanian Deadlift", emoji:"🔄", muscle:"Hamstrings & lower back", sets:3, reps:"10", startWeight:15, increment:2.5, unit:"kg per hand",
    how:["Dumbbells in front of thighs, standing hip-width apart.","Push hips back (not down), lower dumbbells along your legs.","Lower until you feel a hamstring stretch — around mid-shin.","Drive hips forward to stand. Squeeze glutes at top.","Keep a flat back throughout — no rounding."],
    tip:"Think 'hip hinge' not squat. Hips go back, knees barely bend." },
  { id:"shoulder", name:"Shoulder Press", emoji:"⬆️", muscle:"Shoulders & triceps", sets:3, reps:"10", startWeight:8, increment:2, unit:"kg per hand",
    how:["Sit on bench with back support.","Dumbbells at shoulder height, palms facing forward.","Press up until arms nearly extended — don't fully lock out.","Lower slowly back to shoulder height.","Core braced — don't arch your lower back."],
    tip:"Seated prevents you using legs to cheat the weight up." },
  { id:"plank", name:"Plank", emoji:"🧱", muscle:"Core", sets:3, reps:"hold", startWeight:30, increment:5, unit:"seconds",
    how:["Forearms on floor, elbows under shoulders.","Straight line from head to heels — no sagging hips.","Brace core like you're about to take a punch.","Hold for the target time. Breathe normally.","If form breaks, stop and rest — quality beats duration."],
    tip:"Time increases every 3 weeks. By week 12 you'll be holding 50s." },
];

export const HIIT_MOVES = [
  {id:"jog",name:"Jog on the Spot",emoji:"🏃",visual:"Knees pumping up towards your hips, arms swinging at 90°. Land on the balls of your feet.",cue:"Drive your knees up. Stay tall.",mod:"March on the spot — lift knees high without bouncing.",color:"#3b82f6"},
  {id:"squat",name:"Squat",emoji:"🦵",visual:"Feet shoulder-width apart. Sit your hips straight down like into a chair, chest up, knees tracking over toes.",cue:"Weight in your heels. Don't let your knees cave in.",mod:"Hold onto a wall or chair for balance.",color:"#10b981"},
  {id:"burpee",name:"Burpee",emoji:"💥",visual:"Stand → squat → hands on floor → step or jump feet to plank → step or jump feet in → jump up overhead.",cue:"Keep moving. Speed doesn't matter.",mod:"Step feet back and in. Skip the jump — just stand up.",color:"#ef4444"},
  {id:"mountain",name:"Mountain Climbers",emoji:"🏔️",visual:"Plank position. Drive one knee to chest then swap fast — like running horizontally.",cue:"Keep hips level. Core tight throughout.",mod:"Slow walk — step one knee in, step back, swap sides.",color:"#f97316"},
  {id:"starjump",name:"Star Jumps",emoji:"⭐",visual:"Jump feet wide while raising arms overhead — star shape. Jump back and repeat.",cue:"Land softly with bent knees. Keep a rhythm.",mod:"Step out side to side instead of jumping.",color:"#a78bfa"},
  {id:"highknees",name:"High Knees",emoji:"🦿",visual:"Running on the spot — exaggerate it, get each knee up to hip height. Arms pumping.",cue:"Faster than a jog, slower than a sprint.",mod:"March with high knees at walking pace.",color:"#06b6d4"},
  {id:"lunge",name:"Alternating Lunges",emoji:"🎯",visual:"Step one foot forward, lower back knee to floor, drive back to standing. Alternate legs.",cue:"Don't let front knee go past toes. Big step forward.",mod:"Reverse lunge — step backwards. Easier on the knees.",color:"#84cc16"},
  {id:"pressup",name:"Press Ups",emoji:"💪",visual:"Hands slightly wider than shoulders, body a straight line. Lower chest to floor, push back up.",cue:"Don't let hips sag. Eyes on the floor.",mod:"Drop to your knees. Still keep a straight line.",color:"#f59e0b"},
  {id:"jumpsquat",name:"Jump Squats",emoji:"🚀",visual:"Squat down then explode into a jump. Land softly back into a squat.",cue:"Land quietly — soft knees. Power from your whole leg.",mod:"Regular squat — no jump.",color:"#ec4899"},
  {id:"plankhold",name:"Plank Hold",emoji:"🧱",visual:"Forearms on floor, elbows under shoulders. Straight line head to heels. Hold and breathe.",cue:"Squeeze glutes and core. Don't let hips sag.",mod:"Drop to your knees — still keep a flat back.",color:"#64748b"},
];

export const HIIT_WORKOUTS = [
  {id:"w1",name:"Workout 1",sub:"The Foundation",moves:["jog","squat","burpee","starjump","highknees"],work:30,rest:30,rounds:5},
  {id:"w2",name:"Workout 2",sub:"Lower Body Burn",moves:["jog","squat","lunge","jumpsquat","mountain"],work:30,rest:30,rounds:5},
  {id:"w3",name:"Workout 3",sub:"Full Body Blast",moves:["highknees","burpee","pressup","starjump","plankhold"],work:35,rest:25,rounds:5},
  {id:"w4",name:"Workout 4",sub:"The Long One",moves:["jog","squat","mountain","lunge","burpee","starjump","highknees","pressup","jumpsquat","plankhold"],work:30,rest:20,rounds:3},
  {id:"w5",name:"Workout 5",sub:"Max Effort",moves:["burpee","jumpsquat","mountain","pressup","highknees"],work:40,rest:20,rounds:5},
];

export const MILESTONES = [
  {lbs:252,label:"Under 18st"},
  {lbs:238,label:"Under 17st"},
  {lbs:227,label:"⭐ Beat your best (16st 3lb)"},
  {lbs:224,label:"Under 16st"},
  {lbs:210,label:"Under 15st"},
  {lbs:196,label:"🎯 Goal — 14st"},
];

// COLORS re-exported from theme for backward compatibility
export { COLORS } from './theme';
