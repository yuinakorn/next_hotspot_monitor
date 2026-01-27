import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

function SkeletonCard({ className }: { className?: string }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 mt-16">
          {/* KPI Section Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart Section Skeleton */}
            <div className="lg:col-span-3 xl:col-span-2">
              <SkeletonCard className="h-[400px]" />
            </div>

            {/* Sidebar Widget Skeleton */}
             <div className="lg:col-span-1 hidden xl:block rounded-xl p-6 h-[200px] animate-pulse bg-slate-200">
             </div>
          </div>

          {/* Table Section Skeleton */}
          <div>
            <SkeletonCard className="h-[400px]" />
          </div>
          
        </main>
      </div>
    </div>
  );
}
