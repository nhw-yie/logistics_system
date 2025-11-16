/**
 * Embedded class: DiaChi
 * @typedef {Object} DiaChiProps
 * @property {string} soNha
 * @property {string} duong
 * @property {string} phuong
 * @property {string} quan
 * @property {string} thanhPho
 */

class DiaChi {
  /**
   * @param {DiaChiProps} props
   */
  constructor({ soNha = '', duong = '', phuong = '', quan = '', thanhPho = '' } = {}) {
    this.soNha = String(soNha || '');
    this.duong = String(duong || '');
    this.phuong = String(phuong || '');
    this.quan = String(quan || '');
    this.thanhPho = String(thanhPho || '');
  }

  validate() {
    const errors = [];
    // basic presence checks optional
    return errors;
  }
}

module.exports = DiaChi;
