import * as XLSX from "xlsx";
import * as Sharing from "expo-sharing";
// Change this line specifically:
import * as FileSystem from "expo-file-system/legacy";

export async function exportEmployeeMonthToExcel({
  employee,
  attendance,
  year,
  month,
}: {
  employee: { id: number; fullName: string };
  attendance: { date: string; time: string }[];
  year: number;
  month: number;
}) {
  try {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grouped: Record<string, string[]> = {};
    attendance.forEach((a) => {
      if (!grouped[a.date]) grouped[a.date] = [];
      grouped[a.date].push(a.time);
    });

    const rows = [["Matricule", "Nom", "Département", "Date", "Pointages"]];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = String(day).padStart(2, "0");
      const m = String(month + 1).padStart(2, "0");
      const isoDate = `${year}-${m}-${d}`;
      const frDate = `${d}/${m}/${year}`;

      rows.push([
        employee.id.toString(),
        employee.fullName,
        "STAR MARKET",
        frDate,
        grouped[isoDate]?.join(" ") || "",
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pointage");

    const excelData = XLSX.write(workbook, {
      type: "base64",
      bookType: "xlsx",
    });

    // Now FileSystem.cacheDirectory will exist again
    const fileName = `Pointage_${employee.fullName.replace(/\s/g, "_")}_${
      month + 1
    }_${year}.xlsx`;
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, excelData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error("Export Error:", error);
  }
}
