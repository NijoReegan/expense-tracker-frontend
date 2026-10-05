import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAppData } from '../context/useAppData';
import { useAuth } from '../context/useAuth';

export default function TopAppBar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const logout = useAuth().logout;
  const { data, markNotificationRead, markAllNotificationsRead } = useAppData();
  const { profile, notifications } = data;
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const timer = useRef(null);
  const notifTimer = useRef(null);

  const showMenu = () => { clearTimeout(timer.current); setOpen(true); };
  const hideMenu = () => { timer.current = setTimeout(() => setOpen(false), 200); };

  const showNotif = () => { clearTimeout(notifTimer.current); setNotifOpen(true); };
  const hideNotif = () => { notifTimer.current = setTimeout(() => setNotifOpen(false), 200); };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = (profile.name || 'ST').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const firstName = (profile.name || 'Member').split(' ')[0];

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-sidebar-width z-40 h-16 flex justify-between items-center px-container-padding bg-surface/80 dark:bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden hover:bg-primary-container/20 rounded-full p-2 transition-transform duration-300 active:scale-90"
          onClick={onMenuClick}
        >
          <Icon name="menu" className="text-primary dark:text-primary-fixed-dim" />
        </button>
        <h2 className="font-headline-md-mobile text-headline-md-mobile font-black text-primary dark:text-primary-fixed hidden md:block lg:hidden">
          Expense tracker
        </h2>
        {title && (
          <h2 className="font-title-sm text-title-sm font-bold text-primary hidden lg:block">
            {title}
          </h2>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" onMouseEnter={showNotif} onMouseLeave={hideNotif}>
          <button
            onClick={() => { setOpen(false); setNotifOpen(!notifOpen); }}
            className="hover:bg-primary-container/20 rounded-full p-2 transition-transform duration-300 active:scale-90 relative"
          >
            <Icon name="notifications" className="text-primary dark:text-primary-fixed-dim" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50 animate-in"
              onMouseEnter={showNotif}
              onMouseLeave={hideNotif}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
                <div>
                  <h3 className="font-title-sm text-title-sm font-bold text-on-surface">Notifications</h3>
                  <p className="text-xs text-on-surface-variant">{unreadCount} unread alert{unreadCount === 1 ? '' : 's'}</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} className="text-primary text-xs font-bold hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 && (
                  <div className="px-5 py-12 text-center text-on-surface-variant">
                    <Icon name="notifications_off" className="text-3xl text-outline mb-2 block mx-auto" />
                    No notifications
                  </div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-variant/30 ${!n.read ? 'bg-primary-container/10' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.iconBg}`}>
                      <Icon name={n.icon} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-body-md text-body-md ${n.read ? 'text-on-surface' : 'font-bold text-on-surface'}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-outline uppercase tracking-wider mt-1">{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
        <div className="relative" onMouseEnter={showMenu} onMouseLeave={hideMenu}>
          <button
            onClick={() => { setOpen(!open); setNotifOpen(false); }}
            className="flex items-center gap-2 hover:bg-primary-container/10 rounded-full p-1 pr-3"
          >
            <span className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary text-xs font-black">
              {initials}
            </span>
            <span className="font-label-caps text-label-caps text-on-surface font-bold hidden md:block">
              {firstName}
            </span>
            <Icon name="expand_more" className="text-outline hidden md:block" />
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 py-2 z-50 animate-in"
              onMouseEnter={showMenu}
              onMouseLeave={hideMenu}
            >
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="font-title-sm text-title-sm font-bold text-on-surface">{profile.name}</p>
                <p className="text-xs text-on-surface-variant">{profile.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-variant/30 transition-colors text-left"
                >
                  <Icon name="settings" className="text-outline" />
                  <span className="font-body-md text-body-md">Settings</span>
                </button>
                <button
                  onClick={async () => {
                    setOpen(false);
                    setNotifOpen(false);
                    await logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 transition-colors text-left"
                >
                  <Icon name="logout" className="text-error" />
                  <span className="font-body-md text-body-md">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}