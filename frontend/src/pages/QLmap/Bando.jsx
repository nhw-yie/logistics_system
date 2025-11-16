import React, { useEffect, useState } from 'react';
import { apiGet } from '../../services/api';
import '../page.css';

// Icons
const WarehouseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const StoreIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
    <path d="M3 9l2-5h14l2 5"/>
    <path d="M8 9v13"/>
    <path d="M16 9v13"/>
  </svg>
);

const TruckIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h5l3 3v5h-2"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const MapPinIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const LayersIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

export default function Map() {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConnections, setShowConnections] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, warehouse, branch, truck

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiGet('/kho').catch(() => []),
      apiGet('/chinhanh').catch(() => []),
      apiGet('/xetai').catch(() => []),
      apiGet('/vanchuyen').catch(() => []),
    ])
      .then(([khoList, chinhanhList, xetaiList, vanchuyenList]) => {
        // Build warehouses
        const khoArr = Array.isArray(khoList) ? khoList : (khoList.result || []);
        const warehousesBuilt = khoArr.map((k) => ({
          id: k.maKho || k['@rid'],
          name: k.tenKho || k.maKho || '',
          type: k.loaiKho || '',
          capacity: Number(k.dungTich || 0),
          status: k.trangThai || 'active',
          lat: k.viDo || null,
          lng: k.kinhDo || null,
          address: (k.diaChi && (k.diaChi.soNha || k.diaChi.duong)) 
            ? `${k.diaChi.soNha || ''} ${k.diaChi.duong || ''}`.trim() 
            : '',
        }));

        // Build branches
        const cnArr = Array.isArray(chinhanhList) ? chinhanhList : (chinhanhList.result || []);
        const branchesBuilt = cnArr.map((cn) => ({
          id: cn.maChiNhanh || cn['@rid'],
          name: cn.tenChiNhanh || cn.maChiNhanh || '',
          district: (cn.diaChi && cn.diaChi.quan) || '',
          status: cn.trangThai || 'active',
          lat: cn.viDo || null,
          lng: cn.kinhDo || null,
          address: (cn.diaChi && (cn.diaChi.soNha || cn.diaChi.duong)) 
            ? `${cn.diaChi.soNha || ''} ${cn.diaChi.duong || ''}`.trim() 
            : '',
        }));

        // Build trucks (prefer VanChuyen over XeTai)
        const vanch = Array.isArray(vanchuyenList) ? vanchuyenList : (vanchuyenList.result || []);
        const xet = Array.isArray(xetaiList) ? xetaiList : (xetaiList.result || []);
        const trucksBuilt = (vanch.length ? vanch.map((v) => ({
          id: v.maVanChuyen || v['@rid'],
          plate: (v.xeTai && (v.xeTai.bienSo || v.xeTai)) || '',
          driver: v.taiXe && (v.taiXe.hoTen || v.taiXe) || '',
          route: v.diemDi && v.diemDen ? `${v.diemDi} → ${v.diemDen}` : v.tuyenDuong || '',
          status: v.trangThai || 'idle',
          eta: v.ngayDen || '',
          lat: v.viDo || null,
          lng: v.kinhDo || null,
        })) : xet.map((x) => ({
          id: x.maXe || x['@rid'],
          plate: x.bienSo || '',
          driver: x.taiXeChinh && (x.taiXeChinh.hoTen || x.taiXeChinh) || '',
          route: x.viTriHienTai || '',
          status: x.tinhTrang || '',
          eta: '',
          lat: x.viDo || null,
          lng: x.kinhDo || null,
        })));

        setWarehouses(warehousesBuilt);
        setBranches(branchesBuilt);
        setTrucks(trucksBuilt);
      })
      .catch((err) => {
        console.error('Map load error', err);
      })
      .finally(() => setLoading(false));
  };

  const getWarehouseColor = (type) => {
    if (type === 'kho_chinh') return '#3b82f6';
    if (type === 'kho_vung') return '#2563eb';
    return '#60a5fa';
  };

  const getWarehouseSize = (type) => {
    if (type === 'kho_chinh') return 64;
    if (type === 'kho_vung') return 48;
    return 40;
  };

  const activeTrucks = trucks.filter(t => 
    t.status === 'in_transit' || 
    t.status === 'dang_van_chuyen' || 
    t.status === 'dang_giao'
  );

  if (loading) {
    return (
      <div className="page-root">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '4px solid #3b82f6', 
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <h3>Đang tải bản đồ...</h3>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPinIcon />
            Bản Đồ Hệ Thống Phân Phối
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>
            {warehouses.length} Kho • {branches.length} Chi nhánh • {activeTrucks.length} Xe đang chạy
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Filter Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            background: '#fff', 
            padding: 4, 
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: filterType === 'all' ? '#3b82f6' : 'transparent',
                color: filterType === 'all' ? '#fff' : '#666',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('warehouse')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: filterType === 'warehouse' ? '#3b82f6' : 'transparent',
                color: filterType === 'warehouse' ? '#fff' : '#666',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Kho
            </button>
            <button
              onClick={() => setFilterType('branch')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: filterType === 'branch' ? '#10b981' : 'transparent',
                color: filterType === 'branch' ? '#fff' : '#666',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Chi nhánh
            </button>
            <button
              onClick={() => setFilterType('truck')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: filterType === 'truck' ? '#8b5cf6' : 'transparent',
                color: filterType === 'truck' ? '#fff' : '#666',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Xe
            </button>
          </div>

          {/* Toggle Connections */}
          <button
            onClick={() => setShowConnections(!showConnections)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: showConnections ? '#3b82f6' : '#fff',
              color: showConnections ? '#fff' : '#666',
              border: showConnections ? 'none' : '1px solid #e5e7eb',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <LayersIcon size={16} />
            {showConnections ? 'Ẩn kết nối' : 'Hiện kết nối'}
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: 24
      }}>
        <div style={{ 
          position: 'relative', 
          height: 600,
          background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #dcfce7 100%)'
        }}>
          {/* Grid background */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            opacity: 0.15,
            backgroundImage: 'repeating-linear-gradient(0deg, #00000020 0px, #00000020 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, #00000020 0px, #00000020 1px, transparent 1px, transparent 30px)'
          }} />

          {/* Connection lines */}
          {showConnections && (
            <>
              {/* Kho Chính to Kho Vùng */}
              {warehouses.filter(w => w.type === 'kho_chinh').map(mainKho => 
                warehouses.filter(w => w.type === 'kho_vung').map(regionalKho => {
                  if (!mainKho.lat || !regionalKho.lat) return null;
                  const x1 = ((mainKho.lng - 106.5) * 1400);
                  const y1 = ((11 - mainKho.lat) * 1400);
                  const x2 = ((regionalKho.lng - 106.5) * 1400);
                  const y2 = ((11 - regionalKho.lat) * 1400);
                  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                  return (
                    <div
                      key={`${mainKho.id}-${regionalKho.id}`}
                      style={{
                        position: 'absolute',
                        left: x1,
                        top: y1,
                        width: length,
                        height: 3,
                        background: 'linear-gradient(90deg, #3b82f6 0%, #3b82f650 100%)',
                        transformOrigin: '0 0',
                        transform: `rotate(${angle}deg)`,
                        opacity: 0.4,
                        borderRadius: 2,
                        pointerEvents: 'none'
                      }}
                    />
                  );
                })
              )}

              {/* Kho Vùng to Chi Nhánh */}
              {warehouses.filter(w => w.type === 'kho_vung').map(regionalKho => 
                branches.slice(0, 3).map(branch => {
                  if (!regionalKho.lat || !branch.lat) return null;
                  const x1 = ((regionalKho.lng - 106.5) * 1400);
                  const y1 = ((11 - regionalKho.lat) * 1400);
                  const x2 = ((branch.lng - 106.5) * 1400);
                  const y2 = ((11 - branch.lat) * 1400);
                  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                  return (
                    <div
                      key={`${regionalKho.id}-${branch.id}`}
                      style={{
                        position: 'absolute',
                        left: x1,
                        top: y1,
                        width: length,
                        height: 2,
                        background: 'linear-gradient(90deg, #10b981 0%, #10b98150 100%)',
                        transformOrigin: '0 0',
                        transform: `rotate(${angle}deg)`,
                        opacity: 0.3,
                        borderRadius: 2,
                        pointerEvents: 'none'
                      }}
                    />
                  );
                })
              )}
            </>
          )}

          {/* Warehouses */}
          {(filterType === 'all' || filterType === 'warehouse') && warehouses.map((w) => {
            if (!w.lat || !w.lng) return null;
            const x = ((w.lng - 106.5) * 1400);
            const y = ((11 - w.lat) * 1400);
            const size = getWarehouseSize(w.type);
            const color = getWarehouseColor(w.type);
            
            return (
              <div 
                key={w.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 10
                }}
                onClick={() => setSelectedItem({ type: 'warehouse', data: w })}
              >
                <div 
                  className="map-marker"
                  style={{
                    width: size,
                    height: size,
                    background: color,
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'all 0.3s',
                    border: '3px solid #fff'
                  }}
                >
                  <WarehouseIcon size={size * 0.5} />
                </div>
                
                {/* Label */}
                <div className="map-label" style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 8,
                  background: '#fff',
                  padding: '6px 12px',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  border: `2px solid ${color}`,
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }}>
                  {w.name}
                </div>
              </div>
            );
          })}

          {/* Branches */}
          {(filterType === 'all' || filterType === 'branch') && branches.map((b) => {
            if (!b.lat || !b.lng) return null;
            const x = ((b.lng - 106.5) * 1400);
            const y = ((11 - b.lat) * 1400);
            const color = b.status === 'warning' ? '#f59e0b' : '#10b981';
            
            return (
              <div 
                key={b.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 10
                }}
                onClick={() => setSelectedItem({ type: 'branch', data: b })}
              >
                <div 
                  className="map-marker"
                  style={{
                    width: 40,
                    height: 40,
                    background: color,
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'all 0.3s',
                    border: '3px solid #fff'
                  }}
                >
                  <StoreIcon size={20} />
                </div>
                
                {/* Label */}
                <div className="map-label" style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 8,
                  background: '#fff',
                  padding: '4px 10px',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#374151',
                  border: `2px solid ${color}`,
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }}>
                  {b.name}
                </div>
              </div>
            );
          })}

          {/* Trucks */}
          {(filterType === 'all' || filterType === 'truck') && activeTrucks.map((t) => {
            if (!t.lat || !t.lng) return null;
            const x = ((t.lng - 106.5) * 1400);
            const y = ((11 - t.lat) * 1400);
            
            return (
              <div 
                key={t.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 15,
                  animation: 'pulse 2s infinite'
                }}
                onClick={() => setSelectedItem({ type: 'truck', data: t })}
              >
                <div 
                  className="map-marker"
                  style={{
                    width: 36,
                    height: 36,
                    background: '#8b5cf6',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    border: '3px solid #fff',
                    transition: 'all 0.3s'
                  }}
                >
                  <TruckIcon size={18} />
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: 16,
            minWidth: 220
          }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: '#374151' }}>
              Chú thích
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <div style={{ 
                  width: 24, 
                  height: 24, 
                  background: '#3b82f6', 
                  borderRadius: 6, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <WarehouseIcon size={16} />
                </div>
                <span style={{ color: '#374151' }}>Kho ({warehouses.length})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <div style={{ 
                  width: 24, 
                  height: 24, 
                  background: '#10b981', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <StoreIcon size={16} />
                </div>
                <span style={{ color: '#374151' }}>Chi nhánh ({branches.length})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <div style={{ 
                  width: 24, 
                  height: 24, 
                  background: '#8b5cf6', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <TruckIcon size={16} />
                </div>
                <span style={{ color: '#374151' }}>Xe đang chạy ({activeTrucks.length})</span>
              </div>
            </div>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.15); }
            }
            .map-marker:hover {
              transform: scale(1.15);
            }
            .map-marker:hover + .map-label {
              opacity: 1 !important;
            }
          `}</style>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Kho theo loại */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarehouseIcon size={20} />
            Kho theo loại
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Kho Chính', value: warehouses.filter(w => w.type === 'kho_chinh').length, color: '#3b82f6' },
              { label: 'Kho Vùng', value: warehouses.filter(w => w.type === 'kho_vung').length, color: '#2563eb' },
              { label: 'Kho Hậu Cần', value: warehouses.filter(w => w.type === 'kho_hau_can').length, color: '#60a5fa' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 14, color: '#666' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: item.color, fontSize: 16 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chi nhánh theo khu vực */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
            <StoreIcon size={20} />
            Chi nhánh theo khu vực
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Q1', 'Q7', 'Thủ Đức', 'Bình Thạnh', 'Tân Bình'].map(district => {
              const count = branches.filter(b => b.district === district).length;
              return (
                <div key={district} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#666' }}>{district}</span>
                  <span style={{ fontWeight: 700, color: '#10b981', fontSize: 16 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tình trạng vận chuyển */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TruckIcon size={20} />
            Tình trạng vận chuyển
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { 
                label: 'Đang vận chuyển', 
                value: trucks.filter(t => t.status === 'in_transit' || t.status === 'dang_van_chuyen').length, 
                color: '#3b82f6' 
              },
              { 
                label: 'Đang tải hàng', 
                value: trucks.filter(t => t.status === 'loading' || t.status === 'dang_tai').length, 
                color: '#8b5cf6' 
              },
              { 
                label: 'Chờ điều động', 
                value: trucks.filter(t => t.status === 'idle' || t.status === 'san_sang').length, 
                color: '#6b7280' 
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#666' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color, fontSize: 16 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(59,130,246,0.3)', color: '#fff' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPinIcon size={20} />
            Thống kê tổng quan
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, opacity: 0.9 }}>Tổng điểm phân phối</span>
              <span style={{ fontWeight: 700, fontSize: 20 }}>{warehouses.length + branches.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, opacity: 0.9 }}>Phương tiện hoạt động</span>
              <span style={{ fontWeight: 700, fontSize: 20 }}>{activeTrucks.length}/{trucks.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, opacity: 0.9 }}>Hiệu suất vận chuyển</span>
              <span style={{ fontWeight: 700, fontSize: 20 }}>
                {trucks.length > 0 ? ((activeTrucks.length / trucks.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 20,
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: 500,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.3s'
          }}>
            {/* Header */}
            <div style={{
              padding: 20,
              background: selectedItem.type === 'warehouse' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                          selectedItem.type === 'branch' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                          'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{selectedItem.data.name}</h3>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                  {selectedItem.type === 'warehouse' ? selectedItem.data.type :
                   selectedItem.type === 'branch' ? selectedItem.data.district :
                   selectedItem.data.plate}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 20 }}>
              {selectedItem.type === 'warehouse' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Mã kho</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.id}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Địa chỉ</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.address || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Tọa độ</div>
                    <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace', fontSize: 14 }}>
                      {selectedItem.data.lat}, {selectedItem.data.lng}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Công suất</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>
                      {selectedItem.data.capacity ? selectedItem.data.capacity.toLocaleString() : 'N/A'} m³
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 600 }}>Trạng thái</div>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: selectedItem.data.status === 'active' ? '#10b98120' : '#ef444420',
                      color: selectedItem.data.status === 'active' ? '#10b981' : '#ef4444',
                      border: `1px solid ${selectedItem.data.status === 'active' ? '#10b981' : '#ef4444'}40`
                    }}>
                      {selectedItem.data.status === 'active' ? '✓ Hoạt động' : '✗ Không hoạt động'}
                    </span>
                  </div>
                </>
              )}

              {selectedItem.type === 'branch' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Mã chi nhánh</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.id}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Khu vực</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.district || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Địa chỉ</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.address || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Tọa độ</div>
                    <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace', fontSize: 14 }}>
                      {selectedItem.data.lat}, {selectedItem.data.lng}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 600 }}>Trạng thái</div>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: selectedItem.data.status === 'active' ? '#10b98120' : '#f59e0b20',
                      color: selectedItem.data.status === 'active' ? '#10b981' : '#f59e0b',
                      border: `1px solid ${selectedItem.data.status === 'active' ? '#10b981' : '#f59e0b'}40`
                    }}>
                      {selectedItem.data.status === 'active' ? '✓ Hoạt động' : '⚠ Cảnh báo'}
                    </span>
                  </div>
                </>
              )}

              {selectedItem.type === 'truck' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Mã xe</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.id}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Biển số</div>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: 16, fontFamily: 'monospace' }}>
                      {selectedItem.data.plate || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Tài xế</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.driver || 'Chưa phân công'}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Tuyến đường</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{selectedItem.data.route || 'Chưa có tuyến'}</div>
                  </div>
                  {selectedItem.data.eta && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Thời gian dự kiến</div>
                      <div style={{ fontWeight: 600, color: '#3b82f6' }}>{selectedItem.data.eta}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4, fontWeight: 600 }}>Vị trí hiện tại</div>
                    <div style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace', fontSize: 14 }}>
                      {selectedItem.data.lat}, {selectedItem.data.lng}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 600 }}>Trạng thái</div>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: selectedItem.data.status === 'in_transit' || selectedItem.data.status === 'dang_van_chuyen' ? '#3b82f620' : '#6b728020',
                      color: selectedItem.data.status === 'in_transit' || selectedItem.data.status === 'dang_van_chuyen' ? '#3b82f6' : '#6b7280',
                      border: `1px solid ${selectedItem.data.status === 'in_transit' || selectedItem.data.status === 'dang_van_chuyen' ? '#3b82f6' : '#6b7280'}40`
                    }}>
                      {selectedItem.data.status === 'in_transit' || selectedItem.data.status === 'dang_van_chuyen' ? '🚛 Đang vận chuyển' : 
                       selectedItem.data.status === 'loading' || selectedItem.data.status === 'dang_tai' ? '📦 Đang tải hàng' : 
                       '⏸ Chờ điều động'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}