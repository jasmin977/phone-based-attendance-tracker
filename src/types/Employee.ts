export interface Employee {
  id: number;
  fullName: string;
  secretBadge?: string;
  createdAt: string;
}

export type AttendanceType = "IN" | "OUT";
export interface Attendance {
  id: number;
  employeeId: number;
  date: string; // 2026-01-07
  time: string; // 08:15
  type: AttendanceType;
}
