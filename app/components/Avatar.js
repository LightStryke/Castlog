'use client'

export default function Avatar({ user, size = 32, className = '' }) {
  const name = user?.username || user?.name || 'A'
  const initials = name.charAt(0).toUpperCase()
  const avatarUrl = user?.avatar_url

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-600 text-white ${className}`} style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold">{initials}</span>
      )}
    </div>
  )
}
