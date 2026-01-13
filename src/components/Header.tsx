import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {};

export default function Header({}: Props) {
  const [currentTime, setCurrentTime] = useState("");

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime(); // set immediately
    const interval = setInterval(updateTime, 60 * 1000); // every minute
    return () => clearInterval(interval);
  }, []);

  // Get current date
  const now = new Date();
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
  }, [now]);

  // Determine greeting
  const greeting = useMemo(() => {
    const hours = now.getHours();
    if (hours < 12) return "Bonjour 🌞"; // Morning
    if (hours < 18) return "Bon après-midi 🌤"; // Afternoon
    return "Bonsoir 🌃"; // Evening
  }, [now]);

  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <View style={styles.timeContainer}>
        <MaterialIcons name="access-time" size={20} color="#111" />
        <Text style={styles.time}>{currentTime}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  time: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#444444",
    marginLeft: 4, // space between icon and text
  },
  greeting: { fontSize: 28, fontWeight: "bold", marginBottom: 5 },
  date: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 20,
    color: "#888",
    fontStyle: "italic",
  },
});
