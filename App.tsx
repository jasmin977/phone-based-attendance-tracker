// App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { initDB } from "./src/db/database";
import { ActivityIndicator, Text, View } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import EmployeesScreen from "./src/screens/EmployeesScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

export type RootTabParamList = {
  Pointage: undefined;
  Employeés: undefined;
  Historique: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center", // Centers vertically
          alignItems: "center", // Centers horizontally
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "finger-print";
            if (route.name === "Pointage") iconName = "finger-print";
            else if (route.name === "Employeés") iconName = "people";
            else if (route.name === "Historique") iconName = "timer-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Pointage" component={HomeScreen} />
        <Tab.Screen name="Employeés" component={EmployeesScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
