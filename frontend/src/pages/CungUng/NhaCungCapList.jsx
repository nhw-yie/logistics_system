import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../services/api';
import './NhaCungCapList.css';

const NhaCungCapList = () => {
  const navigate = useNavigate();
  const [nhaCungCapList, setNhaCungCapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    tongNCC: 0,
    nccHoatDong: 0,
    nccNgungHopTac: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Backend exposes `/nhacungcap` and `/nhacungcap/:maNCC`.
      // The frontend previously requested non-existent endpoints; call the base list
      // and compute simple stats locally.
      const nccData = await apiGet('/nhacungcap');
      setNhaCungCapList(nccData || []);

      const tong = (nccData || []).length;
      const hoatDong = (nccData || []).filter(i => i.trangThai === 'hoạt_động').length;
      const ngung = tong - hoatDong;
      setStats({ tongNCC: tong, nccHoatDong: hoatDong, nccNgungHopTac: ngung });
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu nhà cung cấp');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maNCC, tenNCC) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${tenNCC}"?`)) {
      return;
    }
    try {
      await apiDelete(`/nhacungcap/${maNCC}`);
      fetchData();
    } catch (err) {
      alert('Lỗi khi xóa nhà cung cấp: ' + err.message);
    }
  };

  const filteredList = nhaCungCapList.filter(ncc => {
    const matchSearch = ncc.tenNCC.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ncc.maNCC.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || ncc.trangThai === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="nha-cung-cap-container">
      <div className="page-header">
        <h1>Quản lý Nhà cung cấp</h1>
        <button 
          className="btn-primary"
          onClick={() => navigate('/nha-cung-cap/them')}
        >
          <i className="icon-plus"></i> Thêm nhà cung cấp
        </button>
      </div>

      {/* Thống kê */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="icon-building"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.tongNCC}</div>
            <div className="stat-label">Tổng NCC</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="icon-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.nccHoatDong}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <i className="icon-x-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.nccNgungHopTac}</div>
            <div className="stat-label">Ngừng hợp tác</div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Bộ lọc */}
      <div className="filter-section">
        <div className="search-box">
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã NCC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="hoạt_động">Hoạt động</option>
            <option value="ngừng_hợp_tác">Ngừng hợp tác</option>
          </select>
        </div>
      </div>

      {/* Danh sách */}
      <div className="ncc-list">
        {filteredList.length === 0 ? (
          <div className="empty-state">
            <i className="icon-inbox"></i>
            <p>Không tìm thấy nhà cung cấp nào</p>
          </div>
        ) : (
          filteredList.map((ncc) => (
            <div key={ncc.maNCC} className="ncc-card">
              <div className="ncc-card-header">
                <div className="ncc-info">
                  <h3>{ncc.tenNCC}</h3>
                  <span className="ncc-code">{ncc.maNCC}</span>
                </div>
                <span className={`status-badge ${ncc.trangThai === 'hoạt_động' ? 'active' : 'inactive'}`}>
                  {ncc.trangThai === 'hoạt_động' ? 'Hoạt động' : 'Ngừng hợp tác'}
                </span>
              </div>
              
              <div className="ncc-card-body">
                <div className="info-row">
                  <i className="icon-map-pin"></i>
                  <span>
                    {ncc.diaChi?.soNha} {ncc.diaChi?.duong}, {ncc.diaChi?.phuong}, {ncc.diaChi?.quan}
                  </span>
                </div>
                <div className="info-row">
                  <i className="icon-phone"></i>
                  <span>{ncc.lienHe?.sdt}</span>
                </div>
                <div className="info-row">
                  <i className="icon-mail"></i>
                  <span>{ncc.lienHe?.email}</span>
                </div>
                <div className="info-row">
                  <i className="icon-user"></i>
                  <span>Người liên hệ: {ncc.lienHe?.nguoiLienHe}</span>
                </div>
                
                <div className="ncc-stats">
                  <div className="stat-item">
                    <i className="icon-package"></i>
                    <span>{ncc.soSanPham || 0} sản phẩm</span>
                  </div>
                  <div className="stat-item">
                    <i className="icon-truck"></i>
                    <span>{ncc.soKhoGiaoHang || 0} kho giao hàng</span>
                  </div>
                  <div className="stat-item">
                    <i className="icon-calendar"></i>
                    <span>
                      Hợp tác từ: {ncc.ngayHopTac ? new Date(ncc.ngayHopTac).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ncc-card-actions">
                <button 
                  className="btn-detail"
                  onClick={() => navigate(`/nha-cung-cap/${ncc.maNCC}`)}
                >
                  <i className="icon-eye"></i> Xem chi tiết
                </button>
                <button 
                  className="btn-edit"
                  onClick={() => navigate(`/nha-cung-cap/${ncc.maNCC}/sua`)}
                >
                  <i className="icon-edit"></i> Sửa
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(ncc.maNCC, ncc.tenNCC)}
                >
                  <i className="icon-trash"></i> Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NhaCungCapList;