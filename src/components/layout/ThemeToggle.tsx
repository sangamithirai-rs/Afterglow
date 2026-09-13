import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft transition hover:text-ink"
    >
      {theme === 'dark' ? '☾' : '☼'}
    </button>
  )
}