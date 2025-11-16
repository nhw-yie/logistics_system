/**
 * Embedded class: ChiTietPhieu
 * @typedef {Object} ChiTietPhieuProps
 * @property {string|Object} sanPham  // LINK to SanPham
 * @property {number} soLuong
 * @property {number} donGia
 * @property {number} thanhTien
 * @property {string|Object} [loHang]
 * @property {Date|string} [hanSuDung]
 */

class ChiTietPhieu {
  /** @param {ChiTietPhieuProps} props */
  constructor({ sanPham = null, soLuong = 0, donGia = 0, thanhTien = null, loHang = null, hanSuDung = null } = {}) {
    this.sanPham = sanPham;
    this.soLuong = Number(soLuong || 0);
    this.donGia = Number(donGia || 0);
    this.thanhTien = thanhTien != null ? Number(thanhTien) : this.soLuong * this.donGia;
    this.loHang = loHang;
    this.hanSuDung = hanSuDung ? new Date(hanSuDung) : null;
  }

  validate() {
    const errors = [];
    if (!this.sanPham) errors.push('sanPham required');
    if (!Number.isInteger(this.soLuong) || this.soLuong < 0) errors.push('soLuong must be non-negative integer');
    if (typeof this.donGia !== 'number' || Number.isNaN(this.donGia)) errors.push('donGia must be number');
    return errors;
  }
}

module.exports = ChiTietPhieu;
