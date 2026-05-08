import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // For app load
  const [isLoggingIn, setIsLoggingIn] = useState(false); // For button press

  const PROXY_URL = 'https://macro-track-aiproxy.aryanue195035ece.workers.dev';

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    console.log("[AuthContext] Starting loadToken...");
    try {
      const token = await SecureStore.getItemAsync('userToken');
      console.log("[AuthContext] Token from SecureStore:", token);
      if (token) {
        setUserToken(token);
      }
    } catch (e) {
      console.error("[AuthContext] Error loading token:", e);
    }
    console.log("[AuthContext] loadToken finished. Setting isInitializing to false.");
    setIsInitializing(false);
  };

const registerDevice = async () => {
    console.log("[AuthContext] registerDevice clicked.");
    try {
      setIsLoggingIn(true);

      // 1. Generate or retrieve Fingerprint
      let fingerprint = await SecureStore.getItemAsync('device_fingerprint');
      if (!fingerprint) {
        fingerprint = Crypto.randomUUID();
        console.log("[AuthContext] Generated NEW fingerprint:", fingerprint);
        await SecureStore.setItemAsync('device_fingerprint', fingerprint);
      }

      // 2. Call your Cloudflare Worker
      console.log(`[AuthContext] Fetching: ${PROXY_URL}/v1/register-guest`);
      const response = await fetch(`${PROXY_URL}/v1/register-guest`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-device-fingerprint': fingerprint 
        }
      });

      // 🚨 FIX: Read the response as TEXT first, not JSON.
      const rawText = await response.text();
      console.log(`[AuthContext] Server returned Status: ${response.status}`);
      console.log(`[AuthContext] Raw Server Response:`, rawText); // <--- This will reveal the true error!

      // 🚨 FIX: Safely attempt to parse the JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error("[AuthContext] Failed to parse JSON. The server sent plain text instead.");
        alert(`Server Error: ${rawText.substring(0, 50)}...`);
        return; // Stop execution here
      }

      // 3. Handle the structured JSON response
      if (response.ok && data.token) {
        console.log("[AuthContext] Registration successful! Saving token.");
        await SecureStore.setItemAsync('userToken', data.token);
        setUserToken(data.token);
      } else {
        console.error("[AuthContext] Worker returned error:", data.error);
        alert(`Registration failed: ${data.error || 'Unknown error'}`);
      }

    } catch (e) {
      console.error("[AuthContext] Network/Fetch exception:", e);
      alert("Network error. Please check your connection.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  const logoutDevice = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      if (token) {
        // 1. Tell the server to delete the user from the database
        await fetch(`${PROXY_URL}/v1/user`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error("[AuthContext] Failed to delete user on server:", e);
    } finally {
      // 2. Wipe local storage (failsafe: we do this even if the server request fails)
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('device_fingerprint'); // Forces a fresh ID next time
      
      // 3. Reset state to instantly show the Login screen again
      setUserToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, isInitializing, isLoggingIn, registerDevice, logoutDevice }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);