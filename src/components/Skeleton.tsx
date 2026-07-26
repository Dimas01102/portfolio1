import './Skeleton.css';

export default function Skeleton({
  width = '100%',
  height = '16px',
  radius = '6px',
  className = '',
}: {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}
