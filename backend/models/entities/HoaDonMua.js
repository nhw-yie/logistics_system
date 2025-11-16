const ChiTietPhieu = require('../embedded/ChiTietPhieu');

/**
 * Entity: HoaDonMua
 * Properties:
 *  - maHoaDon STRING (required)
 *  - ngayLap DATE
 *  - nhaCungCap LINK NhaCungCap
 *  - phieuNhap LINK PhieuNhap
 *  - chiTiet EMBEDDEDLIST ChiTietPhieu
 *  - tongTien DOUBLE
 *  - thueVAT DOUBLE
 *  - giamGia DOUBLE
 *  - tongThanhToan DOUBLE
 *  - trangThai STRING
 *  - hinhThucThanhToan STRING
 *  - ghiChu STRING
 */
class HoaDonMua {
  constructor({ maHoaDon = '', ngayLap = null, nhaCungCap = null, phieuNhap = null, chiTiet = [], tongTien = 0, thueVAT = 0, giamGia = 0, tongThanhToan = 0, trangThai = 'chua_thanh_toan', hinhThucThanhToan = 'tien_mat', ghiChu = '' } = {}) {
    this['@class'] = 'HoaDonMua';
    this.maHoaDon = String(maHoaDon || '');
    this.ngayLap = ngayLap ? new Date(ngayLap) : null;
    this.nhaCungCap = nhaCungCap;
    this.phieuNhap = phieuNhap;
    this.chiTiet = (Array.isArray(chiTiet) ? chiTiet : []).map((c) => (c instanceof ChiTietPhieu ? c : new ChiTietPhieu(c)));
    this.tongTien = Number(tongTien || 0);
    this.thueVAT = Number(thueVAT || 0);
    this.giamGia = Number(giamGia || 0);
    this.tongThanhToan = Number(tongThanhToan || 0);
    this.trangThai = String(trangThai || 'chua_thanh_toan');
    this.hinhThucThanhToan = String(hinhThucThanhToan || 'tien_mat');
    this.ghiChu = String(ghiChu || '');
  }

  validate() {
    const errors = [];
    if (!this.maHoaDon) errors.push('maHoaDon required');
    return errors;
  }
}

module.exports = HoaDonMua;