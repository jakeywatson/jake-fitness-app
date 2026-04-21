// Zero to Fit — Design System
// Philosophy: dark, premium, athletic. Less like a web app, more like Strava or Whoop.

export const COLORS = {
  // Backgrounds — layered depth
  bg:       '#080c14',   // page background — near-black with blue tint
  surface:  '#0f1520',   // cards — slightly lighter
  elevated: '#16202f',   // modals, popovers
  overlay:  '#1c2a3d',   // hover states, active inputs

  // Borders
  border:   '#1e2d42',
  border2:  '#2a3d56',

  // Text
  text:     '#f0f4f8',
  textSub:  '#8fa3b8',   // secondary labels
  textMuted:'#4d6278',   // timestamps, hints

  // Brand
  blue:     '#3b82f6',
  blueLight:'#93c5fd',
  blueDark: '#1d3a62',
  blueMid:  '#2563eb',

  // Accents
  green:    '#34d399',
  greenDim: '#065f46',
  greenBg:  '#061a14',
  red:      '#f87171',
  redBg:    '#1f0a0a',
  orange:   '#fb923c',
  yellow:   '#fbbf24',
  purple:   '#a78bfa',
  purpleBg: '#1a1040',
};

export const TYPE = {
  // Use Inter font family (loaded in App.js)
  display:  { fontFamily: 'Inter_700Bold',   fontSize: 32, color: COLORS.text,    lineHeight: 38 },
  title:    { fontFamily: 'Inter_700Bold',   fontSize: 22, color: COLORS.text,    lineHeight: 28 },
  heading:  { fontFamily: 'Inter_600SemiBold',fontSize:17, color: COLORS.text,    lineHeight: 24 },
  body:     { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.text,    lineHeight: 22 },
  label:    { fontFamily: 'Inter_500Medium',  fontSize: 12, color: COLORS.textSub, lineHeight: 18 },
  caption:  { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.textMuted,lineHeight: 16 },
  mono:     { fontFamily: 'Inter_600SemiBold',fontSize: 28, color: COLORS.text },
};

export const RADIUS = {
  sm:  8,
  md:  14,
  lg:  20,
  xl:  28,
  pill:999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Shared component styles
export const S = {
  screen:     { flex: 1, backgroundColor: COLORS.bg },
  content:    { padding: 20, paddingBottom: 48 },
  card:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHi:     { backgroundColor: COLORS.elevated, borderRadius: RADIUS.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border2 },
  row:        { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Labels — replace the uppercase spaced-out style with something cleaner
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },

  // Pill badge
  badge:  { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },

  // Primary button
  btn: {
    backgroundColor: COLORS.blue,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...{ shadowColor: '#3b82f6', shadowOffset:{width:0,height:4}, shadowOpacity:0.35, shadowRadius:10, elevation:6 },
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff' },

  // Ghost button
  btnGhost: {
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border2,
  },
  btnGhostText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: COLORS.textSub },

  // Input
  input: {
    backgroundColor: COLORS.overlay,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border2,
    color: COLORS.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    padding: 14,
  },
};
