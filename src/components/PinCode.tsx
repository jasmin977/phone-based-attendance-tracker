import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  employeeName?: string;

  pinLength?: number;
  lastType?: "IN" | "OUT";
};

export default function PinCode({
  employeeName,
  visible,
  onClose,
  onConfirm,

  pinLength,
  lastType,
}: Props) {
  const [secretBadge, setSecretBadge] = useState("");

  const PIN_LENGTH = pinLength || 4;
  const [loading, setLoading] = useState(false);
  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION = 30; // seconds

  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(LOCK_DURATION);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locked) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocked(false);
          setAttempts(0);
          setSecretBadge("");
          setError(null);
          return LOCK_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [locked]);

  useEffect(() => {
    if (secretBadge.length === PIN_LENGTH && !loading && !locked) {
      setLoading(true);
      setError(null);

      const timer = setTimeout(() => {
        Promise.resolve(onConfirm(secretBadge))
          .catch(() => {
            setError("Badge invalide. Veuillez réessayer.");
            setAttempts((prev) => {
              const next = prev + 1;
              if (next >= MAX_ATTEMPTS) {
                setLocked(true);
              }
              return next;
            });
          })
          .finally(() => {
            setLoading(false);
            setSecretBadge("");
          });
      }, 2000); // ⏳ fake 2 seconds

      return () => clearTimeout(timer);
    }
  }, [secretBadge]);

  useEffect(() => {
    if (secretBadge.length > 0) {
      setError(null);
    }
  }, [secretBadge]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        onClose();
        setError(null);
      }}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{employeeName}</Text>

          <Text style={styles.subtitle}>Enter badge PIN</Text>
          {error && !locked && <Text style={styles.errorText}>{error}</Text>}
          {/* PIN dots */}
          <View style={styles.pinContainer}>
            {Array.from({ length: secretBadge.length }).map((_, index) => (
              <View key={index} style={styles.pinDotFilled} />
            ))}
          </View>
          <TouchableOpacity
            style={[
              {
                width: 30,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                top: 15,
                right: 20,
                position: "absolute",
              },
            ]}
            onPress={() => {
              setSecretBadge("");
              onClose();
            }}
          >
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          {/* Keypad */}

          {!locked && (
            <View style={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.key}
                  onPress={() => {
                    if (loading) return;
                    if (secretBadge.length < pinLength!) {
                      setSecretBadge(secretBadge + num.toString());
                    }
                  }}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}

              {/* Cancel */}
              <View style={{ width: "28%", margin: "2%" }}></View>

              {/* Zero */}
              <TouchableOpacity
                style={styles.key}
                onPress={() => {
                  if (loading) return;
                  if (secretBadge.length < pinLength!) {
                    setSecretBadge(secretBadge + "0");
                  }
                }}
              >
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity
                style={[
                  {
                    width: "28%",
                    height: "28%",
                    aspectRatio: 1,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "2%",
                  },
                ]}
                onPress={() => {
                  if (loading) return;
                  setSecretBadge(secretBadge.slice(0, -1));
                }}
              >
                <Text style={styles.deleteText}>⌫</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.statusContainer}>
            {locked ? (
              <Text style={styles.lockText}>
                🔒 Trop de tentatives
                {"\n"}Réessayez dans {remainingTime}s
              </Text>
            ) : loading ? (
              <>
                <ActivityIndicator size="small" color="#2ecc71" />
                <Text style={styles.statusText}>
                  {lastType === "IN"
                    ? "Pointage de sortie en cours…"
                    : "Pointage d’entrée en cours…"}
                </Text>
              </>
            ) : (
              <Text style={styles.statusHint}>
                {lastType === "IN"
                  ? "Sortie en attente…"
                  : "Entrée en attente…"}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },

  pinContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },

  pinDot: {},

  pinDotFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#999",
    marginHorizontal: 6,
    backgroundColor: "#111",
  },

  keypad: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  key: {
    width: "28%",
    height: "28%",
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: "2%",
    backgroundColor: "#f2f2f29d",
    borderColor: "#d4d4d4",
    borderWidth: 1,
  },

  keyText: {
    fontSize: 25,
    fontWeight: "bold",
  },

  deleteText: {
    fontSize: 20,
  },

  cancelKey: {
    backgroundColor: "#ffe5e5",
  },

  cancelText: {
    fontSize: 20,
    color: "#161616",
  },

  errorText: {
    marginTop: 8,
    color: "#c0392b",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  statusContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#2ecc71",
  },

  statusHint: {
    fontSize: 13,
    color: "#777",
  },

  lockText: {
    textAlign: "center",
    fontSize: 14,
    color: "#c0392b",
    fontWeight: "bold",
  },
});
