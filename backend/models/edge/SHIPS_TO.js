// Edge: SHIPS_TO (NCC -> Kho)
// Properties:
//  - khoangCach DOUBLE
//  - thoiGianCho DOUBLE
//  - trangThai STRING
//  - phiVanChuyen DOUBLE
//  - tanSuat STRING

class SHIPS_TO {
  constructor({ khoangCach = 0, thoiGianCho = 0, trangThai = '', phiVanChuyen = 0, tanSuat = '' } = {}) {
    this['@class'] = 'SHIPS_TO';
    this.khoangCach = Number(khoangCach || 0);
    this.thoiGianCho = Number(thoiGianCho || 0);
    this.trangThai = String(trangThai || '');
    this.phiVanChuyen = Number(phiVanChuyen || 0);
    this.tanSuat = String(tanSuat || '');
  }

  validate() {
    return [];
  }
}

module.exports = SHIPS_TO;
