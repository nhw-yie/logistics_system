import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiGet, apiPost } from '../../services/api';
import './TaoDonDatHang.css';   // ⬅️ Thêm dòng import CSS

export default function TaoDonDatHang() {
  const nav = useNavigate();
  const { state } = useLocation();
  const prefillKho = state?.kho || null;

  const [nccList, setNccList] = useState([]);
  const [destList, setDestList] = useState([]);
  const [chiTietRows, setChiTietRows] = useState([]);
  const [lotOptions, setLotOptions] = useState({});
  const lookupTimers = useRef({});
  const lookupVersions = useRef({});
  const [form, setForm] = useState({
    maDon: '',
    ngayLap: new Date().toISOString().slice(0, 10),
    nhaCungCap: '',
    khoDat: prefillKho?.maKho || '',
    chiTietText: '[]'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingNcc, setLoadingNcc] = useState(true);

  // when supplier changes, clear existing detail rows (they belong to another supplier)
  useEffect(() => {
    setChiTietRows([]);
    setLotOptions({});
  }, [form.nhaCungCap]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/nhacungcap');
        const list = Array.isArray(data) ? data : (data?.result || []);
        setNccList(list);

        if (prefillKho && prefillKho.maKho) {
          try {
            const dests = await apiGet(`/phanphoi/kho/${prefillKho.maKho}`);
            const list = Array.isArray(dests) ? dests : (dests?.result || []);
            setDestList(list);

            // destList is kept for possible future use, don't set khoNhan here
          } catch (err) {
            console.warn('Không lấy được danh sách phân phối (PhanPhoi): ', err.message || err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingNcc(false);
      }
    })();
  }, []);

  // Auto-generate maDon once on mount when empty
  useEffect(() => {
    (async () => {
      try {
        if (form.maDon && form.maDon.trim() !== '') return;
        const resp = await apiGet('/dondathang/nextMa');
        const ma = resp && (resp.maDon || (resp.result && resp.result[0] && resp.result[0].maDon));
        if (ma) setForm(prev => ({ ...prev, maDon: ma }));
      } catch (err) {
        console.warn('Không tạo được mã tự động đơn đặt hàng', err);
      }
    })();
    // run on mount only
  }, []);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleMaSPInputChange = (idx, ma) => {
    // Update immediately
    const next = [...chiTietRows];
    next[idx] = { ...next[idx], maSP: ma };
    setChiTietRows(next);

    // bump version
    lookupVersions.current[idx] = (lookupVersions.current[idx] || 0) + 1;
    const myVersion = lookupVersions.current[idx];

    if (lookupTimers.current[idx]) clearTimeout(lookupTimers.current[idx]);
    // longer debounce so user can finish typing; validation only when input length >= 3
    lookupTimers.current[idx] = setTimeout(async () => {
      if (!ma || ma.trim() === '') return;
      if ((ma || '').trim().length < 3) return; // wait until user typed enough chars
      if (!form.nhaCungCap) {
        alert('Vui lòng chọn nhà cung cấp trước');
        return;
      }
      try {
        const res = await apiGet(`/sanpham/cungung/${encodeURIComponent(ma)}`);
        if (lookupVersions.current[idx] !== myVersion) return;
        const list = Array.isArray(res) ? res : (res?.result || []);
        const p = list[0];
        if (!p) {
          alert('Không tìm thấy sản phẩm');
          const next2 = [...chiTietRows];
          next2[idx] = { maSP: '', tenSP: '', soLuong: 0, donGia: 0, maLo: '', thanhTien: 0 };
          setChiTietRows(next2);
          return;
        }
        // check if this product is supplied by selected NCC (compare by RID)
        const supplierRid = form.nhaCungCap; // we store NhaCungCap @rid as value
        const cungUng = Array.isArray(p.cungUng) ? p.cungUng : [];
        const matched = cungUng.find(c => {
          const nc = c.nhaCungCap;
          return nc === supplierRid || (nc && nc['@rid'] === supplierRid) || (typeof nc === 'string' && nc === supplierRid);
        });
        if (!matched) {
          // clear the row and notify
          const next2 = [...chiTietRows];
          next2[idx] = { maSP: '', tenSP: '', soLuong: 0, donGia: 0, maLo: '', thanhTien: 0 };
          setChiTietRows(next2);
          alert('Sản phẩm không thuộc nhà cung cấp đã chọn');
          return;
        }

        // use supplier's giaNhap as donGia
        const supplierPrice = Number(matched.giaNhap || 0);

        setChiTietRows(prev => {
          const next2 = [...(Array.isArray(prev) ? prev : [])];
          if (!next2[idx]) next2[idx] = {};
          const existingSo = Number(next2[idx].soLuong || 0) || 0;
          next2[idx] = {
            ...next2[idx],
            maSP: ma,
            tenSP: p.tenSP || '',
            donGia: supplierPrice,
            soLuong: existingSo || 1,
            thanhTien: Number((existingSo || 1) * supplierPrice)
          };
          return next2;
        });

        // fetch lots (optional)
        try {
          const lots = await apiGet(`/lohang/sanpham/${encodeURIComponent(ma)}`);
          const lotList = Array.isArray(lots) ? lots : (lots?.result || []);
          if (lookupVersions.current[idx] === myVersion) {
            setLotOptions(prev => ({ ...prev, [idx]: lotList }));
          }
        } catch (e) {}

      } catch (err) {
        console.error(err);
      }
    }, 600);
  };

  const handleSubmit = async () => {
    setError(null);
    const chiTiet = (Array.isArray(chiTietRows) ? chiTietRows : []).map(r => ({
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
        maDon: form.maDon,
        ngayLap: form.ngayLap,
        nhaCungCap: form.nhaCungCap,
        khoDat: form.khoDat,
        chiTiet
      };

      await apiPost('/dondathang', payload);
      alert('✅ Tạo đơn đặt hàng thành công');
      nav(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi tạo đơn đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tao-don-container">
      <h2>Tạo Đơn Đặt Hàng</h2>

      {loadingNcc ? (
        <p>Đang tải nhà cung cấp...</p>
      ) : (
        <div className="tao-don-form">

          <label>Mã đơn
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={form.maDon}
                onChange={e => handleChange('maDon', e.target.value)}
              />
              <button type="button" onClick={async () => {
                try {
                  const resp = await apiGet('/dondathang/nextMa');
                  const ma = resp && (resp.maDon || (resp.result && resp.result[0] && resp.result[0].maDon));
                  if (ma) setForm(prev => ({ ...prev, maDon: ma }));
                } catch (err) {
                  console.warn('Không tạo được mã tự động', err);
                  alert('Không tạo được mã tự động');
                }
              }}>Tạo mã</button>
            </div>
          </label>

          <label>Ngày lập
            <input
              type="date"
              value={form.ngayLap}
              onChange={e => handleChange('ngayLap', e.target.value)}
            />
          </label>

          <label>Nhà cung cấp
            <select
              value={form.nhaCungCap}
              onChange={e => handleChange('nhaCungCap', e.target.value)}
            >
              <option value="">-- Chọn NCC --</option>
              {nccList.map(n => (
                <option key={n['@rid'] || n.maNCC} value={n['@rid'] || n.maNCC}>
                  {n.tenNCC || n.maNCC}
                </option>
              ))}
            </select>
          </label>

          <label>Kho đặt
            <input
              value={form.khoDat}
              onChange={e => handleChange('khoDat', e.target.value)}
            />
          </label>

          {/* Chi tiết: bảng đơn hàng */}
          <div className="chi-tiet-table">
            <label>Chi tiết đơn</label>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá (gia nhập)</th>
                  <th>Mã lô (tùy chọn)</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {chiTietRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <input value={row.maSP || ''} onChange={e => handleMaSPInputChange(idx, e.target.value)} />
                    </td>
                    <td>{row.tenSP || ''}</td>
                    <td>
                      <input type="number" min="0" value={row.soLuong !== undefined ? row.soLuong : ''}
                        onChange={e => {
                          const val = Number(e.target.value || 0);
                          const next = [...chiTietRows];
                          next[idx] = { ...next[idx], soLuong: val, thanhTien: (val * (next[idx].donGia || 0)) };
                          setChiTietRows(next);
                        }}
                      />
                    </td>
                    <td>{row.donGia !== undefined && row.donGia !== null ? Number(row.donGia).toLocaleString() : ''}</td>
                    <td>
                      {lotOptions[idx] && lotOptions[idx].length > 0 ? (
                        <select value={row.maLo || ''} onChange={e => { const next = [...chiTietRows]; next[idx] = { ...next[idx], maLo: e.target.value }; setChiTietRows(next); }}>
                          <option value="">-- Chọn lô --</option>
                          {lotOptions[idx].map((l, i) => (
                            <option key={i} value={l.maLo || l.loHang?.maLo || l['@rid']}>{l.maLo || l.loHang?.maLo || l['@rid']}</option>
                          ))}
                        </select>
                      ) : (
                        <input value={row.maLo || ''} onChange={e => { const next = [...chiTietRows]; next[idx] = { ...next[idx], maLo: e.target.value }; setChiTietRows(next); }} />
                      )}
                    </td>
                    <td>{(row.thanhTien || (row.soLuong || 0) * (row.donGia || 0)).toLocaleString()}</td>
                    <td><button type="button" onClick={() => { const next = chiTietRows.filter((_, i) => i !== idx); setChiTietRows(next); }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setChiTietRows(prev => ([...prev, { maSP: '', tenSP: '', soLuong: 1, donGia: 0, maLo: '', thanhTien: 0 }]))}>+ Thêm hàng</button>
              <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                Tổng: {chiTietRows.reduce((s, r) => s + ((r.soLuong || 0) * (r.donGia || 0)), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="tao-don-buttons">
            <button className="cancel-btn" onClick={() => nav(-1)}>Hủy</button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Tạo đơn đặt hàng'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
