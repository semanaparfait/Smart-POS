"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import { BackButton, Button, Field, FormPage, FormSection, TextArea } from "@/app/owner/components/forms";

// A page that asks why: rejecting an expense or a payment, or reporting money
// as not received. It sends `{ note }` and goes back.
export function ReasonPage({
  back,
  backLabel,
  eyebrow,
  title,
  description,
  summary,
  label = "Why?",
  placeholder,
  submitLabel = "Reject",
  path,
  done,
}: {
  back: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  summary?: React.ReactNode;
  label?: string;
  placeholder: string;
  submitLabel?: string;
  path: string;
  done: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (note.trim().length < 3) return toast.error("Say why, so the worker knows");
    setSaving(true);
    try {
      await ownerRequest(path, { method: "PATCH", body: JSON.stringify({ note: note.trim() }) });
      toast.success(done);
      router.push(back);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={back}
      backLabel={backLabel}
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={
        <>
          <BackButton href={back} />
          <Button tone="danger" icon={X} busy={saving} onClick={submit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <FormSection>
        {summary}
        <Field label={label} hint="The worker sees this.">
          <TextArea value={note} maxLength={255} rows={3} autoFocus onChange={(e) => setNote(e.target.value)} placeholder={placeholder} />
        </Field>
      </FormSection>
    </FormPage>
  );
}
