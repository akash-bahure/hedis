import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  recordLabel?: string;
  selectedCount?: number;
  maxVisible?: number;
}

function buildPageRange(
  current: number,
  total: number,
  maxVisible: number
): (number | "...")[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, current + half);

  // Shift window if near the edges
  if (current - half < 2) {
    end = Math.min(total - 1, maxVisible - 1);
  }
  if (current + half > total - 1) {
    start = Math.max(2, total - maxVisible + 2);
  }

  const pages: (number | "...")[] = [1];

  if (start > 2) pages.push("...");

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) pages.push("...");

  pages.push(total);

  return pages;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export function Pagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  recordLabel = "records",
  selectedCount,
  maxVisible = 7,
}: PaginationProps) {
  // Guard: nothing to paginate
  if (totalPages <= 0 || totalRecords <= 0) return null;

  const from = Math.min((page - 1) * pageSize + 1, totalRecords);
  const to = Math.min(page * pageSize, totalRecords);
  const pageRange = buildPageRange(page, totalPages, maxVisible);

  return (
    <div className="flex-shrink-0 border-t border-border px-4 py-2.5 flex items-center justify-between gap-4 bg-card">
      {/* ── LEFT: record count + selection badge ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{from}</span>
          {" – "}
          <span className="font-semibold text-foreground">{to}</span>
          {" of "}
          <span className="font-semibold text-foreground">
            {totalRecords}
          </span>{" "}
          {recordLabel}
        </span>

        {selectedCount !== undefined && selectedCount > 0 && (
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* ── RIGHT: page buttons ── */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page numbers */}
        {pageRange.map((pg, idx) =>
          pg === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-7 h-7 flex items-center justify-center text-[11px] text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              aria-label={`Go to page ${pg}`}
              aria-current={page === pg ? "page" : undefined}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-semibold transition-colors ${
                page === pg
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {pg}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
