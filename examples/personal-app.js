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
  const userInfo = await api.getUserInfo();

  console.log('User info:\n', userInfo);

  const defaultStatement = await api.getStatement({ account: '0', from, to });

  console.log('Default account statement:\n', defaultStatement);
};

run().catch(console.log);
