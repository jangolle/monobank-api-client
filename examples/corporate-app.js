const { ClientFactory, Permission } = require('../');

const KEY_ID = process.env.KEY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!KEY_ID) {
  console.log('env var KEY_ID required for this example');
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.log('env var PRIVATE_KEY required for this example');
  process.exit(1);
}

const api = ClientFactory.createCorporate(KEY_ID, PRIVATE_KEY);

const run = async () => {
  const accessInfo = await api.getAccessRequest({
    permissions: [Permission.GET_STATEMENT, Permission.GET_PERSONAL_INFO],
  });

  const { tokenRequestId, acceptUrl } = accessInfo;

  console.log(`Go to '${acceptUrl}' from your mobile device with Monobank client and grant access.`);

  setInterval(async () => {
    const isGranted = await api.checkAccessRequest({ requestId: tokenRequestId });

    if (isGranted) {
      console.log('Access granted successfully!');
      process.exit(0);
    } else {
      console.log(`Access for requestId "${tokenRequestId}" not granted yet. Auto-check in 5s..`);
    }
  }, 5000);
};

run().catch(console.log);
