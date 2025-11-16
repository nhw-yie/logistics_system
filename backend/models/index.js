// Convenience exporter for models (embedded / entities / edges)
module.exports = {
  // embedded
  DiaChi: require('./embedded/DiaChi'),
  LienHe: require('./embedded/LienHe'),
  ThongTinCungUng: require('./embedded/ThongTinCungUng'),
  ChiTietPhieu: require('./embedded/ChiTietPhieu'),

  // entities
  NhaCungCap: require('./entities/NhaCungCap'),
  DanhMuc: require('./entities/DanhMuc'),
  SanPham: require('./entities/SanPham'),
  LoaiHang: require('./entities/LoaiHang'),
  NhanVien: require('./entities/NhanVien'),
  TaiXe: require('./entities/TaiXe'),
  XeTai: require('./entities/XeTai'),
  Kho: require('./entities/Kho'),
  KhuKho: require('./entities/KhuKho'),
  ChiNhanh: require('./entities/ChiNhanh'),
  LoHang: require('./entities/LoHang'),
  TonKho: require('./entities/TonKho'),
  DonDatHang: require('./entities/DonDatHang'),
  PhieuNhap: require('./entities/PhieuNhap'),
  PhieuXuat: require('./entities/PhieuXuat'),
  PhieuHoan: require('./entities/PhieuHoan'),
  HoaDonMua: require('./entities/HoaDonMua'),
  HopDong: require('./entities/HopDong'),
  BaoCao: require('./entities/BaoCao'),
  TuyenDuong: require('./entities/TuyenDuong'),
  VanChuyen: require('./entities/VanChuyen'),

  // edges
  LAM_VIEC_TAI: require('./edge/LAM_VIEC_TAI'),
  PhanPhoi: require('./edge/PhanPhoi'),
  SHIPS_TO: require('./edge/SHIPS_TO'),
  ChiNhanh_SP: require('./edge/ChiNhanh_SP'),
  Loctate_in: require('./edge/Loctate_in'),
};