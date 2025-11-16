/**
 * Edge: LAM_VIEC_TAI (EXTENDS E)
 * Use for graph relation: employee works at (linking V vertices)
 * Properties:
 *  - no specific properties by schema
 */
class LAM_VIEC_TAI {
  constructor(props = {}) {
    this['@class'] = 'LAM_VIEC_TAI';
    // edge properties placeholder
    Object.assign(this, props);
  }
}

module.exports = LAM_VIEC_TAI;