const express = require('express');
const bodyParser = require('body-parser');
const { allowCrossOriginRequestsMiddleware } = require('../app/middleware/cors.middleware');

module.exports = function () {
    // INITIALISE EXPRESS //
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.raw({ type: 'image/*', limit: '20mb'}));
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint

    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        console.log('');
        console.log(`##### ${req.method} ${req.path} #####`);
        console.log('');
        next();
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);

    require('../app/routes/users.routes')(app);
    require('../app/routes/users.photos.routes')(app);

    require('../app/routes/petitions.routes')(app);
    require('../app/routes/petitions.photos.routes')(app);
    require('../app/routes/petitions.signatures.routes')(app);

    return app;
};
