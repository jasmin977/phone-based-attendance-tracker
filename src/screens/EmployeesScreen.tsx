// screens/EmployeesScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllEmployees,
  deleteEmployee,
  updateEmployee,
  createEmployee,
} from "../services/employees";

interface Employee {
  id: number;
  fullName: string;
  secretBadge?: string;
  createdAt: string;
}

export default function EmployeesScreen({ navigation }: any) {
  const [locked, setLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [nameInput, setNameInput] = useState("");
  const [badgeInput, setBadgeInput] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setRefreshing(true); // show spinner
    getAllEmployees().then((data) => {
      setEmployees(data);
      setRefreshing(false);
    });
  };

  const handleDelete = (employee: Employee) => {
    Alert.alert(
      `⛔ Supprimer ${employee.fullName} ?`,
      `Les pointages de ${employee.fullName} seront supprimées. Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteEmployee(employee.id);
            fetchEmployees();
          },
        },
      ]
    );
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNameInput(employee.fullName);
    setBadgeInput(employee.secretBadge ?? "");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, nameInput, badgeInput);
    setEditModalVisible(false);
    fetchEmployees();
  };

  const handleAddEmployee = async () => {
    if (nameInput.trim() === "") {
      Alert.alert(
        "📍 Information manquante",
        "Le nom est obligatoire pour créer une fiche employé. 🪪"
      );
      return;
    }
    if (badgeInput.trim() === "") {
      Alert.alert(
        "📍 Information manquante",
        "Le badge secret est obligatoire pour créer une fiche employé. 🪪"
      );
      return;
    }

    const newEmployee = await createEmployee(nameInput, badgeInput);
    setAddModalVisible(false);
    setNameInput("");
    setBadgeInput("");
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const handleAuth = () => {
    const correctPassword = "250991"; // Replace with your desired password
    if (password === correctPassword) {
      setLocked(false);
    } else {
      Alert.alert(
        "🔑 Authentification",
        "Oups ! Ce n'est pas le bon mot de passe. 💡 Besoin d'aide ?"
      );
    }
  };
  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.employeeContainer}>
      <Text style={styles.employeeName}>{item.fullName}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil" size={22} color="#6caff7" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.actionButton}
        >
          <Ionicons name="trash" size={22} color="#fa6565" />
        </TouchableOpacity>
      </View>
    </View>
  );
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
        <Modal visible={locked} animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Authentification Requise</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                inputMode="decimal"
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nos Employés 💕</Text>
        <Text style={styles.count}>Total: {employees.length}</Text>
      </View>

      {employees.length === 0 && !refreshing && (
        <Text style={styles.empty}>
          Aucun employé trouvé. Veuillez en ajouter.
        </Text>
      )}
      {/* Employee List */}
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshing={refreshing}
        onRefresh={fetchEmployees}
      />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier Employé</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nom complet"
              style={styles.input}
            />
            <TextInput
              value={badgeInput}
              inputMode="decimal"
              onChangeText={setBadgeInput}
              placeholder="Badge secret"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelBttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={addModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ajouter Employé</Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nom"
              style={styles.input}
            />
            <TextInput
              value={badgeInput}
              onChangeText={setBadgeInput}
              placeholder="Badge secret"
              inputMode="decimal"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelBttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleAddEmployee}
              >
                <Text style={styles.buttonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          setNameInput("");
          setBadgeInput("");
          setAddModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  count: { fontSize: 18, color: "gray", alignSelf: "center" },

  employeeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  employeeName: { fontSize: 18 },
  actions: { flexDirection: "row" },
  actionButton: { marginLeft: 15 },

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
    fontSize: 16,
    marginBottom: 10,
  },

  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
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

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
});
