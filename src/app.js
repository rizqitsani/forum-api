const createServer = require('./infrastructure/http/createServer');

require('dotenv').config();

(async () => {
  const server = await createServer();
  await server.start();

  console.log(`Server running at ${server.info.uri}`);
})();
