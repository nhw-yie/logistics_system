const DiaChi = require('../embedded/DiaChi');
const LienHe = require('../embedded/LienHe');

/**
 * Entity: ChiNhanh
 * Properties:
 *  - maChiNhanh STRING (required)
 *  - tenChiNhanh STRING
 *  - diaChi EMBEDDED DiaChi
 *  - lienHe EMBEDDED LienHe
 *  - quanLy LINK NhanVien (optional)
 *  - kinhDo DOUBLE
 *  - viDo DOUBLE
 *  - trangThai STRING
 */
class ChiNhanh {
  constructor({ maChiNhanh = '', tenChiNhanh = '', diaChi = {}, lienHe = {}, quanLy = null, kinhDo = null, viDo = null, trangThai = 'hoạt_động' } = {}) {
    this['@class'] = 'ChiNhanh';
    this.maChiNhanh = String(maChiNhanh || '');
    this.tenChiNhanh = String(tenChiNhanh || '');
    this.diaChi = diaChi instanceof DiaChi ? diaChi : new DiaChi(diaChi);
    this.lienHe = lienHe instanceof LienHe ? lienHe : new LienHe(lienHe);
    this.quanLy = quanLy;
    this.kinhDo = kinhDo == null ? null : Number(kinhDo);
    this.viDo = viDo == null ? null : Number(viDo);
    this.trangThai = String(trangThai || 'hoạt_động');
  }

  validate() {
    const errors = [];
    if (!this.maChiNhanh) errors.push('maChiNhanh required');
    if (this.maChiNhanh && !/^[A-Za-z0-9_-]{2,30}$/.test(this.maChiNhanh)) errors.push('maChiNhanh invalid');
    if (!this.tenChiNhanh) errors.push('tenChiNhanh required');
    const lienHeErrors = this.lienHe?.validate ? this.lienHe.validate() : [];
    return errors.concat(lienHeErrors);
  }
}

module.exports = ChiNhanh;
