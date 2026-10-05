import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopAppBar from './TopAppBar';
import BottomNav from './BottomNav';
import Icon from './Icon';
import { useAppData } from '../context/useAppData';

const PAGE_TITLES = {
  '/dashboard': 'Financial Dashboard',
  '/expenses': 'Expense Management',
  '/income': 'Income Management',
  '/savings': 'Savings Goals',
  '/budget': 'Budget Management',
  '/analytics': 'Financial Analytics',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { error, dismissError } = useAppData();
  const title = PAGE_TITLES[location.pathname] ?? 'Expense tracker';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-background text-on-surface min-h-screen transition-colors duration-300">
      <Sidebar open={sidebarOpen} onNavigate={closeSidebar} />
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeSidebar}
      ></div>
      <main className="lg:ml-sidebar-width min-h-screen flex flex-col">
        <TopAppBar title={title} onMenuClick={() => setSidebarOpen((v) => !v)} />
        <section className="flex-1 pt-24 pb-32 lg:pb-10 px-container-padding">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>
        <BottomNav />
      </main>

      {error && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-[90] max-w-sm bg-error text-white px-5 py-3 rounded-xl shadow-lg font-bold flex items-start gap-3 animate-in">
          <Icon name="error_outline" className="text-white shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={dismissError} className="shrink-0 hover:opacity-70" aria-label="Dismiss">
            <Icon name="close" className="text-white" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}