import { useNavigate } from "react-router-dom";
import { useCreateJob } from "../hooks/useJobs";
import { CreateJobForm } from "../components/jobs/CreateJobForm";
import { ApiError } from "../api/client";
import type { CreateJobRequest } from "../types";
import toast from "react-hot-toast";

export function CreateJobPage() {
  const navigate = useNavigate();
  const mutation = useCreateJob();

  function handleSubmit(data: CreateJobRequest) {
    mutation.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Job created: ${res.jobId.slice(0, 8)}…`);
        navigate(`/jobs/${res.jobId}`);
      },
      onError: (err) => {
        if (err instanceof ApiError && err.details) {
          const messages = err.details.map((d) => `${d.path}: ${d.message}`).join("\n");
          toast.error(`Validation failed:\n${messages}`);
        } else {
          toast.error(err instanceof ApiError ? err.message : "Failed to create job");
        }
      },
    });
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create Job</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Submit a new background job for processing
        </p>
      </div>

      <div className="rounded-xl border border-border-primary bg-surface-secondary p-6">
        <CreateJobForm
          onSubmit={handleSubmit}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}
