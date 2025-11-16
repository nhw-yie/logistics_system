/**
 * Entity: TonKho
 * Properties:
 *  - diaDiem LINK (Kho | ChiNhanh) (required)
 *  - sanPham LINK SanPham (required)
 *  - soLuong INTEGER
 *  - nguongCanhBao INTEGER
 *  - soLuongToiDa INTEGER
 *  - kieuNhapCoDinh STRING
 *  - trangThai STRING
 */
class TonKho {
  constructor({ diaDiem = null, sanPham = null, soLuong = 0, nguongCanhBao = null, soLuongToiDa = null, kieuNhapCoDinh = null, trangThai = 'ổn_định' } = {}) {
    this['@class'] = 'TonKho';
    this.diaDiem = diaDiem; // LINK to Kho or ChiNhanh
    this.sanPham = sanPham; // LINK to SanPham
    this.soLuong = Number.isInteger(soLuong) ? soLuong : Math.round(Number(soLuong || 0));
    this.nguongCanhBao = nguongCanhBao == null ? null : Number(nguongCanhBao);
    this.soLuongToiDa = soLuongToiDa == null ? null : Number(soLuongToiDa);
    this.kieuNhapCoDinh = kieuNhapCoDinh ? String(kieuNhapCoDinh) : null;
    this.trangThai = String(trangThai || 'ổn_định');
  }

  validate() {
    const errors = [];
    if (!this.diaDiem) errors.push('diaDiem required');
    if (!this.sanPham) errors.push('sanPham required');
    if (!Number.isInteger(this.soLuong)) errors.push('soLuong must be integer');
    return errors;
  }
}

module.exports = TonKho;
