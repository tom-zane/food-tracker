import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { SettingsProvider } from "./src/context/SettingsContext";
import { FoodLogProvider } from "./src/context/FoodLogContext";
import { WeightProvider } from "./src/context/WeightContext";
import { AuthProvider } from "./src/context/AuthContext";

import AppNavigator from "./src/navigation/AppNavigator";

import { COLORS, SPACING } from "./src/styles/theme";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <FoodLogProvider>
            <WeightProvider>
              <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <NavigationContainer>
                  <StatusBar style="light" backgroundColor={COLORS.surface} />
                  <RootNavigator />
                </NavigationContainer>
              </SafeAreaView>
            </WeightProvider>
          </FoodLogProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
