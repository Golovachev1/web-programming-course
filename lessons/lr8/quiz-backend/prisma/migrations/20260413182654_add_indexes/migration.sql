-- CreateIndex
CREATE INDEX "Answer_sessionId_score_idx" ON "Answer"("sessionId", "score" DESC);
