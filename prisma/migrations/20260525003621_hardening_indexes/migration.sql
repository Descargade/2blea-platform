-- DropIndex
DROP INDEX "Conversation_clientId_idx";

-- DropIndex
DROP INDEX "Conversation_projectId_idx";

-- DropIndex
DROP INDEX "Extra_serviceId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_read_idx";

-- DropIndex
DROP INDEX "Notification_userId_read_idx";

-- DropIndex
DROP INDEX "Offer_active_featured_idx";

-- DropIndex
DROP INDEX "Project_clientId_status_idx";

-- DropIndex
DROP INDEX "ProjectFile_projectId_idx";

-- DropIndex
DROP INDEX "Service_active_idx";

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "ActivityLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "BudgetRequest_status_createdAt_idx" ON "BudgetRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BudgetRequest_email_createdAt_idx" ON "BudgetRequest"("email", "createdAt");

-- CreateIndex
CREATE INDEX "Client_company_idx" ON "Client"("company");

-- CreateIndex
CREATE INDEX "Conversation_clientId_updatedAt_deletedAt_idx" ON "Conversation"("clientId", "updatedAt", "deletedAt");

-- CreateIndex
CREATE INDEX "Conversation_projectId_deletedAt_idx" ON "Conversation"("projectId", "deletedAt");

-- CreateIndex
CREATE INDEX "Extra_serviceId_deletedAt_idx" ON "Extra"("serviceId", "deletedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_deletedAt_idx" ON "Message"("conversationId", "createdAt", "deletedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_read_deletedAt_idx" ON "Message"("conversationId", "read", "deletedAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Offer_active_featured_deletedAt_idx" ON "Offer"("active", "featured", "deletedAt");

-- CreateIndex
CREATE INDEX "Project_clientId_status_deletedAt_idx" ON "Project"("clientId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Project_status_deletedAt_idx" ON "Project"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_category_deletedAt_idx" ON "ProjectFile"("projectId", "category", "deletedAt");

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_deletedAt_idx" ON "ProjectFile"("projectId", "deletedAt");

-- CreateIndex
CREATE INDEX "Service_active_order_idx" ON "Service"("active", "order");

-- CreateIndex
CREATE INDEX "User_role_deletedAt_idx" ON "User"("role", "deletedAt");
