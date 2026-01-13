# Star Market - Employee Attendance Tracker

A React Native mobile application built with Expo for managing employee attendance, tracking check-in/out times, and generating monthly reports.

## 📱 Features

### 🏠 Home Screen (Pointage)
- **Dashboard:** Real-time view of all employees and their current status (**Present** 🟢 / **Absent** 🔴).
- **Secure Check-In/Out:** Employees tap their name and enter their unique **Secret Badge** to clock in or out.
- **Instant Feedback:** Visual confirmation of successful attendance logging.

### 👥 Employee Management (Admin)
- **Protected Access:** Locked by a master password to prevent unauthorized changes.
- **Manage Staff:** Add, Edit, or Remove employees.
- **Credentials:** Assign unique "Secret Badges" to each employee for secure clocking.

### 📅 History & Reports (Admin)
- **Detailed Logs:** View attendance history by selecting an employee, month, and year.
- **Excel Export:** Generate and share `.xlsx` reports for payroll and archiving.
- **Offline Storage:** All data is stored locally on the device using SQLite.

## 🛠 Tech Stack
- **Framework:** React Native (Expo)
- **Database:** SQLite (Local storage)
- **Language:** TypeScript
- **Export:** SheetJS (xlsx) for Excel reports

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your mobile device (for testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd employee-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npx expo start
   ```

4. **Run on Device:**
   - Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).

## 📦 Building the APK (Android)

To generate a standalone APK file for Android devices:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure the Project (First Time Only):**
   Ensure `eas.json` has the `apk` profile (this is already set up in this project).

4. **Build the APK:**
   ```bash
   eas build --platform android --profile apk
   ```
   *   If prompted to generate a Keystore, choose **Yes** (or press Enter).
   *   The build will run in the cloud (approx 10-20 mins).

5. **Download:**
   Once the build finishes, the terminal will provide a direct link to download the `.apk` file. You can install this file on any Android device.

## 🔐 Security
- **Admin Default Password:** `250991` (Used for accessing Employees and History screens).
  *Note: Ensure to change this in the source code (`EmployeesScreen.tsx` & `HistoryScreen.tsx`) for production use.*
