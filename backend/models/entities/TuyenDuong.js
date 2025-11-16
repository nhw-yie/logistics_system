// Entity: TuyenDuong
// Schema fields:
//  - maTuyen STRING
//  - diemDi LINK Kho
//  - diemDen LINK ChiNhanh
//  - cacDiemQua EMBEDDEDLIST STRING
//  - tongKhoangCach DOUBLE
//  - thoiGianDuKien DOUBLE
//  - trangThai STRING

class TuyenDuong {
  constructor({ maTuyen = '', diemDi = null, diemDen = null, cacDiemQua = [], tongKhoangCach = 0, thoiGianDuKien = 0, trangThai = 'hoạt_động' } = {}) {
    this['@class'] = 'TuyenDuong';
    this.maTuyen = String(maTuyen || '');
    this.diemDi = diemDi; // LINK Kho
    this.diemDen = diemDen; // LINK ChiNhanh
    this.cacDiemQua = Array.isArray(cacDiemQua) ? cacDiemQua.map(String) : [];
    this.tongKhoangCach = Number(tongKhoangCach || 0);
    this.thoiGianDuKien = Number(thoiGianDuKien || 0);
    this.trangThai = String(trangThai || '');
  }

  validate() {
    const errors = [];
    if (!this.maTuyen) errors.push('maTuyen required');
    return errors;
  }
}

module.exports = TuyenDuong;
