'use strict';

const assert = require('chai').assert;
const CurrencyInfo = require('src/Dto/CurrencyInfo');
const cc = require('currency-codes');

describe('src/Dto/CurrencyInfo', () => {
  it('must construct correct CurrencyInfo object', function() {
    const testCcA = cc.number(980);
    const testCcB = cc.number(957);

    const data = {
      currencyCodeA: testCcA.number,
      currencyCodeB: testCcB.number,
      date: Math.floor(new Date().getTime() / 1000),
      rateSell: 42.15,
      rateBuy: 14,
      rateCross: undefined,
    };

    const currencyInfo = new CurrencyInfo(data);

    assert.equal(currencyInfo.currencyCodeA, testCcA);
    assert.equal(currencyInfo.currencyCodeB, testCcB);
    assert.equal(currencyInfo.date.getTime() / 1000, data.date);
    assert.equal(currencyInfo.rateSell, data.rateSell);
    assert.equal(currencyInfo.rateBuy, data.rateBuy);
    assert.equal(currencyInfo.rateCross, data.rateCross);
  });

  it('must throw Error with invalid currencyCodeA', function() {
    const data = {
      currencyCodeA: 666,
      currencyCodeB: 957,
      date: Math.floor(new Date().getTime() / 1000),
      rateSell: 42.15,
      rateBuy: 14,
      rateCross: undefined,
    };

    assert.throws(
      () => {
        new CurrencyInfo(data);
      },
      Error,
      /^Invalid currencyCodeA value/,
    );
  });

  it('must throw Error with invalid currencyCodeB', function() {
    const data = {
      currencyCodeA: 957,
      currencyCodeB: 666,
      date: Math.floor(new Date().getTime() / 1000),
      rateSell: 42.15,
      rateBuy: 14,
      rateCross: undefined,
    };

    assert.throws(
      () => {
        new CurrencyInfo(data);
      },
      Error,
      /^Invalid currencyCodeB value/,
    );
  });
});
