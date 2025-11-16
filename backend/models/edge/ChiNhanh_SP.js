// Edge: ChiNhanh_SP
// Properties:
//  - trangThai STRING

class ChiNhanh_SP {
  constructor({ trangThai = 'con_hang' } = {}) {
    this['@class'] = 'ChiNhanh_SP';
    this.trangThai = String(trangThai || '');
  }

  validate() {
    return [];
  }
}

module.exports = ChiNhanh_SP;
