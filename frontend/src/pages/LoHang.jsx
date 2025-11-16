import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../services/api';
import { Search, Package, AlertTriangle, MapPin, Calendar, Eye, X } from 'lucide-react';
import './LoHang.css';

const LoHang = () => {
  const navigate = useNavigate();
  const [loHangList, setLoHangList] = useState([]);
  const [selectedLo, setSelectedLo] = useState(null);
  const [phanBoLo, setPhanBoLo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('all');

  useEffect(() => {
    fetchLoHang();
  }, []);

  const fetchLoHang = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Đang tải danh sách lô hàng...');
      const loHangRes = await apiGet('lohang');
      
      console.log('📦 Lô hàng data:', loHangRes);
      setLoHangList(loHangRes);
      
    } catch (err) {
      setError('Lỗi khi tải dữ liệu lô hàng: ' + err.message);
      console.error('Error fetching lô hàng data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhanBo = async (maLo) => {
    try {
      setDetailLoading(true);
      console.log(`🎯 Đang tải phân bổ lô: ${maLo}`);
      
      const phanBoRes = await apiGet(`tonkhotheolo/lohang/${maLo}`);
      console.log('📊 Phân bổ data:', phanBoRes);

      // Transform data để đảm bảo cấu trúc đúng
      const transformedPhanBo = phanBoRes.map(item => ({
        ...item,
        diaDiem: {
          maKho: item.diaDiem_maKho || item.diaDiem?.maKho,
          tenKho: item.diaDiem_tenKho || item.diaDiem?.tenKho,
          maKhu: item.diaDiem_maKhu || item.diaDiem?.maKhu,
          tenKhu: item.diaDiem_tenKhu || item.diaDiem?.tenKhu
        },
        loaiDiaDiem: item.diaDiem_maKhu ? 'Khu kho' : 'Kho'
      }));

      setPhanBoLo(transformedPhanBo);
      
    } catch (err) {
      console.error('❌ Error fetching phân bổ:', err);
      setError('Lỗi khi tải phân bổ lô hàng: ' + err.message);
      setPhanBoLo([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (lo) => {
    console.log('🎯 Selected lô:', lo);
    setSelectedLo(lo);
    fetchPhanBo(lo.maLo);
  };

  const handleCloseDetail = () => {
    setSelectedLo(null);
    setPhanBoLo([]);
  };

  // Thống kê tổng quan
  const thongKe = useMemo(() => {
    const conHan = loHangList.filter(lo => lo.trangThai === 'con_han').length;
    const canDate = loHangList.filter(lo => lo.trangThai === 'can_date').length;
    const hetHan = loHangList.filter(lo => lo.trangThai === 'het_han').length;
    
    const tongSoLuongConHan = loHangList
      .filter(lo => lo.trangThai === 'con_han')
      .reduce((sum, lo) => sum + (lo.soLuongGoc || 0), 0);
    
    const tongSoLuongCanDate = loHangList
      .filter(lo => lo.trangThai === 'can_date')
      .reduce((sum, lo) => sum + (lo.soLuongGoc || 0), 0);
    
    const tongSoLuongHetHan = loHangList
      .filter(lo => lo.trangThai === 'het_han')
      .reduce((sum, lo) => sum + (lo.soLuongGoc || 0), 0);

    return {
      tongSoLo: loHangList.length,
      conHan,
      canDate,
      hetHan,
      tongSoLuongConHan,
      tongSoLuongCanDate,
      tongSoLuongHetHan
    };
  }, [loHangList]);

  // Lọc và tìm kiếm
  const filteredLoHang = useMemo(() => {
    let filtered = loHangList;
    
    if (filterTrangThai !== 'all') {
      filtered = filtered.filter(lo => lo.trangThai === filterTrangThai);
    }
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lo => {
        const maLo = (lo.maLo || '').toLowerCase();
        const tenSP = (lo.sanPham?.tenSP || lo.tenSP || '').toLowerCase();
        const maSP = (lo.sanPham?.maSP || lo.maSP || '').toLowerCase();
        
        return maLo.includes(searchLower) || 
               tenSP.includes(searchLower) || 
               maSP.includes(searchLower);
      });
    }
    
    return filtered;
  }, [loHangList, filterTrangThai, searchTerm]);

  const getTrangThaiBadge = (trangThai) => {
    const statusMap = {
      'con_han': 'success',
      'can_date': 'warning',
      'het_han': 'danger'
    };
    
    const statusText = {
      'con_han': 'Còn hạn',
      'can_date': 'Cận date',
      'het_han': 'Hết hạn'
    };

    return (
      <span className={`badge badge-${statusMap[trangThai] || 'secondary'}`}>
        {statusText[trangThai] || trangThai}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getSoNgayConLai = (hanSuDung) => {
    if (!hanSuDung) return null;
    const today = new Date();
    const hsd = new Date(hanSuDung);
    const diffTime = hsd - today;
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

  const phanBoStats = useMemo(() => {
    if (phanBoLo.length === 0) return { tongSoLuong: 0, soDiaDiem: 0 };
    
    const tongSoLuong = phanBoLo.reduce((sum, pb) => sum + (pb.soLuongHienTai || 0), 0);
    
    return {
      tongSoLuong,
      soDiaDiem: phanBoLo.length
    };
  }, [phanBoLo]);

  if (loading) {
    return (
      <div className="lohang-container">
        <div className="loading">
          <div className="spinner"></div>
          Đang tải dữ liệu lô hàng...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lohang-container">
        <div className="error-alert">{error}</div>
        <button onClick={fetchLoHang} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="lohang-container">
      <div className="lohang-header">
        <div className="header-top">
          <h1>Quản lý Lô Hàng</h1>
          <p className="header-subtitle">Theo dõi và quản lý tồn kho theo từng lô hàng</p>
        </div>
        
        <div className="lohang-stats">
          <div className="stat-card">
            <h3>{thongKe.tongSoLo}</h3>
            <p>Tổng số lô</p>
          </div>

          <div className="stat-card stat-success">
            <h3>{thongKe.conHan}</h3>
            <p>Còn hạn</p>
            <span className="stat-detail">{thongKe.tongSoLuongConHan.toLocaleString()} đơn vị</span>
          </div>

          <div className="stat-card stat-warning">
            <h3>{thongKe.canDate}</h3>
            <p>Cận date</p>
            <span className="stat-detail">{thongKe.tongSoLuongCanDate.toLocaleString()} đơn vị</span>
          </div>

          <div className="stat-card stat-danger">
            <h3>{thongKe.hetHan}</h3>
            <p>Hết hạn</p>
            <span className="stat-detail">{thongKe.tongSoLuongHetHan.toLocaleString()} đơn vị</span>
          </div>
        </div>
      </div>

      <div className="lohang-content">
        <div className="search-filter-section">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã lô, tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Trạng thái:</label>
            <select 
              value={filterTrangThai} 
              onChange={(e) => setFilterTrangThai(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả ({loHangList.length})</option>
              <option value="con_han">Còn hạn ({thongKe.conHan})</option>
              <option value="can_date">Cận date ({thongKe.canDate})</option>
              <option value="het_han">Hết hạn ({thongKe.hetHan})</option>
            </select>
          </div>

          {(filterTrangThai !== 'all' || searchTerm.trim()) && (
            <button 
              className="btn-clear-filter"
              onClick={() => {
                setFilterTrangThai('all');
                setSearchTerm('');
              }}
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="lohang-table-section">
          <h2>Danh sách Lô Hàng ({filteredLoHang.length})</h2>
          
          {filteredLoHang.length > 0 ? (
            <div className="table-container">
              <table className="lohang-table">
                <thead>
                  <tr>
                    <th>Mã lô</th>
                    <th>Sản phẩm</th>
                    <th>Loại hàng</th>
                    <th>NSX</th>
                    <th>HSD</th>
                    <th className="text-center">Còn lại</th>
                    <th className="text-right">Số lượng</th>
                    <th className="text-center">Trạng thái</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoHang.map((lo) => {
                    const soNgayConLai = getSoNgayConLai(lo.hanSuDung);
                    const tenSP = lo.sanPham?.tenSP || lo.tenSP || 'Không xác định';
                    const maSP = lo.sanPham?.maSP || lo.maSP || 'N/A';
                    const donViTinh = lo.sanPham?.donViTinh || lo.donViTinh || '';
                    const tenLoai = lo.sanPham?.loaiHang?.tenLoai || lo.loaiHang || 'N/A';
                    
                    return (
                      <tr 
                        key={lo.maLo} 
                        className={soNgayConLai !== null && soNgayConLai <= 7 && soNgayConLai >= 0 ? 'row-warning' : ''}
                      >
                        <td>
                          <div className="flex-with-icon">
                            <Package className="icon-sm" />
                            <span className="font-medium">{lo.maLo}</span>
                          </div>
                        </td>
                        <td>
                          <div className="product-info">
                            <div className="product-name">{tenSP}</div>
                            <div className="product-code">{maSP}</div>
                          </div>
                        </td>
                        <td>{tenLoai}</td>
                        <td>{formatDate(lo.ngaySanXuat)}</td>
                        <td>
                          <div className="date-info">
                            {formatDate(lo.hanSuDung)}
                            {soNgayConLai !== null && soNgayConLai <= 7 && soNgayConLai >= 0 && (
                              <div className="warning-badge">
                                <AlertTriangle className="icon-xs" />
                                <span>Còn {soNgayConLai} ngày</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {getDaysRemainingBadge(soNgayConLai)}
                        </td>
                        <td className="text-right number">
                          <strong>{lo.soLuongGoc?.toLocaleString()}</strong> {donViTinh}
                        </td>
                        <td className="text-center">
                          {getTrangThaiBadge(lo.trangThai)}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleViewDetail(lo)}
                            className="btn-view-detail"
                            title="Xem chi tiết"
                          >
                            <Eye className="icon-sm" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <Package className="no-data-icon" />
              <p>
                {searchTerm.trim() || filterTrangThai !== 'all'
                  ? 'Không tìm thấy lô hàng phù hợp với bộ lọc'
                  : 'Không có lô hàng nào'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết lô hàng */}
      {selectedLo && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>Chi tiết lô hàng {selectedLo.maLo}</h2>
                <p>{selectedLo.sanPham?.tenSP || selectedLo.tenSP}</p>
              </div>
              <button className="btn-close-modal" onClick={handleCloseDetail}>
                <X />
              </button>
            </div>

            <div className="modal-content">
              {detailLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  Đang tải chi tiết...
                </div>
              ) : (
                <>
                  {/* Thông tin chung */}
                  <div className="info-grid-modal">
                    <div className="info-card">
                      <Calendar className="info-icon" />
                      <div>
                        <p className="info-label">Ngày sản xuất</p>
                        <p className="info-value">{formatDate(selectedLo.ngaySanXuat)}</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <Calendar className="info-icon" />
                      <div>
                        <p className="info-label">Hạn sử dụng</p>
                        <p className="info-value">{formatDate(selectedLo.hanSuDung)}</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <Package className="info-icon" />
                      <div>
                        <p className="info-label">Số lượng gốc</p>
                        <p className="info-value">
                          {selectedLo.soLuongGoc?.toLocaleString()} {selectedLo.sanPham?.donViTinh || selectedLo.donViTinh}
                        </p>
                      </div>
                    </div>
                    <div className="info-card">
                      <div>
                        <p className="info-label">Trạng thái</p>
                        <div className="info-value">
                          {getTrangThaiBadge(selectedLo.trangThai)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phân bổ theo địa điểm */}
                  <div className="phanbo-section">
                    <h3 className="section-title">
                      <MapPin className="icon-sm" />
                      Phân bổ theo địa điểm
                    </h3>
                    
                    {phanBoLo.length === 0 ? (
                      <div className="no-data">
                        <Package className="no-data-icon" />
                        <p>Chưa có phân bổ cho lô hàng này</p>
                      </div>
                    ) : (
                      <div className="phanbo-list">
                        {phanBoLo.map((pb, index) => (
                          <div key={index} className="phanbo-card">
                            <div className="phanbo-header">
                              <div className="phanbo-location">
                                <span className={`location-badge ${pb.loaiDiaDiem === 'Kho' ? 'badge-purple' : 'badge-green'}`}>
                                  {pb.loaiDiaDiem}
                                </span>
                                <span className="location-name">
                                  {pb.diaDiem?.tenKho || 'N/A'}
                                  {pb.diaDiem?.tenKhu && ` - ${pb.diaDiem.tenKhu}`}
                                </span>
                              </div>
                              {getTrangThaiBadge(pb.trangThai)}
                            </div>
                            <div className="phanbo-details">
                              <div className="phanbo-detail-item">
                                <p className="detail-label">Số lượng</p>
                                <p className="detail-value">
                                  {pb.soLuongHienTai?.toLocaleString()} {selectedLo.sanPham?.donViTinh || selectedLo.donViTinh}
                                </p>
                              </div>
                              <div className="phanbo-detail-item">
                                <p className="detail-label">Vị trí</p>
                                <p className="detail-value">{pb.viTriLuuTru || '-'}</p>
                              </div>
                              <div className="phanbo-detail-item">
                                <p className="detail-label">Ngày nhập</p>
                                <p className="detail-value">{formatDate(pb.ngayNhapKho)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tổng kết */}
                  <div className="summary-section">
                    <div className="summary-item">
                      <p className="summary-label">Tổng số lượng còn lại</p>
                      <p className="summary-value">
                        {phanBoStats.tongSoLuong.toLocaleString()} {selectedLo.sanPham?.donViTinh || selectedLo.donViTinh}
                      </p>
                    </div>
                    <div className="summary-item">
                      <p className="summary-label">Số địa điểm</p>
                      <p className="summary-value">{phanBoStats.soDiaDiem}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoHang;