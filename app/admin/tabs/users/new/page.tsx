"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddUserForm from "@/app/admin/tabs/users/components/AddUserForm";

function NewUser() {
  const q = useSearchParams();
  return (
    <main className="space-y-6">
      <div>
        <Link href="/admin/tabs/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink">Add user</h1>
        <p className="mt-1 text-sm text-ink/60">Give someone access to a business on SmartPOS.</p>
      </div>
      <AddUserForm initialCompanyCode={q.get("company") ?? ""} />
    </main>
  );
}

export default function NewUserPage() {
  return (
    <Suspense>
      <NewUser />
    </Suspense>
  );
}
