// Entity: XeTai
// Schema fields (from DB):
//  - maXe STRING
//  - bienSo STRING
//  - hangXe STRING
//  - taiTrong DOUBLE
//  - tinhTrang STRING
//  - taiXeChinh LINK TaiXe
//  - ghiChu STRING
//  - viTriHienTai STRING
//  - kinhDo DOUBLE
//  - viDo DOUBLE
//  - khoHienTai LINK Kho

class XeTai {
  constructor({ maXe = '', bienSo = '', hangXe = '', taiTrong = 0, tinhTrang = 'hoạt_động', taiXeChinh = null, ghiChu = '', viTriHienTai = '', kinhDo = null, viDo = null, khoHienTai = null } = {}) {
    this['@class'] = 'XeTai';
    this.maXe = String(maXe || '');
    this.bienSo = String(bienSo || '');
    this.hangXe = String(hangXe || '');
    this.taiTrong = Number(taiTrong || 0);
    this.tinhTrang = String(tinhTrang || '');
    this.taiXeChinh = taiXeChinh; // LINK TaiXe
    this.ghiChu = String(ghiChu || '');
    this.viTriHienTai = String(viTriHienTai || '');
    this.kinhDo = kinhDo == null ? null : Number(kinhDo);
    this.viDo = viDo == null ? null : Number(viDo);
    this.khoHienTai = khoHienTai; // LINK Kho
  }

  validate() {
    const errors = [];
    if (!this.maXe) errors.push('maXe required');
    return errors;
  }
}

module.exports = XeTai;
