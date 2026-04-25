-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'england',
    "defaultTaxCode" TEXT NOT NULL DEFAULT '1257L',
    "studentLoanPlans" TEXT NOT NULL DEFAULT '[]',
    "pensionEmployeeRate" REAL NOT NULL DEFAULT 0.05,
    "pensionEmployerRate" REAL NOT NULL DEFAULT 0.03,
    "useSalarySacrifice" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taxYear" TEXT NOT NULL,
    "entryName" TEXT NOT NULL DEFAULT 'Tax Calculation',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "country" TEXT NOT NULL DEFAULT 'england',
    "taxCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaxEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncomeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "IncomeItem_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TaxEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Deduction_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TaxEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CapitalGain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "salePrice" REAL NOT NULL,
    "costs" REAL NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "CapitalGain_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TaxEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "ipAddress" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "TaxEntry_userId_idx" ON "TaxEntry"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
