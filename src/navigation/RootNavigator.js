import React from 'react';
// This is the new, correct import:
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import AppNavigator from './AppNavigator';

// Use the new native stack:
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { userToken, isInitializing } = useAuth();

  if (isInitializing) return null; 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        <Stack.Screen name="MainApp" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

