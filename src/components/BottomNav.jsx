import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const TABS = [
  { to: '/dashboard', icon: 'home', label: 'Home' },
  { to: '/expenses', icon: 'receipt_long', label: 'Expenses' },
  { to: '/income', icon: 'trending_up', label: 'Income' },
  { to: '/settings', icon: 'person', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-surface/85 dark:bg-inverse-surface/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] lg:hidden">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all ${
              isActive
                ? 'text-primary dark:text-secondary-fixed bg-primary-container/30 scale-110'
                : 'text-on-surface-variant dark:text-outline-variant hover:opacity-80'
            }`
          }
        >
          <Icon name={tab.icon} size={24} />
          <span className="font-label-caps text-label-caps mt-1">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}