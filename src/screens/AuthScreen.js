import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { signIn, signUp, signInWithGoogle, signInWithApple } from '../utils/supabase';
import { Image } from 'react-native';
import { COLORS } from '../constants/data';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    } finally {
      setSocialLoading(null);
    }
  };

  const handleApple = async () => {
    setError(''); setSocialLoading('apple');
    try {
      const session = await signInWithApple();
      if (session?.user) onAuth(session.user);
    } catch (e) {
      setError(e.message || 'Apple sign-in failed');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Zero to Fit</Text>
          <Text style={styles.tagline}>Simple runs. Simple gym.{'\n'}Told exactly what to do.</Text>
        </View>

        {/* Social sign-in — shown first, most prominent */}
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={!!socialLoading} testID="google-btn">
            {socialLoading === 'google'
              ? <ActivityIndicator color="#1f1f1f" />
              : <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
            }
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleBtn} onPress={handleApple} disabled={!!socialLoading}>
              {socialLoading === 'apple'
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={styles.appleIcon}></Text>
                    <Text style={styles.appleText}>Continue with Apple</Text>
                  </>
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

        {/* Email/password toggle */}
        <View style={styles.toggle}>
          {['signin', 'signup'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
              onPress={() => { setMode(m); setError(''); setSuccess(''); }}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={t => { setEmail(t); setError(''); }}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="email-input"
          />
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            placeholder="6+ characters"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            testID="password-input"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            testID="sign-in-btn"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.trialNote}>
          <Text style={styles.trialText}>
            Free forever for the basics.{'\n'}Unlock everything for £3.99/month.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flexGrow: 1, padding: 24, paddingTop: 60 },
  hero: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 100, height: 100, marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  tagline: { fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 24 },
  socialButtons: { gap: 10, marginBottom: 20 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 16, height: 54 },
  googleIcon: { fontSize: 18, fontWeight: '700', color: '#4285F4', width: 24, textAlign: 'center' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#1f1f1f' },
  appleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#000', borderRadius: 12, padding: 16, height: 54 },
  appleIcon: { fontSize: 20, color: '#fff' },
  appleText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, color: COLORS.muted },
  toggle: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.blueDark },
  toggleText: { fontSize: 14, color: COLORS.dim, fontWeight: '600' },
  toggleTextActive: { color: COLORS.blueLight },
  form: { gap: 4 },
  inputLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4, marginTop: 8, letterSpacing: 1 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.text, padding: 14, fontSize: 15 },
  errorText: { color: COLORS.red, fontSize: 13, marginTop: 8, textAlign: 'center' },
  successText: { color: COLORS.green, fontSize: 13, marginTop: 8, textAlign: 'center' },
  submitBtn: { backgroundColor: COLORS.blue, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  trialNote: { marginTop: 28, alignItems: 'center' },
  trialText: { fontSize: 12, color: COLORS.dim, textAlign: 'center', lineHeight: 20 },
});
