'use strict';

const assert = require('chai').assert;
const Account = require('src/Dto/Account');
const cc = require('currency-codes');

describe('src/Dto/Account', () => {
  it('must construct correct Account object', function() {
    const testCc = cc.number(980);

    const accountData = {
      id: 'ffff',
      balance: 12000,
      creditLimit: 0,
      currencyCode: testCc.number,
      cashbackType: 'None',
    };

    const account = new Account(accountData);

    assert.equal(account.id, accountData.id);
    assert.equal(account.balance, accountData.balance);
    assert.equal(account.creditLimit, accountData.creditLimit);
    assert.equal(account.currencyCode, testCc);
    assert.equal(account.cashbackType, accountData.cashbackType);
  });

  it('must throw Error with invalid currency', function() {
    const accountData = {
      id: 'ffff',
      balance: 12000,
      creditLimit: 0,
      currencyCode: 666,
      cashbackType: 'None',
    };

    assert.throws(
      () => {
        new Account(accountData);
      },
      Error,
      /^Invalid currencyCode value/,
    );
  });
});
