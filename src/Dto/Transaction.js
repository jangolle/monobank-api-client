'use strict';

const cc = require('currency-codes');

class Transaction {
  /**
   * @param {string} id
   * @param {int} time
   * @param {string} description
   * @param {int} mcc
   * @param {boolean} hold
   * @param {int} amount
   * @param {int} operationAmount
   * @param {int} currencyCode
   * @param {int} commissionRate
   * @param {int} cashbackAmount
   * @param {int} balance
   */
  constructor({
    id,
    time,
    description,
    mcc,
    hold,
    amount,
    operationAmount,
    currencyCode,
    commissionRate,
    cashbackAmount,
    balance,
  }) {
    const dateObj = new Date();
    dateObj.setTime(time * 1000);

    this._id = id;
    this._time = dateObj;
    this._description = description;
    this._mcc = mcc;
    this._hold = hold;
    this._amount = amount;
    this._operationAmount = operationAmount;
    this._currencyCode = cc.number(currencyCode);
    this._commissionRate = commissionRate;
    this._cashbackAmount = cashbackAmount;
    this._balance = balance;
  }

  /**
   * @returns {string}
   */
  get id() {
    return this._id;
  }

  /**
   * @returns {Date}
   */
  get time() {
    return this._time;
  }

  /**
   * @returns {string}
   */
  get description() {
    return this._description;
  }

  /**
   * @returns {int}
   */
  get mcc() {
    return this._mcc;
  }

  /**
   * @returns {boolean}
   */
  get hold() {
    return this._hold;
  }

  /**
   * @returns {int}
   */
  get amount() {
    return this._amount;
  }

  /**
   * @returns {int}
   */
  get operationAmount() {
    return this._operationAmount;
  }

  /**
   * @returns {CurrencyCodeRecord}
   */
  get currencyCode() {
    return this._currencyCode;
  }

  /**
   * @returns {int}
   */
  get commissionRate() {
    return this._commissionRate;
  }

  /**
   * @returns {int}
   */
  get cashbackAmount() {
    return this._cashbackAmount;
  }

  /**
   * @returns {int}
   */
  get balance() {
    return this._balance;
  }
}

module.exports = Transaction;
