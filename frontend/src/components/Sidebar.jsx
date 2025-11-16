import React from 'react'
import { NavLink } from 'react-router-dom'
import './sidebar.css'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/bando', label: 'Bản Đồ' },
  { to: '/kho', label: 'Hệ Thống Kho' },
  { to: '/chinhanh', label: 'Chi Nhánh Bán Lẻ' },
  { to: '/lohang', label: 'Lô Hàng' },
  { to: '/sanpham', label: 'Sản Phẩm' },
  { to: '/baocao', label: 'Báo Cáo' },
  { to: '/nguoidung', label: 'Người Dùng' }
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Logistics</div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
