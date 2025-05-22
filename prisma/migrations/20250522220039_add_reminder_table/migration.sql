-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "confirmationId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_confirmationId_key" ON "Reminder"("confirmationId");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_confirmationId_fkey" FOREIGN KEY ("confirmationId") REFERENCES "Confirmation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
