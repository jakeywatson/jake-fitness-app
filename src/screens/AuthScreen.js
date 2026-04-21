import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signIn, signUp, signInWithGoogle, signInWithApple } from '../utils/supabase';
import { COLORS } from '../constants/data';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!email.includes('@')) { setError('Enter a valid email address'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setSuccess('Check your email to confirm your account, then sign in.');
        setMode('signin');
      } else {
        const { user } = await signIn(email, password);
        onAuth(user);
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(''); setSocialLoading('google');
    try {
      const session = await signInWithGoogle();
      if (session?.user) onAuth(session.user);
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    } finally { setSocialLoading(null); }
  };

  const handleApple = async () => {
    setError(''); setSocialLoading('apple');
    try {
      const session = await signInWithApple();
      if (session?.user) onAuth(session.user);
    } catch (e) {
      setError(e.message || 'Apple sign-in failed');
    } finally { setSocialLoading(null); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>Zero to Fit</Text>
          <Text style={styles.tagline}>No decisions.{'\n'}Just progress.</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['🏃 Running plan', '💪 Gym plan', '🔥 HIIT', '⚖️ Weight tracking'].map(f => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Social buttons */}
        <View style={styles.socialSection}>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={!!socialLoading}
            testID="google-btn"
            activeOpacity={0.85}
          >
            {socialLoading === 'google'
              ? <ActivityIndicator color="#1f1f1f" />
              : <>
                  <Text style={styles.googleG}>G</Text>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
            }
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleBtn} onPress={handleApple} disabled={!!socialLoading} activeOpacity={0.85}>
              {socialLoading === 'apple'
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.appleIcon}></Text><Text style={styles.appleText}>Continue with Apple</Text></>
              }
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Toggle */}
        <View style={styles.toggle}>
          {['signin', 'signup'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
              onPress={() => { setMode(m); setError(''); setSuccess(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => { setEmail(t); setError(''); }}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="email-input"
          />
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.pwWrap}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={t => { setPassword(t); setError(''); }}
              placeholder="6+ characters"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPw}
              testID="password-input"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            testID="sign-in-btn"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Free forever for the basics.{'\n'}Unlock everything for £3.99/month.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080c14' },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 28 },
  logoWrap: { width: 80, height: 80, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#080c14' },
  logo: { width: 80, height: 80 },
  appName: { fontFamily: 'Inter_700Bold', fontSize: 34, color: '#f0f4f8', marginBottom: 8, letterSpacing: -0.5 },
  tagline: { fontFamily: 'Inter_400Regular', fontSize: 17, color: '#8fa3b8', textAlign: 'center', lineHeight: 26 },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 },
  pill: { backgroundColor: '#0f1520', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#1e2d42' },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8fa3b8' },

  socialSection: { gap: 10, marginBottom: 24 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, height: 52 },
  googleG: { fontSize: 17, fontWeight: '700', color: '#4285F4', width: 20, textAlign: 'center' },
  googleText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1f1f1f' },
  appleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#000', borderRadius: 14, height: 52, borderWidth: 1, borderColor: '#333' },
  appleIcon: { fontSize: 18, color: '#fff' },
  appleText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e2d42' },
  dividerText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#4d6278' },

  toggle: { flexDirection: 'row', backgroundColor: '#0f1520', borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#1e2d42' },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#1d3a62' },
  toggleText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#4d6278' },
  toggleTextActive: { fontFamily: 'Inter_600SemiBold', color: '#93c5fd' },

  form: { gap: 0 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#8fa3b8', marginBottom: 6, marginTop: 14, letterSpacing: 0.3 },
  input: { backgroundColor: '#16202f', borderWidth: 1, borderColor: '#2a3d56', borderRadius: 12, color: '#f0f4f8', fontFamily: 'Inter_400Regular', fontSize: 15, padding: 14, marginBottom: 0 },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  errorText: { fontFamily: 'Inter_400Regular', color: '#f87171', fontSize: 13, marginTop: 10, textAlign: 'center' },
  successText: { fontFamily: 'Inter_400Regular', color: '#34d399', fontSize: 13, marginTop: 10, textAlign: 'center' },
  submitBtn: {
    backgroundColor: '#3b82f6', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff' },
  footer: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#4d6278', textAlign: 'center', lineHeight: 20, marginTop: 32 },
});
