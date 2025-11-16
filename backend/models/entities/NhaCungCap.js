const DiaChi = require('../embedded/DiaChi');
const LienHe = require('../embedded/LienHe');

/**
 * Entity: NhaCungCap (OrientDB class: NhaCungCap)
 * Properties:
 *  - maNCC STRING (required, code)
 *  - tenNCC STRING (required)
 *  - diaChi EMBEDDED DiaChi
 *  - lienHe EMBEDDED LienHe
 *  - trangThai STRING
 *  - ngayHopTac DATE
 *  - danhSachSanPham LINKLIST SanPham (optional)
 */
class NhaCungCap {
  /**
   * @param {Object} props
   */
  constructor({ maNCC = '', tenNCC = '', diaChi = {}, lienHe = {}, trangThai = 'hoạt_động', ngayHopTac = null, danhSachSanPham = [] } = {}) {
    this['@class'] = 'NhaCungCap';
    this.maNCC = String(maNCC || '');
    this.tenNCC = String(tenNCC || '');
    this.diaChi = diaChi instanceof DiaChi ? diaChi : new DiaChi(diaChi);
    this.lienHe = lienHe instanceof LienHe ? lienHe : new LienHe(lienHe);
    this.trangThai = String(trangThai || 'hoạt_động');
    this.ngayHopTac = ngayHopTac ? new Date(ngayHopTac) : null;
    this.danhSachSanPham = Array.isArray(danhSachSanPham) ? danhSachSanPham : [];
  }

  validate() {
    const errors = [];
    if (!this.maNCC) errors.push('maNCC required');
    if (this.maNCC && !/^[A-Za-z0-9_-]{3,30}$/.test(this.maNCC)) errors.push('maNCC format invalid');
    if (!this.tenNCC) errors.push('tenNCC required');
    const lienHeErrors = this.lienHe?.validate ? this.lienHe.validate() : [];
    return errors.concat(lienHeErrors);
  }
}

module.exports = NhaCungCap;
