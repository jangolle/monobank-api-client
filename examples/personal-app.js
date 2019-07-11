const { ClientFactory } = require('../');

const TOKEN = process.env.TOKEN;
const FROM_INTERVAL = 86400000;

if (!TOKEN) {
  console.log('env var TOKEN required for this example');
  process.exit(1);
}

const api = ClientFactory.createPersonal(TOKEN);
const to = new Date();
const from = new Date();

from.setTime(to.getTime() - FROM_INTERVAL);

const run = async () => {
  // const userInfo = await api.getUserInfo();

  const defaultStatement = await api.getStatement({ account: '0', from, to });
  //
  console.log('Default account statement:\n', defaultStatement);
  //
  // const statement = await api.getStatementByCurrencyCode({ currencyCode: 'UAH', from, to });
  //
  // console.log('Currency account statement:\n', statement);
};

run().catch(console.log);
