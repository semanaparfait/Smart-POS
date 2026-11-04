import ChangePassword from "@/app/owner/settings/password/ChangePassword";

export default function AdminPasswordPage() {
  return <ChangePassword back="/admin/tabs/profile" backLabel="My profile" eyebrow="My account" home="/admin" />;
}
