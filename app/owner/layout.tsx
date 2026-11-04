import RoleGate from "@/app/components/RoleGate";
import OwnerShell from "@/app/owner/components/OwnerShell";

// The owner's area of the website: their own business only.
export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate area="owner">
      <OwnerShell>{children}</OwnerShell>
    </RoleGate>
  );
}
