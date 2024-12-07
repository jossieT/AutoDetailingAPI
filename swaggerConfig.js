const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auto Detailing Service API',
      description: "Comprehensive API documentation for managing auto detailing services, including booking, staff assignment, and availability management.",
      contact: {
        name: "Yosef Teshome",
        email: "joseteshe2017@gmail.com",
      },
      version: '1.0.0',
    },
    servers: [
      {
        url: "http://localhost:5000/",
        description: "Local server"
      },
      // {
      //   url: "",
      //   description: "Live server"
      // },
    ]
  },
  // looks for configuration in specified directories
  apis: ['./routes/*.js'],

}
const swaggerSpec = swaggerJsdoc(options)
const swaggerDocs = (app, port) => {
  // Swagger Page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
};

module.exports = { swaggerDocs };
