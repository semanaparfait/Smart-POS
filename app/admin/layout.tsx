import SiderBar from "@/app/admin/components/SiderBar";
import TopNavBar from "@/app/admin/components/TopNavBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
     
      <SiderBar />

   
      <div className="flex min-w-0 flex-1 flex-col">
      
        <TopNavBar />

       
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}