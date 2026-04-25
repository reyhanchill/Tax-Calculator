-- CreateTable
CREATE TABLE "NewsletterSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "NewsletterSignup_interest_idx" ON "NewsletterSignup"("interest");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSignup_email_interest_key" ON "NewsletterSignup"("email", "interest");
