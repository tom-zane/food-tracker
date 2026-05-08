import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { LogOut, Bug } from 'lucide-react-native';

import { COLORS, SPACING } from '../../../styles/theme';
import { useAuth } from '../../../context/AuthContext';

export const AccountSection = () => {
  const { logoutDevice } = useAuth(); 
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleInjectFakeData = async () => { 
    Alert.alert("Dev Tools", "Fake Data Injected!"); 
  };

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LogOut size={18} color="#ef4444" />
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Account</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={() => setIsLogoutModalVisible(true)}>
          <Text style={styles.logoutButtonText}>Delete Account & Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Developer Tools */}
      <View style={styles.developerSection}>
        <Text style={styles.devTitle}>Developer Tools</Text>
        <TouchableOpacity style={styles.devBtn} onPress={handleInjectFakeData}>
          <Bug size={16} color={COLORS.textSecondary} />
          <Text style={styles.devBtnText}>Inject Fake Historical Data</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Warning Modal */}
      <Modal visible={isLogoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Warning</Text>
            <Text style={styles.modalSubtext}>
              Are you sure you want to log out? This is a guest account. Logging out will permanently delete your account and wipe all your data from the server unless you have exported it.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#ef4444' }]} onPress={() => {
                setIsLogoutModalVisible(false);
                logoutDevice();
              }}>
                <Text style={styles.modalConfirmText}>Yes, Delete</Text>
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
  
  logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', alignItems: 'center' },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },

  developerSection: { marginTop: 10, padding: SPACING.md, alignItems: 'center' },
  devTitle: { color: COLORS.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  devBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  devBtnText: { color: COLORS.textSecondary, fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 20, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  modalSubtext: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.background, alignItems: 'center' },
  modalCancelText: { color: COLORS.text, fontWeight: 'bold' },
  modalConfirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  modalConfirmText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});