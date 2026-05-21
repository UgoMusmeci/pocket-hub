import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/carte', label: 'Carte' },
  { to: '/espansioni', label: 'Espansioni' },
  { to: '/eventi', label: 'Eventi' },
  { to: '/mazzi', label: 'Mazzi' },
  { to: '/ricompense', label: 'Emblemi' },
]

export function SiteHeader() {
  return (
    <header className="site-header-shell">
      <div className="site-header">
        <NavLink to="/" className="brand-mark">
          <span className="brand-ball" aria-hidden="true"></span>
          <div>
            <strong>Pocket Hub</strong>
            <small>Carte, espansioni, mazzi e guide</small>
          </div>
        </NavLink>

        <nav className="top-nav" aria-label="Navigazione principale">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'top-nav-link top-nav-link-active' : 'top-nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
