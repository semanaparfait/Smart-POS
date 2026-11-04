"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";

export type Area = "admin" | "owner";

const AREA_ROLES: Record<Area, string[]> = {
  admin: ["SUPERADMIN"],
  owner: ["OWNER", "ADMIN"],
};

// Where each role belongs on the website. Workers sign in on their devices only.
export const homeForRole = (role?: string) => {
  const r = role?.toUpperCase() ?? "";
  if (AREA_ROLES.admin.includes(r)) return "/admin";
  if (AREA_ROLES.owner.includes(r)) return "/owner";
  return "/pages/Login";
};

// Shows an area only to the role it is for: signed-out visitors go to sign-in,
// the wrong role goes to its own area.
export default function RoleGate({ area, children }: { area: Area; children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [checked, setChecked] = useState(!!user);

  useEffect(() => {
    if (user) return;
    let alive = true;
    fetchMe().then((me) => {
      if (!alive) return;
      if (!me) router.replace("/pages/Login");
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, [user, fetchMe, router]);

  const allowed = !!user && AREA_ROLES[area].includes(user.role?.toUpperCase() ?? "");

  useEffect(() => {
    if (checked && user && !allowed) router.replace(homeForRole(user.role));
  }, [checked, user, allowed, router]);

  if (!allowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-ivory">
        <Loader2 className="h-6 w-6 animate-spin text-ink/40" aria-label="Loading" />
      </div>
    );
  }
  return <>{children}</>;
}
