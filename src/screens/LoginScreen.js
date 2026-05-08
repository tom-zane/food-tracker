import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS, SPACING } from "../styles/theme";

export default function LoginScreen() {
  const { registerDevice, isLoggingIn } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>MacroTrack</Text>
        <Text style={styles.subtitle}>Frictionless nutrition tracking.</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoggingIn && { opacity: 0.7 }]} 
        onPress={registerDevice}
        activeOpacity={0.8}
        disabled={isLoggingIn} // Prevents double taps
      >
        {isLoggingIn ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Get Started (Free)</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ... keep your styles the same ...

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.surface, 
    justifyContent: "space-between", // Pushes content up and button down
    alignItems: "center", 
    padding: SPACING.lg,
    paddingTop: 100,
    paddingBottom: 60,
  },
  contentWrapper: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 32,
    borderRadius: 64, // Gives the icon a nice "squircle" look if it's square
  },
  title: { 
    fontSize: 48, // Slightly scaled down from 64 to prevent weird wrapping on smaller phones
    fontWeight: "800", // Extra bold for a modern header look
    color: COLORS.text,
    letterSpacing: -1.5, // Tighter letter spacing looks more premium
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 18, // Balanced with the new title size
    color: COLORS.textSecondary, 
    textAlign: "center",
    opacity: 0.8,
  },
  button: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 18, 
    paddingHorizontal: 40, 
    borderRadius: 20, // Softer, more modern pill shape
    width: "100%", 
    alignItems: "center",
    shadowColor: COLORS.primary, // Glow effect matching the button
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Elevation for Android shadow
  },
  buttonText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 18,
    letterSpacing: 0.5,
  },
});