const DiaChi = require('../embedded/DiaChi');

/**
 * Entity: Kho
 * Properties:
 *  - maKho STRING (required)
 *  - tenKho STRING
 *  - loaiKho STRING
 *  - diaChi EMBEDDED DiaChi
 *  - kinhDo DOUBLE
 *  - viDo DOUBLE
 *  - dungTich DOUBLE
 *  - trangThai STRING
 */
class Kho {
  constructor({ maKho = '', tenKho = '', loaiKho = 'kho_chinh', diaChi = {}, kinhDo = null, viDo = null, dungTich = 0, trangThai = 'hoạt_động' } = {}) {
    this['@class'] = 'Kho';
    this.maKho = String(maKho || '');
    this.tenKho = String(tenKho || '');
    this.loaiKho = String(loaiKho || 'kho_chinh');
    this.diaChi = diaChi instanceof DiaChi ? diaChi : new DiaChi(diaChi);
    this.kinhDo = kinhDo == null ? null : Number(kinhDo);
    this.viDo = viDo == null ? null : Number(viDo);
    this.dungTich = Number(dungTich || 0);
    this.trangThai = String(trangThai || 'hoạt_động');
  }

  validate() {
    const errors = [];
    if (!this.maKho) errors.push('maKho required');
    if (this.maKho && !/^[A-Za-z0-9_-]{2,30}$/.test(this.maKho)) errors.push('maKho invalid');
    if (!this.tenKho) errors.push('tenKho required');
    return errors;
  }
}

module.exports = Kho;
