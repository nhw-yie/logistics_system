import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../services/api';

const ThemKho = ({ onBack, onSuccess }) => {
  const [khoInfo, setKhoInfo] = useState({
    maKho: '',
    tenKho: '',
    loaiKho: 'kho_vung',
    dungTich: '',
    trangThai: 'hoạt_động',
    diaChi: {
      soNha: '',
      duong: '',
      phuong: '',
      quan: '',
      thanhPho: 'TP. Hồ Chí Minh'
    },
    kinhDo: '',
    viDo: ''
  });

  const [khuKhoList, setKhuKhoList] = useState([
    {
      id: Date.now(),
      maKhu: '',
      tenKhu: '',
      maLoai: '',
      dungTich: '',
      nhietDo: '',
      trangThai: 'hoạt_động'
    }
  ]);

  const [loaiHangData, setLoaiHangData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLoaiHang, setLoadingLoaiHang] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetchLoaiHang();
  }, []);

  const fetchLoaiHang = async () => {
    try {
      setLoadingLoaiHang(true);
      const data = await apiGet('loaihang');
      // Handle both array and {success, data} formats
      const items = Array.isArray(data) ? data : (data?.data || []);
      setLoaiHangData(items);
    } catch (err) {
      console.error('❌ Error fetching loai hang:', err);
      setApiError('Không thể tải danh sách loại hàng: ' + err.message);
    } finally {
      setLoadingLoaiHang(false);
    }
  };

  const handleKhoChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setKhoInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setKhoInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    setApiError(null);
  };

  const handleKhuKhoChange = (id, field, value) => {
    setKhuKhoList(prev => prev.map(khu => 
      khu.id === id ? { ...khu, [field]: value } : khu
    ));
    if (errors[`khukho_${id}_${field}`]) {
      setErrors(prev => ({ ...prev, [`khukho_${id}_${field}`]: null }));
    }
  };

  const addKhuKho = () => {
    setKhuKhoList(prev => [...prev, {
      id: Date.now(),
      maKhu: '',
      tenKhu: '',
      maLoai: '',
      dungTich: '',
      nhietDo: '',
      trangThai: 'hoạt_động'
    }]);
  };

  const removeKhuKho = (id) => {
    if (khuKhoList.length > 1) {
      setKhuKhoList(prev => prev.filter(khu => khu.id !== id));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate Kho
    if (!khoInfo.maKho.trim()) {
      newErrors.maKho = 'Vui lòng nhập mã kho';
    } else if (!/^[A-Z0-9-]+$/.test(khoInfo.maKho)) {
      newErrors.maKho = 'Mã kho chỉ gồm chữ in hoa, số và dấu gạch ngang';
    }
    
    if (!khoInfo.tenKho.trim()) {
      newErrors.tenKho = 'Vui lòng nhập tên kho';
    }
    
    if (!khoInfo.dungTich || parseFloat(khoInfo.dungTich) <= 0) {
      newErrors.dungTich = 'Vui lòng nhập dung tích hợp lệ (> 0)';
    }
    
    if (!khoInfo.diaChi.duong.trim()) {
      newErrors['diaChi.duong'] = 'Vui lòng nhập tên đường';
    }
    
    if (!khoInfo.diaChi.phuong.trim()) {
      newErrors['diaChi.phuong'] = 'Vui lòng nhập phường/xã';
    }
    
    if (!khoInfo.diaChi.quan.trim()) {
      newErrors['diaChi.quan'] = 'Vui lòng nhập quận/huyện';
    }

    // Validate KhuKho
    khuKhoList.forEach(khu => {
      if (!khu.maKhu.trim()) {
        newErrors[`khukho_${khu.id}_maKhu`] = 'Vui lòng nhập mã khu';
      } else if (!/^[A-Z0-9-]+$/.test(khu.maKhu)) {
        newErrors[`khukho_${khu.id}_maKhu`] = 'Mã khu chỉ gồm chữ in hoa, số và dấu gạch ngang';
      }
      
      if (!khu.tenKhu.trim()) {
        newErrors[`khukho_${khu.id}_tenKhu`] = 'Vui lòng nhập tên khu';
      }
      
      if (!khu.maLoai) {
        newErrors[`khukho_${khu.id}_maLoai`] = 'Vui lòng chọn loại hàng';
      }
      
      if (!khu.dungTich || parseFloat(khu.dungTich) <= 0) {
        newErrors[`khukho_${khu.id}_dungTich`] = 'Vui lòng nhập dung tích hợp lệ (> 0)';
      }
    });

    // Check duplicate maKhu
    const maKhuSet = new Set();
    khuKhoList.forEach(khu => {
      if (khu.maKhu.trim() && maKhuSet.has(khu.maKhu)) {
        newErrors[`khukho_${khu.id}_maKhu`] = 'Mã khu bị trùng';
      }
      maKhuSet.add(khu.maKhu);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setApiError('⚠️ Vui lòng kiểm tra lại thông tin đã nhập!');
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.input-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      // Step 1: Create Kho
      const khoPayload = {
        maKho: khoInfo.maKho.trim(),
        tenKho: khoInfo.tenKho.trim(),
        loaiKho: khoInfo.loaiKho,
        dungTich: parseFloat(khoInfo.dungTich),
        trangThai: khoInfo.trangThai,
        diaChi: {
          soNha: khoInfo.diaChi.soNha.trim(),
          duong: khoInfo.diaChi.duong.trim(),
          phuong: khoInfo.diaChi.phuong.trim(),
          quan: khoInfo.diaChi.quan.trim(),
          thanhPho: khoInfo.diaChi.thanhPho.trim()
        },
        kinhDo: khoInfo.kinhDo ? parseFloat(khoInfo.kinhDo) : null,
        viDo: khoInfo.viDo ? parseFloat(khoInfo.viDo) : null
      };
      
      console.log('📤 Creating Kho:', khoPayload);
      const khoResult = await apiPost('kho', khoPayload);
      console.log('✅ Kho created:', khoResult);

      // Step 2: Create KhuKho (sequential to avoid race conditions)
      const createdKhuKho = [];
      for (const khu of khuKhoList) {
        const khuPayload = {
          maKhu: khu.maKhu.trim(),
          tenKhu: khu.tenKhu.trim(),
          maLoai: khu.maLoai,
          dungTich: parseFloat(khu.dungTich),
          nhietDo: khu.nhietDo ? parseFloat(khu.nhietDo) : 25,
          trangThai: khu.trangThai,
          maKho: khoInfo.maKho.trim()
        };

        console.log('📤 Creating KhuKho:', khuPayload);
        const khuResult = await apiPost('khukho', khuPayload);
        console.log('✅ KhuKho created:', khuResult);
        createdKhuKho.push(khuResult);
      }

      // Success!
      alert(`✅ Thành công!\n\n• Đã tạo kho: ${khoInfo.tenKho}\n• Đã tạo ${createdKhuKho.length} khu kho`);
      
      if (onSuccess) {
        onSuccess();
      } else if (onBack) {
        onBack();
      }

    } catch (err) {
      console.error('❌ Error:', err);
      const errorMsg = err.message || 'Lỗi không xác định';
      setApiError(`❌ Lỗi khi tạo kho: ${errorMsg}`);
      
      // Show detailed error in console
      if (err.details) {
        console.error('Error details:', err.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasData = khoInfo.maKho || khoInfo.tenKho || 
                    khuKhoList.some(k => k.maKhu || k.tenKhu);
    
    if (hasData && !window.confirm('Bạn có chắc muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
      return;
    }
    
    if (onBack) onBack();
  };

  if (loadingLoaiHang) {
    return (
      <div style={{...styles.container, textAlign: 'center', padding: '100px'}}>
        <div style={styles.spinner}></div>
        <p style={{marginTop: '20px', color: '#6c757d'}}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.btnBack} onClick={handleCancel}>
          ← Quay lại
        </button>
        <h1 style={styles.title}>Thêm Kho Mới</h1>
      </div>

      {apiError && (
        <div style={styles.alertError}>
          <strong>⚠️ Lỗi:</strong> {apiError}
        </div>
      )}

      <div style={styles.formWrapper}>
        {/* THÔNG TIN KHO */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📦 Thông tin Kho</h2>
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Mã kho <span style={styles.required}>*</span>
              </label>
              <input
                style={{...styles.input, ...(errors.maKho && styles.inputError)}}
                className={errors.maKho ? 'input-error' : ''}
                type="text"
                value={khoInfo.maKho}
                onChange={(e) => handleKhoChange('maKho', e.target.value.toUpperCase())}
                placeholder="VD: KHO-V001"
                disabled={loading}
              />
              {errors.maKho && <span style={styles.errorMsg}>{errors.maKho}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Tên kho <span style={styles.required}>*</span>
              </label>
              <input
                style={{...styles.input, ...(errors.tenKho && styles.inputError)}}
                className={errors.tenKho ? 'input-error' : ''}
                type="text"
                value={khoInfo.tenKho}
                onChange={(e) => handleKhoChange('tenKho', e.target.value)}
                placeholder="VD: Kho Vùng Đông Sài Gòn"
                disabled={loading}
              />
              {errors.tenKho && <span style={styles.errorMsg}>{errors.tenKho}</span>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Loại kho</label>
              <select 
                style={styles.input} 
                value={khoInfo.loaiKho} 
                onChange={(e) => handleKhoChange('loaiKho', e.target.value)}
                disabled={loading}
              >
                <option value="kho_chinh">Kho chính</option>
                <option value="kho_vung">Kho vùng</option>
                <option value="kho_hau_can">Kho hậu cần</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Dung tích (m³) <span style={styles.required}>*</span>
              </label>
              <input
                style={{...styles.input, ...(errors.dungTich && styles.inputError)}}
                className={errors.dungTich ? 'input-error' : ''}
                type="number"
                value={khoInfo.dungTich}
                onChange={(e) => handleKhoChange('dungTich', e.target.value)}
                placeholder="VD: 10000"
                min="0"
                step="0.01"
                disabled={loading}
              />
              {errors.dungTich && <span style={styles.errorMsg}>{errors.dungTich}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Trạng thái</label>
              <select 
                style={styles.input} 
                value={khoInfo.trangThai} 
                onChange={(e) => handleKhoChange('trangThai', e.target.value)}
                disabled={loading}
              >
                <option value="hoạt_động">Hoạt động</option>
                <option value="bảo_trì">Bảo trì</option>
                <option value="đầy">Đầy</option>
              </select>
            </div>
          </div>

          <h3 style={styles.subTitle}>📍 Địa chỉ</h3>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Số nhà</label>
              <input 
                style={styles.input} 
                type="text" 
                value={khoInfo.diaChi.soNha} 
                onChange={(e) => handleKhoChange('diaChi.soNha', e.target.value)} 
                placeholder="VD: 123"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Tên đường <span style={styles.required}>*</span>
              </label>
              <input
                style={{...styles.input, ...(errors['diaChi.duong'] && styles.inputError)}}
                className={errors['diaChi.duong'] ? 'input-error' : ''}
                type="text"
                value={khoInfo.diaChi.duong}
                onChange={(e) => handleKhoChange('diaChi.duong', e.target.value)}
                placeholder="VD: Nguyễn Văn Linh"
                disabled={loading}
              />
              {errors['diaChi.duong'] && <span style={styles.errorMsg}>{errors['diaChi.duong']}</span>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Phường/Xã <span style={styles.required}>*</span>
              </label>
              <input
                style={{...styles.input, ...(errors['diaChi.phuong'] && styles.inputError)}}
                className={errors['diaChi.phuong'] ? 'input-error' : ''}
                type="text"
                value={khoInfo.diaChi.phuong}
                onChange={(e) => handleKhoChange('diaChi.phuong', e.target.value)}
                placeholder="VD: Tân Phú"
                disabled={loading}
              />
              {errors['diaChi.phuong'] && <span style={styles.errorMsg}>{errors['diaChi.phuong']}</span>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Quận/Huyện <span style={styles.required}>*</span>
              </label>
              <input
                style={{...styles.input, ...(errors['diaChi.quan'] && styles.inputError)}}
                className={errors['diaChi.quan'] ? 'input-error' : ''}
                type="text"
                value={khoInfo.diaChi.quan}
                onChange={(e) => handleKhoChange('diaChi.quan', e.target.value)}
                placeholder="VD: Quận 7"
                disabled={loading}
              />
              {errors['diaChi.quan'] && <span style={styles.errorMsg}>{errors['diaChi.quan']}</span>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Thành phố</label>
              <input 
                style={styles.input} 
                type="text" 
                value={khoInfo.diaChi.thanhPho} 
                onChange={(e) => handleKhoChange('diaChi.thanhPho', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <h3 style={styles.subTitle}>🗺️ Tọa độ (không bắt buộc)</h3>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Kinh độ</label>
              <input 
                style={styles.input} 
                type="number" 
                value={khoInfo.kinhDo} 
                onChange={(e) => handleKhoChange('kinhDo', e.target.value)} 
                placeholder="VD: 106.7019" 
                step="0.0001"
                disabled={loading}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vĩ độ</label>
              <input 
                style={styles.input} 
                type="number" 
                value={khoInfo.viDo} 
                onChange={(e) => handleKhoChange('viDo', e.target.value)} 
                placeholder="VD: 10.7769" 
                step="0.0001"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* KHU KHO */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={{...styles.sectionTitle, margin: 0, borderBottom: 'none'}}>
              🏢 Khu Kho ({khuKhoList.length})
            </h2>
            <button 
              style={{...styles.btnAdd, ...(loading && styles.btnDisabled)}} 
              onClick={addKhuKho}
              disabled={loading}
            >
              ➕ Thêm khu kho
            </button>
          </div>

          {khuKhoList.map((khu, index) => (
            <div key={khu.id} style={styles.khuItem}>
              <div style={styles.khuHeader}>
                <h3 style={styles.khuTitle}>Khu kho #{index + 1}</h3>
                {khuKhoList.length > 1 && (
                  <button 
                    style={{...styles.btnRemove, ...(loading && styles.btnDisabled)}} 
                    onClick={() => removeKhuKho(khu.id)}
                    disabled={loading}
                  >
                    ✕ Xóa
                  </button>
                )}
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Mã khu <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={{...styles.input, ...(errors[`khukho_${khu.id}_maKhu`] && styles.inputError)}}
                    className={errors[`khukho_${khu.id}_maKhu`] ? 'input-error' : ''}
                    type="text"
                    value={khu.maKhu}
                    onChange={(e) => handleKhuKhoChange(khu.id, 'maKhu', e.target.value.toUpperCase())}
                    placeholder="VD: KHU-A01"
                    disabled={loading}
                  />
                  {errors[`khukho_${khu.id}_maKhu`] && (
                    <span style={styles.errorMsg}>{errors[`khukho_${khu.id}_maKhu`]}</span>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Tên khu <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={{...styles.input, ...(errors[`khukho_${khu.id}_tenKhu`] && styles.inputError)}}
                    className={errors[`khukho_${khu.id}_tenKhu`] ? 'input-error' : ''}
                    type="text"
                    value={khu.tenKhu}
                    onChange={(e) => handleKhuKhoChange(khu.id, 'tenKhu', e.target.value)}
                    placeholder="VD: Khu lạnh A"
                    disabled={loading}
                  />
                  {errors[`khukho_${khu.id}_tenKhu`] && (
                    <span style={styles.errorMsg}>{errors[`khukho_${khu.id}_tenKhu`]}</span>
                  )}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Loại hàng <span style={styles.required}>*</span>
                  </label>
                  <select
                    style={{...styles.input, ...(errors[`khukho_${khu.id}_maLoai`] && styles.inputError)}}
                    className={errors[`khukho_${khu.id}_maLoai`] ? 'input-error' : ''}
                    value={khu.maLoai}
                    onChange={(e) => handleKhuKhoChange(khu.id, 'maLoai', e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Chọn loại hàng --</option>
                    {loaiHangData.map(loai => (
                      <option key={loai.maLoai} value={loai.maLoai}>
                        {loai.tenLoai} {loai.YC_NhietDo && `(${loai.YC_NhietDo})`}
                      </option>
                    ))}
                  </select>
                  {errors[`khukho_${khu.id}_maLoai`] && (
                    <span style={styles.errorMsg}>{errors[`khukho_${khu.id}_maLoai`]}</span>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Dung tích (m³) <span style={styles.required}>*</span>
                  </label>
                  <input
                    style={{...styles.input, ...(errors[`khukho_${khu.id}_dungTich`] && styles.inputError)}}
                    className={errors[`khukho_${khu.id}_dungTich`] ? 'input-error' : ''}
                    type="number"
                    value={khu.dungTich}
                    onChange={(e) => handleKhuKhoChange(khu.id, 'dungTich', e.target.value)}
                    placeholder="VD: 1000"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                  {errors[`khukho_${khu.id}_dungTich`] && (
                    <span style={styles.errorMsg}>{errors[`khukho_${khu.id}_dungTich`]}</span>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nhiệt độ (°C)</label>
                  <input 
                    style={styles.input} 
                    type="number" 
                    value={khu.nhietDo} 
                    onChange={(e) => handleKhuKhoChange(khu.id, 'nhietDo', e.target.value)} 
                    placeholder="VD: 5" 
                    step="0.1"
                    disabled={loading}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Trạng thái</label>
                  <select 
                    style={styles.input} 
                    value={khu.trangThai} 
                    onChange={(e) => handleKhuKhoChange(khu.id, 'trangThai', e.target.value)}
                    disabled={loading}
                  >
                    <option value="hoạt_động">Hoạt động</option>
                    <option value="bảo_trì">Bảo trì</option>
                    <option value="đầy">Đầy</option>
                  </select>
                </div>
              </div>

              {khu.maLoai && loaiHangData.find(l => l.maLoai === khu.maLoai) && (
                <div style={styles.info}>
                  <strong>ℹ️ Thông tin loại hàng:</strong>
                  {loaiHangData.find(l => l.maLoai === khu.maLoai).YC_NhietDo && (
                    <span> 🌡️ {loaiHangData.find(l => l.maLoai === khu.maLoai).YC_NhietDo}</span>
                  )}
                  {loaiHangData.find(l => l.maLoai === khu.maLoai).YC_Khac && (
                    <span> • {loaiHangData.find(l => l.maLoai === khu.maLoai).YC_Khac}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button 
            style={{...styles.btnCancel, ...(loading && styles.btnDisabled)}} 
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            style={{...styles.btnSubmit, ...(loading && styles.btnDisabled)}} 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? '⏳ Đang xử lý...' : '✅ Tạo Kho'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 40px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '25px 30px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  btnBack: {
    padding: '12px 24px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    color: '#2c3e50',
    fontWeight: '700'
  },
  alertError: {
    padding: '16px 20px',
    background: '#f8d7da',
    border: '2px solid #dc3545',
    borderRadius: '8px',
    color: '#721c24',
    marginBottom: '20px',
    fontSize: '15px',
    lineHeight: '1.5'
  },
  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  section: {
    background: 'white',
    padding: '35px 40px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    margin: '0 0 30px 0',
    fontSize: '24px',
    color: '#2c3e50',
    fontWeight: '700',
    paddingBottom: '20px',
    borderBottom: '3px solid #007bff'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '3px solid #007bff'
  },
  subTitle: {
    margin: '30px 0 20px 0',
    fontSize: '20px',
    color: '#495057',
    fontWeight: '600'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
    marginBottom: '25px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#495057'
  },
  required: {
    color: '#dc3545',
    fontSize: '18px',
    marginLeft: '2px'
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '15px',
    background: 'white',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputError: {
    borderColor: '#dc3545',
    boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.1)'
  },
  errorMsg: {
    color: '#dc3545',
    fontSize: '13px',
    fontWeight: '500',
    marginTop: '-2px'
  },
  btnAdd: {
    padding: '12px 24px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
  },
  khuItem: {
    padding: '30px',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '25px',
    border: '2px solid #e9ecef',
    transition: 'all 0.3s ease'
  },
  khuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '2px solid #dee2e6'
  },
  khuTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#343a40',
    fontWeight: '600'
  },
  btnRemove: {
    padding: '10px 20px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
  },
  info: {
    padding: '15px 18px',
    background: '#e7f3ff',
    borderLeft: '4px solid #007bff',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#004085',
    marginTop: '20px',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '20px',
    padding: '30px 40px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  btnCancel: {
    padding: '14px 35px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)'
  },
  btnSubmit: {
    padding: '14px 45px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
  },
  btnDisabled: {
    background: '#6c757d',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }
};

export default ThemKho;