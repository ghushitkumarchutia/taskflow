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

const mockSendMail = jest.fn<any>().mockResolvedValue({
  messageId: "test-msg-id-001",
  accepted: ["user@example.com"],
});

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTestAccount: jest.fn<any>().mockResolvedValue({
      smtp: { host: "smtp.ethereal.email", port: 587, secure: false },
      user: "test@ethereal.email",
      pass: "testpass",
    }),
    createTransport: jest.fn<any>().mockReturnValue({
      sendMail: mockSendMail,
    }),
    getTestMessageUrl: jest.fn<any>().mockReturnValue("https://ethereal.email/message/test-preview"),
  },
}));

const { processEmail } = await import("../jobs/email.job.js");

function createMockJob(overrides: Record<string, any> = {}) {
  return {
    id: "e1b2c3d4-0000-0000-0000-000000000001",
    data: {
      to: "user@example.com",
      subject: "Welcome to TaskFlow",
      template: "welcome",
      context: { name: "John", plan: "pro" },
    },
    attemptsMade: 0,
    updateProgress: jest.fn<any>().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("processEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip processing if job is already COMPLETED (idempotency)", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "COMPLETED" });

    await processEmail(mockJob as any);

    expect(mockPrisma.job.update).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should transition status to PROCESSING then COMPLETED on success", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: null });
    mockPrisma.job.update.mockResolvedValue({});

    await processEmail(mockJob as any);

    expect(mockPrisma.job.update).toHaveBeenCalledTimes(2);

    expect(mockPrisma.job.update).toHaveBeenNthCalledWith(1, {
      where: { id: "e1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({
        status: "PROCESSING",
        attempts: 1,
      }),
    });

    expect(mockPrisma.job.update).toHaveBeenNthCalledWith(2, {
      where: { id: "e1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({
        status: "COMPLETED",
        progress: 100,
        result: {
          messageId: "test-msg-id-001",
          accepted: ["user@example.com"],
          previewUrl: "https://ethereal.email/message/test-preview",
        },
      }),
    });
  });

  it("should call updateProgress at all defined milestones", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: null });
    mockPrisma.job.update.mockResolvedValue({});

    await processEmail(mockJob as any);

    expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(30);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(60);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(90);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
    expect(mockJob.updateProgress).toHaveBeenCalledTimes(5);
  });

  it("should send email with correct recipient, subject, and HTML body", async () => {
    const mockJob = createMockJob();
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: null });
    mockPrisma.job.update.mockResolvedValue({});

    await processEmail(mockJob as any);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith({
      from: '"TaskFlow Engine" <taskflow@example.com>',
      to: "user@example.com",
      subject: "Welcome to TaskFlow",
      html: expect.stringContaining("welcome"),
    });
  });

  it("should preserve startedAt on retry attempts", async () => {
    const existingStart = new Date("2026-01-01T00:00:00Z");
    const mockJob = createMockJob({ attemptsMade: 2 });
    mockPrisma.job.findUnique.mockResolvedValue({ status: "QUEUED", startedAt: existingStart });
    mockPrisma.job.update.mockResolvedValue({});

    await processEmail(mockJob as any);

    expect(mockPrisma.job.update).toHaveBeenNthCalledWith(1, {
      where: { id: "e1b2c3d4-0000-0000-0000-000000000001" },
      data: expect.objectContaining({
        startedAt: existingStart,
        attempts: 3,
      }),
    });
  });
});
