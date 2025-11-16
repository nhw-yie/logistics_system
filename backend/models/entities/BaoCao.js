/**
 * Entity: BaoCao
 * Properties:
 *  - maBaoCao STRING
 *  - loaiBaoCao STRING
 *  - thoiGianLap DATETIME
 *  - nguoiLap LINK NhanVien
 *  - doiTuongLienQuan LINK
 *  - duLieu EMBEDDEDLIST
 *  - ghiChu STRING
 */
class BaoCao {
  constructor({ maBaoCao = '', loaiBaoCao = '', thoiGianLap = null, nguoiLap = null, doiTuongLienQuan = null, duLieu = [], ghiChu = '' } = {}) {
    this['@class'] = 'BaoCao';
    this.maBaoCao = String(maBaoCao || '');
    this.loaiBaoCao = String(loaiBaoCao || '');
    this.thoiGianLap = thoiGianLap ? new Date(thoiGianLap) : null;
    this.nguoiLap = nguoiLap;
    this.doiTuongLienQuan = doiTuongLienQuan;
    this.duLieu = Array.isArray(duLieu) ? duLieu : [];
    this.ghiChu = String(ghiChu || '');
  }

  validate() {
    const errors = [];
    if (!this.maBaoCao) errors.push('maBaoCao required');
    return errors;
  }
}

module.exports = BaoCao;