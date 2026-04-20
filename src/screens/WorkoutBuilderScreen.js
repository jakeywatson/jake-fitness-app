import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, FlatList, Alert,
} from 'react-native';
import { COLORS } from '../constants/data';
import { EXERCISES, CATEGORIES, getExerciseById } from '../constants/exercises';
import { saveWorkout } from '../utils/community';

const DEFAULT_SETS = 3;
const DEFAULT_REPS = '10';
const DEFAULT_REST = 60;

export default function WorkoutBuilderScreen({ user, isPremium, onSaved, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState('any');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workSecs, setWorkSecs] = useState(40);
  const [restSecs, setRestSecs] = useState(20);
  const [rounds, setRounds] = useState(3);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  const addExercise = useCallback((ex) => {
    setSelectedExercises(prev => [...prev, {
      id: ex.id,
      sets: DEFAULT_SETS,
      reps: ex.durationSecs ? `${ex.durationSecs}s` : DEFAULT_REPS,
      rest_secs: DEFAULT_REST,
    }]);
    setPickerOpen(false);
  }, []);

  const removeExercise = useCallback((idx) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateExercise = useCallback((idx, field, value) => {
    setSelectedExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }, []);

  const moveExercise = useCallback((idx, dir) => {
    setSelectedExercises(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Give your workout a name.'); return; }
    if (selectedExercises.length < 2) { Alert.alert('Too few exercises', 'Add at least 2 exercises.'); return; }
    setSaving(true);
    try {
      const workout = {
        creator_id: user.id,
        display_name: user.displayName || user.email.split('@')[0],
        name: name.trim(),
        description: description.trim(),
        moves: selectedExercises,
        work_secs: workSecs,
        rest_secs: restSecs,
        rounds,
        is_public: isPublic,
        fitness_level: fitnessLevel,
        source: 'user',
      };
      const saved = await saveWorkout(workout);
      onSaved(saved);
    } catch (e) {
      Alert.alert('Save failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = pickerCategory === 'all'
    ? EXERCISES
    : EXERCISES.filter(e => e.category === pickerCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Build Workout</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, saving && { opacity: 0.5 }]}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={styles.label}>WORKOUT NAME</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Monday Push Day"
          placeholderTextColor={COLORS.muted}
        />

        {/* Description */}
        <Text style={styles.label}>DESCRIPTION (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's this workout about?"
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={2}
        />

        {/* Timing */}
        <Text style={styles.label}>TIMING</Text>
        <View style={styles.timingRow}>
          {[
            ['Work', workSecs, setWorkSecs, [20, 30, 40, 45, 60]],
            ['Rest', restSecs, setRestSecs, [15, 20, 30, 45, 60]],
            ['Rounds', rounds, setRounds, [2, 3, 4, 5, 6]],
          ].map(([label, val, setter, opts]) => (
            <View key={label} style={styles.timingItem}>
              <Text style={styles.timingLabel}>{label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timingOptions}>
                  {opts.map(o => (
                    <TouchableOpacity
                      key={o}
                      style={[styles.timingOpt, val === o && styles.timingOptActive]}
                      onPress={() => setter(o)}
                    >
                      <Text style={[styles.timingOptText, val === o && styles.timingOptTextActive]}>
                        {label === 'Rounds' ? o : `${o}s`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </View>

        {/* Visibility */}
        <Text style={styles.label}>VISIBILITY</Text>
        <View style={styles.toggleRow}>
          {[
            ['private', '🔒 Private', false],
            ['public', '🌍 Public', true],
          ].map(([id, label, val]) => (
            <TouchableOpacity
              key={id}
              style={[styles.toggleOpt, isPublic === val && styles.toggleOptActive]}
              onPress={() => setIsPublic(val)}
            >
              <Text style={[styles.toggleOptText, isPublic === val && styles.toggleOptTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {isPublic && (
          <View style={styles.levelRow}>
            <Text style={styles.label}>FITNESS LEVEL</Text>
            <View style={styles.levelOpts}>
              {[['any', 'All levels'], ['beginner', 'Beginner'], ['intermediate', 'Intermediate']].map(([id, label]) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.levelOpt, fitnessLevel === id && styles.levelOptActive]}
                  onPress={() => setFitnessLevel(id)}
                >
                  <Text style={[styles.levelOptText, fitnessLevel === id && styles.levelOptTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Exercise list */}
        <Text style={styles.label}>EXERCISES ({selectedExercises.length})</Text>
        {selectedExercises.map((item, idx) => {
          const ex = getExerciseById(item.id);
          if (!ex) return null;
          return (
            <View key={`${item.id}_${idx}`} style={styles.exCard}>
              <View style={styles.exCardHeader}>
                <Text style={styles.exEmoji}>{ex.emoji}</Text>
                <Text style={styles.exName}>{ex.name}</Text>
                <View style={styles.exActions}>
                  <TouchableOpacity onPress={() => moveExercise(idx, -1)} style={styles.exBtn}>
                    <Text style={styles.exBtnText}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveExercise(idx, 1)} style={styles.exBtn}>
                    <Text style={styles.exBtnText}>↓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeExercise(idx)} style={styles.exBtn}>
                    <Text style={[styles.exBtnText, { color: COLORS.red }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.exConfig}>
                {[
                  ['Sets', 'sets', [2, 3, 4, 5]],
                  ['Reps', 'reps', ['8', '10', '12', '15']],
                ].map(([label, field, opts]) => (
                  <View key={field} style={styles.exConfigItem}>
                    <Text style={styles.exConfigLabel}>{label}</Text>
                    <View style={styles.exConfigOpts}>
                      {opts.map(o => (
                        <TouchableOpacity
                          key={o}
                          style={[styles.exConfigOpt, String(item[field]) === String(o) && styles.exConfigOptActive]}
                          onPress={() => updateExercise(idx, field, o)}
                        >
                          <Text style={[styles.exConfigOptText, String(item[field]) === String(o) && styles.exConfigOptTextActive]}>
                            {o}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Add exercise button */}
        <TouchableOpacity style={styles.addExBtn} onPress={() => setPickerOpen(true)}>
          <Text style={styles.addExBtnText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise picker modal */}
      <Modal visible={pickerOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Exercise</Text>
            <TouchableOpacity onPress={() => setPickerOpen(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {[{ id: 'all', label: 'All', emoji: '💪' }, ...CATEGORIES].map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catBtn, pickerCategory === c.id && styles.catBtnActive]}
                onPress={() => setPickerCategory(c.id)}
              >
                <Text style={styles.catBtnText}>{c.emoji} {c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={filteredExercises}
            keyExtractor={e => e.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: ex }) => (
              <TouchableOpacity style={styles.exPickerItem} onPress={() => addExercise(ex)}>
                <Text style={styles.exPickerEmoji}>{ex.emoji}</Text>
                <View style={styles.exPickerInfo}>
                  <Text style={styles.exPickerName}>{ex.name}</Text>
                  <Text style={styles.exPickerMuscle}>{ex.muscle}</Text>
                </View>
                <Text style={[
                  styles.exPickerDiff,
                  ex.difficulty === 'intermediate' && { color: COLORS.yellow },
                  ex.difficulty === 'beginner' && { color: COLORS.green },
                ]}>{ex.difficulty}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cancelBtn: { padding: 8 },
  cancelText: { color: COLORS.muted, fontSize: 14 },
  saveBtn: { backgroundColor: COLORS.blue, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 10, letterSpacing: 3, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, color: COLORS.text, padding: 14, fontSize: 15 },
  inputMulti: { height: 70, textAlignVertical: 'top' },
  timingRow: { gap: 10 },
  timingItem: { backgroundColor: COLORS.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  timingLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 8 },
  timingOptions: { flexDirection: 'row', gap: 8 },
  timingOpt: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  timingOptActive: { backgroundColor: COLORS.blueDark, borderColor: COLORS.blue },
  timingOptText: { color: COLORS.dim, fontSize: 13 },
  timingOptTextActive: { color: COLORS.blueLight },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleOpt: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: 'center' },
  toggleOptActive: { borderColor: COLORS.blue, backgroundColor: COLORS.blueDark },
  toggleOptText: { color: COLORS.dim, fontSize: 13 },
  toggleOptTextActive: { color: COLORS.blueLight, fontWeight: '700' },
  levelRow: { marginTop: 10 },
  levelOpts: { flexDirection: 'row', gap: 8 },
  levelOpt: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: 'center' },
  levelOptActive: { borderColor: COLORS.green, backgroundColor: COLORS.greenBg },
  levelOptText: { color: COLORS.dim, fontSize: 12 },
  levelOptTextActive: { color: COLORS.green, fontWeight: '700' },
  exCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  exCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  exEmoji: { fontSize: 20, marginRight: 10 },
  exName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  exActions: { flexDirection: 'row', gap: 4 },
  exBtn: { padding: 6, borderRadius: 6, backgroundColor: COLORS.bg },
  exBtnText: { color: COLORS.muted, fontSize: 14 },
  exConfig: { gap: 8 },
  exConfigItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exConfigLabel: { fontSize: 11, color: COLORS.muted, width: 32 },
  exConfigOpts: { flexDirection: 'row', gap: 6 },
  exConfigOpt: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  exConfigOptActive: { backgroundColor: COLORS.purpleDark, borderColor: COLORS.purple },
  exConfigOptText: { color: COLORS.dim, fontSize: 12 },
  exConfigOptTextActive: { color: COLORS.purpleLight },
  addExBtn: { borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  addExBtnText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalClose: { padding: 8 },
  modalCloseText: { color: COLORS.muted, fontSize: 16 },
  catScroll: { borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 52 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  catBtnActive: { borderBottomColor: COLORS.blue },
  catBtnText: { color: COLORS.muted, fontSize: 13 },
  exPickerItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  exPickerEmoji: { fontSize: 22, marginRight: 12 },
  exPickerInfo: { flex: 1 },
  exPickerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  exPickerMuscle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  exPickerDiff: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
});
