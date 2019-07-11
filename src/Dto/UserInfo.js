'use strict';

class UserInfo {
  /**
   * @param {string} name
   * @param {Account[]} accounts
   */
  constructor({ name, accounts }) {
    this._name = name;
    this._accounts = accounts;
  }

  /**
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * @returns {Account[]}
   */
  get accounts() {
    return this._accounts;
  }
}

module.exports = UserInfo;
