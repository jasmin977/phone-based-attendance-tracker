import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import {
  getAllEmployees,
  getEmployeeLastAttendanceType,
  isSecretBadgeValid,
} from "../services/employees";
import { handleCheckInOut } from "../services/attendance";
import { Ionicons } from "@expo/vector-icons"; // for success icon
import { AttendanceType, Employee } from "../types/Employee";
import PinCode from "../components/PinCode";
import Header from "../components/Header";

type EmployeeWithStatus = Employee & { lastAttendanceType?: AttendanceType };

export default function HomeScreen() {
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWithStatus | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<null | AttendanceType>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async () => {
    setRefreshing(true); // show spinner
    const data = await getAllEmployees();
    const employeesWithStatus: EmployeeWithStatus[] = await Promise.all(
      data.map(async (emp) => {
        const status = await getEmployeeLastAttendanceType(emp.id); // "IN" | "OUT" | null
        return { ...emp, lastAttendanceType: status ?? undefined };
      })
    );
    setEmployees(employeesWithStatus);
    setRefreshing(false);
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Greeting

  // Handle check-in/out modal
  const handleEmployeePress = (employee: Employee) => {
    setSelectedEmployee(employee);

    setModalVisible(true);
  };

  const handleConfirm = async (secretBadge: string) => {
    if (!selectedEmployee) return;

    const isValid = await isSecretBadgeValid(selectedEmployee.id, secretBadge);
    if (!isValid) {
      Alert.alert(
        "❌ Badge invalide",
        "Badge secret invalide. Veuillez réessayer."
      );
      return;
    }

    // call your check-in/out function
    const result = await handleCheckInOut(selectedEmployee.id);

    // show success icon message
    setSuccessMessage(result.type); // or detect if it's IN/OUT
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === selectedEmployee.id
          ? { ...emp, lastAttendanceType: result.type }
          : emp
      )
    );
    setModalVisible(false);

    // hide success after 2 seconds
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <View style={styles.container}>
      <Header />

      {employees.length === 0 && !refreshing && (
        <Text style={styles.empty}>
          Aucun employé trouvé. Veuillez en ajouter.
        </Text>
      )}
      <FlatList
        data={employees}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            style={styles.employeeButton}
            onPress={() => handleEmployeePress(item)}
          >
            <Text style={styles.employeeText}>{item.fullName}</Text>
            <Text
              style={[
                styles.employeeText,
                item.lastAttendanceType === "IN"
                  ? styles.presentStatus
                  : styles.absentStatus,
                styles.statusBadge, // optional if you want padding and borderRadius
              ]}
            >
              {item.lastAttendanceType === "IN" ? "En poste" : "Hors poste"}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={fetchEmployees}
      />

      {/* Modal for secret badge */}
      <PinCode
        pinLength={selectedEmployee?.secretBadge?.length}
        employeeName={selectedEmployee?.fullName}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        lastType={selectedEmployee?.lastAttendanceType}
      />

      {/* Success message */}
      {successMessage && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="green" />
          <Text style={styles.successText}>
            {successMessage === "IN" ? "Entrée réussie" : "Sortie réussie"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#f5f5f5",
  },

  title: { fontSize: 22, fontWeight: "600", marginBottom: 10 },
  scroll: { maxHeight: "auto" },
  employeeButton: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // Shadow for iOS
    shadowColor: "#818181",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,

    // Elevation for Android
    elevation: 3,

    // Optional border for subtle depth
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  absentStatus: {
    backgroundColor: "#dddddd95",
    color: "#777373",
  },
  presentStatus: {
    backgroundColor: "#a2f3ba8f",
    color: "#4ae387",
  },

  employeeText: { fontSize: 14, color: "#535353", fontWeight: "500" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  successContainer: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  successText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
  },
  button: {
    flex: 1, // make buttons take equal width
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5, // space between buttons
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
});
