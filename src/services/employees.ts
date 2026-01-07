import { db } from "../db/database";
import { Attendance, AttendanceType, Employee } from "../types/Employee";

export async function getEmployeeById(id: number): Promise<Employee | null> {
  const result = await db.getAllAsync<Employee>(
    "SELECT * FROM employees WHERE id = ?",
    [id]
  );

  return result.length > 0 ? result[0] : null;
}
export async function getAllEmployees(): Promise<Employee[]> {
  const result = await db.getAllAsync<Employee>("SELECT * FROM employees");
  return result;
}
export async function getEmployeeAttendance(employeeId: number) {
  const result = await db.getAllAsync<Attendance>(
    "SELECT * FROM attendance WHERE employeeId = ? ORDER BY date DESC, time DESC",
    [employeeId]
  );
  return result;
}
export async function getEmployeeLastAttendanceType(
  employeeId: number
): Promise<AttendanceType | null> {
  const result = await db.getAllAsync<Attendance>(
    "SELECT * FROM attendance WHERE employeeId = ? ORDER BY date DESC, time DESC LIMIT 1",
    [employeeId]
  );
  return result.length > 0 ? result[0].type : null;
}
export async function isSecretBadgeValid(
  employeeId: number,
  secretBadge: string
): Promise<boolean> {
  const result = await db.getAllAsync<Employee>(
    "SELECT * FROM employees WHERE id = ? AND secretBadge = ?",
    [employeeId, secretBadge]
  );
  return result.length > 0;
}

export async function createEmployee(
  name: string,
  secretBadge: string
): Promise<Employee> {
  try {
    const createdAt = new Date().toISOString();

    const result = await db.runAsync(
      "INSERT INTO employees (fullName, secretBadge, createdAt) VALUES (?, ?, ?)",
      [name, secretBadge, createdAt]
    );

    // Manually fetch the ID if result.lastInsertRowId is missing
    const row = await db.getFirstAsync<{ id: number }>(
      "SELECT last_insert_rowid() as id"
    );
    const manualID = row?.id;

    const newEmployee: Employee = {
      id: manualID as number,
      fullName: name,
      secretBadge,
      createdAt,
    };

    return newEmployee;
  } catch (err) {
    console.error("Error creating employee:", err);
    throw new Error("Failed to create employee");
  }
}

export async function updateEmployee(
  id: number,
  name: string,
  secretBadge: string
) {
  // Build dynamic query
  const fields: string[] = [];
  const values: any[] = [];

  if (name.trim() !== "") {
    fields.push("fullName = ?");
    values.push(name);
  }

  if (secretBadge.trim() !== "") {
    fields.push("secretBadge = ?");
    values.push(secretBadge);
  }

  if (fields.length === 0) {
    // Nothing to update
    return;
  }

  const query = `UPDATE employees SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  await db.runAsync(query, values);
}

export async function deleteEmployee(id: number) {
  await db.runAsync("DELETE FROM employees WHERE id = ?", [id]);
  await db.runAsync("DELETE FROM attendance WHERE employeeId = ?", [id]);
}
