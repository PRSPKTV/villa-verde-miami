import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import RequireOwner from './RequireOwner';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <RequireOwner>
      <div className="min-h-screen bg-cream-50">
        <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
          <div className="p-6 md:p-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </RequireOwner>
  );
}
