const ThongTinCungUng = require('../embedded/ThongTinCungUng');

/**
 * Entity: SanPham (OrientDB class: SanPham)
 * Properties:
 *  - maSP STRING (required)
 *  - tenSP STRING (required)
 *  - danhMuc LINK DanhMuc (optional)
 *  - donViTinh STRING
 *  - giaBan DOUBLE
 *  - trangThai STRING
 *  - cungUng EMBEDDEDLIST ThongTinCungUng
 */
class SanPham {
  /** @param {Object} props */
  constructor({ maSP = '', tenSP = '', danhMuc = null, donViTinh = '', giaBan = 0, trangThai = 'con_hang', cungUng = [] } = {}) {
    this['@class'] = 'SanPham';
    this.maSP = String(maSP || '');
    this.tenSP = String(tenSP || '');
    this.danhMuc = danhMuc;
    this.donViTinh = String(donViTinh || '');
    this.giaBan = typeof giaBan === 'number' ? giaBan : Number(giaBan || 0);
    this.trangThai = String(trangThai || 'con_hang');
    this.cungUng = (Array.isArray(cungUng) ? cungUng : []).map((c) => (c instanceof ThongTinCungUng ? c : new ThongTinCungUng(c)));
  }

  validate() {
    const errors = [];
    if (!this.maSP) errors.push('maSP required');
    if (this.maSP && !/^[A-Za-z0-9_-]{2,30}$/.test(this.maSP)) errors.push('maSP invalid');
    if (!this.tenSP) errors.push('tenSP required');
    if (typeof this.giaBan !== 'number' || Number.isNaN(this.giaBan)) errors.push('giaBan must be number');
    return errors;
  }
}

module.exports = SanPham;
