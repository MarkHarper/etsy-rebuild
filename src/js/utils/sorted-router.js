'use strict';

var Backbone = require('backbone');
var _ = require('underscore');

// A wrapper around Backbone router that understands specificity
function SortedRouter(router) {
  this.router = router || new Backbone.Router();
  this.routes = {};
}
 
SortedRouter.prototype = {
  // Takes 1 or more urls and a callback function and adds them as routes
  route: function () {
    var len = arguments.length - 1,
        callback = arguments[arguments.length - 1];
 
    for (var i = 0; i < len; ++i) {
      this.routes[arguments[i]] = callback;
    }
  },
 
  init: function () {
    // A magic number to force a route to be lowest specificity
    // Number.MIN_VALUE didn't work...
    var lowestRoute = -1000000,
        me = this;
 
    // Register all routes, sorted by specificity
    _.chain(_.pairs(this.routes))
      .sortBy(function (route) {
        var url = route[0];
 
        if (url.indexOf('*') >= 0) {
          return lowestRoute;
        } else {
          return -url.split(':').length;
        }
      })
      .each(function (route) {
        me.router.route(route[0], route[1]);
      });
 
    // Start the backbone routing subsystem
    Backbone.history.start();
  }
};

module.exports = SortedRouter;