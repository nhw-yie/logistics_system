// Edge: Loctate_in (LoHang -> Kho/ChiNhanh)
// No special properties in schema beyond edge identity

class Loctate_in {
  constructor(props = {}) {
    this['@class'] = 'Loctate_in';
    Object.assign(this, props);
  }

  validate() {
    return [];
  }
}

module.exports = Loctate_in;
