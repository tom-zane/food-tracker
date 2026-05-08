import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { COLORS, SPACING } from '../../../styles/theme';

const FoodLogTable = ({ logs, onDelete }) => {
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.time} • P:{item.protein}g C:{item.carbs}g F:{item.fats}g</Text>
      </View>
      <View style={styles.action}>
        <Text style={styles.calories}>{item.calories} kcal</Text>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
          <Trash2 size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Log</Text>
      {logs.length === 0 ? (
        <Text style={styles.empty}>No food logged yet. Use AI to add some!</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
     backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  header: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  action: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  calories: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 10,
  },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
  deleteBtn: {
    padding: 4,
  }
});

export default FoodLogTable;
