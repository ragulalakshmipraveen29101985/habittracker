import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import { AuthProvider, useAuth } from "./src/state/AuthContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { TrackerScreen } from "./src/screens/TrackerScreen";
import { CreateTrackerScreen } from "./src/screens/CreateTrackerScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ArchiveScreen } from "./src/screens/ArchiveScreen";
import { colors } from "./src/theme/tokens";
import type { RootStackParamList } from "./src/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.cream,
    text: colors.ink,
    border: colors.line,
    primary: colors.ink,
    notification: colors.coral,
  },
};

function Routed() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.inkSoft} />
      </View>
    );
  }
  if (!user) return <LoginScreen />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Tracker" component={TrackerScreen} />
      <Stack.Screen
        name="CreateTracker"
        component={CreateTrackerScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="Archive" component={ArchiveScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  // Optionally preload Google Fonts via expo-font in a future iteration.
  useEffect(() => { /* fonts ready check could go here */ }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NavTheme}>
        <StatusBar style="dark" />
        <AuthProvider>
          <Routed />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
