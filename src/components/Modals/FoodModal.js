import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS, SPACING } from '../../styles/theme';
import { processAiRequest } from '../../utils/aiOrchestrator';

// Mock data for saved dishes (we'll replace this with real DB data later)
const MOCK_SAVED_DISHES = [
  { id: '1', name: 'Oatmeal with Whey Protein & Berries', cals: 380 },
  { id: '2', name: 'Grilled Chicken Breast with Rice', cals: 450 },
  { id: '3', name: 'Post-Workout Shake (2 scoops)', cals: 240 },
  { id: '4', name: '4 Scrambled Eggs with Toast', cals: 410 },
];

const FoodModal = ({ visible, onClose, onAdd, profile }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'manual'

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    try {
      const systemPrompt = `
        Analyze the following meal and estimate the calories and macros (protein, carbs, fats in grams).
        Return ONLY a valid JSON object with an "items" array. Do not include markdown formatting or code blocks.
        Format: { "items": [{ "id": "unique_string", "name": "Food item", "calories": 100, "protein": 10, "carbs": 20, "fats": 5 }] }
        
        Meal description: ${text}
      `;

      const rawResponse = await processAiRequest(systemPrompt, profile);
      const cleanedResponse = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedResponse);

      if (parsedData && parsedData.items) {
        const finalItems = parsedData.items.map(item => ({
          ...item,
          id: item.id || Math.random().toString(36).substring(2, 10)
        }));

        onAdd(finalItems);
        setText('');
        onClose();
      } else {
        throw new Error("Invalid response format from AI.");
      }

    } catch (e) {
      console.error("[FoodModal Error]:", e);
      Alert.alert("Analysis Failed", e.message || "Could not analyze text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavedDishClick = (dishName) => {
    // For now, this just fills the input field. 
    // Later, you can make this directly log the dish to bypass the AI if the macros are already known.
    setText(dishName);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          
          {/* TABS HEADER */}
          <View style={styles.tabHeader}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'ai' && styles.activeTab]} 
                onPress={() => setActiveTab('ai')}
              >
                <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>AI Log</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'manual' && styles.activeTab]} 
                onPress={() => setActiveTab('manual')}
              >
                <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>Manual (Soon)</Text>
              </TouchableOpacity>
            </View>
            
            {/* Placeholder for server quota */}
            <Text style={styles.quotaText}>
              {profile.useMarcoTrackAI ? '🔥 5 left' : 'BYOK Active'}
            </Text>
          </View>

          {activeTab === 'ai' ? (
            <>
              {/* BEST PRACTICES TEXT */}
              <Text style={styles.bestPracticesText}>
                💡 <Text style={{fontWeight: 'bold'}}>Pro tip:</Text> Include quantities and cooking methods for better accuracy (e.g., "200g raw chicken breast pan-fried in 1 tsp olive oil").
              </Text>
              
              {/* INPUT FIELD */}
              <TextInput
                style={styles.input}
                multiline
                placeholder="What did you eat?"
                placeholderTextColor={COLORS.textSecondary}
                value={text}
                onChangeText={setText}
                autoFocus
              />

              <View style={styles.footerRow}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleSubmit} 
                  style={[styles.submitBtn, loading && styles.disabled]}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.submitText}>Analyze & Log</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* SAVED DISHES */}
              <Text style={styles.sectionTitle}>Your Saved Dishes</Text>
              <ScrollView style={styles.savedDishesContainer} showsVerticalScrollIndicator={false}>
                {MOCK_SAVED_DISHES.map((dish) => (
                  <TouchableOpacity 
                    key={dish.id} 
                    style={styles.savedDishItem}
                    onPress={() => handleSavedDishClick(dish.name)}
                  >
                    <Clock size={16} color={COLORS.textSecondary} />
                    <View style={styles.savedDishTextContainer}>
                      <Text style={styles.savedDishName} numberOfLines={1}>{dish.name}</Text>
                      <Text style={styles.savedDishCals}>{dish.cals} kcal</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonText}>Manual logging is coming soon!</Text>
              <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { marginTop: 20 }]}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  
  // Tabs
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  quotaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // AI Form
  bestPracticesText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(0, 208, 132, 0.05)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 16,
    padding: SPACING.md,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  submitText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },

  // Saved Dishes
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  savedDishesContainer: {
    maxHeight: 200,
  },
  savedDishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    gap: 12,
  },
  savedDishTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedDishName: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
  },
  savedDishCals: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Manual Tab Placeholder
  comingSoonContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  comingSoonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  }
});

export default FoodModal;