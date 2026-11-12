import { NavLink } from 'react-router-dom';
import { Shield, LogOut, X } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ items, activeItem, onClose, isOpen, onLogout }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={20} />
          </div>
          <div className="sidebar-logo-text">
            Campus<span>Care</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            if (item.path) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={20} />
                  <span className="sidebar-nav-item-label">{item.label}</span>
                </NavLink>
              );
            }
            return (
              <button
                key={item.label}
                className={`sidebar-nav-item ${activeItem === item.label ? 'active' : ''}`}
                onClick={() => {
                  item.onClick?.();
                  onClose?.();
                }}
              >
                <Icon size={20} />
                <span className="sidebar-nav-item-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
