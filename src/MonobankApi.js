'use strict';

const axios = require('axios');
const MonobankBaseApi = require('./MonobankBaseApi');
const Endpoint = require('./Endpoint');
const { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED, TOO_MANY_REQUESTS } = require('./HttpStatusCode');
const {
  InvalidRequestParamsError,
  AccessForbiddenError,
  NotFoundError,
  UnauthorizedRequestError,
  UndefinedApiError,
  TooManyRequestsError,
} = require('./Error');

class MonobankApi extends MonobankBaseApi {
  /**
   * @param {string} token
   * @param {string} baseURL
   * @param {int} timeout
   */
  constructor({ token, baseURL, timeout }) {
    super({ baseURL, timeout });

    this._client = axios.create(
      Object.assign(this._clientOptions, {
        headers: {
          'X-Token': token,
        },
      }),
    );
  }

  /**
   * @returns {Promise<boolean>}
   */
  async setupWebHook({ url }) {
    try {
      const { status } = await this._callEndpoint({
        method: 'POST',
        endpoint: Endpoint.SETUP_WEBHOOK,
        body: {
          webHookUrl: url,
        },
      });

      return status === OK;
    } catch (err) {
      if (err.isAxiosError) {
        const { status, data } = err.response;

        switch (status) {
          case TOO_MANY_REQUESTS:
            throw new TooManyRequestsError(data.errorDescription || 'Too many requests');
          case UNAUTHORIZED:
            throw new UnauthorizedRequestError(data.errorDescription || 'Invalid request');
          case BAD_REQUEST:
            throw new InvalidRequestParamsError(data.errorDescription || 'Unauthorized request');
          default:
            throw new UndefinedApiError(data.errorDescription || 'Unclassified API error');
        }
      }

      throw new UndefinedApiError('Something went wrong');
    }
  }
}

module.exports = MonobankApi;
