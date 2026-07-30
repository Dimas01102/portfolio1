import { useEffect, useRef, useState } from 'react';
import './ShareButtons.css';

interface ShareButtonsProps {
  url: string;
  title: string;
  summary?: string;
}

export default function ShareButtons({ url, title, summary }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers/contexts without clipboard permission
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: summary, url });
    } catch {
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    {
      key: 'x',
      label: 'Share on X',
      icon: 'bi-twitter-x',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: 'facebook',
      label: 'Share on Facebook',
      icon: 'bi-facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'linkedin',
      label: 'Share on LinkedIn',
      icon: 'bi-linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      key: 'whatsapp',
      label: 'Share on WhatsApp',
      icon: 'bi-whatsapp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="share-bar">
      <span className="share-bar__label">
        <i className="bi bi-share-fill" /> Share this article
      </span>
      <div className="share-bar__buttons">
        {canNativeShare && (
          <button type="button" className="share-btn share-btn--native" onClick={handleNativeShare} title="Share">
            <i className="bi bi-send-fill" />
          </button>
        )}
        {links.map((l) => (
          <a
            key={l.key}
            className={`share-btn share-btn--${l.key}`}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            title={l.label}
            aria-label={l.label}
          >
            <i className={`bi ${l.icon}`} />
          </a>
        ))}
        <button type="button" className="share-btn share-btn--copy" onClick={handleCopy} title="Copy link">
          <i className={`bi ${copied ? 'bi-check2' : 'bi-link-45deg'}`} />
        </button>
      </div>
      {copied && <span className="share-bar__toast">Link copied!</span>}
    </div>
  );
}