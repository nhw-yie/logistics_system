import React, { useState, useEffect, useMemo } from 'react';
import { apiGet } from '../services/api';
import './ChiNhanh.css';

const ChiNhanh = () => {
  const [chiNhanhData, setChiNhanhData] = useState([]);
  const [selectedChiNhanh, setSelectedChiNhanh] = useState(null);
  const [tonKhoData, setTonKhoData] = useState([]);
  const [tonKhoTheoLoData, setTonKhoTheoLoData] = useState([]);
  const [nhanVienData, setNhanVienData] = useState([]);
  const [loaiHangData, setLoaiHangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tonghop'); // 'tonghop', 'theolo', 'nhanvien'
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const [filterLoaiHang, setFilterLoaiHang] = useState('all');
  const [filterBoPhan, setFilterBoPhan] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchChiNhanhData();
    fetchLoaiHang();
  }, []);

  const fetchChiNhanhData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Đang tải dữ liệu chi nhánh...');
      const chiNhanhRes = await apiGet('chinhanh');
      
      console.log('🏢 Chi nhánh data:', chiNhanhRes);
      setChiNhanhData(chiNhanhRes);
      
    } catch (err) {
      setError('Lỗi khi tải dữ liệu chi nhánh: ' + err.message);
      console.error('Error fetching chi nhanh data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoaiHang = async () => {
    try {
      const loaiHangRes = await apiGet('loaihang');
      setLoaiHangData(loaiHangRes);
    } catch (err) {
      console.error('Error fetching loai hang:', err);
    }
  };

  const stats = useMemo(() => {
    const hoatDong = chiNhanhData.filter(cn => cn.trangThai === 'hoạt_động' || cn.trangThai === 'hoat_dong').length;
    const baoTri = chiNhanhData.filter(cn => cn.trangThai === 'bảo_trì' || cn.trangThai === 'bao_tri').length;
    const dongCua = chiNhanhData.filter(cn => cn.trangThai === 'đóng_cửa' || cn.trangThai === 'dong_cua').length;

    return {
      tongSoChiNhanh: chiNhanhData.length,
      hoatDong,
      baoTri,
      dongCua
    };
  }, [chiNhanhData]);

  const fetchChiNhanhDetail = async (chiNhanh) => {
    try {
      setDetailLoading(true);
      console.log(`🎯 Đang tải chi tiết chi nhánh: ${chiNhanh.maChiNhanh}`);

      const [tonKhoRes, tonKhoTheoLoRes, nhanVienRes] = await Promise.all([
        apiGet(`tonkhotonghop/chinhanh/${chiNhanh.maChiNhanh}`).catch(() => []),
        apiGet(`tonkhotheolo/chinhanh/${chiNhanh.maChiNhanh}`).catch(() => []),
        apiGet(`nhanvien/chinhanh/${chiNhanh.maChiNhanh}`).catch(() => [])
      ]);

      console.log('📊 Tồn kho tổng hợp:', tonKhoRes);
      console.log('📦 Tồn kho theo lô:', tonKhoTheoLoRes);
      console.log('👥 Nhân viên:', nhanVienRes);

      // Transform tonKhoTheoLo data
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
          maChiNhanh: item.diaDiem_maChiNhanh || item.diaDiem?.maChiNhanh,
          tenChiNhanh: item.diaDiem_tenChiNhanh || item.diaDiem?.tenChiNhanh
        }
      }));

      setTonKhoData(tonKhoRes);
      setTonKhoTheoLoData(transformedTonKhoTheoLo);
      setNhanVienData(nhanVienRes);
      setSelectedChiNhanh(chiNhanh);
      setActiveTab('tonghop');
      setExpandedRow(null);
      
    } catch (err) {
      console.error('❌ Error fetching chi nhanh detail:', err);
      setError('Lỗi khi tải chi tiết chi nhánh: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChiNhanhSelect = (chiNhanh) => {
    console.log('🎯 Selected chi nhánh:', chiNhanh);
    setSelectedChiNhanh(null);
    fetchChiNhanhDetail(chiNhanh);
  };

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

  const nhanVienStats = useMemo(() => {
    const boPhanCount = {};
    nhanVienData.forEach(nv => {
      const boPhan = nv.boPhan || 'Chưa phân bổ';
      boPhanCount[boPhan] = (boPhanCount[boPhan] || 0) + 1;
    });

    return {
      tongSoNhanVien: nhanVienData.length,
      boPhanCount
    };
  }, [nhanVienData]);

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

  const filteredNhanVien = useMemo(() => {
    if (filterBoPhan === 'all') return nhanVienData;
    return nhanVienData.filter(nv => nv.boPhan === filterBoPhan);
  }, [nhanVienData, filterBoPhan]);

  const groupedTonKhoTheoLo = useMemo(() => {
    const grouped = {};
    tonKhoTheoLoData.forEach(item => {
      const maSP = item.sanPham?.maSP || item.sanPham_maSP || 'unknown';
      if (!grouped[maSP]) {
        grouped[maSP] = {
          sanPham: item.sanPham || {
            maSP: item.sanPham_maSP,
            tenSP: item.sanPham_tenSP,
            donViTinh: item.sanPham_donViTinh
          },
          los: []
        };
      }
      grouped[maSP].los.push(item);
    });
    
    Object.values(grouped).forEach(group => {
      group.los.sort((a, b) => {
        const dateA = new Date(a.loHang?.hanSuDung || a.loHang_hanSuDung || 0);
        const dateB = new Date(b.loHang?.hanSuDung || b.loHang_hanSuDung || 0);
        return dateA - dateB;
      });
    });
    
    return grouped;
  }, [tonKhoTheoLoData]);

  const getTrangThaiBadge = (trangThai) => {
    const statusMap = {
      'hoạt_động': 'success',
      'bảo_trì': 'warning',
      'đóng_cửa': 'danger',
      'con_hang': 'success',
      'can_date': 'warning',
      'het_hang': 'danger',
      'hoat_dong': 'success',
      'bao_tri': 'warning',
      'dong_cua': 'danger',
      'đang_làm_việc': 'success',
      'dang_lam_viec': 'success'
    };
    
    const statusText = {
      'hoạt_động': 'Hoạt động',
      'bảo_trì': 'Bảo trì',
      'đóng_cửa': 'Đóng cửa',
      'con_hang': 'Còn hàng',
      'can_date': 'Cận date',
      'het_hang': 'Hết hàng',
      'hoat_dong': 'Hoạt động',
      'bao_tri': 'Bảo trì',
      'dong_cua': 'Đóng cửa',
      'đang_làm_việc': 'Đang làm việc',
      'dang_lam_viec': 'Đang làm việc'
    };

    return (
      <span className={`badge badge-${statusMap[trangThai] || 'secondary'}`}>
        {statusText[trangThai] || trangThai}
      </span>
    );
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
    
    try {
      let date;
      if (typeof dateString === 'string') {
        date = new Date(dateString.replace(' ', 'T'));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateDaysRemaining = (hanSuDung) => {
    if (!hanSuDung) return null;
    
    let expDate;
    if (typeof hanSuDung === 'string') {
      expDate = new Date(hanSuDung.replace(' ', 'T'));
    } else {
      expDate = new Date(hanSuDung);
    }
    
    if (isNaN(expDate.getTime())) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);
    
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
      <div className="chinhanh-container">
        <div className="loading">
          <div className="spinner"></div>
          Đang tải dữ liệu chi nhánh...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chinhanh-container">
        <div className="error-alert">{error}</div>
        <button onClick={fetchChiNhanhData} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="chinhanh-container">
      <div className="chinhanh-header">
        <h1>Quản lý Chi Nhánh</h1>
        <div className="chinhanh-stats">
          <div className="stat-card">
            <h3>{stats.tongSoChiNhanh}</h3>
            <p>Tổng số chi nhánh</p>
          </div>

          <div className="stat-card stat-card-detail">
            <div className="stat-detail-grid">
              <div className="stat-detail-item">
                <span className="stat-number">{stats.hoatDong}</span>
                <span className="stat-label">Hoạt động</span>
              </div>
              <div className="stat-detail-item">
                <span className="stat-number">{stats.baoTri}</span>
                <span className="stat-label">Bảo trì</span>
              </div>
              <div className="stat-detail-item">
                <span className="stat-number">{stats.dongCua}</span>
                <span className="stat-label">Đóng cửa</span>
              </div>
            </div>
            <p className="stat-card-title">Trạng thái chi nhánh</p>
          </div>
        </div>
      </div>

      <div className="chinhanh-content">
        <div className="chinhanh-list-section">
          <h2>Danh sách Chi Nhánh ({stats.tongSoChiNhanh})</h2>
          <div className="chinhanh-grid">
            {chiNhanhData.map(cn => (
              <div 
                key={cn.maChiNhanh} 
                className={`chinhanh-card ${selectedChiNhanh?.maChiNhanh === cn.maChiNhanh ? 'selected' : ''}`}
                onClick={() => handleChiNhanhSelect(cn)}
              >
                <div className="chinhanh-card-header">
                  <h3>{cn.tenChiNhanh}</h3>
                  {getTrangThaiBadge(cn.trangThai)}
                </div>
                <div className="chinhanh-card-body">
                  <p><strong>Mã CN:</strong> {cn.maChiNhanh}</p>
                  <p><strong>Địa chỉ:</strong> {renderDiaChi(cn.diaChi)}</p>
                  <p><strong>SĐT:</strong> {cn.lienHe?.sdt || 'N/A'}</p>
                  <p><strong>Email:</strong> {cn.lienHe?.email || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedChiNhanh && (
          <div className="chinhanh-detail-section">
            <div className="detail-header">
              <h2>Chi tiết Chi Nhánh: {selectedChiNhanh.tenChiNhanh}</h2>
              <button 
                className="btn-close"
                onClick={() => setSelectedChiNhanh(null)}
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                Đang tải chi tiết chi nhánh...
              </div>
            ) : (
              <>
                <div className="chinhanh-info-section">
                  <h3>Thông tin Chi Nhánh</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Mã chi nhánh:</strong> {selectedChiNhanh.maChiNhanh}
                    </div>
                    <div className="info-item">
                      <strong>Trạng thái:</strong> {getTrangThaiBadge(selectedChiNhanh.trangThai)}
                    </div>
                    <div className="info-item">
                      <strong>Số điện thoại:</strong> {selectedChiNhanh.lienHe?.sdt || 'N/A'}
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong> {selectedChiNhanh.lienHe?.email || 'N/A'}
                    </div>
                    <div className="info-item full-width">
                      <strong>Địa chỉ:</strong> {renderDiaChi(selectedChiNhanh.diaChi)}
                    </div>
                  </div>
                </div>

                <div className="detail-section tonkho-section">
                  <div className="tonkho-header">
                    <h3>Quản lý Chi Nhánh</h3>
                    
                    <div className="tonkho-stats-mini">
                      <div className="stat-mini">
                        <span className="stat-mini-label">👥 Nhân viên:</span>
                        <span className="stat-mini-value">{nhanVienStats.tongSoNhanVien}</span>
                      </div>
                      <div className="stat-mini">
                        <span className="stat-mini-label">📦 Sản phẩm:</span>
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
                      className={`tab-btn ${activeTab === 'nhanvien' ? 'active' : ''}`}
                      onClick={() => setActiveTab('nhanvien')}
                    >
                      👥 Nhân viên ({nhanVienData.length})
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'tonghop' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tonghop')}
                    >
                      📦 Tồn kho ({tonKhoData.length})
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'theolo' ? 'active' : ''}`}
                      onClick={() => setActiveTab('theolo')}
                    >
                      📋 Theo lô ({tonKhoTheoLoData.length})
                    </button>
                  </div>

                  {/* TAB NHÂN VIÊN */}
                  {activeTab === 'nhanvien' && (
                    <>
                      <div className="tonkho-filters">
                        <div className="filter-group">
                          <label>Bộ phận:</label>
                          <select 
                            value={filterBoPhan} 
                            onChange={(e) => setFilterBoPhan(e.target.value)}
                            className="filter-select"
                          >
                            <option value="all">Tất cả bộ phận ({nhanVienData.length})</option>
                            {Object.keys(nhanVienStats.boPhanCount).map(bp => (
                              <option key={bp} value={bp}>
                                {bp} ({nhanVienStats.boPhanCount[bp]})
                              </option>
                            ))}
                          </select>
                        </div>

                        {filterBoPhan !== 'all' && (
                          <button 
                            className="btn-clear-filter"
                            onClick={() => setFilterBoPhan('all')}
                          >
                            ✕ Xóa bộ lọc
                          </button>
                        )}
                      </div>

                      {filteredNhanVien.length > 0 ? (
                        <div className="nhanvien-grid">
                          {filteredNhanVien.map((nv, index) => (
                            <div key={index} className="nhanvien-card">
                              <div className="nhanvien-header">
                                <div>
                                  <h4>{nv.hoTen}</h4>
                                  <p className="nhanvien-manv">{nv.maNV}</p>
                                </div>
                                {getTrangThaiBadge('đang_làm_việc')}
                              </div>
                              <div className="nhanvien-body">
                                <div className="nhanvien-info-row">
                                  <span className="info-label">Chức vụ:</span>
                                  <span className="info-value">{nv.chucVu || 'N/A'}</span>
                                </div>
                                <div className="nhanvien-info-row">
                                  <span className="info-label">Bộ phận:</span>
                                  <span className="info-value">{nv.boPhan || 'N/A'}</span>
                                </div>
                                <div className="nhanvien-info-row">
                                  <span className="info-label">Ngày vào làm:</span>
                                  <span className="info-value">{formatDate(nv.ngayVaoLam)}</span>
                                </div>
                                <div className="nhanvien-contact">
                                  <div className="contact-item">
                                    <span>📱</span>
                                    <span>{nv.sdt || 'N/A'}</span>
                                  </div>
                                  <div className="contact-item">
                                    <span>📧</span>
                                    <span>{nv.email || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-data">
                          {filterBoPhan === 'all'
                            ? 'Không có nhân viên tại chi nhánh này'
                            : `Không có nhân viên trong bộ phận "${filterBoPhan}"`
                          }
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB TỒN KHO TỔNG HỢP - giống như Kho */}
                  {activeTab === 'tonghop' && (
                    <>
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

                      {filteredTonKho.length > 0 ? (
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
                            ? 'Không có tồn kho tại chi nhánh này' 
                            : 'Không có sản phẩm phù hợp với bộ lọc'
                          }
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB TỒN KHO THEO LÔ */}
                  {activeTab === 'theolo' && (
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
                                    const maLo = lo.loHang?.maLo || lo.loHang_maLo || 'N/A';
                                    const soLuong = lo.soLuongHienTai || 0;
                                    const viTri = lo.viTriLuuTru || '-';
                                    const ngayNhap = lo.ngayNhapKho || null;
                                    const ngaySX = lo.loHang?.ngaySanXuat || lo.loHang_ngaySanXuat || null;
                                    const hanSD = lo.loHang?.hanSuDung || lo.loHang_hanSuDung || null;
                                    const trangThai = lo.trangThai || 'N/A';
                                    
                                    const daysRemaining = calculateDaysRemaining(hanSD);
                                    
                                    return (
                                      <tr key={idx} className={daysRemaining !== null && daysRemaining <= 7 ? 'row-danger' : ''}>
                                        <td>{maLo}</td>
                                        <td className="text-right number">{soLuong.toLocaleString()}</td>
                                        <td>{viTri}</td>
                                        <td>{formatDate(ngayNhap)}</td>
                                        <td>{formatDate(ngaySX)}</td>
                                        <td>{formatDate(hanSD)}</td>
                                        <td>{getDaysRemainingBadge(daysRemaining)}</td>
                                        <td>{getTrangThaiBadge(trangThai)}</td>
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
                      <div className="no-data">Không có tồn kho theo lô tại chi nhánh này</div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChiNhanh;