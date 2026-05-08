import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  View, ScrollView, StyleSheet, Text, TouchableOpacity, 
  SafeAreaView, FlatList, Dimensions 
} from 'react-native';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { FoodLogContext } from '../context/FoodLogContext';
import { SettingsContext } from '../context/SettingsContext';
import { COLORS, SPACING } from '../styles/theme';

import CalorieDial from '../components/ScreenComponents/HomeScreen/CalorieDial';
import FoodLogTable from '../components/ScreenComponents/HomeScreen/FoodLogTable';
import WeeklyChart from '../components/ScreenComponents/HomeScreen/WeeklyChart';

import FoodModal from '../components/Modals/FoodModal';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { logs, addFoodLog, removeFoodItem, getDayTotals } = useContext(FoodLogContext);
  
  // FIX: tdee is now part of the profile object, no need to destructure it separately
  const { profile } = useContext(SettingsContext);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [chartRefDate, setChartRefDate] = useState(new Date());

  // Date Navigation State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date()); 
  const flatListRef = useRef(null);

  // Helper to reliably format YYYY-MM-DD
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const dateKey = formatDateKey(selectedDate);
  const dayLogs = logs[dateKey] || [];
  const totals = getDayTotals(dateKey);

  // Date Tape Calculations
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();

  // Change Month View
  const handlePrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const handleDaySelect = (day) => {
    setSelectedDate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  };

  // Scroll to selected date or 1st of month on load/month change
  useEffect(() => {
    if (viewMonth.getMonth() === selectedDate.getMonth() && viewMonth.getFullYear() === selectedDate.getFullYear()) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: selectedDate.getDate() - 1, 
          animated: true, 
          viewPosition: 0.5 
        });
      }, 100);
    }
  }, [viewMonth, selectedDate]);

  const getWeeklyChartData = () => {
    const labels = [];
    const actualCalories = [];
    const targetCalories = [];

    let maxFoundIntake = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(chartRefDate);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      
      const dailyCals = getDayTotals(key).calories;
      if (dailyCals > maxFoundIntake) maxFoundIntake = dailyCals;

      labels.push(d.toLocaleDateString([], { weekday: 'short' }));
      actualCalories.push(dailyCals);
      
      // FIX: Use profile.tdee
      targetCalories.push(profile.tdee);
    }

    // FIX: Use profile.tdee
    const upperBound = Math.max(profile.tdee * 1.5, maxFoundIntake * 1.1);

    return { 
      labels, 
      datasets: [
        { 
          data: actualCalories,
          color: (opacity = 1) => COLORS.primary, 
          strokeWidth: 3
        },
        {
          data: targetCalories,
          color: (opacity = 1) => '#FFD60A', 
          strokeWidth: 2,
          withDots: false,
          strokeDashArray: [6, 6] 
        },
        {
          data: [upperBound, upperBound, upperBound, upperBound, upperBound, upperBound, upperBound],
          color: () => 'transparent',
          strokeWidth: 0,
          withDots: false
        }
      ],
      legend: ["Intake", "Target"]
    };
  };

  const renderDayItem = ({ item }) => {
    const isSelected = 
      item === selectedDate.getDate() && 
      viewMonth.getMonth() === selectedDate.getMonth() &&
      viewMonth.getFullYear() === selectedDate.getFullYear();
    
    const isToday = 
      item === today.getDate() && 
      viewMonth.getMonth() === today.getMonth() &&
      viewMonth.getFullYear() === today.getFullYear();

    return (
      <TouchableOpacity 
        style={[styles.dayTapeItem, isSelected && styles.dayTapeItemSelected]} 
        onPress={() => handleDaySelect(item)}
      >
        <Text style={[styles.dayTapeText, isSelected && styles.dayTapeTextSelected]}>
          {isToday ? 'Today' : item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dateHeader}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
            <ChevronLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
            <ChevronRight color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={daysArray}
          keyExtractor={(item) => item.toString()}
          renderItem={renderDayItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTapeContainer}
          getItemLayout={(data, index) => ({ length: 60, offset: 60 * index, index })}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.dashboardCard}>
          <View style={styles.dialContainer}>
            <CalorieDial consumed={totals.calories} total={profile.tdee} />
          </View>
          
          <View style={styles.macrosColumn}>
            {/* FIX: Use profile.tdee for all calculations */}
            <MiniMacroBox label="Protein" value={totals.protein} target={Math.round(profile.tdee * 0.3 / 4)} color="#FF453A" />
            <MiniMacroBox label="Carbs" value={totals.carbs} target={Math.round(profile.tdee * 0.4 / 4)} color="#64D2FF" />
            <MiniMacroBox label="Fats" value={totals.fats} target={Math.round(profile.tdee * 0.3 / 9)} color="#FFD60A" />
          </View>
        </View>

        <FoodLogTable 
          logs={dayLogs} 
          onDelete={(id) => removeFoodItem(dateKey, id)} 
        />

        <WeeklyChart 
          data={getWeeklyChartData()} 
          onWeekChange={(week) => setChartRefDate(new Date(week.timestamp))}
        />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="#000" size={32} />
      </TouchableOpacity>

      {/* FIX: Passing the entire profile object so the modal can use the orchestrator */}
      <FoodModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onAdd={(items) => addFoodLog(dateKey, items)}
        profile={profile} 
      />
    </SafeAreaView>
  );
};

const MiniMacroBox = ({ label, value, target, color }) => (
  <View style={styles.miniMacroBox}>
    <View style={styles.miniMacroHeader}>
      <Text style={[styles.miniMacroLabel, { color }]}>{label}</Text>
      <Text style={styles.miniMacroValue}>{value}g</Text>
    </View>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${Math.min((value / target) * 100, 100)}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dateHeader: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  monthArrow: {
    padding: SPACING.xs,
  },
  monthText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayTapeContainer: {
    paddingHorizontal: SPACING.sm,
    gap: 8,
  },
  dayTapeItem: {
    width: 60,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  dayTapeItemSelected: {
    backgroundColor: COLORS.primary,
  },
  dayTapeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  dayTapeTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  dashboardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dialContainer: {
    flex: 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macrosColumn: {
    flex: 0.45,
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  miniMacroBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    padding: 10,
    borderRadius: 10,
  },
  miniMacroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  miniMacroLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  miniMacroValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressBar: {
    marginTop: SPACING.sm,
    height: 4,
    backgroundColor: COLORS.border,
    width: '100%',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});

export default HomeScreen;