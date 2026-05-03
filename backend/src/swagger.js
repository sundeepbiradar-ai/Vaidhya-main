const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Healthcare Discovery API',
    version: '1.0.0',
    description: 'API documentation for the healthcare discovery and appointment platform'
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Development server'
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);
