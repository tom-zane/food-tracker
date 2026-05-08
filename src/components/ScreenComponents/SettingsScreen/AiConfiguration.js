import React, { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { Cpu, CheckCircle } from 'lucide-react-native';
import { SettingsContext } from '../../../context/SettingsContext';
import { COLORS, SPACING } from '../../../styles/theme';

const AI_MODELS = [
  { label: 'Google Gemini', value: 'gemini', disabled: false },
  { label: 'DeepSeek (Soon)', value: 'deepseek', disabled: true },
  { label: 'OpenAI (Soon)', value: 'openai', disabled: true },
];

export const AiConfiguration = () => {
  const { profile, updateProfile } = useContext(SettingsContext);
  
  const isApiKeyValid = profile.aiKeys?.gemini?.startsWith('AIza') && profile.aiKeys.gemini.length > 30;

  const updateAiKey = (provider, key) => {
    updateProfile({ aiKeys: { ...profile.aiKeys, [provider]: key } });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Cpu size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>AI Configuration</Text>
      </View>
      
      {/* Toggle for MarcoTrack AI */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Use MarcoTrack AI</Text>
        <Switch
          value={profile.useMarcoTrackAI}
          onValueChange={(v) => updateProfile({ useMarcoTrackAI: v })}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={'#fff'}
        />
      </View>

      {/* MarcoTrack AI Plan Section */}
      <View style={[styles.planCardContainer, !profile.useMarcoTrackAI && styles.disabledSection]} pointerEvents={!profile.useMarcoTrackAI ? 'none' : 'auto'}>
         {/* ... Your exact Free/Premium Cards code here ... */}
      </View>

      <View style={styles.divider} />

      {/* Use Your Own AI Section */}
      <View style={[styles.ownAiContainer, profile.useMarcoTrackAI && styles.disabledSection]} pointerEvents={profile.useMarcoTrackAI ? 'none' : 'auto'}>
        <Text style={styles.ownAiTitle}>Use Your Own AI</Text>
        <View style={styles.pickerContainerHorizontal}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {AI_MODELS.map(model => (
              <TouchableOpacity 
                key={model.value}
                disabled={model.disabled}
                style={[styles.chip, profile.aiProvider === model.value && styles.chipSelected, model.disabled && styles.chipDisabled]}
                onPress={() => updateProfile({ aiProvider: model.value })}
              >
                <Text style={[styles.chipText, profile.aiProvider === model.value && styles.chipTextSelected, model.disabled && styles.chipTextDisabled]}>
                  {model.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {profile.aiProvider === 'gemini' && (
          <View style={[styles.inputGroup, { marginTop: SPACING.sm }]}>
            <Text style={styles.label}>Gemini API Key</Text>
            <View style={styles.apiInputWrapper}>
              <TextInput 
                style={[styles.input, styles.apiInput]} 
                placeholder="AIzaSy..."
                secureTextEntry
                placeholderTextColor={COLORS.textSecondary}
                value={profile.aiKeys?.gemini}
                onChangeText={(v) => updateAiKey('gemini', v)}
              />
              {isApiKeyValid && (
                <View style={styles.validIconContainer}>
                  <CheckCircle color={COLORS.primary} size={20} />
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 60 },
  headerTitle: { color: COLORS.text, fontSize: 32, fontWeight: 'bold', marginBottom: SPACING.lg, marginTop: 10 },
  
  // Compact TDEE
  compactTdeeCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  compactTdeeLabel: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  compactTdeeSubtext: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  compactTdeeValue: { color: COLORS.primary, fontSize: 28, fontWeight: '900' },

  // Sections
  section: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: 8 },
  sectionTitle: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  // Inputs
  rowInputs: { flexDirection: 'row', gap: SPACING.sm },
  inputGroup: { marginBottom: SPACING.md },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, fontSize: 16 },
  hint: { color: COLORS.textSecondary, fontSize: 12, marginTop: 6, fontStyle: 'italic' },

  // AI Configuration Toggle & Cards
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  toggleLabel: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  disabledSection: { opacity: 0.35 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  
  planCardContainer: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'stretch' },
  planColFree: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, justifyContent: 'center' },
  planTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  planDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
  
  planColPremium: { flex: 1.1, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, padding: SPACING.md, justifyContent: 'center' },
  premiumTitle: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  premiumPrice: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  premiumPeriod: { fontSize: 14, fontWeight: 'normal', color: COLORS.textSecondary },
  premiumHighlight: { color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginTop: 4, marginBottom: 4 },
  premiumDesc: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16 },

  ownAiContainer: { paddingTop: 4 },
  ownAiTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: SPACING.sm },
  
  // API Input
  apiInputWrapper: { position: 'relative', justifyContent: 'center' },
  apiInput: { paddingRight: 40 },
  validIconContainer: { position: 'absolute', right: 12 },
  
  // Chips
  pickerContainerHorizontal: { flexDirection: 'row', gap: 8, marginBottom: SPACING.sm },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  chipSelected: { backgroundColor: 'rgba(0, 208, 132, 0.1)', borderColor: COLORS.primary },
  chipDisabled: { opacity: 0.5 },
  chipText: { color: COLORS.textSecondary, fontWeight: '600' },
  chipTextSelected: { color: COLORS.primary, fontWeight: 'bold' },
  chipTextDisabled: { color: COLORS.textSecondary },

  // Buttons
  globalSaveBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: SPACING.md, borderRadius: 14, gap: 8, marginBottom: SPACING.lg, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  globalSaveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  
  actionRow: { flexDirection: 'row', gap: SPACING.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  actionBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { color: COLORS.text, fontWeight: '600' },

  // Logout
  logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center' },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },

  // Developer
  developerSection: { marginTop: 10, padding: SPACING.md, alignItems: 'center' },
  devTitle: { color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  devBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  devBtnText: { color: COLORS.textSecondary, fontSize: 13 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 20, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  modalSubtext: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  textArea: { backgroundColor: COLORS.background, color: COLORS.text, borderRadius: 12, padding: 12, height: 150, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, fontFamily: 'monospace' },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.background, alignItems: 'center' },
  modalCancelText: { color: COLORS.text, fontWeight: 'bold' },
  modalConfirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  modalConfirmText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
