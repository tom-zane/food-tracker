import React, { useContext, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from "react-native";
import { Plus, TrendingUp, Edit2 } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS, SPACING } from "../styles/theme";

import { WeightContext } from "../context/WeightContext";

import InputModal from "../components/Modals/InputModal";

const screenWidth = Dimensions.get("window").width;

const WeightTrackerScreen = () => {
  const { history, addWeightEntry, editWeightEntry, targetWeight, setTarget, height, updateHeight } = useContext(WeightContext);

  // Modal States
  const [modalConfig, setModalConfig] = useState({ visible: false, type: null, id: null, initialValue: "" });

  const currentWeight = history.length > 0 ? history[0].weight : "--";
  const startWeight = history.length > 0 ? history[history.length - 1].weight : "--";
  const progress = typeof currentWeight === "number" && typeof startWeight === "number" ? (startWeight - currentWeight).toFixed(1) : 0;

  // Calculate BMI
  const bmi = height && currentWeight !== "--" ? (currentWeight / Math.pow(height / 100, 2)).toFixed(1) : "--";

  // Prepare Graph Data (Chronological order)
  const graphData = [...history].reverse().slice(-14); // Last 14 entries
  const labels = graphData.map((h) => new Date(h.date).getDate().toString());
  const weights = graphData.map((h) => h.weight);
  const targets = graphData.map(() => targetWeight);

  const handleModalSubmit = (value) => {
    if (modalConfig.type === "add") addWeightEntry(value);
    if (modalConfig.type === "edit") editWeightEntry(modalConfig.id, value);
    if (modalConfig.type === "target") setTarget(value);
    if (modalConfig.type === "height") updateHeight(value);
  };

  const openModal = (type, id = null, initialValue = "") => {
    setModalConfig({ visible: true, type, id, initialValue });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Weight Tracker</Text>

        {/* Top Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statValue}>
              {currentWeight} <Text style={styles.unit}>kg</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.statCard} onPress={() => openModal("target", null, targetWeight)}>
            <View style={styles.statHeaderRow}>
              <Text style={styles.statLabel}>Target</Text>
              <Edit2 color={COLORS.textSecondary} size={12} />
            </View>
            <Text style={styles.statValue}>
              {targetWeight} <Text style={styles.unit}>kg</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={() => openModal("height", null, height)}>
            <View style={styles.statHeaderRow}>
              <Text style={styles.statLabel}>BMI {!height && "(Add Height)"}</Text>
              <Edit2 color={COLORS.textSecondary} size={12} />
            </View>
            <Text style={styles.statValue}>{bmi}</Text>
          </TouchableOpacity>
        </View>

        {/* Graph */}
        {weights.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weight Trend</Text>
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  { data: weights, color: (opacity = 1) => COLORS.primary, strokeWidth: 3 }, // Actual weight line
                  { data: targets, color: (opacity = 1) => `rgb(255, 255, 0.6)`, strokeWidth: 2, withDots: false}, // Goal line
                ],
                legend: ["Actual", "Goal"],
              }}
              width={screenWidth - SPACING.md * 2 - SPACING.md * 2} // Screen - margins - padding
              height={220}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => COLORS.textSecondary,
                labelColor: (opacity = 1) => COLORS.textSecondary,
                propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.surface },
              }}
              bezier
              style={{ borderRadius: 16, marginTop: 8 }}
            />
          </View>
        )}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp color={COLORS.primary} size={20} />
            <Text style={styles.progressTitle}>Total Progress</Text>
          </View>
          <Text style={styles.progressValue}>{progress > 0 ? `-${progress}` : progress} kg</Text>
        </View>

        {/* History List */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>History</Text>
          {history.length === 0 ? (
            <Text style={styles.empty}>No logs yet</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>
                <View style={styles.historyWeightContainer}>
                  <Text style={styles.historyWeight}>{item.weight} kg</Text>
                  <TouchableOpacity onPress={() => openModal("edit", item.id, item.weight)} style={styles.editBtn}>
                    <Edit2 color={COLORS.textSecondary} size={14} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => openModal("add")}>
        <Plus color="#000" size={32} />
      </TouchableOpacity>

      {/* Dynamic Modal */}
      <InputModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig({ visible: false, type: null, id: null, initialValue: "" })}
        onSubmit={handleModalSubmit}
        initialValue={modalConfig.initialValue}
        title={modalConfig.type === "add" ? "Log Today's Weight" : modalConfig.type === "edit" ? "Edit Weight Entry" : modalConfig.type === "target" ? "Set Target Weight" : "Set Height (cm)"}
        placeholder={modalConfig.type === "height" ? "Height in cm" : "Weight (kg)"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: "bold", marginBottom: SPACING.lg },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: 16, flex: 1, alignItems: "center" },
  statHeaderRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, textAlign: "center" },
  statValue: { color: COLORS.text, fontSize: 20, fontWeight: "bold" },
  unit: { fontSize: 12, color: COLORS.textSecondary },
  chartContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.lg, alignItems: "center" },
  chartTitle: { alignSelf: "flex-start", color: COLORS.text, fontSize: 16, fontWeight: "600" },
  progressCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, alignItems: "center", marginBottom: SPACING.lg },
  progressHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  progressTitle: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
  progressValue: { color: COLORS.primary, fontSize: 36, fontWeight: "bold" },
  historyContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md },
  historyTitle: { color: COLORS.text, fontSize: 18, fontWeight: "600", marginBottom: SPACING.sm },
  historyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyDate: { color: COLORS.textSecondary, fontSize: 12 }, // Made smaller (Requirement 5)
  historyWeightContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyWeight: { color: COLORS.text, fontWeight: "bold", fontSize: 14 }, // Made smaller (Requirement 5)
  editBtn: { padding: 4 },
  empty: { color: COLORS.textSecondary, textAlign: "center", padding: 20 },
  fab: {
    position: "absolute",
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default WeightTrackerScreen;
