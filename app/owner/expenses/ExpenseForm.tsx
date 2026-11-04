"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import { rwf, toNumber } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormSection, MoneyInput, TextArea, TextInput, todayKey } from "@/app/owner/components/forms";
import { EXPENSE_CATEGORIES, EXPENSE_REPEATS, categoryLabel, repeatOf, type ExpenseCategory, type ExpenseRepeat } from "@/app/owner/finance/labels";
import { monthlyAmount, type Expense } from "@/app/owner/finance/money";

export const EXPENSES = "/owner/expenses";

// The page for adding or changing one expense.
export function ExpenseForm({ editing }: { editing: Expense | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState<ExpenseCategory | "">(editing?.category ?? "");
  const [amount, setAmount] = useState(editing ? String(Math.round(toNumber(editing.amount))) : "");
  const [repeat, setRepeat] = useState<ExpenseRepeat>(editing?.repeat ?? "ONCE");
  const [startDate, setStartDate] = useState(editing?.startDate ?? todayKey());
  const [endDate, setEndDate] = useState(editing?.endDate ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [saving, setSaving] = useState(false);
  const per = repeatOf(repeat).per;

  // Picking a kind fills a title, unless one was typed.
  const pickCategory = (value: ExpenseCategory) => {
    if (!title.trim() || EXPENSE_CATEGORIES.some((c) => c.label === title)) setTitle(categoryLabel(value));
    setCategory(value);
  };

  const save = async () => {
    if (!title.trim() || !category || !(Number(amount) > 0)) return toast.error("Enter what it was for, its kind and the amount");
    if (repeat !== "ONCE" && endDate && endDate < startDate) return toast.error("The end date is before the start date");
    setSaving(true);
    try {
      await ownerRequest(editing ? `/expenses/${editing.id}` : "/expenses", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({
          title: title.trim(),
          category,
          amount: Number(amount),
          repeat,
          startDate,
          endDate: repeat === "ONCE" ? null : endDate || null,
          note: note.trim() || null,
        }),
      });
      toast.success(`${editing ? "Expense saved" : "Expense added"}: ${title.trim()} · ${rwf(amount)}`);
      router.push(EXPENSES);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the expense");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={EXPENSES}
      backLabel="Expenses"
      eyebrow="Finance"
      title={editing ? `Edit ${editing.title}` : "Add expense"}
      description="Rent, bills and everything the company pays to run."
      actions={
        <>
          <BackButton href={EXPENSES} />
          <Button icon={Check} busy={saving} onClick={save}>
            {editing ? "Save changes" : "Add expense"}
          </Button>
        </>
      }
    >
      <FormSection>
        <Field label="Kind">
          <Choices value={category} onChange={(v) => v && pickCategory(v as ExpenseCategory)} options={EXPENSE_CATEGORIES} />
        </Field>
        <Field label="What it was for">
          <TextInput value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Electricity bill, Shop rent" autoFocus={!editing} />
        </Field>
        <Field label="How often">
          <Choices value={repeat} onChange={setRepeat} options={EXPENSE_REPEATS} />
        </Field>
        <Field label={repeat === "ONCE" ? "Amount paid" : `Amount ${per}`} hint={repeat !== "ONCE" && Number(amount) > 0 ? `About ${rwf(monthlyAmount({ amount, repeat }))} per month` : undefined}>
          <MoneyInput value={amount} onChange={setAmount} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={repeat === "ONCE" ? "Paid on" : "Starts"}>
            <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value || todayKey())} />
          </Field>
          {repeat !== "ONCE" && (
            <Field label="Ends (optional)" hint="Leave empty while it is still going">
              <TextInput type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          )}
        </div>
        <Field label="Note (optional)">
          <TextArea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Meter number, landlord" />
        </Field>
        {repeat !== "ONCE" && <p className="text-xs text-ink/55">A repeating cost is spread over the days it covers, so each day&apos;s profit carries its share.</p>}
      </FormSection>
    </FormPage>
  );
}
