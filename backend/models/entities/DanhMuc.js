/**
 * Entity: DanhMuc
 * Properties:
 *  - maDanhMuc STRING (required)
 *  - tenDanhMuc STRING (required)
 *  - moTa STRING
 */
class DanhMuc {
  constructor({ maDanhMuc = '', tenDanhMuc = '', moTa = '' } = {}) {
    this['@class'] = 'DanhMuc';
    this.maDanhMuc = String(maDanhMuc || '');
    this.tenDanhMuc = String(tenDanhMuc || '');
    this.moTa = String(moTa || '');
  }

  validate() {
    const errors = [];
    if (!this.maDanhMuc) errors.push('maDanhMuc required');
    if (this.maDanhMuc && !/^[A-Za-z0-9_-]{2,30}$/.test(this.maDanhMuc)) errors.push('maDanhMuc invalid');
    if (!this.tenDanhMuc) errors.push('tenDanhMuc required');
    return errors;
  }
}

module.exports = DanhMuc;