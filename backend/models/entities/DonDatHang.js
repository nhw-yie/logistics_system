/**
 * Entity: DonDatHang
 * Properties:
 *  - maDon STRING (required)
 *  - ngayLap DATE
 *  - ngayGiaoDuKien DATE
 *  - trangThai STRING
 *  - khoDat LINK Kho
 *  - khoNhan LINK Kho
 *  - nhaCungCap LINK NhaCungCap
 *  - tongTien DOUBLE
 */
class DonDatHang {
  constructor({ maDon = '', ngayLap = null, ngayGiaoDuKien = null, trangThai = 'đang_xử_lý', khoDat = null, khoNhan = null, nhaCungCap = null, tongTien = 0 } = {}) {
    this['@class'] = 'DonDatHang';
    this.maDon = String(maDon || '');
    this.ngayLap = ngayLap ? new Date(ngayLap) : null;
    this.ngayGiaoDuKien = ngayGiaoDuKien ? new Date(ngayGiaoDuKien) : null;
    this.trangThai = String(trangThai || 'đang_xử_lý');
    this.khoDat = khoDat;
    this.khoNhan = khoNhan;
    this.nhaCungCap = nhaCungCap;
    this.tongTien = Number(tongTien || 0);
  }

  validate() {
    const errors = [];
    if (!this.maDon) errors.push('maDon required');
    if (this.maDon && !/^[A-Za-z0-9_-]{3,40}$/.test(this.maDon)) errors.push('maDon invalid');
    return errors;
  }
}

module.exports = DonDatHang;