import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getAllEmployees } from "../services/employees";
import { getAttendanceHistory } from "../services/attendance";
import { exportEmployeeMonthToExcel } from "../helpers/excel";

type Employee = {
  id: number;
  fullName: string;
};

type DayHistory = {
  date: string;
  times: string[];
};

export default function HistoryScreen({ navigation }: any) {
  const today = new Date();
  const [locked, setLocked] = useState(true);
  const [password, setPassword] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const currentYear = new Date().getFullYear();

  const [history, setHistory] = useState<DayHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee !== null) {
      loadHistory();
    }
  }, [selectedEmployee, selectedMonth]);

  const loadEmployees = async () => {
    const result = await getAllEmployees();
    setEmployees(result);
    if (result.length > 0) {
      setSelectedEmployee(result[0].id);
    }
  };

  const loadHistory = async () => {
    const result = await getAttendanceHistory(
      selectedEmployee as number,
      selectedMonth,
      selectedYear
    );

    const grouped: Record<string, string[]> = {};

    result.forEach((r) => {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r.time);
    });

    const formatted = Object.keys(grouped).map((date) => ({
      date,
      times: grouped[date],
    }));

    setHistory(formatted);
  };

  // function to handle pull-to-refresh
  const refreshHistory = async () => {
    if (!selectedEmployee) return;
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };
  const handleAuth = () => {
    const correctPassword = "250991"; // Replace with your desired password
    if (password === correctPassword) {
      setLocked(false);
    } else {
      alert("Mot de passe incorrect");
    }
  };

  if (locked) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f6f6f6",
        }}
      >
        {/* Modal for secret badge */}
        <Modal visible={locked} animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Authentification Requise</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Entrez le mot de passe 🔒"
                style={styles.input}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    // navigate to home screen
                    navigation.navigate("Pointage");
                  }}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelBttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleAuth}
                >
                  <Text style={styles.buttonText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.title}>Historique de pointage</Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#2ecc71",
            padding: 14,
            borderRadius: 12,
            marginVertical: 10,
            alignItems: "center",
          }}
          onPress={() => {
            if (!selectedEmployee) return;
            exportEmployeeMonthToExcel({
              employee: employees.find((e) => e.id === selectedEmployee)!,

              attendance: history.flatMap((day) =>
                day.times.map((time) => ({ date: day.date, time }))
              ),
              year: selectedYear,
              month: selectedMonth,
            });
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Exporter</Text>
        </TouchableOpacity>
      </View>

      {/* Employee selector */}
      <View style={styles.selector}>
        <Picker
          selectedValue={selectedEmployee}
          onValueChange={(value) => setSelectedEmployee(value)}
        >
          {employees.map((emp) => (
            <Picker.Item key={emp.id} label={emp.fullName} value={emp.id} />
          ))}
        </Picker>
      </View>

      {/* Month selector */}
      <View style={styles.selectorRow}>
        <View style={styles.selectorFlex}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Picker.Item
                key={i}
                label={new Date(selectedYear, i, 1).toLocaleString("fr-FR", {
                  month: "long",
                })}
                value={i}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.selectorFlex}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
          >
            {Array.from(
              { length: currentYear - 2026 + 1 },
              (_, i) => currentYear - i
            ).map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Table header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerDate}>Date</Text>
        <Text style={styles.headerTimes}>Pointage</Text>
      </View>

      {/* History list */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString("fr-FR")}
            </Text>
            <Text style={styles.times}>{item.times.join("   ")}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun pointage pour ce mois</Text>
        }
        refreshing={refreshing} // show spinner when refreshing
        onRefresh={refreshHistory}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    marginTop: 6,
  },

  headerDate: {
    width: "35%",
    fontWeight: "600",
    color: "#444",
  },

  headerTimes: {
    width: "65%",
    fontWeight: "600",
    color: "#444",
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 4,
    elevation: 1,
  },

  date: {
    width: "35%",
    fontWeight: "500",
    color: "#555",
  },

  times: {
    width: "65%",
    fontWeight: "500",
    color: "#333",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
  selectorRow: {
    flexDirection: "row",
    gap: 8, // RN 0.71+ (or use margin)
  },

  selector: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,

    marginBottom: 8,
  },
  selectorFlex: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,

    marginBottom: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContainer: { backgroundColor: "#fff", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, marginBottom: 15, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1, // make buttons take equal width
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5, // space between buttons
  },
  cancelButton: {
    backgroundColor: "#cccccc7d", // gray
  },
  confirmButton: {
    backgroundColor: "#007BFF", // blue
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelBttonText: {
    color: "#757575",
    fontWeight: "bold",
  },
});
