-- AlterTable
ALTER TABLE "PayRun" ADD COLUMN "payslipSendDate" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "niNumber" TEXT,
    "taxCode" TEXT NOT NULL DEFAULT '1257L',
    "jobRole" TEXT NOT NULL DEFAULT '',
    "employmentType" TEXT NOT NULL DEFAULT 'salaried',
    "annualSalary" REAL NOT NULL DEFAULT 0,
    "hourlyRate" REAL,
    "payFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "payDay" TEXT NOT NULL DEFAULT '27',
    "pensionRate" REAL NOT NULL DEFAULT 0.05,
    "pensionOptIn" BOOLEAN NOT NULL DEFAULT true,
    "studentLoanPlan" TEXT,
    "startDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "portalPasswordHash" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Employee_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("annualSalary", "createdAt", "dateOfBirth", "email", "employerId", "firstName", "id", "lastName", "niNumber", "payFrequency", "pensionRate", "portalEnabled", "portalPasswordHash", "startDate", "status", "studentLoanPlan", "taxCode", "updatedAt") SELECT "annualSalary", "createdAt", "dateOfBirth", "email", "employerId", "firstName", "id", "lastName", "niNumber", "payFrequency", "pensionRate", "portalEnabled", "portalPasswordHash", "startDate", "status", "studentLoanPlan", "taxCode", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE INDEX "Employee_employerId_idx" ON "Employee"("employerId");
CREATE TABLE "new_PayRunItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "hoursWorked" REAL NOT NULL DEFAULT 0,
    "clockIn" TEXT,
    "clockOut" TEXT,
    "breakMinutes" REAL NOT NULL DEFAULT 0,
    "breakPaid" BOOLEAN NOT NULL DEFAULT false,
    "overtimeHours" REAL NOT NULL DEFAULT 0,
    "overtimeRate" REAL NOT NULL DEFAULT 1.5,
    "bonus" REAL NOT NULL DEFAULT 0,
    "sickDays" REAL NOT NULL DEFAULT 0,
    "holidayDays" REAL NOT NULL DEFAULT 0,
    "adjustment" REAL NOT NULL DEFAULT 0,
    "adjustmentNote" TEXT,
    "grossPay" REAL NOT NULL DEFAULT 0,
    "incomeTax" REAL NOT NULL DEFAULT 0,
    "employeeNIC" REAL NOT NULL DEFAULT 0,
    "employerNIC" REAL NOT NULL DEFAULT 0,
    "pensionEmployee" REAL NOT NULL DEFAULT 0,
    "pensionEmployer" REAL NOT NULL DEFAULT 0,
    "studentLoan" REAL NOT NULL DEFAULT 0,
    "netPay" REAL NOT NULL DEFAULT 0,
    "totalCostToEmployer" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "PayRunItem_payRunId_fkey" FOREIGN KEY ("payRunId") REFERENCES "PayRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PayRunItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PayRunItem" ("adjustment", "adjustmentNote", "bonus", "employeeId", "employeeNIC", "employerNIC", "grossPay", "holidayDays", "hoursWorked", "id", "incomeTax", "netPay", "overtimeHours", "overtimeRate", "payRunId", "pensionEmployee", "pensionEmployer", "sickDays", "studentLoan", "totalCostToEmployer") SELECT "adjustment", "adjustmentNote", "bonus", "employeeId", "employeeNIC", "employerNIC", "grossPay", "holidayDays", "hoursWorked", "id", "incomeTax", "netPay", "overtimeHours", "overtimeRate", "payRunId", "pensionEmployee", "pensionEmployer", "sickDays", "studentLoan", "totalCostToEmployer" FROM "PayRunItem";
DROP TABLE "PayRunItem";
ALTER TABLE "new_PayRunItem" RENAME TO "PayRunItem";
CREATE INDEX "PayRunItem_payRunId_idx" ON "PayRunItem"("payRunId");
CREATE INDEX "PayRunItem_employeeId_idx" ON "PayRunItem"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
