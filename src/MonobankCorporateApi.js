'use strict';

const axios = require('axios');
const assert = require('assert');
const Endpoint = require('./Endpoint');
const Signer = require('./Signer');
const MonobankBaseApi = require('./MonobankBaseApi');
const Permission = require('./Permission');
const { InvalidPermissionValue } = require('./Error');

class MonobankCorporateApi extends MonobankBaseApi {
  /**
   * @param {string} keyId
   * @param {Signer} signer
   * @param {string} baseURL
   * @param {int} timeout
   */
  constructor({ keyId, signer, baseURL, timeout }) {
    super({ baseURL, timeout });

    this._client = axios.create(
      Object.assign(this._clientOptions, {
        headers: {
          'X-Key-Id': keyId,
        },
      }),
    );

    assert(signer instanceof Signer);

    this._signer = signer;
  }

  /**
   * @param {Permission[]} permissions
   * @param {string=} callback
   * @return {Promise<void>}
   */
  async getAccessRequest({ permissions, callback = '' }) {
    try {
      permissions.forEach(p => assert(p instanceof Permission));
    } catch (err) {
      throw new InvalidPermissionValue('Every permission in list must be instance of Permission', { permissions });
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

    const { data } = await this._callEndpoint({
      method: 'POST',
      endpoint,
      headers,
    });

    console.log(data);
  }
}

module.exports = MonobankCorporateApi;
