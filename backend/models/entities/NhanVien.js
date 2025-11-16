const LienHe = require('../embedded/LienHe');

/**
 * Entity: NhanVien
 * Properties:
 *  - maNV STRING (required)
 *  - hoTen STRING
 *  - chucVu STRING
 *  - boPhan STRING
 *  - ngayVaoLam DATE
 *  - lienHe EMBEDDED LienHe
 *  - trangThai STRING
 */
class NhanVien {
  constructor({ maNV = '', hoTen = '', chucVu = '', boPhan = '', ngayVaoLam = null, lienHe = {}, trangThai = 'dang_lam_viec' } = {}) {
    this['@class'] = 'NhanVien';
    this.maNV = String(maNV || '');
    this.hoTen = String(hoTen || '');
    this.chucVu = String(chucVu || '');
    this.boPhan = String(boPhan || '');
    this.ngayVaoLam = ngayVaoLam ? new Date(ngayVaoLam) : null;
    this.lienHe = lienHe instanceof LienHe ? lienHe : new LienHe(lienHe);
    this.trangThai = String(trangThai || 'dang_lam_viec');
  }

  validate() {
    const errors = [];
    if (!this.maNV) errors.push('maNV required');
    if (this.maNV && !/^[A-Za-z0-9_-]{2,30}$/.test(this.maNV)) errors.push('maNV invalid');
    return errors.concat(this.lienHe?.validate ? this.lienHe.validate() : []);
  }
}

module.exports = NhanVien;