'use strict';

const assert = require('chai').assert;
const AccessInfo = require('src/Dto/AccessInfo');

describe('src/Dto/AccessInfo', () => {
  it('must construct correct AccessInfo object', function() {
    const data = { tokenRequestId: 'xxxxxxxxxasdkj', acceptUrl: 'https://example.com/xxxxxxxxxasdkj' };

    const accessInfo = new AccessInfo(data);

    assert.equal(accessInfo.tokenRequestId, data.tokenRequestId);
    assert.equal(accessInfo.acceptUrl, data.acceptUrl);
  });
});
