/**
 * Entity: KhuKho
 * Properties:
 *  - maKhu STRING (required)
 *  - tenKhu STRING
 *  - loaiHang STRING
 *  - dungTich DOUBLE
 *  - trangThai STRING
 *  - kho LINK Kho
 */
class KhuKho {
  constructor({ maKhu = '', tenKhu = '', loaiHang = '', dungTich = 0, trangThai = 'hoạt_động', kho = null } = {}) {
    this['@class'] = 'KhuKho';
    this.maKhu = String(maKhu || '');
    this.tenKhu = String(tenKhu || '');
    this.loaiHang = String(loaiHang || '');
    this.dungTich = Number(dungTich || 0);
    this.trangThai = String(trangThai || 'hoạt_động');
    this.kho = kho;
  }

  validate() {
    const errors = [];
    if (!this.maKhu) errors.push('maKhu required');
    if (this.maKhu && !/^[A-Za-z0-9_-]{2,30}$/.test(this.maKhu)) errors.push('maKhu invalid');
    return errors;
  }
}

module.exports = KhuKho;