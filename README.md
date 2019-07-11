![node](https://img.shields.io/node/v/monobank-api-client.svg?style=flat-square)
![npm](https://img.shields.io/npm/v/monobank-api-client.svg?style=flat-square)
![npm](https://img.shields.io/npm/dm/monobank-api-client.svg?style=flat-square)
![Travis (.org)](https://img.shields.io/travis/JanGolle/monobank-api-client.svg?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/github/JanGolle/monobank-api-client.svg?style=flat-square)

# Monobank API client for Node.JS

![monocat](https://user-images.githubusercontent.com/6859896/60575987-3102f780-9d85-11e9-986e-b7126af57f8d.png)

Monobank API client wrapper build on promises.

## Installation

### yarn:

```
yarn add monobank-api-client
```

### npm:

```
npm i monobank-api-client
```

## Usage

### Personal API

Read docs here - https://api.monobank.ua/docs/

Visit https://api.monobank.ua - read QR code retrieve your personal `TOKEN` here.

#### Create personal client instance

```javascript
const { ClientFactory } = require('monobank-api-client');

const api = ClientFactory.createPersonal(TOKEN);
```

#### Get currency list

```javascript
const currencyInfo = await api.getCurrencyInfo();
```

`currencyInfo` is list of `CurrencyInfo` DTO.

```shell
CurrencyInfo {
    _currencyCodeA:
     { code: 'USD',
       number: '840',
       digits: 2,
       currency: 'US Dollar',
       countries: [Array] },
    _currencyCodeB:
     { code: 'UAH',
       number: '980',
       digits: 2,
       currency: 'Hryvnia',
       countries: [Array] },
    _date: 2019-07-11T07:10:05.000Z,
    _rateSell: 26.0988,
    _rateBuy: 25.761,
    _rateCross: undefined }
```

#### Get statement by account ID

```javascript
const statement = await api.getStatement({
  account: 'ACCOUNT_ID',
  from: new Date('2019-07-04'),
  to: new Date('2019-07-11'),
});
```

`statement` is list of `Transaction` DTO.

```shell
Transaction {
    _id: 'xxxxxxxx',
    _time: 2019-07-10T17:04:51.000Z,
    _description: 'Uber',
    _mcc: 4111,
    _hold: true,
    _amount: -800,
    _operationAmount: -800,
    _currencyCode:
     { code: 'UAH',
       number: '980',
       digits: 2,
       currency: 'Hryvnia',
       countries: [Array] },
    _commissionRate: 0,
    _cashbackAmount: 0,
    _balance: 81129811 }
```

#### Get statement by currency code

```javascript
const statement = await api.getStatementByCurrencyCode({
  currencyCode: 'UAH',
  from: new Date('2019-07-04'),
  to: new Date('2019-07-11'),
});
```

Response will be the same as for previous example.

### Corporate API

Read docs here - https://api.monobank.ua/docs/corporate.html

#### Get access

##### Generate private key

```shell
openssl ecparam -genkey -name secp256k1 -rand /dev/urandom -out priv.key
```

Out file is `priv.key`

**Be careful!** don't share it with anyone

##### Generate public key

```shell
openssl ec -in priv.key -pubout -out pub.key
```

Out file is `pub.key`

##### Request API access

Send an email to api@monobank.ua with next info:

1. app name
2. short description of your app or service
3. attach app logo (.jpg, .png) file
4. attach `pub.key` file **(not private!)**

If everything is OK, then you will get approve and `KEY_ID`.

Now you can start using corporate API.

#### Create corporate client instance

```javascript
const { ClientFactory } = require('monobank-api-client');

const api = ClientFactory.createCorporate(KEY_ID, '/path/to/priv.key');
```

#### Create access request

```javascript
const accessInfo = await api.getAccessRequest({ permissions: [Permission.GET_PERSONAL_INFO] });
```

`accessInfo` is instance of `AccessInfo` DTO:

```shell
AccessInfo {
  _tokenRequestId: 'aL67772mA7PlJygFjzQP111',
  _acceptUrl: 'https://mbnk.app/auth/aL67772mA7PlJygFjzQP111' }
```

Store `tokenRequestId` to DB and give user `acceptUrl` link.

#### Check access is granted

```javascript
const isGranted = await api.checkAccessRequest({ requestid: 'aL67772mA7PlJygFjzQP111' });
```

Other use cases of corporate API same to personal with same interface.

## Error handling

Most of bad cases mapped to custom error classes. All NOT-OK responses from API also mapped to errors, so you could handle them by their classes too.

Actual list below.

- `InvalidPrivateKeyError`;
- `TooManyRequestsError`;
- `InvalidPermissionValueError`;
- `AccessForbiddenError`;
- `InvalidRequestParamsError`;
- `NotFoundError`;
- `UnauthorizedRequestError`;
- `UndefinedApiError`;

## Examples

Check [examples](https://github.com/JanGolle/monobank-api-client/tree/master/examples) directory for more use cases.

### Run personal API example

```shell
TOKEN='your-personal-token-here' node examples/personal-app.js
```

### Run corporate API example

```shell
KEY_ID='key-id-given-by-monobank' PRIVATE_KEY='path/to/priv.key' node examples/personal-app.js
```

**FYI:** Corporate API example has `5s` access granted check.

```shell
jangolle@imac:/monobank-api-client$ KEY_ID=xxxxxxx PRIVATE_KEY=/xxxx/xxxx/priv.key node examples/corporate-app.js
Go to 'https://mbnk.app/auth/xxxxxxxxxxxxxxxxx' from your mobile device with Monobank client and grant access.
Access for requestId "xxxxxxxxxxxxxxxxx" not granted yet. Auto-check in 5s..
Access for requestId "xxxxxxxxxxxxxxxxx" not granted yet. Auto-check in 5s..
Access for requestId "xxxxxxxxxxxxxxxxx" not granted yet. Auto-check in 5s..
Access granted successfully!

```

## FAQ

#### Q: Why I receive list of transactions and operation amounts and balances so big (x100) of real amount by my card?

**A:** Everything is OK. Operation amounts and account balances represented as `int64` amount of currency with minor units.

If you need normalized value just do next calculation:

```javascript
const normalizedAmount = transaction.amount / Math.pow(10, transaction.currencyCode.digits);
```

`monobank-api-client` use `currency-codes` module as dictionary for `ISO 4217` to detect minor units and country of usage for currency.

## Roadmap

- Tests
