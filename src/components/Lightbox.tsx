import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Lightbox.css';

export default function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" aria-label="Close" onClick={onClose}>
        <i className="bi bi-x-lg" />
      </button>
      <img src={src} alt={alt} className="lightbox__img" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  );
}
