import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children, className = '' }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-verde-900/90 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 ${className}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-cream-100/10 hover:bg-cream-100/20 text-cream-100 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
