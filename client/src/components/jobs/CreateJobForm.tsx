import { useState, type FormEvent } from "react";
import type { JobType, CreateJobRequest } from "../../types";
import { Send } from "lucide-react";

const JOB_TYPES: JobType[] = ["EMAIL", "REPORT", "RESIZE", "WEBHOOK", "SCHEDULED"];

interface CreateJobFormProps {
  onSubmit: (data: CreateJobRequest) => void;
  isLoading: boolean;
}

/**
 * Dynamic form that builds the exact payload shape each job type expects.
 * Mirrors backend's createJobSchema and per-type payload interfaces precisely.
 */
export function CreateJobForm({ onSubmit, isLoading }: CreateJobFormProps) {
  const [type, setType] = useState<JobType>("EMAIL");
  const [userId, setUserId] = useState("");
  const [priority, setPriority] = useState<number>(0);
  const [scheduledAt, setScheduledAt] = useState("");

  // ─── Per-type payload fields ──────────────────────────────
  // EMAIL
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [emailContext, setEmailContext] = useState("{}");

  // REPORT
  const [reportType, setReportType] = useState("");
  const [reportFilters, setReportFilters] = useState("{}");
  const [reportFilePath, setReportFilePath] = useState("");

  // RESIZE
  const [resizeFilePath, setResizeFilePath] = useState("");
  const [resizeOutputDir, setResizeOutputDir] = useState("");

  // WEBHOOK
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookMethod, setWebhookMethod] = useState("POST");
  const [webhookHeaders, setWebhookHeaders] = useState("{}");
  const [webhookBody, setWebhookBody] = useState("{}");

  // SCHEDULED
  const [reminderType, setReminderType] = useState("email");
  const [scheduledTarget, setScheduledTarget] = useState("");
  const [scheduledMessage, setScheduledMessage] = useState("");

  function buildPayload(): Record<string, unknown> {
    switch (type) {
      case "EMAIL":
        return {
          to: emailTo,
          subject: emailSubject,
          template: emailTemplate,
          context: safeJsonParse(emailContext),
        };
      case "REPORT":
        return {
          reportType,
          filters: safeJsonParse(reportFilters),
          filePath: reportFilePath,
        };
      case "RESIZE":
        return {
          filePath: resizeFilePath,
          outputDir: resizeOutputDir,
        };
      case "WEBHOOK":
        return {
          url: webhookUrl,
          method: webhookMethod,
          headers: safeJsonParse(webhookHeaders),
          body: safeJsonParse(webhookBody),
        };
      case "SCHEDULED":
        return {
          reminderType,
          target: scheduledTarget,
          message: scheduledMessage,
        };
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const data: CreateJobRequest = {
      type,
      userId,
      payload: buildPayload(),
    };

    if (priority > 0) data.priority = priority;
    if (scheduledAt) data.scheduledAt = new Date(scheduledAt).toISOString();

    onSubmit(data);
  }

  const inputClass =
    "w-full rounded-lg border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent-blue focus:ring-1 focus:ring-accent-blue";
  const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Common Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Job Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as JobType)}
            className={inputClass}
            required
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>User ID *</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={inputClass}
            placeholder="e.g. user_123"
            required
            minLength={1}
          />
        </div>
        <div>
          <label className={labelClass}>Priority (0-10)</label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
            className={inputClass}
            min={0}
            max={10}
          />
        </div>
        <div>
          <label className={labelClass}>Schedule (optional)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border-primary" />

      {/* Dynamic payload fields */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          {type} Payload
        </h3>

        {type === "EMAIL" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>To *</label>
              <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className={inputClass} placeholder="recipient@example.com" required />
            </div>
            <div>
              <label className={labelClass}>Subject *</label>
              <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} placeholder="Email subject" required />
            </div>
            <div>
              <label className={labelClass}>Template *</label>
              <input type="text" value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)} className={inputClass} placeholder="welcome" required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Context (JSON)</label>
              <textarea value={emailContext} onChange={(e) => setEmailContext(e.target.value)} className={`${inputClass} font-mono min-h-[80px]`} placeholder='{"name": "John"}' />
            </div>
          </div>
        )}

        {type === "REPORT" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Report Type *</label>
              <input type="text" value={reportType} onChange={(e) => setReportType(e.target.value)} className={inputClass} placeholder="sales_summary" required />
            </div>
            <div>
              <label className={labelClass}>File Path *</label>
              <input type="text" value={reportFilePath} onChange={(e) => setReportFilePath(e.target.value)} className={inputClass} placeholder="/data/sales.csv" required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Filters (JSON)</label>
              <textarea value={reportFilters} onChange={(e) => setReportFilters(e.target.value)} className={`${inputClass} font-mono min-h-[80px]`} placeholder='{"year": 2026}' />
            </div>
          </div>
        )}

        {type === "RESIZE" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>File Path *</label>
              <input type="text" value={resizeFilePath} onChange={(e) => setResizeFilePath(e.target.value)} className={inputClass} placeholder="/uploads/image.jpg" required />
            </div>
            <div>
              <label className={labelClass}>Output Directory *</label>
              <input type="text" value={resizeOutputDir} onChange={(e) => setResizeOutputDir(e.target.value)} className={inputClass} placeholder="/uploads/resized" required />
            </div>
          </div>
        )}

        {type === "WEBHOOK" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>URL *</label>
              <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className={inputClass} placeholder="https://api.example.com/hook" required />
            </div>
            <div>
              <label className={labelClass}>Method</label>
              <select value={webhookMethod} onChange={(e) => setWebhookMethod(e.target.value)} className={inputClass}>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Headers (JSON)</label>
              <textarea value={webhookHeaders} onChange={(e) => setWebhookHeaders(e.target.value)} className={`${inputClass} font-mono min-h-[80px]`} placeholder='{"X-Api-Key": "..."}' />
            </div>
            <div>
              <label className={labelClass}>Body (JSON)</label>
              <textarea value={webhookBody} onChange={(e) => setWebhookBody(e.target.value)} className={`${inputClass} font-mono min-h-[80px]`} placeholder='{"event": "test"}' />
            </div>
          </div>
        )}

        {type === "SCHEDULED" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Reminder Type *</label>
              <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className={inputClass}>
                <option value="email">email</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Target *</label>
              <input type="text" value={scheduledTarget} onChange={(e) => setScheduledTarget(e.target.value)} className={inputClass} placeholder="user@example.com" required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Message *</label>
              <input type="text" value={scheduledMessage} onChange={(e) => setScheduledMessage(e.target.value)} className={inputClass} placeholder="Don't forget the meeting!" required />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-blue-hover hover:shadow-lg hover:shadow-accent-blue/25 disabled:opacity-50 disabled:pointer-events-none"
      >
        <Send className="h-4 w-4" />
        {isLoading ? "Submitting…" : "Submit Job"}
      </button>
    </form>
  );
}

function safeJsonParse(str: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
