import React, { useContext } from 'react';
import { View, ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';
import { SettingsContext } from '../context/SettingsContext';
import { COLORS, SPACING } from '../styles/theme';

// Import your new components
import { ProfileSettings } from '../components/ScreenComponents/SettingsScreen/ProfileSettings';
import { AiConfiguration } from '../components/ScreenComponents/SettingsScreen/AiConfiguration';
import { DataManagement } from '../components/ScreenComponents/SettingsScreen/DataManagement';
import { AccountSection } from '../components/ScreenComponents/SettingsScreen/AccountSection';

const SettingsScreen = () => {
  // Only fetching what we need for the top level
  const { profile } = useContext(SettingsContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Settings</Text>
        
        {/* COMPACT TARGET (TDEE) */}
        <View style={styles.compactTdeeCard}>
          <View>
            <Text style={styles.compactTdeeLabel}>Daily Calorie Target</Text>
            <Text style={styles.compactTdeeSubtext}>Based on your profile metrics</Text>
          </View>
          <Text style={styles.compactTdeeValue}>{profile.tdee} <Text style={{fontSize: 14}}>kcal</Text></Text>
        </View>

        {/* Modular Components */}
        <ProfileSettings />
        <AiConfiguration />
        <DataManagement />
        <AccountSection />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 60 },
  headerTitle: { color: COLORS.text, fontSize: 32, fontWeight: 'bold', marginBottom: SPACING.lg, marginTop: 10 }, 
  compactTdeeCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  compactTdeeLabel: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  compactTdeeSubtext: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  compactTdeeValue: { color: COLORS.primary, fontSize: 28, fontWeight: '900' },
});

export default SettingsScreen;