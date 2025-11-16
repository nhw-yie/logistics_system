/**
 * Entity: LoHang
 * Properties:
 *  - maLo STRING (required)
 *  - sanPham LINK SanPham
 *  - ngaySanXuat DATE
 *  - hanSuDung DATE
 *  - soLuong INTEGER
 *  - khuKho LINK KhuKho
 *  - trangThai STRING
 */
class LoHang {
  constructor({ maLo = '', sanPham = null, ngaySanXuat = null, hanSuDung = null, soLuong = 0, khuKho = null, trangThai = 'còn_hạn' } = {}) {
    this['@class'] = 'LoHang';
    this.maLo = String(maLo || '');
    this.sanPham = sanPham;
    this.ngaySanXuat = ngaySanXuat ? new Date(ngaySanXuat) : null;
    this.hanSuDung = hanSuDung ? new Date(hanSuDung) : null;
    this.soLuong = Number.isInteger(soLuong) ? soLuong : Math.round(Number(soLuong || 0));
    this.khuKho = khuKho;
    this.trangThai = String(trangThai || 'còn_hạn');
  }

  validate() {
    const errors = [];
    if (!this.maLo) errors.push('maLo required');
    if (!this.sanPham) errors.push('sanPham required');
    return errors;
  }
}

module.exports = LoHang;