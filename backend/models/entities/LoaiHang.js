// Entity: LoaiHang
// Schema:
//  - maLoai STRING
//  - tenLoai STRING
//  - moTa STRING
//  - YC_NhietDo STRING
//  - YC_Khac STRING

class LoaiHang {
  constructor({ maLoai = '', tenLoai = '', moTa = '', YC_NhietDo = '', YC_Khac = '' } = {}) {
    this['@class'] = 'LoaiHang';
    this.maLoai = String(maLoai || '');
    this.tenLoai = String(tenLoai || '');
    this.moTa = String(moTa || '');
    this.YC_NhietDo = String(YC_NhietDo || '');
    this.YC_Khac = String(YC_Khac || '');
  }

  validate() {
    const errors = [];
    if (!this.maLoai) errors.push('maLoai required');
    if (!this.tenLoai) errors.push('tenLoai required');
    return errors;
  }
}

module.exports = LoaiHang;
