/**
 * Edge: PhanPhoi EXTENDS E
 * Properties:
 *  - khoangCach DOUBLE
 *  - thoiGian DOUBLE
 *  - trangThai STRING
 */
class PhanPhoi {
  constructor({ khoangCach = 0, thoiGian = 0, trangThai = '' } = {}) {
    this['@class'] = 'PhanPhoi';
    this.khoangCach = Number(khoangCach || 0);
    this.thoiGian = Number(thoiGian || 0);
    this.trangThai = String(trangThai || '');
  }
}

module.exports = PhanPhoi;