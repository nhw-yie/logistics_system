const NhanVien = require('./NhanVien');

/**
 * Entity: TaiXe (extends NhanVien semantics)
 * Properties:
 *  - inherits NhanVien
 *  - soGPLX STRING
 *  - loaiXe STRING
 */
class TaiXe extends NhanVien {
  constructor(props = {}) {
    super(props);
    this['@class'] = 'TaiXe';
    this.soGPLX = String(props.soGPLX || '');
    this.loaiXe = String(props.loaiXe || '');
  }

  validate() {
    const errors = super.validate();
    // GPLX optional basic format
    if (this.soGPLX && !/^[A-Za-z0-9]{3,20}$/.test(this.soGPLX)) errors.push('soGPLX invalid');
    return errors;
  }
}

module.exports = TaiXe;