'use strict';

const Endpoint = require('./Endpoint');
const Transaction = require('./Dto/Transaction');
const CurrencyInfo = require('./Dto/CurrencyInfo');
const Account = require('./Dto/Account');
const UserInfo = require('./Dto/UserInfo');
const { BAD_REQUEST, FORBIDDEN, NOT_FOUND, UNAUTHORIZED, TOO_MANY_REQUESTS } = require('./HttpStatusCode');
const {
  InvalidRequestParamsError,
  AccessForbiddenError,
  NotFoundError,
  UnauthorizedRequestError,
  UndefinedApiError,
  TooManyRequestsError,
} = require('./Error');

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
        const { status, data } = err.response;

        switch (status) {
          case TOO_MANY_REQUESTS:
            throw new TooManyRequestsError(data.errorDescription || 'Too many requests');
          case UNAUTHORIZED:
            throw new UnauthorizedRequestError(data.errorDescription || 'Unauthorized request');
          default:
            throw new UndefinedApiError(data.errorDescription || 'Unclassified API error');
        }
      }

      throw new UndefinedApiError('Something went wrong');
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
        const { status, data } = err.response;

        switch (status) {
          case TOO_MANY_REQUESTS:
            throw new TooManyRequestsError(data.errorDescription || 'Too many requests');
          case UNAUTHORIZED:
            throw new UnauthorizedRequestError(data.errorDescription || 'Unauthorized request');
          default:
            throw new UndefinedApiError(data.errorDescription || 'Unclassified API error');
        }
      }

      throw new UndefinedApiError('Something went wrong');
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
        const { status, data } = err.response;

        switch (status) {
          case TOO_MANY_REQUESTS:
            throw new TooManyRequestsError(data.errorDescription || 'Too many requests');
          case UNAUTHORIZED:
            throw new UnauthorizedRequestError(data.errorDescription || 'Unauthorized request');
          case BAD_REQUEST:
            throw new InvalidRequestParamsError(data.errorDescription || 'Invalid request');
          case FORBIDDEN:
            throw new AccessForbiddenError(data.errorDescription || 'Access forbidden');
          case NOT_FOUND:
            throw new NotFoundError(data.errorDescription || 'RequestId not found');
          default:
            throw new UndefinedApiError(data.errorDescription || 'Unclassified API error');
        }
      }

      throw new UndefinedApiError('Something went wrong');
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
        const { status, data } = err.response;

        switch (status) {
          case TOO_MANY_REQUESTS:
            throw new TooManyRequestsError(data.errorDescription || 'Too many requests');
          case UNAUTHORIZED:
            throw new UnauthorizedRequestError(data.errorDescription || 'Unauthorized request');
          case BAD_REQUEST:
            throw new InvalidRequestParamsError(data.errorDescription || 'Invalid request');
          case FORBIDDEN:
            throw new AccessForbiddenError(data.errorDescription || 'Access forbidden');
          case NOT_FOUND:
            throw new NotFoundError(data.errorDescription || 'RequestId not found');
          default:
            throw new UndefinedApiError(data.errorDescription || 'Unclassified API error');
        }
      }

      console.log(err);

      throw new UndefinedApiError('Something went wrong');
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
