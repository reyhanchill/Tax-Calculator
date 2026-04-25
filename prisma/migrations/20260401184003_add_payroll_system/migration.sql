-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "niNumber" TEXT,
    "taxCode" TEXT NOT NULL DEFAULT '1257L',
    "annualSalary" REAL NOT NULL DEFAULT 0,
    "payFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "pensionRate" REAL NOT NULL DEFAULT 0.05,
    "studentLoanPlan" TEXT,
    "startDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "portalPasswordHash" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Employee_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerId" TEXT NOT NULL,
    "taxYear" TEXT NOT NULL DEFAULT '2025-26',
    "period" TEXT NOT NULL,
    "payDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayRun_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayRunItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "hoursWorked" REAL NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payRunItemId" TEXT NOT NULL,
    "viewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payslip_payRunItemId_fkey" FOREIGN KEY ("payRunItemId") REFERENCES "PayRunItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "accountType" TEXT NOT NULL DEFAULT 'individual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "gdprConsent", "id", "name", "passwordHash", "totpEnabled", "totpSecret", "updatedAt") SELECT "createdAt", "email", "gdprConsent", "id", "name", "passwordHash", "totpEnabled", "totpSecret", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Employee_employerId_idx" ON "Employee"("employerId");

-- CreateIndex
CREATE INDEX "PayRun_employerId_idx" ON "PayRun"("employerId");

-- CreateIndex
CREATE INDEX "PayRunItem_payRunId_idx" ON "PayRunItem"("payRunId");

-- CreateIndex
CREATE INDEX "PayRunItem_employeeId_idx" ON "PayRunItem"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_payRunItemId_key" ON "Payslip"("payRunItemId");
