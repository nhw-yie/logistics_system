// src/pages/HeThongKho/TaoPhieuXuat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost, apiGet } from '../../services/api';
import styles from './TaoPhieuXuat.module.css';   // ← thêm "from" và tên biến

export default function TaoPhieuXuat() {
  const nav = useNavigate();
  const { state } = useLocation();
  const prefillKho = state?.kho || null;

  const [form, setForm] = useState({
    maPhieu: '',
    ngayXuat: new Date().toISOString().slice(0, 10),
    kho: prefillKho?.maKho || '',
    xuatDen: '',
    ghiChu: '',
    chiTietText: '[]',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [destList, setDestList] = useState([]);
  const [chiTietRows, setChiTietRows] = useState([]);
  const [lotOptions, setLotOptions] = useState({});
  const lookupTimers = useRef({});
  const lookupVersions = useRef({});

  const handleMaSPInputChange = (idx, ma) => {
    // Update local value immediately
    const next = [...chiTietRows];
    next[idx] = { ...next[idx], maSP: ma };
    setChiTietRows(next);

    // bump lookup version for this row to invalidate previous in-flight responses
    lookupVersions.current[idx] = (lookupVersions.current[idx] || 0) + 1;
    const myVersion = lookupVersions.current[idx];

    // Debounce backend lookup
    if (lookupTimers.current[idx]) clearTimeout(lookupTimers.current[idx]);
    lookupTimers.current[idx] = setTimeout(async () => {
      if (!ma || ma.trim() === '') return;
      console.log('[lookup] maSP=', ma, 'rowIdx=', idx);
      try {
        // Try to fetch product including supplier info first
        let res = null;
        const urlWithSupplier = `/sanpham/cungung/${encodeURIComponent(ma)}`;
        const urlBasic = `/sanpham/${encodeURIComponent(ma)}`;
        console.log('[lookup] requesting', urlWithSupplier, 'version=', myVersion);
        try {
          res = await apiGet(urlWithSupplier);
        } catch (e) {
          // fallback to basic product lookup
          console.log('[lookup] supplier endpoint failed, falling back to', urlBasic, e);
          res = await apiGet(urlBasic);
        }
        // attach version to raw response for easier tracing
        console.log('[lookup] raw response (version=', myVersion, '):', res);
        // If another lookup for this row started after this one, ignore this response
        if (lookupVersions.current[idx] !== myVersion) {
          console.log('[lookup] stale product response ignored', { ma, idx, myVersion, current: lookupVersions.current[idx] });
          return;
        }
        console.log('[lookup] raw response:', res);
        const list = Array.isArray(res) ? res : (res?.result || []);
        const p = list[0];
        console.log('[lookup] product object:', p);
        if (p) {
          // Determine suggested price: prefer first supplier's giaNhap if available,
          // otherwise fall back to product's giaBan (retail price).
          const supplierPrice = (p.cungUng && p.cungUng[0] && Number(p.cungUng[0].giaNhap)) || null;
          const suggestedPrice = (supplierPrice !== null && !Number.isNaN(supplierPrice)) ? supplierPrice : (p.giaBan || 0);

          // Use functional update to avoid stale closure and ensure we preserve maSP
          setChiTietRows(prev => {
            const next2 = [...(Array.isArray(prev) ? prev : [])];
            if (!next2[idx]) next2[idx] = {};
            const existingSoLuong = Number(next2[idx].soLuong || 0);
            const existingDonGia = next2[idx].donGia;
            // Prefer user's manually-entered positive price; otherwise use supplierPrice then giaBan
            const newDonGia = (typeof existingDonGia === 'number' && existingDonGia > 0)
              ? existingDonGia
              : (supplierPrice !== null && !Number.isNaN(supplierPrice) ? supplierPrice : (p.giaBan || 0));
            // debug - show what price we're using
            console.log('[lookup] computed price details', { ma, supplierPrice, giaBan: p.giaBan, cungUng: p.cungUng, existingDonGia, newDonGia });
            next2[idx] = {
              ...next2[idx],
              maSP: ma,
              tenSP: p.tenSP || '',
              donGia: newDonGia,
              soLuong: existingSoLuong,
              thanhTien: Number(existingSoLuong * newDonGia)
            };
            return next2;
          });
        }
        // fetch lots for this product
        try {
          const lots = await apiGet(`/lohang/sanpham/${encodeURIComponent(ma)}`);
          const lotList = Array.isArray(lots) ? lots : (lots?.result || []);
          // Again ignore if a newer lookup has started
          if (lookupVersions.current[idx] !== myVersion) {
            console.log('[lookup] stale lots response ignored', { ma, idx, myVersion, current: lookupVersions.current[idx] });
            return;
          }
          setLotOptions(prev => ({ ...prev, [idx]: lotList }));
        } catch (err) {
          // ignore
        }
      } catch (err) {
        // ignore lookup errors
      }
    }, 300);
  };

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError(null);
    // use chiTietRows as the payload detail rows
    const chiTiet = chiTietRows.map(r => ({
      maSP: r.maSP,
      tenSP: r.tenSP,
      soLuong: Number(r.soLuong || 0),
      donGia: Number(r.donGia || 0),
      maLo: r.maLo,
      thanhTien: Number((r.soLuong || 0) * (r.donGia || 0))
    }));

    setLoading(true);
    try {
      const payload = {
        maPhieu: form.maPhieu,
        ngayXuat: form.ngayXuat,
        kho: form.kho,
        xuatDen: form.xuatDen,
        chiTiet,
        ghiChu: form.ghiChu,
      };

      await apiPost('/phieuxuat', payload);
      alert('Tạo phiếu xuất thành công');
      nav(-1);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || 'Lỗi khi tạo phiếu xuất'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách điểm nhận khi có kho được prefill
  useEffect(() => {
    if (prefillKho?.maKho) {
      (async () => {
        try {
          const dests = await apiGet(`/phanphoi/kho/${prefillKho.maKho}`);
          const list = Array.isArray(dests) ? dests : dests?.result || [];
          setDestList(list);

          if (list.length > 0) {
            const first = list[0];
            const id = first.maKho || first.maChiNhanh || first['@rid'] || '';
            setForm((prev) => ({ ...prev, xuatDen: id }));
          }
        } catch (err) {
          console.warn('Không lấy được danh sách điểm xuất:', err);
        }
      })();
    }
  }, [prefillKho]);

  // Auto-generate maPhieu once on mount when empty
  useEffect(() => {
    (async () => {
      try {
        if (form.maPhieu && form.maPhieu.trim() !== '') return;
        const resp = await apiGet('/phieuxuat/nextMa');
        const ma = resp && (resp.maPhieu || (resp.result && resp.result[0] && resp.result[0].maPhieu));
        if (ma) setForm(prev => ({ ...prev, maPhieu: ma }));
      } catch (err) {
        console.warn('Không tạo được mã tự động', err);
      }
    })();
    // run on mount only
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Tạo Phiếu Xuất</h2>

      <div className={styles.formGrid}>
        {/* Mã phiếu */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Mã phiếu</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className={styles.input}
              value={form.maPhieu}
              onChange={(e) => handleChange('maPhieu', e.target.value)}
              placeholder="PX2025-001"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const resp = await apiGet('/phieuxuat/nextMa');
                  const ma = resp && (resp.maPhieu || (resp.result && resp.result[0] && resp.result[0].maPhieu));
                  if (ma) setForm(prev => ({ ...prev, maPhieu: ma }));
                } catch (err) {
                  console.warn('Không tạo được mã tự động', err);
                  alert('Không tạo được mã tự động');
                }
              }}
            >Tạo mã</button>
          </div>
        </div>

        {/* Ngày xuất */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày xuất</label>
          <input
            type="date"
            className={styles.input}
            value={form.ngayXuat}
            onChange={(e) => handleChange('ngayXuat', e.target.value)}
          />
        </div>

        {/* Kho xuất */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Kho xuất (maKho)</label>
          <input
            className={styles.input}
            value={form.kho}
            onChange={(e) => handleChange('kho', e.target.value)}
            placeholder="KHO001"
          />
        </div>

        {/* Xuất đến */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Xuất đến</label>
          {destList.length > 0 ? (
            <select
              className={styles.select}
              value={form.xuatDen}
              onChange={(e) => handleChange('xuatDen', e.target.value)}
            >
              <option value="">-- Chọn điểm nhận --</option>
              {destList.map((d) => {
                const id = d.maKho || d.maChiNhanh || d['@rid'];
                const name = d.tenKho || d.tenChiNhanh || id;
                const loai = d.loai || d.loaiDiaDiem || 'Không xác định';
                return (
                  <option key={id} value={id}>
                    {name} ({loai})
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              className={styles.input}
              value={form.xuatDen}
              onChange={(e) => handleChange('xuatDen', e.target.value)}
              placeholder="CN001 hoặc @rid"
            />
          )}
        </div>

        {/* Ghi chú */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Ghi chú</label>
          <input
            className={styles.input}
            value={form.ghiChu}
            onChange={(e) => handleChange('ghiChu', e.target.value)}
            placeholder="Ghi chú (tùy chọn)"
          />
        </div>

        {/* Chi tiết phiếu xuất (bảng) */}
        <div className={`${styles.formGroup} ${styles.tableGroup}`}>
          <label className={styles.label}>Chi tiết phiếu xuất</label>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Mã lô</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {chiTietRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <input
                      className={styles.input}
                      value={row.maSP || ''}
                      onChange={(e) => handleMaSPInputChange(idx, e.target.value)}
                    />
                  </td>
                  <td>{row.tenSP || ''}</td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      value={row.soLuong !== undefined ? row.soLuong : ''}
                      onChange={(e) => {
                        const val = Number(e.target.value || 0);
                        const next = [...chiTietRows];
                        next[idx] = { ...next[idx], soLuong: val, thanhTien: (val * (next[idx].donGia || 0)) };
                        setChiTietRows(next);
                      }}
                    />
                  </td>
                  <td>
                    <div className={styles.cellValue}>
                      {row.donGia !== undefined && row.donGia !== null ? Number(row.donGia).toLocaleString() : ''}
                    </div>
                  </td>
                  <td>
                    {lotOptions[idx] && lotOptions[idx].length > 0 ? (
                      <select
                        value={row.maLo || ''}
                        onChange={(e) => {
                          const next = [...chiTietRows];
                          next[idx] = { ...next[idx], maLo: e.target.value };
                          setChiTietRows(next);
                        }}
                      >
                        <option value="">-- Chọn lô --</option>
                        {lotOptions[idx].map((l, i) => (
                          <option key={i} value={l.maLo || l.loHang?.maLo || l['@rid']}>
                            {l.maLo || l.loHang?.maLo || l['@rid']}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={styles.input}
                        value={row.maLo || ''}
                        onChange={(e) => {
                          const next = [...chiTietRows];
                          next[idx] = { ...next[idx], maLo: e.target.value };
                          setChiTietRows(next);
                        }}
                      />
                    )}
                  </td>
                  <td>{(row.thanhTien || (row.soLuong || 0) * (row.donGia || 0)).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        const next = chiTietRows.filter((_, i) => i !== idx);
                        setChiTietRows(next);
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setChiTietRows(prev => ([...prev, { maSP: '', tenSP: '', soLuong: 1, /* donGia omitted so lookup can set it */ maLo: '', thanhTien: 0 }]))}
            >
              + Thêm hàng
            </button>
            <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
              Tổng: {chiTietRows.reduce((s, r) => s + ((r.soLuong || 0) * (r.donGia || 0)), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Nút hành động */}
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.btnCancel}`}
            onClick={() => nav(-1)}
          >
            Hủy
          </button>
          <button
            className={`${styles.button} ${styles.btnSubmit}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Tạo phiếu xuất'}
          </button>
        </div>
      </div>
    </div>
  );
}