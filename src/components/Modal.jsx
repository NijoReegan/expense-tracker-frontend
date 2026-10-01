import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;
    const focusables = () => {
      if (!panel) return [];
      return [...panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.disabled && el.offsetParent !== null);
    };

    const handler = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab' && panel) {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    const firstField = panel?.querySelector('input, select, textarea, [contenteditable="true"]');
    (firstField || closeButtonRef.current || panel)?.focus?.();

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const sizeClass = size === 'lg' ? 'max-w-lg' : size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative ${sizeClass} w-full m-auto bg-surface rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-in my-8`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <h3 className="font-title-sm text-title-sm font-bold text-on-surface">{title}</h3>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-surface-variant/30 text-outline transition-colors">
            <Icon name="close" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}