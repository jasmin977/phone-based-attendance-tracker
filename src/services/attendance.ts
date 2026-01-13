import * as Print from "expo-print";
import { getEmployeeById } from "./employees";
import { Attendance } from "../types/Employee";
import { db } from "../db/database";

export async function handleCheckInOut(employeeId: number) {
  const employee = await getEmployeeById(employeeId);
  if (!employee) throw new Error("Employee not found");

  // Automatically decides IN/OUT and inserts
  const newAttendance = await addAttendance(employee.id);

  return newAttendance;
}

export async function getAttendanceHistory(
  employeeId: number,
  month: number,
  year: number
) {
  const monthStr = String(month + 1).padStart(2, "0");
  const yearStr = String(year).padStart(4, "0");

  const result = await db.getAllAsync<Attendance>(
    "SELECT date, time FROM attendance WHERE employeeId = ? AND date LIKE ? ORDER BY date ASC, time ASC",
    [employeeId, `${yearStr}-${monthStr}%`]
  );
  return result;
}

export const addAttendance = async (
  employeeId: number
): Promise<Attendance> => {
  // 1️⃣ Get last attendance for this employee
  const lastAttendance = await db.getAllAsync<Attendance>(
    "SELECT * FROM attendance WHERE employeeId = ? ORDER BY date DESC, time DESC LIMIT 1",
    [employeeId]
  );
  const lastType =
    lastAttendance.length > 0 ? lastAttendance[0].type : undefined;

  // 2️⃣ Decide new type
  //if its new day set to IN else toggle
  const now = new Date();
  const date = now.toLocaleDateString("en-CA"); // yyyy-MM-dd
  const lastDate = lastAttendance.length > 0 ? lastAttendance[0].date : null;
  const newType: "IN" | "OUT" =
    lastDate !== date ? "IN" : lastType === "IN" ? "OUT" : "IN";

  // 3️⃣ Create date and time
  const time = now.toTimeString().slice(0, 5);

  // 4️⃣ Insert attendance in DB
  const result = await db.runAsync(
    "INSERT INTO attendance (employeeId, date, time, type) VALUES (?, ?, ?, ?)",
    [employeeId, date, time, newType]
  );
  // Manually fetch the ID if result.lastInsertRowId is missing
  const row = await db.getFirstAsync<{ id: number }>(
    "SELECT last_insert_rowid() as id"
  );
  const manualID = row?.id;

  // 5️⃣ Return the created Attendance object
  const newAttendance: Attendance = {
    id: manualID as number,
    employeeId,
    date,
    time,
    type: newType,
  };
  console.log("🚀 ~ addAttendance ~ newAttendance:", newAttendance);

  return newAttendance;
};
