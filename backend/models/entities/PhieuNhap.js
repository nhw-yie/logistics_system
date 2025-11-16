const ChiTietPhieu = require('../embedded/ChiTietPhieu');

/**
 * Entity: PhieuNhap
 * Properties:
 *  - maPhieu STRING (required)
 *  - ngayNhap DATE
 *  - kho LINK Kho
 *  - chiTiet EMBEDDEDLIST ChiTietPhieu
 *  - ghiChu STRING
 */
class PhieuNhap {
  constructor({ maPhieu = '', ngayNhap = null, kho = null, chiTiet = [], ghiChu = '' } = {}) {
    this['@class'] = 'PhieuNhap';
    this.maPhieu = String(maPhieu || '');
    this.ngayNhap = ngayNhap ? new Date(ngayNhap) : null;
    this.kho = kho;
    this.chiTiet = (Array.isArray(chiTiet) ? chiTiet : []).map((c) => (c instanceof ChiTietPhieu ? c : new ChiTietPhieu(c)));
    this.ghiChu = String(ghiChu || '');
  }

  validate() {
    const errors = [];
    if (!this.maPhieu) errors.push('maPhieu required');
    return errors;
  }
}

module.exports = PhieuNhap;