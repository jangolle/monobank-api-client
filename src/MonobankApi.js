'use strict';

const axios = require('axios');
const Endpoint = require('./Endpoint');
const Transaction = require('./ValueObject/Transaction');
const CurrencyInfo = require('./ValueObject/CurrencyInfo');
const Account = require('./ValueObject/Account');
const UserInfo = require('./ValueObject/UserInfo');

const BASE_URL = 'https://api.monobank.ua';
const TIMEOUT = 1000;

class MonobankApi {
  /**
   * @param {string} token
   * @param {string} baseURL
   * @param {int} timeout
   */
  constructor({ token, baseURL = BASE_URL, timeout = TIMEOUT }) {
    this._client = axios.create({
      baseURL,
      headers: {
        'X-Token': token,
      },
      timeout: TIMEOUT,
    });
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
   * @param {Date} to
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

module.exports = MonobankApi;
