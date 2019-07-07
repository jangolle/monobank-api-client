'use strict';

const Signer = require('./Signer');
const MonobankApi = require('./MonobankApi');
const MonobankCorporateApi = require('./MonobankCorporateApi');

const BASE_URL = 'https://api.monobank.ua';
const TIMEOUT = 1000;

class ClientFactory {
  /**
   *
   * @param {string} token
   * @param {string=} baseURL
   * @param {int=} timeout
   * @return {MonobankApi}
   */
  static createPersonal(token, baseURL = BASE_URL, timeout = TIMEOUT) {
    return new MonobankApi({ token, baseURL, timeout });
  }

  /**
   * @param {string} keyId
   * @param {string} privateKey
   * @param {string=} baseURL
   * @param {int=} timeout
   * @return {MonobankCorporateApi}
   */
  static createCorporate(keyId, privateKey, baseURL = BASE_URL, timeout = TIMEOUT) {
    return new MonobankCorporateApi({ keyId, signer: new Signer(privateKey), baseURL, timeout });
  }
}

module.exports = ClientFactory;
