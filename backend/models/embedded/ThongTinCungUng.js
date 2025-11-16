/**
 * Embedded class: ThongTinCungUng (supplier info for a product)
 * @typedef {Object} ThongTinCungUngProps
 * @property {string|Object} nhaCungCap  // LINK or identifier
 * @property {number} giaNhap
 * @property {Date|string} thoiGianCapNhat
 */

class ThongTinCungUng {
  /** @param {ThongTinCungUngProps} props */
  constructor({ nhaCungCap = null, giaNhap = 0, thoiGianCapNhat = null } = {}) {
    this.nhaCungCap = nhaCungCap;
    this.giaNhap = typeof giaNhap === 'number' ? giaNhap : Number(giaNhap || 0);
    this.thoiGianCapNhat = thoiGianCapNhat ? new Date(thoiGianCapNhat) : null;
  }

  validate() {
    const errors = [];
    if (this.giaNhap != null && (typeof this.giaNhap !== 'number' || Number.isNaN(this.giaNhap))) errors.push('giaNhap must be a number');
    return errors;
  }
}

module.exports = ThongTinCungUng;
