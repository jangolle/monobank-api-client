'use strict';

class AccessInfo {
  /**
   * @param {string} tokenRequestId
   * @param {string} acceptUrl
   */
  constructor({ tokenRequestId, acceptUrl }) {
    this._tokenRequestId = tokenRequestId;
    this._acceptUrl = acceptUrl;
  }

  /**
   * @return {string}
   */
  get tokenRequestId() {
    return this._tokenRequestId;
  }

  /**
   * @return {string}
   */
  get acceptUrl() {
    return this._acceptUrl;
  }
}

module.exports = AccessInfo;
