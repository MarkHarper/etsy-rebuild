'use strict';

var router = require('./router');
var bulk = require('bulk-require');

// Require all controllers (which register their own routes)
bulk(__dirname, ['controllers/**/*.js']);

// Start the router
router.init();