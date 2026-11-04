import SiderBar from "@/app/admin/components/SiderBar";
import TopNavBar from "@/app/admin/components/TopNavBar";
import RoleGate from "@/app/components/RoleGate";

// The super admin's area: every company, user and device.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate area="admin">
      <div className="flex h-screen flex-col overflow-hidden bg-ivory text-ink">
        <TopNavBar />

        <div className="flex min-h-0 flex-1 overflow-hidden relative">
          <div className="relative h-full w-16 shrink-0 z-40">
            <SiderBar />
          </div>
          <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RoleGate>
  );
}
