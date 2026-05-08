// utils/chartHelpers.js

export const getChartDataForWeek = (allEntries, referenceTimestamp) => {
  const chartData = {
    labels: [],
    datasets: [{ data: [] }]
  };

  const refDate = new Date(referenceTimestamp);

  // Loop through the 7 days ending on the reference timestamp
  for (let i = 6; i >= 0; i--) {
    // Get the date for each specific day in the week window
    const d = new Date(refDate.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Format the label as "Mon", "Tue", etc.
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' }); 
    
    // 1. Filter entries that match this specific day
    const dailyEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === d.toDateString();
    });

    // 2. Sum up the values for this day
    // IMPORTANT: Change 'item.amount' to whatever key you use in your data (e.g., intake, calories, water)
    const dailyTotal = dailyEntries.reduce((sum, item) => sum + (item.amount || 0), 0);

    // 3. Push to our chart arrays
    chartData.labels.push(dayLabel);
    chartData.datasets[0].data.push(dailyTotal);
  }

  // Fallback: react-native-chart-kit can crash if the array is completely empty
  if (chartData.labels.length === 0) {
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
    };
  }

  return chartData;
};