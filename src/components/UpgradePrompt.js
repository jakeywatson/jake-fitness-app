import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/data';

export default function UpgradePrompt({ message, onUpgrade }) {
  return (
    <View style={styles.container}>
      <Text style={styles.lock}>🔒</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.btn} onPress={onUpgrade}>
        <Text style={styles.btnText}>Unlock Premium — from £3.99/month</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1a1035', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.purple, margin: 4 },
  lock: { fontSize: 32, marginBottom: 10 },
  message: { fontSize: 14, color: COLORS.purpleLight, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  btn: { backgroundColor: COLORS.purple, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
