'use strict';

const Endpoint = require('./Endpoint');
const Transaction = require('./ValueObject/Transaction');
const CurrencyInfo = require('./ValueObject/CurrencyInfo');
const Account = require('./ValueObject/Account');
const UserInfo = require('./ValueObject/UserInfo');

class MonobankBaseApi {
  /**
   * @param {string} token
   * @param {string} baseURL
   * @param {int} timeout
   */
  constructor({ baseURL, timeout }) {
    if (this.constructor === MonobankBaseApi) {
      throw new Error('Base class cannot be constructed.');
    }

    this._clientOptions = { baseURL, timeout };
    this._currencyToAccountIdsMap = {};
  }

  /**
   * @param {{}=} headers
   * @returns {Promise<CurrencyInfo[]>}
   */
  async getCurrencyList(headers = {}) {
    try {
      const { data } = await this._callEndpoint({
        method: 'GET',
        headers,
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
   * @param {{}=} headers
   * @returns {Promise<UserInfo>}
   */
  async getUserInfo(headers = {}) {
    try {
      const { data } = await this._callEndpoint({
        method: 'GET',
        headers,
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
   * @param {string=} endpoint
   * @param {{}=} headers
   * @returns {Promise<Transaction[]>}
   */
  async getStatement({ account, from, to }, headers = {}) {
    try {
      const { data } = await this._callEndpoint({
        method: 'GET',
        headers,
        endpoint: this._buildStatementEndpoint(account, from, to || new Date()),
      });

      return data && data.map(v => new Transaction(v));
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
   * @param {{}=} headers
   * @returns {Promise<Transaction[]>}
   */
  async getStatementByCurrencyCode({ currencyCode, from, to }, headers = {}) {
    try {
      const { accounts } = await this.getUserInfo(headers);

      if (!this._currencyToAccountIdsMap[currencyCode]) {
        accounts.forEach(acc => {
          this._currencyToAccountIdsMap[acc.currencyCode.code] = acc.id;
        });
      }

      if (!this._currencyToAccountIdsMap[currencyCode]) {
        throw new Error(`There is no account for currencyCode "${currencyCode}"`);
      }

      return this.getStatement({ account: this._currencyToAccountIdsMap[currencyCode], from, to }, headers);
    } catch (err) {
      if (err.isAxiosError) {
        throw new Error(err.response.data.errorDescription || 'Undefined API error');
      }

      throw err;
    }
  }

  /**
   * @return {AxiosInstance|undefined}
   */
  getClient() {
    if (!this._client) {
      throw new Error('Axios client does not initialized yet');
    }

    return this._client;
  }

  /**
   * @param {string} account
   * @param {Date} from
   * @param {Date} to
   * @return {string}
   * @private
   */
  _buildStatementEndpoint(account, from, to) {
    return Endpoint.ACCOUNT_STATEMENT.replace('{account}', account)
      .replace('{from}', Math.floor(from.getTime() / 1000))
      .replace('{to}', Math.floor((to ? to.getTime() : new Date().getTime()) / 1000));
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
    return this.getClient().request({
      method,
      url: endpoint,
      headers,
      body,
    });
  }
}

module.exports = MonobankBaseApi;
