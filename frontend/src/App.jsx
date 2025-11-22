import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/dashboard_page/Dashboard'
import NhaCungCap from './pages/QLsanPham/NhaCungCap'
import SanPham from './pages/QLsanPham/SanPham'
import Map from './pages/QLmap/Bando'
import ChiNhanh from './pages/ChiNhanh'
import Kho from './pages/HeThongKho/Kho'
import ThemKho from './pages/HeThongKho/themkho'
import TonKho from './pages/TonKho'
import PhieuNhapKho from './pages/PhieuNhapKho'
import PhieuXuatKho from './pages/PhieuXuatKho'
import NhanVien from './pages/NhanVien'
import TaiXe from './pages/TaiXe'
import XeTai from './pages/XeTai'
import VanChuyen from './pages/VanChuyen'
import BaoCao from './pages/BaoCao'
import NguoiDung from './pages/NguoiDung'
import LoHang from './pages/LoHang'
import TaoPhieuXuat from './pages/HeThongKho/TaoPhieuXuat'
import TaoDonDatHang from './pages/HeThongKho/TaoDonDatHang'
function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Sidebar />
        <div className="app-main">
          <Header />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/nhacungcap" element={<NhaCungCap />} />
              <Route path="/sanpham" element={<SanPham />} />
              <Route path="/chinhanh" element={<ChiNhanh />} />
              <Route path="/bando" element={<Map />} />
              <Route path="/kho" element={<Kho />} />
              <Route path="/tonkho" element={<TonKho />} />
              <Route path="/phieunhapkho" element={<PhieuNhapKho />} />
              <Route path="/phieuxuatkho" element={<PhieuXuatKho />} />
              <Route path="/nhanvien" element={<NhanVien />} />
              <Route path="/taixe" element={<TaiXe />} />
              <Route path="/xetai" element={<XeTai />} />
              <Route path="/vanchuyen" element={<VanChuyen />} />
              <Route path="/baocao" element={<BaoCao />} />
              <Route path="/nguoidung" element={<NguoiDung />} />
              <Route path="/kho/them-moi" element={<ThemKho />} />
              <Route path="/lohang" element={<LoHang />} />
               <Route path="/phieuxuat/tao" element={<TaoPhieuXuat />} />
+              <Route path="/dondathang/tao" element={<TaoDonDatHang />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
