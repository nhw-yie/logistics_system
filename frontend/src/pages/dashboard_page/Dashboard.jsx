import React, { useEffect, useState } from 'react'
import '../page.css'
import { apiGet } from '../../services/api'

function daysBetween(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const diff = (d - new Date()) / (1000 * 60 * 60 * 24)
  return Math.ceil(diff)
}

function statusFromDaysLeft(days) {
  if (days == null) return 'unknown'
  if (days <= 0) return 'expired'
  if (days <= 3) return 'near_expiry'
  return 'good'
}

// Icon components
const WarehouseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
    <path d="M3 9l2-5h14l2 5"/>
    <path d="M8 9v13"/>
    <path d="M16 9v13"/>
  </svg>
)

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h5l3 3v5h-2"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)

const ThermometerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({})
  const [warehouses, setWarehouses] = useState([])
  const [branches, setBranches] = useState([])
  const [batches, setBatches] = useState([])
  const [trucks, setTrucks] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiGet('/kho').catch(() => []),
      apiGet('/khukho').catch(() => []),
      apiGet('/lohang').catch(() => []),
      apiGet('/xetai').catch(() => []),
      apiGet('/vanchuyen').catch(() => []),
      apiGet('/chinhanh').catch(() => []),
      apiGet('/tonkho').catch(() => []),
      apiGet('/sanpham').catch(() => []),
      apiGet('/nhacungcap').catch(() => []),
    ])
      .then(([khoList, khukhoList, lohangList, xetaiList, vanchuyenList, chinhanhList, tonkhoList, spList, nccList]) => {
        const normalize = (r) => (Array.isArray(r) ? r.length : (r && Array.isArray(r.result) ? r.result.length : 0))
        setCounts({
          kho: normalize(khoList),
          khukho: normalize(khukhoList),
          lohang: normalize(lohangList),
          xetai: normalize(xetaiList),
          vanchuyen: normalize(vanchuyenList),
          chinhanh: normalize(chinhanhList),
          sanpham: normalize(spList),
          nhacungcap: normalize(nccList),
        })

        // Build map for quick lookup
        const khukhoByKhoId = {}
        for (const kk of (Array.isArray(khukhoList) ? khukhoList : (khukhoList.result || []))) {
          const parentMaKho = kk.kho && typeof kk.kho === 'object' ? (kk.kho.maKho || kk.kho['@rid']) : (typeof kk.kho === 'string' ? kk.kho : null)
          if (!khukhoByKhoId[parentMaKho]) khukhoByKhoId[parentMaKho] = []
          khukhoByKhoId[parentMaKho].push(kk)
        }

        const lohangs = Array.isArray(lohangList) ? lohangList : (lohangList.result || [])
        const tonkhos = Array.isArray(tonkhoList) ? tonkhoList : (tonkhoList.result || [])
        const spMap = {}
        for (const sp of (Array.isArray(spList) ? spList : (spList.result || []))) spMap[sp['@rid'] || sp.maSP || ''] = sp

        // Build warehouses
        const khoArr = Array.isArray(khoList) ? khoList : (khoList.result || [])
        const warehousesBuilt = khoArr.map((k) => {
          const key1 = k.maKho
          const key2 = k['@rid']
          const rawZones = (khukhoByKhoId[key1] || []).concat(khukhoByKhoId[key2] || [])
          const zones = (rawZones || []).map((z) => {
            const zoneId = z.maKhu || z['@rid'] || z.tenKhu
            const zoneLohangs = lohangs.filter((lh) => {
              if (!lh.khuKho) return false
              const kk = lh.khuKho
              const kkId = kk.maKhu || kk['@rid'] || kk.tenKhu || ''
              return kkId === zoneId
            })
            const current = zoneLohangs.reduce((s, lh) => s + (Number(lh.soLuong || 0)), 0)
            return {
              id: z.maKhu || z['@rid'] || z.tenKhu || '',
              name: z.tenKhu || z.maKhu || z['@rid'] || '',
              temp: z.nhietDo ?? (z.YC_NhietDo || null),
              capacity: Number(z.dungTich || z.capacity || 0),
              current,
              type: z.loaiHang || (z.type || ''),
            }
          })

          const currentFromZones = zones.reduce((s, z) => s + (Number(z.current || 0)), 0)
          const tonForKho = tonkhos.filter((t) => {
            if (!t.diaDiem) return false
            if (typeof t.diaDiem === 'object') return t.diaDiem.maKho === k.maKho || t.diaDiem['@rid'] === k['@rid']
            return String(t.diaDiem).includes(k.maKho || '')
          })
          const currentFromTon = tonForKho.reduce((s, t) => s + (Number(t.soLuong || 0)), 0)
          const current = currentFromZones || currentFromTon || Number(k.dungTich || 0) * 0.5

          return {
            id: k.maKho || k['@rid'],
            name: k.tenKho || k.maKho || '',
            type: k.loaiKho || '',
            capacity: Number(k.dungTich || 0),
            current,
            status: k.trangThai || 'active',
            branches: 0,
            temp: [],
            lat: k.kinhDo || null,
            lng: k.viDo || null,
            address: (k.diaChi && (k.diaChi.soNha || k.diaChi.duong)) ? `${k.diaChi.soNha || ''} ${k.diaChi.duong || ''}`.trim() : '',
            zones,
            staff: 0,
            vehicles: 0,
          }
        })

        // Build branches
        const cnArr = Array.isArray(chinhanhList) ? chinhanhList : (chinhanhList.result || [])
        const branchesBuilt = cnArr.map((cn) => {
          const tonForCN = tonkhos.filter((t) => {
            if (!t.diaDiem) return false
            if (typeof t.diaDiem === 'object') return t.diaDiem.maChiNhanh === cn.maChiNhanh || t.diaDiem['@rid'] === cn['@rid']
            return String(t.diaDiem).includes(cn.maChiNhanh || '')
          })
          const stock = tonForCN.reduce((s, t) => s + (Number(t.soLuong || 0)), 0)
          
          return {
            id: cn.maChiNhanh || cn['@rid'],
            name: cn.tenChiNhanh || cn.maChiNhanh || '',
            district: (cn.diaChi && cn.diaChi.quan) || '',
            stock,
            orders: 0, // placeholder
            status: cn.trangThai || 'active',
            lat: cn.kinhDo || null,
            lng: cn.viDo || null,
            address: (cn.diaChi && (cn.diaChi.soNha || cn.diaChi.duong)) ? `${cn.diaChi.soNha || ''} ${cn.diaChi.duong || ''}`.trim() : '',
          }
        })

        // Build batches
        const batchesBuilt = lohangs.map((lh) => {
          const sp = lh.sanPham && typeof lh.sanPham === 'object' ? lh.sanPham : (spMap[lh.sanPham] || {})
          const zone = lh.khuKho && (lh.khuKho.maKhu || lh.khuKho['@rid'] || lh.khuKho.tenKhu || '')
          const khoId = lh.khuKho && lh.khuKho.kho ? (lh.khuKho.kho.maKho || lh.khuKho.kho) : ''
          const daysLeft = daysBetween(lh.hanSuDung || lh.hsd || lh.hanSuDungDate || null)
          return {
            id: lh.maLo || lh['@rid'],
            product: sp.tenSP || sp.maSP || (lh.sanPham && (lh.sanPham.name || lh.sanPham)) || 'Unknown',
            warehouse: khoId || (lh.kho && (lh.kho.maKho || lh.kho)) || '',
            zone,
            qty: Number(lh.soLuong || 0),
            unit: sp.donViTinh || '',
            mfg: lh.ngaySanXuat || lh.nsx || null,
            exp: lh.hanSuDung || lh.hsd || null,
            status: statusFromDaysLeft(daysLeft),
            daysLeft,
          }
        })

        // Build trucks
        const vanch = Array.isArray(vanchuyenList) ? vanchuyenList : (vanchuyenList.result || [])
        const xet = Array.isArray(xetaiList) ? xetaiList : (xetaiList.result || [])
        const trucksBuilt = (vanch.length ? vanch.map((v) => ({
          id: v.maVanChuyen || v['@rid'],
          plate: (v.xeTai && (v.xeTai.bienSo || v.xeTai)) || '',
          driver: v.taiXe && (v.taiXe.hoTen || v.taiXe) || '',
          route: v.diemDi && v.diemDen ? `${v.diemDi} → ${v.diemDen}` : v.tuyenDuong || '',
          status: v.trangThai || 'idle',
          eta: v.ngayDen || '',
          load: 0,
          lat: v.kinhDo || null,
          lng: v.viDo || null,
        })) : xet.map((x) => ({
          id: x.maXe || x['@rid'],
          plate: x.bienSo || '',
          driver: x.taiXeChinh && (x.taiXeChinh.hoTen || x.taiXeChinh) || '',
          route: x.viTriHienTai || '',
          status: x.tinhTrang || '',
          eta: '',
          load: 0,
          lat: x.kinhDo || null,
          lng: x.viDo || null,
        })))

        setWarehouses(warehousesBuilt)
        setBranches(branchesBuilt)
        setBatches(batchesBuilt)
        setTrucks(trucksBuilt)
      })
      .catch((err) => {
        console.error('Dashboard load error', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-root">
      <h2>Dashboard</h2>
      <p>Đang tải dữ liệu...</p>
    </div>
  )

  return (
    <div className="page-root">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard Quản Lý Chuỗi Cung Ứng</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>TP. Hồ Chí Minh • Thời gian thực</p>
        </div>
        <button onClick={() => window.location.reload()} style={{ 
          padding: '8px 16px', 
          background: '#3b82f6', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 6,
          cursor: 'pointer'
        }}>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { title: 'Tổng Kho', value: counts.kho, icon: <WarehouseIcon />, color: '#3b82f6', bgColor: '#eff6ff' },
          { title: 'Chi Nhánh', value: branches.length, icon: <StoreIcon />, color: '#10b981', bgColor: '#f0fdf4' },
          { title: 'Xe Đang Chạy', value: trucks.filter(t => t.status === 'in_transit' || t.status === 'dang_van_chuyen').length, icon: <TruckIcon />, color: '#8b5cf6', bgColor: '#faf5ff' },
          { title: 'Lô Cận Date', value: batches.filter(b => b.status === 'near_expiry').length, icon: <AlertIcon />, color: '#ef4444', bgColor: '#fef2f2' },
          { title: 'Khu Kho', value: warehouses.reduce((acc, w) => acc + (w.zones ? w.zones.length : 0), 0), icon: <LayersIcon />, color: '#f59e0b', bgColor: '#fffbeb' },
        ].map((c, i) => (
          <div key={i} style={{
            background: c.bgColor,
            border: `2px solid ${c.color}20`,
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{ color: c.color, display: 'flex', alignItems: 'center' }}>
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value || 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Warehouses & Branches Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Warehouses */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarehouseIcon />
            Hệ Thống Kho ({warehouses.length})
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {warehouses.map((wh) => {
              const pct = wh.capacity ? ((wh.current / wh.capacity) * 100).toFixed(1) : '0.0'
              const color = pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981'
              return (
                <div key={wh.id} className="card" style={{ 
                  cursor: 'pointer',
                  border: `2px solid ${color}20`,
                  transition: 'all 0.2s'
                }} onClick={() => setSelectedWarehouse(wh)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{wh.name}</span>
                        <span style={{ 
                          fontSize: 11, 
                          padding: '2px 8px', 
                          background: '#f1f5f9', 
                          borderRadius: 12,
                          color: '#475569'
                        }}>
                          {wh.type}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>{wh.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color }}>{pct}%</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {Number(wh.current || 0).toLocaleString()}㎥
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    height: 6, 
                    background: '#f1f5f9', 
                    borderRadius: 6, 
                    overflow: 'hidden',
                    marginBottom: 12
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(pct, 100)}%`,
                      background: color,
                      transition: 'width 0.3s'
                    }} />
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666' }}>
                    <div>👥 Nhân viên: <strong>{wh.staff}</strong></div>
                    <div>🚚 Xe: <strong>{wh.vehicles}</strong></div>
                    <div>📦 Khu: <strong>{wh.zones ? wh.zones.length : 0}</strong></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Branches */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <StoreIcon />
            Chi Nhánh Bán Lẻ ({branches.length})
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {branches.map((br) => {
              const isWarning = br.stock < 500
              const statusColor = isWarning ? '#f59e0b' : '#10b981'
              return (
                <div key={br.id} className="card" style={{ 
                  cursor: 'pointer',
                  border: `2px solid ${statusColor}20`,
                  transition: 'all 0.2s'
                }} onClick={() => setSelectedBranch(br)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{br.name}</span>
                        <span style={{ 
                          fontSize: 11, 
                          padding: '2px 8px', 
                          background: '#f1f5f9', 
                          borderRadius: 12,
                          color: '#475569'
                        }}>
                          {br.district}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>{br.id}</div>
                    </div>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 8, 
                      background: `${statusColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20
                    }}>
                      {isWarning ? '⚠️' : '✅'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <div style={{ 
                      background: '#eff6ff', 
                      padding: 10, 
                      borderRadius: 8,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>Tồn kho</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{br.stock}</div>
                    </div>
                    <div style={{ 
                      background: '#f0fdf4', 
                      padding: 10, 
                      borderRadius: 8,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>Đơn hôm nay</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{br.orders}</div>
                    </div>
                    <div style={{ 
                      background: isWarning ? '#fffbeb' : '#f0fdf4', 
                      padding: 10, 
                      borderRadius: 8,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>Trạng thái</div>
                      <div style={{ 
                        fontSize: 18, 
                        fontWeight: 700, 
                        color: statusColor 
                      }}>
                        {isWarning ? '⚠' : '✓'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Warehouse Detail Modal */}
      {selectedWarehouse && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50,
          padding: 20
        }}>
          <div style={{ 
            background: '#fff', 
            width: '100%', 
            maxWidth: 1000, 
            borderRadius: 12, 
            overflow: 'hidden', 
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: 24, 
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 24 }}>{selectedWarehouse.name}</h3>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                  {selectedWarehouse.id} • {selectedWarehouse.type}
                </div>
              </div>
              <button 
                onClick={() => setSelectedWarehouse(null)} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <CloseIcon />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div style={{ padding: 24, overflow: 'auto', flex: 1 }}>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Công suất', value: `${((selectedWarehouse.current / selectedWarehouse.capacity) * 100).toFixed(1)}%`, sub: `${Number(selectedWarehouse.current || 0).toLocaleString()} / ${Number(selectedWarehouse.capacity || 0).toLocaleString()}㎥`, color: '#3b82f6' },
                  { label: 'Nhân viên', value: selectedWarehouse.staff, color: '#10b981' },
                  { label: 'Phương tiện', value: selectedWarehouse.vehicles, color: '#8b5cf6' },
                  { label: 'Khu vực', value: selectedWarehouse.zones ? selectedWarehouse.zones.length : 0, color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={{ 
                    padding: 16, 
                    border: `2px solid ${stat.color}20`, 
                    borderRadius: 12,
                    background: `${stat.color}10`
                  }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    {stat.sub && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stat.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Address */}
              <div style={{ 
                padding: 16, 
                border: '1px solid #e5e7eb', 
                borderRadius: 12, 
                marginBottom: 24,
                background: '#f9fafb'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📍 Địa chỉ
                </div>
                <div style={{ fontSize: 14, color: '#374151' }}>{selectedWarehouse.address || 'Chưa cập nhật'}</div>
                {selectedWarehouse.lat && selectedWarehouse.lng && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    Tọa độ: {selectedWarehouse.lat}, {selectedWarehouse.lng}
                  </div>
                )}
              </div>

              {/* Zones */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LayersIcon /> Các Khu Chứa Hàng ({selectedWarehouse.zones ? selectedWarehouse.zones.length : 0})
                </h4>
                <div style={{ display: 'grid', gap: 12 }}>
                  {(selectedWarehouse.zones || []).map((zone) => {
                    const percentage = zone.capacity ? ((zone.current / zone.capacity) * 100).toFixed(1) : '0.0'
                    const color = percentage > 85 ? '#ef4444' : percentage > 70 ? '#f59e0b' : '#10b981'
                    const bgColor = percentage > 85 ? '#fef2f2' : percentage > 70 ? '#fffbeb' : '#f0fdf4'
                    return (
                      <div key={zone.id} style={{ 
                        border: `2px solid ${color}20`, 
                        borderRadius: 12, 
                        padding: 16,
                        background: bgColor
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 15 }}>{zone.name}</span>
                              <span style={{ 
                                fontSize: 11, 
                                padding: '2px 8px', 
                                background: '#fff', 
                                borderRadius: 12,
                                color: '#475569',
                                border: '1px solid #e5e7eb'
                              }}>
                                {zone.type}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#666' }}>{zone.id}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {zone.temp != null && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4,
                                background: '#fff',
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: '1px solid #e5e7eb'
                              }}>
                                <ThermometerIcon />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>
                                  {zone.temp}°C
                                </span>
                              </div>
                            )}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color }}>{percentage}%</div>
                              <div style={{ fontSize: 11, color: '#888' }}>
                                {Number(zone.current || 0).toLocaleString()}㎥
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', marginBottom: 4 }}>
                            <span>Công suất</span>
                            <span>{Number(zone.capacity || 0).toLocaleString()}㎥</span>
                          </div>
                          <div style={{ 
                            height: 8, 
                            background: '#e5e7eb', 
                            borderRadius: 8, 
                            overflow: 'hidden' 
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(percentage, 100)}%`,
                              background: color,
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Batches */}
              <div>
                <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageIcon /> Lô Hàng Tại Kho ({batches.filter(b => b.warehouse === selectedWarehouse.id).length})
                </h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {batches.filter(b => b.warehouse === selectedWarehouse.id).slice(0, 6).map((batch) => {
                    const statusColor = batch.status === 'near_expiry' ? '#f59e0b' : batch.status === 'expired' ? '#ef4444' : '#10b981'
                    const statusBg = batch.status === 'near_expiry' ? '#fffbeb' : batch.status === 'expired' ? '#fef2f2' : '#f0fdf4'
                    return (
                      <div 
                        key={batch.id} 
                        style={{ 
                          border: `2px solid ${statusColor}30`, 
                          padding: 14, 
                          borderRadius: 10, 
                          cursor: 'pointer',
                          background: statusBg,
                          transition: 'all 0.2s'
                        }} 
                        onClick={() => { setSelectedBatch(batch); setShowBatchModal(true) }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{batch.product}</span>
                              <span style={{ 
                                fontSize: 10, 
                                padding: '2px 8px', 
                                background: statusColor,
                                color: '#fff',
                                borderRadius: 10,
                                fontWeight: 600
                              }}>
                                {batch.status === 'near_expiry' ? 'Cận date' : batch.status === 'expired' ? 'Hết hạn' : 'Tốt'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: '#666' }}>{batch.id} • {batch.zone}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#3b82f6' }}>
                              {batch.qty} {batch.unit}
                            </div>
                            <div style={{ fontSize: 11, color: '#888' }}>HSD: {batch.exp || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {batches.filter(b => b.warehouse === selectedWarehouse.id).length > 6 && (
                  <button style={{ 
                    marginTop: 12, 
                    width: '100%',
                    padding: '10px',
                    background: '#f1f5f9',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#475569'
                  }}>
                    Xem tất cả ({batches.filter(b => b.warehouse === selectedWarehouse.id).length} lô)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch Detail Modal */}
      {selectedBranch && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50,
          padding: 20
        }}>
          <div style={{ 
            background: '#fff', 
            width: '100%', 
            maxWidth: 600, 
            borderRadius: 12, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: 24, 
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 24 }}>{selectedBranch.name}</h3>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                  {selectedBranch.id} • {selectedBranch.district}
                </div>
              </div>
              <button 
                onClick={() => setSelectedBranch(null)} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'Tồn kho', value: selectedBranch.stock, color: '#3b82f6' },
                  { label: 'Đơn hôm nay', value: selectedBranch.orders, color: '#10b981' },
                  { label: 'Trạng thái', value: selectedBranch.stock < 500 ? '⚠️' : '✅', color: selectedBranch.stock < 500 ? '#f59e0b' : '#10b981' },
                ].map((stat, i) => (
                  <div key={i} style={{ 
                    padding: 16, 
                    border: `2px solid ${stat.color}20`, 
                    borderRadius: 12,
                    background: `${stat.color}10`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div style={{ 
                padding: 16, 
                border: '1px solid #e5e7eb', 
                borderRadius: 12,
                background: '#f9fafb'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📍 Địa chỉ
                </div>
                <div style={{ fontSize: 14, color: '#374151' }}>{selectedBranch.address || 'Chưa cập nhật'}</div>
                {selectedBranch.lat && selectedBranch.lng && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    Tọa độ: {selectedBranch.lat}, {selectedBranch.lng}
                  </div>
                )}
              </div>

              {selectedBranch.stock < 500 && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: '#fffbeb',
                  border: '2px solid #f59e0b',
                  borderRadius: 12,
                  display: 'flex',
                  gap: 12
                }}>
                  <div style={{ color: '#f59e0b' }}>
                    <AlertIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                      Cảnh báo tồn kho thấp
                    </div>
                    <div style={{ fontSize: 14, color: '#78350f' }}>
                      Chi nhánh đang có tồn kho thấp. Vui lòng bổ sung hàng hóa.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && selectedBatch && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 60,
          padding: 20
        }}>
          <div style={{ 
            background: '#fff', 
            width: 540, 
            borderRadius: 12, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{ 
              padding: 24, 
              borderBottom: '1px solid #e5e7eb',
              background: selectedBatch.status === 'near_expiry' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                          selectedBatch.status === 'expired' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 20 }}>{selectedBatch.product}</h4>
                  <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>{selectedBatch.id}</div>
                </div>
                <button 
                  onClick={() => setShowBatchModal(false)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none', 
                    borderRadius: 8,
                    padding: 8,
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* Alert */}
              {selectedBatch.status === 'near_expiry' && (
                <div style={{
                  marginBottom: 20,
                  padding: 16,
                  background: '#fffbeb',
                  border: '2px solid #f59e0b',
                  borderRadius: 12,
                  display: 'flex',
                  gap: 12
                }}>
                  <div style={{ color: '#f59e0b' }}>
                    <AlertIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                      Cảnh báo: Lô hàng cận date
                    </div>
                    <div style={{ fontSize: 13, color: '#78350f' }}>
                      Còn {selectedBatch.daysLeft} ngày trước khi hết hạn. Ưu tiên xuất hàng hoặc khuyến mãi.
                    </div>
                  </div>
                </div>
              )}

              {/* Key Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ 
                  padding: 16, 
                  border: '2px solid #3b82f620', 
                  borderRadius: 12,
                  background: '#eff6ff'
                }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>📦 Số lượng</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
                    {selectedBatch.qty} {selectedBatch.unit}
                  </div>
                </div>
                <div style={{ 
                  padding: 16, 
                  border: `2px solid ${
                    selectedBatch.daysLeft <= 3 ? '#ef444420' :
                    selectedBatch.daysLeft <= 7 ? '#f59e0b20' :
                    '#10b98120'
                  }`, 
                  borderRadius: 12,
                  background: selectedBatch.daysLeft <= 3 ? '#fef2f2' :
                              selectedBatch.daysLeft <= 7 ? '#fffbeb' :
                              '#f0fdf4'
                }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>⏰ Còn lại</div>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 700, 
                    color: selectedBatch.daysLeft <= 3 ? '#ef4444' :
                           selectedBatch.daysLeft <= 7 ? '#f59e0b' :
                           '#10b981'
                  }}>
                    {selectedBatch.daysLeft} ngày
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: 12, 
                overflow: 'hidden',
                marginBottom: 20
              }}>
                {[
                  { label: 'Mã lô hàng', value: selectedBatch.id },
                  { label: 'Kho chứa', value: selectedBatch.warehouse },
                  { label: 'Khu vực', value: selectedBatch.zone },
                  { label: '📅 Ngày sản xuất', value: selectedBatch.mfg || 'N/A' },
                  { label: '📅 Hạn sử dụng', value: selectedBatch.exp || 'N/A', highlight: selectedBatch.daysLeft <= 7 },
                  { label: 'Trạng thái', value: selectedBatch.status === 'near_expiry' ? 'Cận hạn' : selectedBatch.status === 'expired' ? 'Hết hạn' : 'Tốt', badge: true },
                ].map((item, i) => (
                  <div key={i} style={{ 
                    padding: 14,
                    borderBottom: i < 5 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 14, color: '#666' }}>{item.label}</span>
                    {item.badge ? (
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 12,
                        background: selectedBatch.status === 'near_expiry' ? '#f59e0b' :
                                   selectedBatch.status === 'expired' ? '#ef4444' :
                                   '#10b981',
                        color: '#fff'
                      }}>
                        {item.value}
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: item.highlight ? (selectedBatch.daysLeft <= 3 ? '#ef4444' : '#f59e0b') : '#111827'
                      }}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Xuất hàng
                </button>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Chuyển kho
                </button>
                {selectedBatch.status === 'near_expiry' && (
                  <button style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    Khuyến mãi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}