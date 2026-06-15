"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { termsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/rich-text-editor";

// Detect whether stored content is HTML (rich) or legacy plain text.
const isHtml = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

// Collapse non-breaking spaces (Quill emits these for plain text) back to normal
// spaces so long paragraphs wrap instead of overflowing horizontally.
const normalize = (s: string) => s.replace(/&nbsp;| | /gi, " ");

export default function TermsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["terms"],
    queryFn: termsApi.get,
  });

  const startEditing = () => {
    setDraft(normalize(data?.content ?? ""));
    setEditing(true);
  };

  const mutation = useMutation({
    mutationFn: (content: string) => termsApi.update(normalize(content)),
    onSuccess: () => {
      toast.success("Terms & Conditions updated.");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Terms &amp; Conditions</h1>
        {editing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDraft(normalize(data?.content ?? ""));
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate(draft)} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </div>
        ) : (
          <Button onClick={startEditing} disabled={isLoading}>
            <Pencil className="size-4" /> Edit
          </Button>
        )}
      </div>

      <Card className="p-6 sm:p-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${85 + ((i * 7) % 15)}%` }} />
            ))}
          </div>
        ) : editing ? (
          <RichTextEditor
            value={draft}
            onChange={setDraft}
            placeholder="Write your terms & conditions here…"
          />
        ) : data?.content ? (
          isHtml(data.content) ? (
            <div
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: normalize(data.content) }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
              {data.content}
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            No terms &amp; conditions have been set yet. Click Edit to add them.
          </p>
        )}
      </Card>
    </div>
  );
}
