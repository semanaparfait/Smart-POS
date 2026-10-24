import { notFound } from "next/navigation";

/** Any admin URL without a page shows app/admin/not-found.tsx inside the admin layout */
export default function MissingAdminPage() {
  notFound();
}
