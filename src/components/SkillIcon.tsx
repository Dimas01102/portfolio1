import { useState, type ReactElement } from 'react';
import { isLocalIcon, isSimpleIcon, simpleIconUrl } from '../lib/icons';

/** Brand logos with no real Simple Icons entry get a small bundled SVG here. */
const LOCAL_ICONS: Record<string, ReactElement> = {
  vscode: (
    <svg viewBox="0 0 24 24" className="skill-icon-svg" aria-hidden="true">
      <path
        fill="#0098FF"
        d="M17.5 2.2 8.4 10.5 3.9 7l-1.6 1.1 4.7 3.9-4.7 3.9L3.9 17l4.5-3.5 9.1 8.3 4.5-2.1V4.3l-4.5-2.1Zm0 4.9v9.8l-6-4.9 6-4.9Z"
      />
    </svg>
  ),
  aws: (
    <svg viewBox="0 0 24 24" className="skill-icon-svg" aria-hidden="true">
      <path
        fill="#FF9900"
        d="M19 18H7a4 4 0 0 1-.6-7.96 5.5 5.5 0 0 1 10.7-1.7A4.5 4.5 0 0 1 19 18Z"
      />
    </svg>
  ),
};

export default function SkillIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (isLocalIcon(icon)) {
    const key = icon.slice(6);
    return LOCAL_ICONS[key] || <i className={`bi bi-code-slash ${className}`} />;
  }

  if (isSimpleIcon(icon) && !failed) {
    const slug = icon.slice(3);
    return (
      <img
        src={simpleIconUrl(slug)}
        alt=""
        className={`skill-icon-img ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  // Fallback bootstrap-icons class, or a generic glyph if the logo 404s.
  const cls = isSimpleIcon(icon) ? 'bi-code-slash' : icon;
  return <i className={`bi ${cls} ${className}`} />;
}