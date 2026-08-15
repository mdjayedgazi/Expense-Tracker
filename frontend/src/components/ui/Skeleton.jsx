export default function Skeleton({ className = '', ...props }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" {...props} />
}