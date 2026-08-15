import { Loader2 } from 'lucide-react'

export default function Spinner({ className = '', size = 5 }) {
  return (
    <Loader2
      className={`animate-spin text-indigo-500 ${className}`}
      style={{ width: size * 4, height: size * 4 }}
      aria-label="Loading"
    />
  )
}