import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../../styles/theme';

const CalorieDial = ({ consumed, total }) => {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const remaining = Math.max(0, total - consumed);
  const percentage = Math.min(consumed / total, 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.remainingValue}>{remaining}</Text>
        <Text style={styles.remainingLabel}>kcal left</Text>
        <Text style={styles.consumedLabel}>{consumed} consumed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  remainingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  remainingLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  consumedLabel: {
    fontSize: 12,
    color: COLORS.primary,
  }
});

export default CalorieDial;
