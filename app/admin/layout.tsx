import SiderBar from "@/app/admin/components/SiderBar";
import TopNavBar from "@/app/admin/components/TopNavBar";
import { PlatformProvider } from "@/app/admin/components/Platform";
import RoleGate from "@/app/components/RoleGate";

// The super admin's area: every company, user and device.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate area="admin">
      <PlatformProvider>
        <div className="flex h-screen overflow-hidden bg-ivory text-ink">
          <SiderBar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <TopNavBar />
            <main className="min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </div>
      </PlatformProvider>
    </RoleGate>
  );
}
