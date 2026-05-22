import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const mockPrisma = {
  job: {
    findUnique: jest.fn<any>(),
    update: jest.fn<any>(),
  },
};

jest.unstable_mockModule("../config/database.js", () => ({
  prisma: mockPrisma,
}));

const mockAxios = jest.fn<any>();

jest.unstable_mockModule("axios", () => ({
  default: mockAxios,
}));

const { processWebhook } = await import("../jobs/webhook.job.js");

function createMockJob(overrides: Record<string, any> = {}) {
  return {
    id: "w1b2c3d4-0000-0000-0000-000000000001",
    data: {
      url: "https://api.example.com/webhook",
      method: "POST",
      headers: { "X-Custom-Header": "taskflow" },
      body: { event: "job.completed", jobId: "abc-123" },
    },
    attemptsMade: 0,
    updateProgress: jest.fn<any>().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("processWebhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip processing if job is already COMPLETED (idempotency)", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "COMPLETED" });

    await processWebhook(mockJob as any);

    expect(mockPrisma.job.update).not.toHaveBeenCalled();
    expect(mockAxios).not.toHaveBeenCalled();
  });

  it("should deliver webhook and transition to COMPLETED on success", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: null });
    mockPrisma.job.update.mockResolvedValue({});
    mockAxios.mockResolvedValue({ status: 200, statusText: "OK" });

    await processWebhook(mockJob as any);

    expect(mockAxios).toHaveBeenCalledTimes(1);
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "https://api.example.com/webhook",
        headers: { "X-Custom-Header": "taskflow" },
        data: { event: "job.completed", jobId: "abc-123" },
        timeout: 30000,
      })
    );

    expect(mockPrisma.job.update).toHaveBeenCalledTimes(2);

    expect(mockPrisma.job.update).toHaveBeenNthCalledWith(1, {
      where: { id: "w1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({
        status: "PROCESSING",
        attempts: 1,
      }),
    });

    expect(mockPrisma.job.update).toHaveBeenNthCalledWith(2, {
      where: { id: "w1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({
        status: "COMPLETED",
        progress: 100,
        result: {
          statusCode: 200,
          statusText: "OK",
        },
      }),
    });
  });

  it("should call updateProgress at defined milestones", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: null });
    mockPrisma.job.update.mockResolvedValue({});
    mockAxios.mockResolvedValue({ status: 201, statusText: "Created" });

    await processWebhook(mockJob as any);

    expect(mockJob.updateProgress).toHaveBeenCalledWith(25);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(75);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
    expect(mockJob.updateProgress).toHaveBeenCalledTimes(3);
  });

  it("should throw and not mark COMPLETED when HTTP request fails", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: null });
    mockPrisma.job.update.mockResolvedValue({});
    mockAxios.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(processWebhook(mockJob as any)).rejects.toThrow("ECONNREFUSED");

    expect(mockPrisma.job.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.job.update).toHaveBeenCalledWith({
      where: { id: "w1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({ status: "PROCESSING" }),
    });
  });

  it("should preserve startedAt on retry attempts", async () => {
    const existingStart = new Date("2026-01-01T00:00:00Z");
    const mockJob = createMockJob({ attemptsMade: 3 });
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: existingStart });
    mockPrisma.job.update.mockResolvedValue({});
    mockAxios.mockResolvedValue({ status: 200, statusText: "OK" });

    await processWebhook(mockJob as any);

    expect(mockPrisma.job.update).toHaveBeenNthCalledWith(1, {
      where: { id: "w1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({
        startedAt: existingStart,
        attempts: 4,
      }),
    });
  });
});
