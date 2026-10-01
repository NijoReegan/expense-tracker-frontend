import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import { NAV_ITEMS } from './navItems';
import { useAppData } from '../context/useAppData';

export default function Sidebar({ open, onNavigate }) {
  const { data } = useAppData();
  const profile = data.profile;
  const name = (profile.name || '').trim();
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 h-full w-sidebar-width bg-surface-container-highest dark:bg-inverse-surface backdrop-blur-xl border-r border-outline-variant/10 shadow-xl sidebar-transition lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full p-6">
        <div className="mb-10 text-left">
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed mb-8">
            Smart Tracker
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-black border-2 border-white shadow-sm">
              {initials}
            </div>
            <div>
              <p className="font-bold text-on-surface">{name || 'Member'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-full font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50'
                }`
              }
            >
              <Icon name={item.icon} size={24} />
              <span className="font-body-md text-body-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-outline-variant/30 flex justify-between items-center text-on-surface-variant">
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 -ml-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50'
              }`
            }
          >
            <Icon name="settings" size={24} />
            <span className="font-body-md text-body-md">Settings</span>
          </NavLink>
          <span className="font-label-caps text-label-caps opacity-50">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
}