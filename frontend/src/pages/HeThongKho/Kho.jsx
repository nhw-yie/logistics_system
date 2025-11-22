import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../services/api';
import './Kho.css';
import SuaKho from './SuaKho';

const Kho = () => {
  const navigate = useNavigate();
  const [khoData, setKhoData] = useState([]);
  const [selectedKho, setSelectedKho] = useState(null);
  const [allKhuKhoData, setAllKhuKhoData] = useState([]);
  const [selectedKhuKhoData, setSelectedKhuKhoData] = useState([]);
  const [tonKhoData, setTonKhoData] = useState([]);
  const [tonKhoTheoLoData, setTonKhoTheoLoData] = useState([]);
  const [loaiHangData, setLoaiHangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tonghop');
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const [filterLoaiHang, setFilterLoaiHang] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // States cho chỉnh sửa
  const [isEditingKho, setIsEditingKho] = useState(false);
  const [editingKhuKho, setEditingKhuKho] = useState(null);

  useEffect(() => {
    fetchKhoData();
    fetchLoaiHang();
  }, []);
  const handleCreatePhieuXuat = () => {
    if (!selectedKho) return;
    navigate('/phieuxuat/tao', { state: { kho: selectedKho } });
  };

  const handleCreateDonDatHang = () => {
    if (!selectedKho) return;
    navigate('/dondathang/tao', { state: { kho: selectedKho } });
  };

  const fetchKhoData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Đang tải dữ liệu kho...');
      const [khoRes, khukhoRes] = await Promise.all([
        apiGet('kho'),
        apiGet('khukho')
      ]);
      
      console.log('📦 Kho data:', khoRes);
      console.log('🏢 Khukho data:', khukhoRes);
      
      setKhoData(khoRes);
      setAllKhuKhoData(khukhoRes);
      
    } catch (err) {
      setError('Lỗi khi tải dữ liệu kho: ' + err.message);
      console.error('Error fetching kho data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoaiHang = async () => {
    try {
      const loaiHangRes = await apiGet('loaihang');
      console.log('🏷️ Loại hàng data:', loaiHangRes);
      setLoaiHangData(loaiHangRes);
    } catch (err) {
      console.error('Error fetching loai hang:', err);
    }
  };

  const stats = useMemo(() => {
    const khoChinh = khoData.filter(kho => kho.loaiKho === 'kho_chinh').length;
    const khoVung = khoData.filter(kho => kho.loaiKho === 'kho_vung').length;
    const khoHauCan = khoData.filter(kho => kho.loaiKho === 'kho_hau_can').length;
    
    const tongCongSuat = allKhuKhoData.length > 0
      ? (allKhuKhoData.reduce((sum, khu) => sum + (khu.hienChua || 0), 0) / allKhuKhoData.length) * 100
      : 0;

    return {
      tongSoKho: khoData.length,
      khoChinh,
      khoVung, 
      khoHauCan,
      tongCongSuat: Math.round(tongCongSuat),
      tongTonKho: 0
    };
  }, [khoData, allKhuKhoData]);

  const fetchKhoDetail = async (kho) => {
    try {
      setDetailLoading(true);
      console.log(`🎯 Đang tải chi tiết kho: ${kho.maKho}`);

      const [khuKhoRes, tonKhoRes, tonKhoTheoLoRes] = await Promise.all([
        apiGet(`khukho/${kho.maKho}`),
        apiGet(`tonkhotonghop/kho/${kho.maKho}`).catch(() => []),
        apiGet(`tonkhotheolo/kho/${kho.maKho}`).catch(() => [])
      ]);

      console.log('🏢 Khu kho:', khuKhoRes);
      console.log('📊 Tồn kho tổng hợp:', tonKhoRes);
      console.log('📦 Tồn kho theo lô (raw):', tonKhoTheoLoRes);

      const transformedTonKhoTheoLo = tonKhoTheoLoRes.map(item => ({
        ...item,
        sanPham: {
          maSP: item.sanPham_maSP || item.sanPham?.maSP,
          tenSP: item.sanPham_tenSP || item.sanPham?.tenSP,
          donViTinh: item.sanPham_donViTinh || item.sanPham?.donViTinh
        },
        loHang: {
          maLo: item.loHang_maLo || item.loHang?.maLo,
          hanSuDung: item.loHang_hanSuDung || item.loHang?.hanSuDung,
          ngaySanXuat: item.loHang_ngaySanXuat || item.loHang?.ngaySanXuat
        },
        diaDiem: {
          maKho: item.diaDiem_maKho || item.diaDiem?.maKho,
          tenKho: item.diaDiem_tenKho || item.diaDiem?.tenKho
        }
      }));

      console.log('📦 Tồn kho theo lô (transformed):', transformedTonKhoTheoLo);

      setSelectedKhuKhoData(khuKhoRes);
      setTonKhoData(tonKhoRes);
      setTonKhoTheoLoData(transformedTonKhoTheoLo);
      setSelectedKho(kho);
      setActiveTab('tonghop');
      setExpandedRow(null);
      
    } catch (err) {
      console.error('❌ Error fetching kho detail:', err);
      setError('Lỗi khi tải chi tiết kho: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleKhoSelect = (kho) => {
    console.log('🎯 Selected kho:', kho);
    setSelectedKho(null);
    setIsEditingKho(false);
    fetchKhoDetail(kho);
  };

  const handleThemKho = () => {
    navigate('/kho/them-moi');
  };

  const handleDeleteKho = async (kho) => {
    if (!window.confirm(`⚠️ Bạn có chắc muốn xóa kho "${kho.tenKho}"?\n\nLưu ý: Thao tác này sẽ xóa tất cả khu kho bên trong!`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Xóa tất cả khu kho trước
      const khuKhos = allKhuKhoData.filter(k => k.maKho === kho.maKho);
      for (const khu of khuKhos) {
        await apiDelete(`khukho/${khu.maKhu}`);
      }
      
      // Xóa kho
      await apiDelete(`kho/${kho.maKho}`);
      
      alert(`✅ Đã xóa kho "${kho.tenKho}" thành công!`);
      
      // Reload data
      await fetchKhoData();
      setSelectedKho(null);
      
    } catch (err) {
      console.error('❌ Error deleting kho:', err);
      alert(`❌ Lỗi khi xóa kho: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKhuKho = async (khuKho) => {
    if (!window.confirm(`⚠️ Bạn có chắc muốn xóa khu kho "${khuKho.tenKhu}"?`)) {
      return;
    }

    try {
      setDetailLoading(true);
      
      await apiDelete(`khukho/${khuKho.maKhu}`);
      
      alert(`✅ Đã xóa khu kho "${khuKho.tenKhu}" thành công!`);
      
      // Reload kho detail
      await fetchKhoDetail(selectedKho);
      await fetchKhoData();
      
    } catch (err) {
      console.error('❌ Error deleting khu kho:', err);
      alert(`❌ Lỗi khi xóa khu kho: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditKho = () => {
    setIsEditingKho(true);
  };

  const handleEditKhuKho = (khuKho) => {
    setEditingKhuKho(khuKho);
  };

  const handleUpdateSuccess = async () => {
    setIsEditingKho(false);
    setEditingKhuKho(null);
    await fetchKhoData();
    if (selectedKho) {
      await fetchKhoDetail(selectedKho);
    }
  };

  const selectedKhoCongSuat = useMemo(() => {
    if (selectedKhuKhoData.length === 0) return 0;
    const avg = selectedKhuKhoData.reduce((sum, khu) => sum + (khu.hienChua || 0), 0) / selectedKhuKhoData.length;
    return Math.round(avg * 100);
  }, [selectedKhuKhoData]);

  const tonKhoStats = useMemo(() => {
    const tongSoLuong = tonKhoData.reduce((sum, item) => sum + (item.tongSoLuong || 0), 0);
    const tongConHan = tonKhoData.reduce((sum, item) => sum + (item.soLuongConHan || 0), 0);
    const tongCanDate = tonKhoData.reduce((sum, item) => sum + (item.soLuongCanDate || 0), 0);
    const soSPCanDatHang = tonKhoData.filter(item => 
      item.tongSoLuong <= (item.reorder_point || 0) && item.tongSoLuong > 0
    ).length;

    return {
      tongSoLuong,
      tongConHan,
      tongCanDate,
      soSPCanDatHang,
      soSanPham: tonKhoData.length
    };
  }, [tonKhoData]);

  const filteredTonKho = useMemo(() => {
    let filtered = tonKhoData;
    
    if (filterTrangThai !== 'all') {
      filtered = filtered.filter(item => item.trangThai === filterTrangThai);
    }
    
    if (filterLoaiHang !== 'all') {
      filtered = filtered.filter(item => {
        const maLoai = item.maLoai || item.sanPham?.maLoai;
        return maLoai === filterLoaiHang;
      });
    }
    
    return filtered;
  }, [tonKhoData, filterTrangThai, filterLoaiHang]);

  const groupedTonKhoTheoLo = useMemo(() => {
    const grouped = {};
    tonKhoTheoLoData.forEach(item => {
      const maSP = item.sanPham?.maSP || 'unknown';
      if (!grouped[maSP]) {
        grouped[maSP] = {
          sanPham: item.sanPham,
          los: []
        };
      }
      grouped[maSP].los.push(item);
    });
    
    Object.values(grouped).forEach(group => {
      group.los.sort((a, b) => {
        const dateA = new Date(a.loHang?.hanSuDung || 0);
        const dateB = new Date(b.loHang?.hanSuDung || 0);
        return dateA - dateB;
      });
    });
    
    return grouped;
  }, [tonKhoTheoLoData]);

  const getTrangThaiBadge = (trangThai) => {
    const statusMap = {
      'hoạt_động': 'success',
      'bảo_trì': 'warning', 
      'đầy': 'danger',
      'con_hang': 'success',
      'can_date': 'warning',
      'het_hang': 'danger',
      'hoat_dong': 'success',
      'bao_tri': 'warning',
      'day': 'danger'
    };
    
    const statusText = {
      'hoạt_động': 'Hoạt động',
      'bảo_trì': 'Bảo trì',
      'đầy': 'Đầy', 
      'con_hang': 'Còn hàng',
      'can_date': 'Cận date',
      'het_hang': 'Hết hàng',
      'hoat_dong': 'Hoạt động',
      'bao_tri': 'Bảo trì',
      'day': 'Đầy'
    };

    return (
      <span className={`badge badge-${statusMap[trangThai] || 'secondary'}`}>
        {statusText[trangThai] || trangThai}
      </span>
    );
  };

  const getLoaiKhoText = (loaiKho) => {
    const loaiMap = {
      'kho_chinh': 'Kho chính',
      'kho_vung': 'Kho vùng', 
      'kho_hau_can': 'Kho hậu cần'
    };
    return loaiMap[loaiKho] || loaiKho;
  };

  const renderDiaChi = (diaChi) => {
    if (!diaChi) return 'Không có địa chỉ';
    
    if (typeof diaChi === 'string') return diaChi;
    
    const parts = [];
    if (diaChi.soNha) parts.push(diaChi.soNha);
    if (diaChi.duong) parts.push(diaChi.duong);
    if (diaChi.phuong) parts.push(diaChi.phuong);
    if (diaChi.quan) parts.push(diaChi.quan);
    if (diaChi.thanhPho) parts.push(diaChi.thanhPho);
    
    return parts.length > 0 ? parts.join(', ') : 'Không có địa chỉ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const calculateDaysRemaining = (hanSuDung) => {
    if (!hanSuDung) return null;
    const today = new Date();
    const expDate = new Date(hanSuDung);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingBadge = (days) => {
    if (days === null) return null;
    
    let className = 'badge badge-';
    let text = '';
    
    if (days < 0) {
      className += 'danger';
      text = `Hết hạn ${Math.abs(days)} ngày`;
    } else if (days === 0) {
      className += 'danger';
      text = 'Hết hạn hôm nay';
    } else if (days <= 7) {
      className += 'danger';
      text = `Còn ${days} ngày`;
    } else if (days <= 30) {
      className += 'warning';
      text = `Còn ${days} ngày`;
    } else {
      className += 'success';
      text = `Còn ${days} ngày`;
    }
    
    return <span className={className}>{text}</span>;
  };

  const toggleRowExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  if (loading) {
    return (
      <div className="kho-container">
        <div className="loading">
          <div className="spinner"></div>
          Đang tải dữ liệu kho...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kho-container">
        <div className="error-alert">{error}</div>
        <button onClick={fetchKhoData} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  // Hiển thị form chỉnh sửa
  if (isEditingKho && selectedKho) {
    return (
      <SuaKho 
        kho={selectedKho}
        onBack={() => setIsEditingKho(false)}
        onSuccess={handleUpdateSuccess}
      />
    );
  }

  if (editingKhuKho) {
    return (
      <SuaKho 
        khuKho={editingKhuKho}
        onBack={() => setEditingKhuKho(null)}
        onSuccess={handleUpdateSuccess}
      />
    );
  }

  return (
    <div className="kho-container">
      <div className="kho-header">
        <div className="header-top">
          <h1>Quản lý Kho & Tồn Kho</h1>
          <button className="btn-add-kho" onClick={handleThemKho}>
            ➕ Thêm Kho Mới
          </button>
        </div>
        
        <div className="kho-stats">
          <div className="stat-card">
            <h3>{stats.tongSoKho}</h3>
            <p>Tổng số kho</p>
          </div>

          <div className="stat-card stat-card-detail">
            <div className="stat-detail-grid">
              <div className="stat-detail-item">
                <span className="stat-number">{stats.khoChinh}</span>
                <span className="stat-label">Kho chính</span>
              </div>
              <div className="stat-detail-item">
                <span className="stat-number">{stats.khoVung}</span>
                <span className="stat-label">Kho vùng</span>
              </div>
              <div className="stat-detail-item">
                <span className="stat-number">{stats.khoHauCan}</span>
                <span className="stat-label">Kho hậu cần</span>
              </div>
            </div>
            <p className="stat-card-title">Phân loại kho</p>
          </div>

          <div className="stat-card">
            <h3>{stats.tongCongSuat}%</h3>
            <p>Tổng công suất (Trung bình)</p>
            <div className="capacity-bar">
              <div 
                className="capacity-fill"
                style={{ width: `${Math.min(stats.tongCongSuat, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="kho-content">
        <div className="kho-list-section">
          <h2>Danh sách Kho ({stats.tongSoKho})</h2>
          <div className="kho-grid">
            {khoData.map(kho => (
              <div 
                key={kho.maKho} 
                className={`kho-card ${selectedKho?.maKho === kho.maKho ? 'selected' : ''}`}
              >
                <div className="kho-card-header">
                  <h3 onClick={() => handleKhoSelect(kho)} style={{cursor: 'pointer', flex: 1}}>
                    {kho.tenKho}
                  </h3>
                  {getTrangThaiBadge(kho.trangThai)}
                </div>
                <div className="kho-card-body" onClick={() => handleKhoSelect(kho)} style={{cursor: 'pointer'}}>
                  <p><strong>Mã kho:</strong> {kho.maKho}</p>
                  <p><strong>Loại kho:</strong> {getLoaiKhoText(kho.loaiKho)}</p>
                  <p><strong>Địa chỉ:</strong> {renderDiaChi(kho.diaChi)}</p>
                  <p><strong>Dung tích:</strong> {kho.dungTich?.toLocaleString()} m³</p>
                </div>
                <div className="kho-card-actions">
                  <button 
                    className="btn-action btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKho(kho);
                      handleEditKho();
                    }}
                    title="Chỉnh sửa kho"
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteKho(kho);
                    }}
                    title="Xóa kho"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedKho && (
          <div className="kho-detail-section">
            <div className="detail-header">
              <h2>Chi tiết Kho: {selectedKho.tenKho}</h2>
               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button 
                className="btn-action btn-primary"
                onClick={handleCreatePhieuXuat}
                title="Tạo Phiếu Xuất từ kho này"
              >
                ➤ Tạo phiếu xuất
              </button>

              <button 
                className="btn-action btn-primary"
                onClick={handleCreateDonDatHang}
                title="Tạo Đơn Đặt Hàng cho kho này"
              >
                🛒 Tạo đơn đặt hàng
              </button>

              <button 
                className="btn-close"
                onClick={() => setSelectedKho(null)}
              >
                ✕
              </button>
            </div>

          </div>

            {detailLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                Đang tải chi tiết kho...
              </div>
            ) : (
              <div className="detail-body">
                <div className="kho-info-section">
                  <h3>Thông tin Kho</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Mã kho:</strong> {selectedKho.maKho}
                    </div>
                    <div className="info-item">
                      <strong>Loại kho:</strong> {getLoaiKhoText(selectedKho.loaiKho)}
                    </div>
                    <div className="info-item">
                      <strong>Trạng thái:</strong> {getTrangThaiBadge(selectedKho.trangThai)}
                    </div>
                    <div className="info-item">
                      <strong>Dung tích:</strong> {selectedKho.dungTich?.toLocaleString()} m³
                    </div>
                    <div className="info-item">
                      <strong>Công suất kho:</strong> 
                      <span style={{ 
                        marginLeft: '8px', 
                        fontWeight: 'bold',
                        color: selectedKhoCongSuat > 80 ? '#e74c3c' : selectedKhoCongSuat > 60 ? '#f39c12' : '#27ae60'
                      }}>
                        {selectedKhoCongSuat}%
                      </span>
                    </div>
                    <div className="info-item full-width">
                      <strong>Địa chỉ:</strong> {renderDiaChi(selectedKho.diaChi)}
                    </div>
                  </div>
                </div>
              <div className="detail-section">
  <h3>Khu Kho ({selectedKhuKhoData.length})</h3>
  {selectedKhuKhoData.length > 0 ? (
    <div className="khukho-grid">
      {selectedKhuKhoData.map(khu => {
        // Chuyển sang number, default 0 nếu undefined/null
        const hienChua = Number(khu.hienChua) || 0;
        console.log('khu.hienChua raw:', khu.hienChua)
        return (
          <div key={khu.maKhu} className="khukho-card">
            <div className="khukho-header">
              <h4>{khu.tenKhu}</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {getTrangThaiBadge(khu.trangThai)}
                <button 
                  className="btn-icon-edit"
                  onClick={() => handleEditKhuKho(khu)}
                  title="Chỉnh sửa khu kho"
                >
                  ✏️
                </button>
                <button 
                  className="btn-icon-delete"
                  onClick={() => handleDeleteKhuKho(khu)}
                  title="Xóa khu kho"
                >
                  🗑️
                </button>
              </div>
            
            <div className="khukho-body">
              <p><strong>Mã khu:</strong> {khu.maKhu}</p>
              <p><strong>Loại hàng:</strong> {khu.tenLoaiHang || 'Không xác định'}</p>
              <p><strong>Dung tích:</strong> {khu.dungTich?.toLocaleString()} m³</p>
              <p>
                <strong>Đã chứa:</strong>
                <span style={{ 
                  marginLeft: '8px',
                  fontWeight: 'bold',
                  color: hienChua > 0.8 ? '#e74c3c' : hienChua > 0.6 ? '#f39c12' : '#27ae60'
                }}>
                  {Math.round(hienChua * 100)}%
                </span>
              </p>
              <p><strong>Nhiệt độ:</strong> {khu.nhietDo}°C</p>
              {khu.loaiHang?.YC_NhietDo && (
                <p><strong>Yêu cầu:</strong> {khu.loaiHang.YC_NhietDo}</p>
              )}
            </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="no-data">Không có khu kho nào trong kho này</div>
  )}
</div>


                <div className="detail-section tonkho-section">
                  <div className="tonkho-header">
                    <h3>Tồn Kho</h3>
                    
                    <div className="tonkho-stats-mini">
                      <div className="stat-mini">
                        <span className="stat-mini-label">Tổng SP:</span>
                        <span className="stat-mini-value">{tonKhoStats.soSanPham}</span>
                      </div>
                      <div className="stat-mini">
                        <span className="stat-mini-label">Tổng SL:</span>
                        <span className="stat-mini-value">{tonKhoStats.tongSoLuong.toLocaleString()}</span>
                      </div>
                      <div className="stat-mini success">
                        <span className="stat-mini-label">Còn hạn:</span>
                        <span className="stat-mini-value">{tonKhoStats.tongConHan.toLocaleString()}</span>
                      </div>
                      <div className="stat-mini warning">
                        <span className="stat-mini-label">Cận date:</span>
                        <span className="stat-mini-value">{tonKhoStats.tongCanDate.toLocaleString()}</span>
                      </div>
                      {tonKhoStats.soSPCanDatHang > 0 && (
                        <div className="stat-mini danger">
                          <span className="stat-mini-label">Cần đặt hàng:</span>
                          <span className="stat-mini-value">{tonKhoStats.soSPCanDatHang}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tonkho-tabs">
                    <button 
                      className={`tab-btn ${activeTab === 'tonghop' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tonghop')}
                    >
                      Tổng hợp ({tonKhoData.length})
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'theolo' ? 'active' : ''}`}
                      onClick={() => setActiveTab('theolo')}
                    >
                      Theo lô ({tonKhoTheoLoData.length})
                    </button>
                  </div>

                  {activeTab === 'tonghop' && (
                    <div className="tonkho-filters">
                      <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select 
                          value={filterTrangThai} 
                          onChange={(e) => setFilterTrangThai(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">Tất cả ({tonKhoData.length})</option>
                          <option value="con_hang">Còn hàng</option>
                          <option value="can_date">Cận date</option>
                          <option value="het_hang">Hết hàng</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Loại hàng:</label>
                        <select 
                          value={filterLoaiHang} 
                          onChange={(e) => setFilterLoaiHang(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">Tất cả loại hàng</option>
                          {loaiHangData.map(loai => (
                            <option key={loai.maLoai} value={loai.maLoai}>
                              {loai.tenLoai}
                            </option>
                          ))}
                        </select>
                      </div>

                      {(filterTrangThai !== 'all' || filterLoaiHang !== 'all') && (
                        <button 
                          className="btn-clear-filter"
                          onClick={() => {
                            setFilterTrangThai('all');
                            setFilterLoaiHang('all');
                          }}
                        >
                          ✕ Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  )}

                  {activeTab === 'tonghop' ? (
                    filteredTonKho.length > 0 ? (
                      <div className="tonkho-table-container">
                        <table className="tonkho-table">
                          <thead>
                            <tr>
                              <th style={{width: '40px'}}></th>
                              <th>Mã SP</th>
                              <th>Tên sản phẩm</th>
                              <th>Loại hàng</th>
                              <th>Đơn vị</th>
                              <th className="text-right">Tồn kho</th>
                              <th className="text-right">Còn hạn</th>
                              <th className="text-right">Cận date</th>
                              <th className="text-center">Reorder</th>
                              <th className="text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTonKho.map((item, index) => {
                              const needReorder = item.tongSoLuong <= (item.reorder_point || 0);
                              const maSP = item.maSP || item.sanPham?.maSP || 'N/A';
                              const tenSP = item.tenSP || item.sanPham?.tenSP || 'Không xác định';
                              const donViTinh = item.donViTinh || item.sanPham?.donViTinh || 'N/A';
                              const tenLoai = item.tenLoai || item.sanPham?.tenLoai || 'N/A';
                              const isExpanded = expandedRow === index;
                              
                              return (
                                <React.Fragment key={index}>
                                  <tr className={needReorder ? 'row-warning' : ''}>
                                    <td>
                                      {(item.YC_NhietDo || item.YC_Khac) && (
                                        <button 
                                          className="btn-expand"
                                          onClick={() => toggleRowExpand(index)}
                                          title="Xem yêu cầu"
                                        >
                                          {isExpanded ? '▼' : '▶'}
                                        </button>
                                      )}
                                    </td>
                                    <td>{maSP}</td>
                                    <td className="product-name">
                                      {tenSP}
                                      {needReorder && <span className="icon-warning" title="Cần đặt hàng"> ⚠️</span>}
                                    </td>
                                    <td>{tenLoai}</td>
                                    <td>{donViTinh}</td>
                                    <td className="text-right number">{item.tongSoLuong?.toLocaleString()}</td>
                                    <td className="text-right number">{item.soLuongConHan?.toLocaleString()}</td>
                                    <td className={`text-right number ${item.soLuongCanDate > 0 ? 'warning' : ''}`}>
                                      {item.soLuongCanDate?.toLocaleString()}
                                    </td>
                                    <td className="text-center">{item.reorder_point?.toLocaleString() || '-'}</td>
                                    <td className="text-center">{getTrangThaiBadge(item.trangThai)}</td>
                                  </tr>
                                  {isExpanded && (
                                    <tr className="expanded-row">
                                      <td colSpan="10">
                                        <div className="expanded-content">
                                          <div className="requirement-section">
                                            <h4>📋 Yêu cầu bảo quản</h4>
                                            <div className="requirement-grid">
                                              {item.YC_NhietDo && (
                                                <div className="requirement-item">
                                                  <span className="requirement-label">🌡️ Nhiệt độ:</span>
                                                  <span className="requirement-value">{item.YC_NhietDo}</span>
                                                </div>
                                              )}
                                              {item.YC_Khac && (
                                                <div className="requirement-item">
                                                  <span className="requirement-label">📌 Yêu cầu khác:</span>
                                                  <span className="requirement-value">{item.YC_Khac}</span>
                                                </div>
                                              )}
                                              {item.max_stock_level && (
                                                <div className="requirement-item">
                                                  <span className="requirement-label">📊 Mức tồn tối đa:</span>
                                                  <span className="requirement-value">{item.max_stock_level.toLocaleString()}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="no-data">
                        {filterTrangThai === 'all' && filterLoaiHang === 'all'
                          ? 'Không có tồn kho tại kho này' 
                          : 'Không có sản phẩm phù hợp với bộ lọc'
                        }
                      </div>
                    )
                  ) : (
                    Object.keys(groupedTonKhoTheoLo).length > 0 ? (
                      <div className="tonkho-theolo-container">
                        {Object.entries(groupedTonKhoTheoLo).map(([maSP, data]) => (
                          <div key={maSP} className="product-lo-group">
                            <div className="product-lo-header">
                              <h4>
                                {data.sanPham?.tenSP || 'Không xác định'} 
                                <span className="product-code"> ({data.sanPham?.maSP})</span>
                              </h4>
                              <span className="lo-count">{data.los.length} lô</span>
                            </div>
                            <div className="lo-table-wrapper">
                              <table className="lo-table">
                                <thead>
                                  <tr>
                                    <th>Mã lô</th>
                                    <th>Số lượng</th>
                                    <th>Vị trí</th>
                                    <th>Ngày nhập</th>
                                    <th>NSX</th>
                                    <th>HSD</th>
                                    <th>Còn lại</th>
                                    <th>Trạng thái</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.los.map((lo, idx) => {
                                    const daysRemaining = calculateDaysRemaining(lo.loHang?.hanSuDung);
                                    return (
                                      <tr key={idx} className={daysRemaining !== null && daysRemaining <= 7 ? 'row-danger' : ''}>
                                        <td>{lo.loHang?.maLo || 'N/A'}</td>
                                        <td className="text-right">{lo.soLuongHienTai?.toLocaleString()}</td>
                                        <td>{lo.viTriLuuTru || '-'}</td>
                                        <td>{formatDate(lo.ngayNhapKho)}</td>
                                        <td>{formatDate(lo.loHang?.ngaySanXuat)}</td>
                                        <td>{formatDate(lo.loHang?.hanSuDung)}</td>
                                        <td>{getDaysRemainingBadge(daysRemaining)}</td>
                                        <td>{getTrangThaiBadge(lo.trangThai)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data">Không có tồn kho theo lô tại kho này</div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kho;