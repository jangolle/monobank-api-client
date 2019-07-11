'use strict';

const axios = require('axios');
const MonobankBaseApi = require('./MonobankBaseApi');

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
}

module.exports = MonobankApi;
