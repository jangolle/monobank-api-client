'use strict';

const fs = require('fs');
const asn1 = require('asn1.js');
const crypto = require('crypto');
const { InvalidPrivateKeyError } = require('./Error');

class Signer {
  constructor(privateKey, keyHeaderPattern = /EC PRIVATE KEY/) {
    let pkey;

    try {
      if (privateKey.match(keyHeaderPattern)) {
        pkey = privateKey;
      } else {
        fs.accessSync(privateKey, fs.constants.F_OK | fs.constants.R_OK);

        pkey = fs.readFileSync(privateKey, 'utf8');
      }
    } catch (err) {
      throw new InvalidPrivateKeyError(
        '"privateKey" must be valid ECDSA PEM string or valid path to readable PEM file',
      );
    }

    this._privateKey = crypto.createPrivateKey(pkey);

    this._ecdsaDerSigner = asn1.define('ECPrivateKey', function() {
      return this.seq().obj(this.key('r').int(), this.key('s').int());
    });
  }

  /**
   * Signs given data and return value represented as base64 string (Algorithm: "SHA256WithECDSA", Curve: "secp256k1")
   *
   * @param {*} data
   * @return {string}
   */
  sign(data) {
    const sha256Signer = crypto.createSign('sha256');

    return Buffer.from(this._ecdsa(data, sha256Signer)).toString('base64');
  }

  /**
   * @param {*} data
   * @param {crypto.Signer} signer
   * @return {Buffer}
   * @private
   */
  _ecdsa(data, signer) {
    signer.update(Buffer.isBuffer(data) ? data : Buffer.from(data));
    signer.end();

    const asn1SignatureBuffer = signer.sign(this._privateKey, 'buffer');
    const rsSignature = this._ecdsaDerSigner.decode(asn1SignatureBuffer, 'der');

    return Buffer.concat([rsSignature.r.toArrayLike(Buffer, 'be', 32), rsSignature.s.toArrayLike(Buffer, 'be', 32)]);
  }
}

module.exports = Signer;
