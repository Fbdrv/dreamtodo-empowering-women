import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { AppProvider, useApp } from "@/providers/AppProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const { profile, isLoading: isAppLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || isAppLoading) return;

    const inLoginGroup = segments[0] === "login";
    const inOnboarding = segments[0] === "onboarding";

    if (!isAuthenticated && !inLoginGroup) {
      console.log("[auth-gate] Not authenticated, redirecting to login");
      router.replace("/login");
    } else if (isAuthenticated && inLoginGroup) {
      // Check if user needs onboarding
      if (!profile.hasCompletedOnboarding) {
        console.log("[auth-gate] Authenticated but needs onboarding");
        router.replace("/onboarding");
      } else {
        console.log("[auth-gate] Authenticated, redirecting to home");
        router.replace("/");
      }
    } else if (isAuthenticated && !inOnboarding && !profile.hasCompletedOnboarding) {
      // User is authenticated, not in onboarding, but hasn't completed it
      console.log("[auth-gate] Needs onboarding, redirecting");
      router.replace("/onboarding");
    } else if (isAuthenticated && inOnboarding && profile.hasCompletedOnboarding) {
      // User completed onboarding but somehow on onboarding screen
      console.log("[auth-gate] Already completed onboarding, redirecting to home");
      router.replace("/");
    }
  }, [isAuthenticated, isReady, isAppLoading, segments, router, profile.hasCompletedOnboarding]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            presentation: "modal",
            gestureEnabled: false,
          }}
        />
      </Stack>
    </AuthGate>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppProvider>
            <RootLayoutNav />
          </AppProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
