const ChiTietPhieu = require('../embedded/ChiTietPhieu');

/**
 * Entity: PhieuHoan
 * Properties:
 *  - maPhieu STRING
 *  - ngayHoan DATE
 *  - khoHoan LINK Kho
 *  - hoanVe LINK Kho
 *  - chiTiet EMBEDDEDLIST ChiTietPhieu
 *  - ghiChu STRING
 */
class PhieuHoan {
  constructor({ maPhieu = '', ngayHoan = null, khoHoan = null, hoanVe = null, chiTiet = [], ghiChu = '' } = {}) {
    this['@class'] = 'PhieuHoan';
    this.maPhieu = String(maPhieu || '');
    this.ngayHoan = ngayHoan ? new Date(ngayHoan) : null;
    this.khoHoan = khoHoan;
    this.hoanVe = hoanVe;
    this.chiTiet = (Array.isArray(chiTiet) ? chiTiet : []).map((c) => (c instanceof ChiTietPhieu ? c : new ChiTietPhieu(c)));
    this.ghiChu = String(ghiChu || '');
  }

  validate() {
    const errors = [];
    if (!this.maPhieu) errors.push('maPhieu required');
    return errors;
  }
}

module.exports = PhieuHoan;