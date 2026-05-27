import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import { JobsTable } from "../components/jobs/JobsTable";
import { JobFilters } from "../components/jobs/JobFilters";
import { Pagination } from "../components/ui/Pagination";
import { PageLoader } from "../components/ui/LoadingSpinner";
import type { JobStatus, JobType } from "../types";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

export function JobsPage() {
  const [status, setStatus] = useState<JobStatus | "">("");
  const [type, setType] = useState<JobType | "">("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useJobs({
    status: status || undefined,
    type: type || undefined,
    page,
    limit,
  });

  // Reset page when filters change
  function handleStatusChange(val: JobStatus | "") {
    setStatus(val);
    setPage(1);
  }
  function handleTypeChange(val: JobType | "") {
    setType(val);
    setPage(1);
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Jobs</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {data?.total ?? 0} total jobs
          </p>
        </div>
        <Link
          to="/jobs/create"
          className="flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-blue-hover hover:shadow-lg hover:shadow-accent-blue/25"
        >
          <PlusCircle className="h-4 w-4" />
          Create Job
        </Link>
      </div>

      {/* Filters */}
      <JobFilters
        status={status}
        type={type}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
      />

      {/* Table */}
      {data && <JobsTable jobs={data.data} />}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
