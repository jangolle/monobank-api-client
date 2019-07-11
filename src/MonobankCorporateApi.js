'use strict';

const axios = require('axios');
const assert = require('assert');
const Endpoint = require('./Endpoint');
const Signer = require('./Signer');
const MonobankBaseApi = require('./MonobankBaseApi');
const Permission = require('./Permission');
const { BAD_REQUEST, FORBIDDEN, OK, NOT_FOUND, UNAUTHORIZED } = require('./HttpStatusCode');
const AccessInfo = require('./Dto/AccessInfo');
const {
  InvalidPermissionValueError,
  InvalidRequestParamsError,
  AccessForbiddenError,
  NotFoundError,
  UnauthorizedRequestError,
  UndefinedApiError,
} = require('./Error');

class MonobankCorporateApi extends MonobankBaseApi {
  /**
   * @param {string} keyId
   * @param {Signer} signer
   * @param {string} baseURL
   * @param {int} timeout
   */
  constructor({ keyId, signer, baseURL, timeout }) {
    super({ baseURL, timeout });

    assert(signer instanceof Signer);

    this._signer = signer;

    this._client = axios.create(
      Object.assign(this._clientOptions, {
        headers: {
          'X-Key-Id': keyId,
        },
      }),
    );
  }

  /**
   * @param {Permission[]} permissions
   * @param {string=} callback
   * @return {Promise<AccessInfo>}
   *
   * @throws InvalidRequestParamsError
   * @throws AccessForbiddenError
   * @throws UndefinedApiError
   */
  async getAccessRequest({ permissions, callback = '' }) {
    try {
      permissions.forEach(p => assert(p instanceof Permission));
    } catch (err) {
      throw new InvalidPermissionValueError('Every permission in list must be instance of Permission', { permissions });
    }

    const permissionsStr = permissions.join('');

    const endpoint = Endpoint.PERSONAL_AUTH_REQUEST;
    const time = Math.floor(new Date().getTime() / 1000) + '';
    const headers = {
      'X-Time': time,
      'X-Permissions': permissionsStr,
      'X-Sign': this._signer.sign(time + permissionsStr + endpoint),
    };

    if (callback) {
      headers['X-Callback'] = callback;
    }

    try {
      const { data } = await this._callEndpoint({
        method: 'POST',
        endpoint,
        headers,
      });

      return new AccessInfo(data);
    } catch (err) {
      if (err.isAxiosError) {
        const { status, data } = err.response;

        switch (status) {
          case BAD_REQUEST:
            throw new InvalidRequestParamsError(data.errorDescription || 'Invalid request');
          case FORBIDDEN:
            throw new AccessForbiddenError(data.errorDescription || 'Access forbidden');
          default:
            throw new UndefinedApiError(data.errorDescription || 'Unclassified API error');
        }
      }

      throw new UndefinedApiError('Something went wrong');
    }
  }

  /**
   * @param {string} requestId
   * @return {Promise<boolean>}
   *
   * @throws InvalidRequestParamsError
   * @throws UnauthorizedRequestError
   * @throws AccessForbiddenError
   * @throws NotFoundError
   * @throws UndefinedApiError
   */
  async checkAccessRequest({ requestId }) {
    const endpoint = Endpoint.PERSONAL_AUTH_REQUEST;

    try {
      const { status } = await this._callEndpoint({
        method: 'GET',
        endpoint,
        headers: this._getAuthHeaders({ requestId, endpoint }),
      });

      return status === OK;
    } catch (err) {
      if (err.isAxiosError) {
        const { status, data } = err.response;

        switch (status) {
          case UNAUTHORIZED:
            // handle this one just as business logic response of API
            return false;
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
   * @param {string} requestId
   * @return {Promise<UserInfo>}
   */
  async getUserInfoWithRequestId(requestId) {
    return super.getUserInfo(this._getAuthHeaders({ requestId, endpoint: Endpoint.CLIENT_INFO }));
  }

  /**
   * @param {string} account
   * @param {Date} from
   * @param {Date=} to
   * @param {string} requestId
   * @return {Promise<Transaction[]>}
   */
  async getStatementWithRequestId({ account, from, to }, requestId) {
    to = to || new Date();

    return super.getStatement(
      { account, from, to },
      this._getAuthHeaders({ requestId, endpoint: this._buildStatementEndpoint(account, from, to) }),
    );
  }

  /**
   * @param {string} requestId
   * @param {string} endpoint
   * @return {{"X-Request-Id": *, "X-Sign": string, "X-Time": string}}
   * @private
   */
  _getAuthHeaders({ requestId, endpoint }) {
    const time = Math.floor(new Date().getTime() / 1000) + '';

    return {
      'X-Time': time,
      'X-Request-Id': requestId,
      'X-Sign': this._signer.sign(time + requestId + endpoint),
    };
  }
}

module.exports = MonobankCorporateApi;
