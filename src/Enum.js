'use strict';

class Enum {
  constructor(value) {
    this._value = value;
  }

  toString() {
    return this._value;
  }
}

module.exports = Enum;
