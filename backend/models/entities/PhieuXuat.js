const ChiTietPhieu = require('../embedded/ChiTietPhieu');

/**
 * Entity: PhieuXuat
 * Properties:
 *  - maPhieu STRING (required)
 *  - ngayXuat DATE
 *  - kho LINK Kho
 *  - chiTiet EMBEDDEDLIST ChiTietPhieu
 *  - xuatDen LINK Kho
 *  - ghiChu STRING
 */
class PhieuXuat {
  constructor({ maPhieu = '', ngayXuat = null, kho = null, chiTiet = [], xuatDen = null, ghiChu = '' } = {}) {
    this['@class'] = 'PhieuXuat';
    this.maPhieu = String(maPhieu || '');
    this.ngayXuat = ngayXuat ? new Date(ngayXuat) : null;
    this.kho = kho;
    this.chiTiet = (Array.isArray(chiTiet) ? chiTiet : []).map((c) => (c instanceof ChiTietPhieu ? c : new ChiTietPhieu(c)));
    this.xuatDen = xuatDen;
    this.ghiChu = String(ghiChu || '');
  }

  validate() {
    const errors = [];
    if (!this.maPhieu) errors.push('maPhieu required');
    return errors;
  }
}

module.exports = PhieuXuat;