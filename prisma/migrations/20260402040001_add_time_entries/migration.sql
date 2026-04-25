-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "payRunItemId" TEXT,
    "date" TEXT NOT NULL,
    "clockIn" TEXT,
    "clockOut" TEXT,
    "breakMinutes" REAL NOT NULL DEFAULT 0,
    "breakPaid" BOOLEAN NOT NULL DEFAULT false,
    "hoursWorked" REAL NOT NULL DEFAULT 0,
    "overtimeHours" REAL NOT NULL DEFAULT 0,
    "overtimeRate" REAL NOT NULL DEFAULT 1.5,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimeEntry_payRunItemId_fkey" FOREIGN KEY ("payRunItemId") REFERENCES "PayRunItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_payRunItemId_idx" ON "TimeEntry"("payRunItemId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_employeeId_date_key" ON "TimeEntry"("employeeId", "date");
