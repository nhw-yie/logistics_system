import React from 'react'
import './header.css'

export default function Header() {
  return (
    <header className="app-header-bar">
      <div className="header-left">
        <h2>Logistics Dashboard</h2>
      </div>
      <div className="header-right">
        <div className="user">Admin</div>
      </div>
    </header>
  )
}
