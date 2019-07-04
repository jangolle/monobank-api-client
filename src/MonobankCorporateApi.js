'use strict';

const axios = require('axios');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const rsa = require('rsa-key');
const Endpoint = require('./Endpoint');
const Transaction = require('./ValueObject/Transaction');
const CurrencyInfo = require('./ValueObject/CurrencyInfo');
const Account = require('./ValueObject/Account');
const UserInfo = require('./ValueObject/UserInfo');

const BASE_URL = 'https://api.monobank.ua';
const TIMEOUT = 1000;

class MonobankCorporateApi {
  /**
   * @param {string} privateKey
   * @param {string} keyId
   * @param {string} baseURL
   * @param {int} timeout
   */
  constructor({ privateKey, keyId, baseURL = BASE_URL, timeout = TIMEOUT }) {
    this._client = axios.create({
      baseURL,
      headers: {
        'X-Key-Id': keyId,
      },
      timeout: TIMEOUT,
    });

    this._privateKey = privateKey;
    this._currencyToAccountIdsMap = {};
  }

  async getAccessRequest({ permissions }) {
    const endpoint = Endpoint.PERSONAL_AUTH_REQUEST;
    const time = Math.floor(new Date().getTime() / 1000) + '';
    const signer = crypto.createSign('sha256');
    const key = new rsa(this._privateKey);
    console.log(key.getType());

    const sign = 42;
    // const sign = this._ec.sign(time + permissions + endpoint, key, 'sha256');

    console.log(sign);

    const xSign = Buffer.from(sign).toString('base64');

    console.log(xSign);

    // const response = await this._callEndpoint({
    //   method: 'POST',
    //   endpoint,
    //   headers: {
    //     'X-Time': time,
    //     'X-Permissions': permissions,
    //     'X-Sign': xSign,
    //   },
    // });
    //
    // console.log(response);
  }

  /**
   * @returns {Promise<CurrencyInfo[]>}
   */
  async getCurrencyList() {
    try {
      const { data } = await this._callEndpoint({
        method: 'GET',
        endpoint: Endpoint.CURRENCY_LIST,
      });

      return data.map(v => new CurrencyInfo(v));
    } catch (err) {
      if (err.isAxiosError) {
        throw new Error(err.response.data.errorDescription || 'Undefined API error');
      }
    }
  }

  /**
   * @returns {Promise<UserInfo>}
   */
  async getUserInfo() {
    try {
      const { data } = await this._callEndpoint({
        method: 'GET',
        endpoint: Endpoint.CLIENT_INFO,
      });

      const { name, accounts } = data;

      return new UserInfo({ name, accounts: accounts.map(v => new Account(v)) });
    } catch (err) {
      if (err.isAxiosError) {
        throw new Error(err.response.data.errorDescription || 'Undefined API error');
      }
    }
  }

  /**
   * @param {string} account
   * @param {Date} from
   * @param {Date=} to
   * @returns {Promise<Transaction[]>}
   */
  async getStatement({ account, from, to }) {
    try {
      const { data } = await this._callEndpoint({
        method: 'GET',
        endpoint: Endpoint.ACCOUNT_STATEMENT.replace('{account}', account)
          .replace('{from}', Math.floor(from.getTime() / 1000))
          .replace('{to}', Math.floor((to ? to.getTime() : new Date().getTime()) / 1000)),
      });

      return data.map(v => new Transaction(v));
    } catch (err) {
      if (err.isAxiosError) {
        throw new Error(err.response.data.errorDescription || 'Undefined API error');
      }
    }
  }

  /**
   * @param {string} currencyCode according to ISO 3166-1 alpha-3
   * @param {Date} from
   * @param {Date=} to
   * @returns {Promise<Transaction[]>}
   */
  async getStatementByCurrencyCode({ currencyCode, from, to }) {
    try {
      const { accounts } = await this.getUserInfo();

      if (!this._currencyToAccountIdsMap[currencyCode]) {
        accounts.forEach(acc => {
          this._currencyToAccountIdsMap[acc.currencyCode.code] = acc.id;
        });
      }

      if (!this._currencyToAccountIdsMap[currencyCode]) {
        throw new Error(`There is no account for currencyCode "${currencyCode}"`);
      }

      return this.getStatement({ account: this._currencyToAccountIdsMap[currencyCode], from, to });
    } catch (err) {
      if (err.isAxiosError) {
        throw new Error(err.response.data.errorDescription || 'Undefined API error');
      }

      throw err;
    }
  }

  /**
   * @param {string} method
   * @param {string} endpoint
   * @param {object} headers
   * @param {object} body
   * @returns {Promise<AxiosResponse<T>>}
   * @private
   */
  _callEndpoint({ method, endpoint, headers, body }) {
    return this._client.request({
      method,
      url: endpoint,
      headers,
      body,
    });
  }
}

module.exports = MonobankCorporateApi;
