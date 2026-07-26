import './SocialDock.css';

const LINKS = [
  {
    icon: 'bi-github',
    href: 'https://github.com/Dimas01102',
    label: 'GitHub',
  },
  {
    icon: 'bi-linkedin',
    href: 'https://www.linkedin.com/in/dimas-dwi-prasetiyo-13706820b/',
    label: 'LinkedIn',
  },
  {
    icon: 'bi-whatsapp',
    href: 'https://wa.me/6282287446410',
    label: 'WhatsApp',
  },
  {
    icon: 'bi-instagram',
    href: 'https://www.instagram.com/dms.prasetiyo/',
    label: 'Instagram',
  },
  {
    icon: 'bi-envelope-fill',
    href: 'mailto:ddimasddpprasetiyo@gmail.com',
    label: 'Email',
  },
];

export default function SocialDock() {
  return (
    <div className="social-dock">
      <div className="social-dock__line" />
      {LINKS.map((l) => (
        <a
          key={l.icon}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          aria-label={l.label}
          className="social-dock__btn"
        >
          <i className={`bi ${l.icon}`} />
        </a>
      ))}
      <div className="social-dock__line" />
    </div>
  );
}