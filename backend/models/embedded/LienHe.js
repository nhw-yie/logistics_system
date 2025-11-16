/**
 * Embedded class: LienHe (contact information)
 * @typedef {Object} LienHeProps
 * @property {string} nguoiLienHe
 * @property {string} sdt
 * @property {string} email
 */

class LienHe {
  /** @param {LienHeProps} props */
  constructor({ nguoiLienHe = '', sdt = '', email = '' } = {}) {
    this.nguoiLienHe = String(nguoiLienHe || '');
    this.sdt = String(sdt || '');
    this.email = String(email || '');
  }

  validate() {
    const errors = [];
    if (this.sdt && !/^[0-9+()\-\s]{6,20}$/.test(this.sdt)) errors.push('sdt invalid');
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) errors.push('email invalid');
    return errors;
  }
}

module.exports = LienHe;
