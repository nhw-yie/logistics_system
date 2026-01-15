import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ReportPage.css';

const ReportPage = () => {
  const [dateRange, setDateRange] = useState({
    tuNgay: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    denNgay: new Date().toISOString().split('T')[0]
  });
  
  const [groupBy, setGroupBy] = useState('ngay');
  const [selectedKho, setSelectedKho] = useState('');
  const [activeTab, setActiveTab] = useState('tong-quan');
  
  // Data states
  const [tongQuan, setTongQuan] = useState(null);
  const [phieuNhapData, setPhieuNhapData] = useState([]);
  const [phieuXuatData, setPhieuXuatData] = useState([]);
  const [topNhap, setTopNhap] = useState([]);
  const [topXuat, setTopXuat] = useState([]);
  const [xuatNhapTon, setXuatNhapTon] = useState([]);
  const [theoKho, setTheoKho] = useState([]);
  const [khoList, setKhoList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  useEffect(() => {
    fetchKhoList();
    fetchAllData();
  }, [dateRange, groupBy, selectedKho]);

  const fetchKhoList = async () => {
    try {
      const data = await apiGet('/kho/danh-sach');
      setKhoList(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách kho:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        tuNgay: dateRange.tuNgay,
        denNgay: dateRange.denNgay,
        groupBy: groupBy
      });

      if (selectedKho) {
        params.append('maKho', selectedKho);
      }

      const [
        tongQuanRes,
        phieuNhapRes,
        phieuXuatRes,
        topNhapRes,
        topXuatRes,
        xuatNhapTonRes,
        theoKhoRes
      ] = await Promise.all([
        apiGet(`/baocao/tong-quan?${params}`),
        apiGet(`/baocao/phieu-nhap?${params}`),
        apiGet(`/baocao/phieu-xuat?${params}`),
        apiGet(`/baocao/top-san-pham-nhap?${params}&limit=10`),
        apiGet(`/baocao/top-san-pham-xuat?${params}&limit=10`),
        apiGet(`/baocao/xuat-nhap-ton?${params}`),
        apiGet(`/baocao/theo-kho?${params}`)
      ]);

      setTongQuan(Array.isArray(tongQuanRes) ? tongQuanRes[0] : tongQuanRes);
      setPhieuNhapData(processTimeSeriesData(phieuNhapRes));
      setPhieuXuatData(processTimeSeriesData(phieuXuatRes));
      setTopNhap(topNhapRes);
      setTopXuat(topXuatRes);
      setXuatNhapTon(xuatNhapTonRes);
      setTheoKho(theoKhoRes);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu báo cáo: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data) => {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.thoiGian]) {
        grouped[item.thoiGian] = { thoiGian: item.thoiGian, total: 0 };
      }
      grouped[item.thoiGian].total += item.soPhieu || 0;
      grouped[item.thoiGian][item.tenKho || 'Unknown'] = item.soPhieu || 0;
    });
    return Object.values(grouped).sort((a, b) => a.thoiGian.localeCompare(b.thoiGian));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (groupBy === 'thang') {
      const [year, month] = dateStr.split('-');
      return `${month}/${year}`;
    }
    if (groupBy === 'nam') return dateStr;
    if (groupBy === 'tuan') {
      const [year, week] = dateStr.split('-');
      return `T${week}/${year}`;
    }
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="report-page">
      <div className="report-header">
        <h1>📊 Báo Cáo & Thống Kê</h1>
        
        <div className="report-filters">
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.tuNgay}
              onChange={(e) => setDateRange({ ...dateRange, tuNgay: e.target.value })}
            />
          </div>
          
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.denNgay}
              onChange={(e) => setDateRange({ ...dateRange, denNgay: e.target.value })}
            />
          </div>
          
          <div className="filter-group">
            <label>Nhóm theo:</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="ngay">Ngày</option>
              <option value="tuan">Tuần</option>
              <option value="thang">Tháng</option>
              <option value="nam">Năm</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Kho:</label>
            <select value={selectedKho} onChange={(e) => setSelectedKho(e.target.value)}>
              <option value="">Tất cả kho</option>
              {khoList.map(kho => (
                <option key={kho.maKho} value={kho.maKho}>{kho.tenKho}</option>
              ))}
            </select>
          </div>
          
          <button className="btn-refresh" onClick={fetchAllData}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={activeTab === 'tong-quan' ? 'active' : ''}
          onClick={() => setActiveTab('tong-quan')}
        >
          Tổng quan
        </button>
        <button
          className={activeTab === 'phieu-nhap' ? 'active' : ''}
          onClick={() => setActiveTab('phieu-nhap')}
        >
          Phiếu nhập
        </button>
        <button
          className={activeTab === 'phieu-xuat' ? 'active' : ''}
          onClick={() => setActiveTab('phieu-xuat')}
        >
          Phiếu xuất
        </button>
        <button
          className={activeTab === 'xuat-nhap-ton' ? 'active' : ''}
          onClick={() => setActiveTab('xuat-nhap-ton')}
        >
          Xuất nhập tồn
        </button>
        <button
          className={activeTab === 'theo-kho' ? 'active' : ''}
          onClick={() => setActiveTab('theo-kho')}
        >
          Theo kho
        </button>
      </div>

      {loading && <div className="loading">Đang tải dữ liệu...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && (
        <>
          {activeTab === 'tong-quan' && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📥</div>
                  <div className="stat-info">
                    <h3>Số phiếu nhập</h3>
                    <p className="stat-value">{formatNumber(tongQuan?.soPhieuNhap)}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📤</div>
                  <div className="stat-info">
                    <h3>Số phiếu xuất</h3>
                    <p className="stat-value">{formatNumber(tongQuan?.soPhieuXuat)}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>Tổng tồn kho</h3>
                    <p className="stat-value">{formatNumber(tongQuan?.tongTonKho)}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-info">
                    <h3>Lô cận date</h3>
                    <p className="stat-value warning">{formatNumber(tongQuan?.soLoCanDate)}</p>
                  </div>
                </div>
              </div>

              <div className="charts-row">
                <div className="chart-container">
                  <h3>Top 10 sản phẩm nhập nhiều nhất</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topNhap}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tenSP" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tongSoLuong" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                  <button className="btn-export" onClick={() => exportToCSV(topNhap, 'top_san_pham_nhap')}>
                    📥 Xuất CSV
                  </button>
                </div>

                <div className="chart-container">
                  <h3>Top 10 sản phẩm xuất nhiều nhất</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topXuat}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tenSP" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tongSoLuong" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                  <button className="btn-export" onClick={() => exportToCSV(topXuat, 'top_san_pham_xuat')}>
                    📥 Xuất CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phieu-nhap' && (
            <div className="tab-content">
              <div className="chart-container full-width">
                <h3>Biểu đồ phiếu nhập theo thời gian</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={phieuNhapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="thoiGian" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip labelFormatter={formatDate} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#0088FE" name="Tổng phiếu" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <button className="btn-export" onClick={() => exportToCSV(phieuNhapData, 'phieu_nhap')}>
                  📥 Xuất CSV
                </button>
              </div>
            </div>
          )}

          {activeTab === 'phieu-xuat' && (
            <div className="tab-content">
              <div className="chart-container full-width">
                <h3>Biểu đồ phiếu xuất theo thời gian</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={phieuXuatData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="thoiGian" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip labelFormatter={formatDate} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#00C49F" name="Tổng phiếu" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <button className="btn-export" onClick={() => exportToCSV(phieuXuatData, 'phieu_xuat')}>
                  📥 Xuất CSV
                </button>
              </div>
            </div>
          )}

          {activeTab === 'xuat-nhap-ton' && (
            <div className="tab-content">
              <div className="table-container">
                <h3>Báo cáo xuất nhập tồn</h3>
                <button className="btn-export" onClick={() => exportToCSV(xuatNhapTon, 'xuat_nhap_ton')}>
                  📥 Xuất CSV
                </button>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Mã SP</th>
                      <th>Tên sản phẩm</th>
                      <th>ĐVT</th>
                      <th>Số lượng nhập</th>
                      <th>Số lượng xuất</th>
                      <th>Tồn hiện tại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {xuatNhapTon.map((item, index) => (
                      <tr key={index}>
                        <td>{item.maSP}</td>
                        <td>{item.tenSP}</td>
                        <td>{item.donViTinh}</td>
                        <td className="number">{formatNumber(item.soLuongNhap || 0)}</td>
                        <td className="number">{formatNumber(item.soLuongXuat || 0)}</td>
                        <td className="number">{formatNumber(item.tonHienTai || 0)}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}

{activeTab === 'theo-kho' && (
        <div className="tab-content">
          <div className="table-container">
            <h3>Báo cáo theo kho</h3>
            <button className="btn-export" onClick={() => exportToCSV(theoKho, 'bao_cao_theo_kho')}>
              📥 Xuất CSV
            </button>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Mã kho</th>
                  <th>Tên kho</th>
                  <th>Loại kho</th>
                  <th>Số phiếu nhập</th>
                  <th>Số phiếu xuất</th>
                  <th>Tồn hiện tại</th>
                </tr>
              </thead>
              <tbody>
                {theoKho.map((item, index) => (
                  <tr key={index}>
                    <td>{item.maKho}</td>
                    <td>{item.tenKho}</td>
                    <td>{item.loaiKho}</td>
                    <td className="number">{formatNumber(item.soPhieuNhap || 0)}</td>
                    <td className="number">{formatNumber(item.soPhieuXuat || 0)}</td>
                    <td className="number">{formatNumber(item.tonHienTai || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-container">
            <h3>Phân bố phiếu nhập theo kho</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={theoKho}
                  dataKey="soPhieuNhap"
                  nameKey="tenKho"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {theoKho.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  )}
</div>

);
};
export default ReportPage;