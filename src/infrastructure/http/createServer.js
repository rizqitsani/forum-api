const Hapi = require('@hapi/hapi');

const createServer = async () => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  return server;
};

module.exports = createServer;
