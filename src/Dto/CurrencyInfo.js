'use strict';

const cc = require('currency-codes');

class CurrencyInfo {
  /**
   * @param {int} currencyCodeA
   * @param {int} currencyCodeB
   * @param {int} date
   * @param {number} rateSell
   * @param {number} rateBuy
   * @param {number} rateCross
   */
  constructor({ currencyCodeA, currencyCodeB, date, rateSell, rateBuy, rateCross }) {
    const dateObj = new Date();
    dateObj.setTime(date * 1000);

    this._currencyCodeA = cc.number(currencyCodeA);
    this._currencyCodeB = cc.number(currencyCodeB);

    if (typeof this._currencyCodeA === 'undefined') {
      throw new Error(`Invalid currencyCodeA value "${currencyCodeA}"`);
    }

    if (typeof this._currencyCodeB === 'undefined') {
      throw new Error(`Invalid currencyCodeB value "${currencyCodeB}"`);
    }

    this._date = dateObj;
    this._rateSell = rateSell;
    this._rateBuy = rateBuy;
    this._rateCross = rateCross;
  }

  /**
   * @returns {CurrencyCodeRecord}
   */
  get currencyCodeA() {
    return this._currencyCodeA;
  }

  /**
   * @returns {CurrencyCodeRecord}
   */
  get currencyCodeB() {
    return this._currencyCodeB;
  }

  /**
   * @returns {Date}
   */
  get date() {
    return this._date;
  }

  /**
   * @returns {number}
   */
  get rateSell() {
    return this._rateSell;
  }

  /**
   * @returns {number}
   */
  get rateBuy() {
    return this._rateBuy;
  }

  /**
   * @returns {number}
   */
  get rateCross() {
    return this._rateCross;
  }
}

module.exports = CurrencyInfo;
