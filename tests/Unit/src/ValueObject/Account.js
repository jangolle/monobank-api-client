'use strict';

const assert = require('chai').assert;
const Account = require('src/ValueObject/Account');
const cc = require('currency-codes');

describe('src/ValueObject/Account', () => {
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
});
