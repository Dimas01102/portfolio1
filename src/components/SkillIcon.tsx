import { useState } from 'react';
import { isSimpleIcon, simpleIconUrl } from '../lib/icons';

export default function SkillIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const [failed, setFailed] = useState(false);

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

  // Fallback: bootstrap-icons class, or a generic glyph if the logo 404s.
  const cls = isSimpleIcon(icon) ? 'bi-code-slash' : icon;
  return <i className={`bi ${cls} ${className}`} />;
}