"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Compute a compact window of page numbers around the current page.
  const pages: (number | "...")[] = [];
  const push = (p: number) => pages.push(p);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i);
    if (page < totalPages - 2) pages.push("...");
    push(totalPages);
  }

  const btn =
    "flex size-9 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total} results
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          className={cn(btn, "bg-primary text-primary-foreground hover:bg-primary/90")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1.5 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                btn,
                p === page
                  ? "bg-sidebar text-white"
                  : "border bg-white text-foreground hover:bg-accent"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Next page"
          className={cn(btn, "bg-primary text-primary-foreground hover:bg-primary/90")}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
