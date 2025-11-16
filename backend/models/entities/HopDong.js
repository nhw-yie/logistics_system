/**
 * Entity: HopDong
 * Properties:
 *  - maHopDong STRING
 *  - nhaCungCap LINK NhaCungCap
 *  - ngayKy DATE
 *  - ngayHetHan DATE
 *  - giaTri DOUBLE
 *  - trangThai STRING
 *  - noiDung EMBEDDEDMAP
 *  - fileDinhKem EMBEDDEDLIST
 */
class HopDong {
  constructor({ maHopDong = '', nhaCungCap = null, ngayKy = null, ngayHetHan = null, giaTri = 0, trangThai = 'hieu_luc', noiDung = {}, fileDinhKem = [] } = {}) {
    this['@class'] = 'HopDong';
    this.maHopDong = String(maHopDong || '');
    this.nhaCungCap = nhaCungCap;
    this.ngayKy = ngayKy ? new Date(ngayKy) : null;
    this.ngayHetHan = ngayHetHan ? new Date(ngayHetHan) : null;
    this.giaTri = Number(giaTri || 0);
    this.trangThai = String(trangThai || 'hieu_luc');
    this.noiDung = typeof noiDung === 'object' ? noiDung : {};
    this.fileDinhKem = Array.isArray(fileDinhKem) ? fileDinhKem : [];
  }

  validate() {
    const errors = [];
    if (!this.maHopDong) errors.push('maHopDong required');
    return errors;
  }
}

module.exports = HopDong;