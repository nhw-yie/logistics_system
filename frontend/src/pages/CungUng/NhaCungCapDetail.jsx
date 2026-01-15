import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';
import './NhaCungCapDetail.css';

const NhaCungCapDetail = () => {
  const { maNCC } = useParams();
  const navigate = useNavigate();
  const [ncc, setNcc] = useState(null);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sanpham'); // 'sanpham' | 'kho'
  
  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddKhoModal, setShowAddKhoModal] = useState(false);
  const [showEditKhoModal, setShowEditKhoModal] = useState(false);
  const [selectedKho, setSelectedKho] = useState(null);
  
  // Form states
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableKho, setAvailableKho] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({ maSP: '', giaNhap: '' });
  const [newKho, setNewKho] = useState({
    maKho: '',
    khoangCach: '',
    thoiGianCho: '',
    phiVanChuyen: '',
    tanSuat: 'hằng ngày',
    trangThai: 'hoạt_động'
  });

  useEffect(() => {
    fetchData();
  }, [maNCC]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nccResp, spResp, khoResp, allKhoResp] = await Promise.all([
        apiGet(`/nhacungcap/${maNCC}`),
        apiGet(`/nhacungcap/${maNCC}/sanpham`),
        apiGet(`/nhacungcap/${maNCC}/kho`),
        apiGet('/kho/danh-sach')
      ]);

      // Normalize responses: API may return array, object, or wrapped { data: [...] }
      const unwrapList = (r) => {
        if (!r) return [];
        if (Array.isArray(r)) return r;
        if (r.data && Array.isArray(r.data)) return r.data;
        if (r.result && Array.isArray(r.result)) return r.result;
        return [r];
      };

      const unwrapSingle = (r) => {
        if (!r) return null;
        if (Array.isArray(r)) return r[0] || null;
        if (r.data && !Array.isArray(r.data)) return r.data;
        if (r.data && Array.isArray(r.data)) return r.data[0] || null;
        if (r.result && Array.isArray(r.result)) return r.result[0] || null;
        return r;
      };

      const nccObj = unwrapSingle(nccResp);
      const spList = unwrapList(spResp);
      const khoListResp = unwrapList(khoResp);
      const allKhoList = unwrapList(allKhoResp);

      // Normalize kho items: API may return fields at top-level, under `k`, or with dotted keys like 'k.tenKho'
      const normalizeKho = (it) => {
        const get = (obj, ...keys) => {
          for (const k of keys) {
            if (obj == null) continue;
            if (k in obj) return obj[k];
            // support dotted key like 'k.tenKho'
            if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
          }
          return undefined;
        };

        const maKho = it.maKho || it['k.maKho'] || (it.k && it.k.maKho) || (it.out && it.out.maKho) || '';
        const tenKho = it.tenKho || it['k.tenKho'] || (it.k && it.k.tenKho) || '';
        const khoangCach = it.khoangCach ?? it['e.khoangCach'] ?? (it.e && it.e.khoangCach) ?? it.khoangCach;
        const thoiGianCho = it.thoiGianCho ?? it['e.thoiGianCho'] ?? (it.e && it.e.thoiGianCho) ?? it.thoiGianCho;
        const phiVanChuyen = it.phiVanChuyen ?? it['e.phiVanChuyen'] ?? (it.e && it.e.phiVanChuyen) ?? it.phiVanChuyen;
        const tanSuat = it.tanSuat ?? it['e.tanSuat'] ?? (it.e && it.e.tanSuat) ?? it.tanSuat;
        const trangThai = it.trangThai ?? it['e.trangThai'] ?? (it.e && it.e.trangThai) ?? it.trangThai;
        const diaChi = it.diaChi || (it.k && it.k.diaChi) || null;
        return { maKho, tenKho, khoangCach, thoiGianCho, phiVanChuyen, tanSuat, trangThai, diaChi };
      };

      const normalizedKhoList = khoListResp.map(normalizeKho);

      setNcc(nccObj);
      setSanPhamList(spList);
      setKhoList(normalizedKhoList);
      setAvailableKho(allKhoList);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (keyword) => {
    if (keyword.length < 2) {
      setAvailableProducts([]);
      return;
    }
    try {
      const data = await apiGet(`/sanpham/tim-kiem?keyword=${keyword}`);
      setAvailableProducts(data);
    } catch (err) {
      console.error('Error searching products:', err);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.maSP || !newProduct.giaNhap) {
      alert('Vui lòng chọn sản phẩm và nhập giá');
      return;
    }
    try {
      await apiPost(`/nhacungcap/${maNCC}/sanpham/${newProduct.maSP}`, {
        giaNhap: parseFloat(newProduct.giaNhap)
      });
      setShowAddProductModal(false);
      setNewProduct({ maSP: '', giaNhap: '' });
      setProductSearchTerm('');
      fetchData();
    } catch (err) {
      alert('Lỗi khi thêm sản phẩm: ' + err.message);
    }
  };

  const handleUpdatePrice = async (maSP, giaNhapMoi) => {
    const giaNhap = parseFloat(giaNhapMoi);
    if (isNaN(giaNhap) || giaNhap <= 0) {
      alert('Giá nhập không hợp lệ');
      return;
    }
    try {
      await apiPut(`/nhacungcap/${maNCC}/sanpham/${maSP}`, { giaNhap });
      fetchData();
    } catch (err) {
      alert('Lỗi khi cập nhật giá: ' + err.message);
    }
  };

  const handleDeleteProduct = async (maSP, tenSP) => {
    if (!window.confirm(`Xóa "${tenSP}" khỏi nhà cung cấp?`)) return;
    try {
      await apiDelete(`/nhacungcap/${maNCC}/sanpham/${maSP}`);
      fetchData();
    } catch (err) {
      alert('Lỗi khi xóa sản phẩm: ' + err.message);
    }
  };

  const handleAddKho = async () => {
    if (!newKho.maKho || !newKho.khoangCach || !newKho.thoiGianCho || !newKho.phiVanChuyen) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      await apiPost(`/nhacungcap/${maNCC}/kho/${newKho.maKho}`, {
        khoangCach: parseFloat(newKho.khoangCach),
        thoiGianCho: parseFloat(newKho.thoiGianCho),
        phiVanChuyen: parseFloat(newKho.phiVanChuyen),
        tanSuat: newKho.tanSuat,
        trangThai: newKho.trangThai
      });
      setShowAddKhoModal(false);
      setNewKho({
        maKho: '',
        khoangCach: '',
        thoiGianCho: '',
        phiVanChuyen: '',
        tanSuat: 'hằng ngày',
        trangThai: 'hoạt_động'
      });
      fetchData();
    } catch (err) {
      alert('Lỗi khi thêm kho: ' + err.message);
    }
  };

  const handleUpdateKho = async () => {
    if (!selectedKho) return;
    try {
      await apiPut(`/nhacungcap/${maNCC}/kho/${selectedKho.maKho}`, {
        khoangCach: parseFloat(selectedKho.khoangCach),
        thoiGianCho: parseFloat(selectedKho.thoiGianCho),
        phiVanChuyen: parseFloat(selectedKho.phiVanChuyen),
        tanSuat: selectedKho.tanSuat,
        trangThai: selectedKho.trangThai
      });
      setShowEditKhoModal(false);
      setSelectedKho(null);
      fetchData();
    } catch (err) {
      alert('Lỗi khi cập nhật kho: ' + err.message);
    }
  };

  const handleDeleteKho = async (maKho, tenKho) => {
    if (!window.confirm(`Xóa liên kết với kho "${tenKho}"?`)) return;
    try {
      await apiDelete(`/nhacungcap/${maNCC}/kho/${maKho}`);
      fetchData();
    } catch (err) {
      alert('Lỗi khi xóa liên kết kho: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!ncc) {
    return <div className="error-container">Không tìm thấy nhà cung cấp</div>;
  }

  return (
    <div className="ncc-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/nha-cung-cap')}>
          <i className="icon-arrow-left"></i> Quay lại
        </button>
        <div className="header-actions">
          <button 
            className="btn-edit"
            onClick={() => navigate(`/nha-cung-cap/${maNCC}/sua`)}
          >
            <i className="icon-edit"></i> Sửa thông tin
          </button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="ncc-info-card">
        <div className="info-header">
          <div>
            <h1>{ncc.tenNCC}</h1>
            <span className="ncc-code">{ncc.maNCC}</span>
          </div>
          <span className={`status-badge ${ncc.trangThai === 'hoạt_động' ? 'active' : 'inactive'}`}>
            {ncc.trangThai === 'hoạt_động' ? 'Hoạt động' : 'Ngừng hợp tác'}
          </span>
        </div>
        
        <div className="info-grid">
          <div className="info-item">
            <i className="icon-map-pin"></i>
            <div>
              <label>Địa chỉ</label>
              <p>{ncc.diaChi?.soNha} {ncc.diaChi?.duong}, {ncc.diaChi?.phuong}, {ncc.diaChi?.quan}, {ncc.diaChi?.thanhPho}</p>
            </div>
          </div>
          <div className="info-item">
            <i className="icon-user"></i>
            <div>
              <label>Người liên hệ</label>
              <p>{ncc.lienHe?.nguoiLienHe}</p>
            </div>
          </div>
          <div className="info-item">
            <i className="icon-phone"></i>
            <div>
              <label>Số điện thoại</label>
              <p>{ncc.lienHe?.sdt}</p>
            </div>
          </div>
          <div className="info-item">
            <i className="icon-mail"></i>
            <div>
              <label>Email</label>
              <p>{ncc.lienHe?.email}</p>
            </div>
          </div>
          <div className="info-item">
            <i className="icon-calendar"></i>
            <div>
              <label>Ngày hợp tác</label>
              <p>{ncc.ngayHopTac ? new Date(ncc.ngayHopTac).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'sanpham' ? 'active' : ''}`}
            onClick={() => setActiveTab('sanpham')}
          >
            <i className="icon-package"></i>
            Sản phẩm ({sanPhamList.length})
          </button>
          <button 
          className={`tab ${activeTab === 'kho' ? 'active' : ''}`}
            onClick={() => setActiveTab('kho')}
          >
            <i className="icon-truck"></i>
            Kho giao hàng ({khoList.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'sanpham' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Danh sách sản phẩm</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowAddProductModal(true)}
            >
              <i className="icon-plus"></i> Thêm sản phẩm
            </button>
          </div>

          {sanPhamList.length === 0 ? (
            <div className="empty-state">
              <i className="icon-package"></i>
              <p>Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Loại hàng</th>
                    <th>Đơn vị</th>
                    <th>Giá bán</th>
                    <th>Giá nhập</th>
                    <th>Cập nhật</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sanPhamList.map((sp) => (
                    <tr key={sp.maSP}>
                      <td><strong>{sp.maSP}</strong></td>
                      <td>{sp.tenSP}</td>
                      <td><span className="badge">{sp.tenDanhMuc}</span></td>
                      <td><span className="badge secondary">{sp.tenLoaiHang}</span></td>
                      <td>{sp.donViTinh}</td>
                      <td className="price">{sp.giaBan ? Number(sp.giaBan).toLocaleString('vi-VN') + '₫' : '—'}</td>
                      <td>
                        {(() => {
                          const giaNhapVal = Array.isArray(sp.giaNhap) ? sp.giaNhap[0] : sp.giaNhap;
                          return (
                            <input
                              type="number"
                              className="input-inline"
                              defaultValue={giaNhapVal ?? ''}
                              onBlur={(e) => {
                                const newVal = e.target.value;
                                if (String(newVal) !== String(giaNhapVal ?? '')) {
                                  handleUpdatePrice(sp.maSP, newVal);
                                }
                              }}
                            />
                          );
                        })()}
                      </td>
                      <td className="date-cell">
                        {sp.thoiGianCapNhat ? new Date(sp.thoiGianCapNhat).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteProduct(sp.maSP, sp.tenSP)}
                        >
                          <i className="icon-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'kho' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Kho giao hàng</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowAddKhoModal(true)}
            >
              <i className="icon-plus"></i> Thêm kho
            </button>
          </div>

          {khoList.length === 0 ? (
            <div className="empty-state">
              <i className="icon-truck"></i>
              <p>Chưa có kho giao hàng nào</p>
            </div>
          ) : (
            <div className="kho-grid">
              {khoList.map((kho) => (
                <div key={kho.maKho} className="kho-card">
                        <div className="kho-card-header">
                          <div>
                            <h3>{kho.tenKho || kho.maKho}</h3>
                            <span className="kho-type">{kho.maKho}</span>
                          </div>
                          <span className={`status-badge ${kho.trangThai === 'hoạt_động' ? 'active' : 'inactive'}`}>
                            {kho.trangThai || '—'}
                          </span>
                        </div>

                        <div className="kho-card-body">
                          <div className="info-row">
                            <i className="icon-map-pin"></i>
                            <span>
                              {kho.diaChi ? (
                                `${kho.diaChi.duong || ''}${kho.diaChi.phuong ? ', ' + kho.diaChi.phuong : ''}${kho.diaChi.quan ? ', ' + kho.diaChi.quan : ''}`
                              ) : (
                                'Địa chỉ không có'
                              )}
                            </span>
                          </div>
                          <div className="info-row">
                            <i className="icon-navigation"></i>
                            <span>Khoảng cách: <strong>{kho.khoangCach ?? '—'} km</strong></span>
                          </div>
                          <div className="info-row">
                            <i className="icon-clock"></i>
                            <span>Thời gian: <strong>{kho.thoiGianCho ?? '—'} giờ</strong></span>
                          </div>
                          <div className="info-row">
                            <i className="icon-dollar-sign"></i>
                            <span>Phí vận chuyển: <strong>{kho.phiVanChuyen !== undefined && kho.phiVanChuyen !== null ? Number(kho.phiVanChuyen).toLocaleString('vi-VN') + '₫' : '—'}</strong></span>
                          </div>
                          <div className="info-row">
                            <i className="icon-repeat"></i>
                            <span>Tần suất: <strong>{kho.tanSuat || '—'}</strong></span>
                          </div>
                        </div>
                  
                  <div className="kho-card-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setSelectedKho(kho);
                        setShowEditKhoModal(true);
                      }}
                    >
                      <i className="icon-edit"></i> Sửa
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteKho(kho.maKho, kho.tenKho)}
                    >
                      <i className="icon-trash"></i> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal thêm sản phẩm */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm sản phẩm</h2>
              <button className="btn-close" onClick={() => setShowAddProductModal(false)}>
                <i className="icon-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tìm sản phẩm</label>
                <input
                  type="text"
                  placeholder="Nhập tên hoặc mã sản phẩm..."
                  value={productSearchTerm}
                  onChange={(e) => {
                    setProductSearchTerm(e.target.value);
                    searchProducts(e.target.value);
                  }}
                />
                {availableProducts.length > 0 && (
                  <div className="search-results">
                    {availableProducts.map((sp) => (
                      <div 
                        key={sp.maSP}
                        className="search-result-item"
                        onClick={() => {
                          setNewProduct({ ...newProduct, maSP: sp.maSP });
                          setProductSearchTerm(sp.tenSP);
                          setAvailableProducts([]);
                        }}
                      >
                        <div>
                          <strong>{sp.tenSP}</strong>
                          <small>{sp.maSP} - {sp.tenDanhMuc}</small>
                        </div>
                        <span className="price">{sp.giaBan?.toLocaleString('vi-VN')}₫</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Giá nhập *</label>
                <input
                  type="number"
                  placeholder="Nhập giá nhập..."
                  value={newProduct.giaNhap}
                  onChange={(e) => setNewProduct({ ...newProduct, giaNhap: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddProductModal(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleAddProduct}>
                <i className="icon-plus"></i> Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm kho */}
      {showAddKhoModal && (
        <div className="modal-overlay" onClick={() => setShowAddKhoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm kho giao hàng</h2>
              <button className="btn-close" onClick={() => setShowAddKhoModal(false)}>
                <i className="icon-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Chọn kho *</label>
                <select
                  value={newKho.maKho}
                  onChange={(e) => setNewKho({ ...newKho, maKho: e.target.value })}
                >
                  <option value="">-- Chọn kho --</option>
                  {availableKho
                    .filter(k => !khoList.find(kl => kl.maKho === k.maKho))
                    .map((k) => (
                      <option key={k.maKho} value={k.maKho}>
                        {k.tenKho} ({k.loaiKho})
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Khoảng cách (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newKho.khoangCach}
                    onChange={(e) => setNewKho({ ...newKho, khoangCach: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian chờ (giờ) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newKho.thoiGianCho}
                    onChange={(e) => setNewKho({ ...newKho, thoiGianCho: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phí vận chuyển (VNĐ) *</label>
                <input
                  type="number"
                  value={newKho.phiVanChuyen}
                  onChange={(e) => setNewKho({ ...newKho, phiVanChuyen: e.target.value })}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tần suất</label>
                  <select
                    value={newKho.tanSuat}
                    onChange={(e) => setNewKho({ ...newKho, tanSuat: e.target.value })}
                  >
                    <option value="hằng ngày">Hằng ngày</option>
                    <option value="3 lần/tuần">3 lần/tuần</option>
                    <option value="2 lần/tuần">2 lần/tuần</option>
                    <option value="1 lần/tuần">1 lần/tuần</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={newKho.trangThai}
                    onChange={(e) => setNewKho({ ...newKho, trangThai: e.target.value })}
                  >
                    <option value="hoạt_động">Hoạt động</option>
                    <option value="tạm_ngừng">Tạm ngừng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddKhoModal(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleAddKho}>
                <i className="icon-plus"></i> Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa kho */}
      {showEditKhoModal && selectedKho && (
        <div className="modal-overlay" onClick={() => setShowEditKhoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin giao hàng</h2>
              <button className="btn-close" onClick={() => setShowEditKhoModal(false)}>
                <i className="icon-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Kho</label>
                <input type="text" value={selectedKho.tenKho} disabled />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Khoảng cách (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedKho.khoangCach}
                    onChange={(e) => setSelectedKho({ ...selectedKho, khoangCach: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian chờ (giờ) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedKho.thoiGianCho}
                    onChange={(e) => setSelectedKho({ ...selectedKho, thoiGianCho: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phí vận chuyển (VNĐ) *</label>
                <input
                  type="number"
                  value={selectedKho.phiVanChuyen}
                  onChange={(e) => setSelectedKho({ ...selectedKho, phiVanChuyen: e.target.value })}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tần suất</label>
                  <select
                    value={selectedKho.tanSuat}
                    onChange={(e) => setSelectedKho({ ...selectedKho, tanSuat: e.target.value })}
                  >
                    <option value="hằng ngày">Hằng ngày</option>
                    <option value="3 lần/tuần">3 lần/tuần</option>
                    <option value="2 lần/tuần">2 lần/tuần</option>
                    <option value="1 lần/tuần">1 lần/tuần</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={selectedKho.trangThai}
                    onChange={(e) => setSelectedKho({ ...selectedKho, trangThai: e.target.value })}
                  >
                    <option value="hoạt_động">Hoạt động</option>
                    <option value="tạm_ngừng">Tạm ngừng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditKhoModal(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleUpdateKho}>
                <i className="icon-save"></i> Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NhaCungCapDetail;