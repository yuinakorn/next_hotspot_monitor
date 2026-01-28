import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
