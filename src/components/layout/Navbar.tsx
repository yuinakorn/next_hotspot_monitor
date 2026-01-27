export function Navbar() {
  return (
    <div className="h-16 bg-white border-b border-slate-200 fixed top-0 left-64 right-0 z-10 flex items-center justify-between px-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">
        Active / Inactive User Dashboard
      </h1>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900">Admin User</p>
          <p className="text-xs text-slate-500">Network Administrator</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
          A
        </div>
      </div>
    </div>
  );
}
