export default function ThemeToggleButton({ theme, onToggle }) {
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
