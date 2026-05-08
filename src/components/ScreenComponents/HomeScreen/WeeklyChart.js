import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SPACING } from '../../../styles/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Helper to generate the last 52 weeks
const generatePast52Weeks = () => {
  const weeks = [];
  const currentDate = new Date();

  for (let i = 0; i < 52; i++) {
    const d = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const month = MONTHS[d.getMonth()];
    const weekNum = Math.ceil(d.getDate() / 7);
    
    weeks.push({
      id: `week-${i}`,
      index: i,
      label: `${month} W${weekNum}`,
      timestamp: d.getTime(),
    });
  }
  return weeks.reverse(); // Oldest left -> Newest right
};

const WeeklyChart = ({ data, onWeekChange }) => {
  const screenWidth = Dimensions.get('window').width - (SPACING.md * 2);
  const scrollViewRef = useRef(null);
  
  const weeks = useMemo(() => generatePast52Weeks(), []);
  const [selectedWeek, setSelectedWeek] = useState(weeks[weeks.length - 1]);

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const handleTabPress = (week) => {
    setSelectedWeek(week);
    if (onWeekChange) onWeekChange(week);
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => COLORS.textSecondary,
    labelColor: (opacity = 1) => COLORS.textSecondary,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.surface
    }
  };

  if (!data || !data.datasets || data.datasets.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Intake Trends</Text>
      
      {/* Restored Scrollable Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {weeks.map((week) => {
            const isActive = selectedWeek.id === week.id;
            return (
              <TouchableOpacity
                key={week.id}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => handleTabPress(week)}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {week.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <LineChart
        data={data}
        width={screenWidth - (SPACING.sm * 2)} 
        height={240}
        yAxisSuffix=""
        chartConfig={chartConfig}
        bezier
        fromZero={true} // Forces Y-Axis to start at 0 so TDEE isn't glued to the bottom
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  tabsContainer: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.md,
  },
  tabsScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default WeeklyChart;