import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-xl shadow-sm border border-slate-100", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          {trend && (
            <p className="text-sm text-emerald-600 mt-2 font-medium flex items-center">
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
