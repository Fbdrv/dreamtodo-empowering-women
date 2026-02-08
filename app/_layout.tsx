import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { AppProvider } from "@/providers/AppProvider";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inLoginGroup = segments[0] === "login";

    if (!isAuthenticated && !inLoginGroup) {
      console.log("[auth-gate] Not authenticated, redirecting to login");
      router.replace("/login");
    } else if (isAuthenticated && inLoginGroup) {
      console.log("[auth-gate] Authenticated, redirecting to home");
      router.replace("/");
    }
  }, [isAuthenticated, isReady, segments, router]);

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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <AuthProvider>
            <AppProvider>
              <RootLayoutNav />
            </AppProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
