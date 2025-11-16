// Entity: VanChuyen
// Schema fields (OrientDB):
//  - maVanChuyen STRING
//  - taiXe LINK TaiXe
//  - xeTai LINK XeTai
//  - tuyenDuong LINK TuyenDuong
//  - ngayKhoiHanh DATE
//  - ngayDen DATE
//  - trangThai STRING
//  - diemDi STRING
//  - diemDen STRING

class VanChuyen {
  constructor({ maVanChuyen = '', taiXe = null, xeTai = null, tuyenDuong = null, ngayKhoiHanh = null, ngayDen = null, trangThai = 'dang_cho', diemDi = '', diemDen = '' } = {}) {
    this['@class'] = 'VanChuyen';
    this.maVanChuyen = String(maVanChuyen || '');
    this.taiXe = taiXe; // LINK TaiXe (RID or object)
    this.xeTai = xeTai; // LINK XeTai
    this.tuyenDuong = tuyenDuong; // LINK TuyenDuong
    this.ngayKhoiHanh = ngayKhoiHanh ? new Date(ngayKhoiHanh) : null;
    this.ngayDen = ngayDen ? new Date(ngayDen) : null;
    this.trangThai = String(trangThai || '');
    this.diemDi = String(diemDi || '');
    this.diemDen = String(diemDen || '');
  }

  validate() {
    const errors = [];
    if (!this.maVanChuyen) errors.push('maVanChuyen required');
    return errors;
  }
}

module.exports = VanChuyen;
