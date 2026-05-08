import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import { Database, Download, Upload, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, SPACING } from '../../../styles/theme';
import { saveData, STORAGE_KEYS } from '../../../utils/storage';
import { SettingsContext } from '../../../context/SettingsContext';
import { FoodLogContext } from '../../../context/FoodLogContext';
import { WeightContext } from '../../../context/WeightContext';

export const DataManagement = () => {
  const { profile, updateProfile } = useContext(SettingsContext);
  const { logs, setLogs } = useContext(FoodLogContext);
  const { history, setHistory } = useContext(WeightContext);

  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importJsonString, setImportJsonString] = useState('');

  const handleExport = () => {
    const data = { profile, logs, history };
    Alert.alert(
      "Data Export", 
      JSON.stringify(data).substring(0, 200) + "...\n\n(In production, this would save a .json file to your phone)"
    );
  };

  const handleImport = async () => {
    try {
      const parsedData = JSON.parse(importJsonString);   
      if (parsedData.profile) await updateProfile(parsedData.profile);
      if (parsedData.logs) {
        setLogs(parsedData.logs);
        await saveData(STORAGE_KEYS.FOOD_LOGS, parsedData.logs);
      }
      if (parsedData.history) {
        setHistory(parsedData.history);
        await saveData(STORAGE_KEYS.WEIGHT_HISTORY, parsedData.history);
      }
      setIsImportModalVisible(false);
      setImportJsonString('');
      Alert.alert("Success", "Data imported successfully!");
    } catch (error) {
      Alert.alert("Import Failed", "Invalid JSON format. Please check your data.");
    }
  };

  const handleClear = () => {
    Alert.alert(     
      "Clear All Data",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear Everything", style: "destructive", onPress: async () => {
          await AsyncStorage.clear();
          setLogs({});
          setHistory([]);
          Alert.alert("Success", "All local data wiped.");
        }}
      ]
    );
  };

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Database size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Data Management</Text>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
            <Download size={20} color={COLORS.text} />
            <Text style={styles.actionBtnText}>Export JSON</Text>
          </TouchableOpacity>            

          <TouchableOpacity style={styles.actionBtn} onPress={() => setIsImportModalVisible(true)}>
            <Upload size={20} color={COLORS.text} />
            <Text style={styles.actionBtnText}>Import JSON</Text>
          </TouchableOpacity>
        </View>
      
        <TouchableOpacity style={[styles.actionBtnFull, { borderColor: COLORS.error, marginTop: SPACING.sm }]} onPress={handleClear}>
          <Trash2 size={20} color={COLORS.error} />
          <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Wipe Local Data</Text>
        </TouchableOpacity>
      </View>

      {/* Import Modal */}
      <Modal visible={isImportModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Data</Text>
            <Text style={styles.modalSubtext}>Paste your exported JSON string below.</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder='{"profile": {...}, "logs": {...}}'
              placeholderTextColor={COLORS.textSecondary}
              value={importJsonString}
              onChangeText={setImportJsonString}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsImportModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleImport}>
                <Text style={styles.modalConfirmText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  section: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: 8 },
  sectionTitle: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }, 
  actionRow: { flexDirection: 'row', gap: SPACING.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  actionBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { color: COLORS.text, fontWeight: '600' },
  
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