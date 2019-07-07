'use strict';

const ExtendableError = require('./ExtendableError');

class InvalidPrivateKey extends ExtendableError {}
class InvalidPermissionValue extends ExtendableError {}

module.exports = {
  ExtendableError,
  InvalidPrivateKey,
  InvalidPermissionValue,
};
