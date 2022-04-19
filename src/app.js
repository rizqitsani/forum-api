require('dotenv').config();

const container = require('./infrastructure/container');
const createServer = require('./infrastructure/http/createServer');

(async () => {
  const server = await createServer(container);
  await server.start();

  console.log(`Server running at ${server.info.uri}`);
})();
