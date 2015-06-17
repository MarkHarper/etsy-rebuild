(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var router = require('../router');

router.route('listings/:id', function (id) {
  // TODO: Show the listing details page, load listing by id from Etsy, etc...
});
},{"../router":4}],2:[function(require,module,exports){
'use strict';

var $ = require('jquery');
var router = require('../router');
var settings = require('../settings');
var EtsyService = require('../services/etsy-service');
var view = require('../utils/view');
var queryString = require('../utils/query-string');

router.route('', 'listings?*query', function (query) {
  var etsy = new EtsyService({ apiKey: settings.etsyApiKey });
  var searchValues = queryString(query);
  
  etsy.listings(searchValues)
    .done(showListings)
    .fail(showError);
    
  function showListings (listings) {
    // Show data as HTML
    view.render('listings', { 
      searchValues: searchValues, 
      listings: listings.results.map(viewModel) 
    });
    
    // Bind events
    $('.search-listings').on('submit', function (e) {
      e.preventDefault();
      
      var searchUrl = $(this).serialize();
      
      location.hash = '#listings?' + searchUrl;
    });
  }
  
  function showError(req, status, err) {
    console.error(err || status);
    alert('Ruh roh!');
  }
});


// Convert the Etsy data model into a form that is more easy for our templates
function viewModel(listing) {
  return {
    id: listing.listing_id,
    imgUrl: listing.MainImage.url_170x135,
    description: listing.description,
    price: listing.price,
    tags: listing.tags,
    breadCrumb: listing.taxonomy_path,
    title: listing.title,
    externalUrl: listing.url,
    userId: listing.user_id,
    Shop: listing.shop
  };
}
},{"../router":4,"../services/etsy-service":5,"../settings":6,"../utils/query-string":7,"../utils/view":9,"jquery":"jquery"}],3:[function(require,module,exports){
'use strict';

var router = require('./router');


// Require all controllers (which register their own routes)
({"controllers":({"listing-ctrl":require("./controllers/listing-ctrl.js"),"listings-ctrl":require("./controllers/listings-ctrl.js")})});

// Start the router
router.init();
},{"./controllers/listing-ctrl.js":1,"./controllers/listings-ctrl.js":2,"./router":4}],4:[function(require,module,exports){
'use strict';

var SortedRouter = require('./utils/sorted-router');

module.exports = new SortedRouter();
},{"./utils/sorted-router":8}],5:[function(require,module,exports){
'use strict';

var $ = require('jquery');

function EtsyService (spec) {
  if (!spec.apiKey) {
    throw new Error('An API key is required!');
  }
  
  this.apiKey = spec.apiKey;
  this.baseUrl = 'https://openapi.etsy.com/' + (spec.apiVersion || 'v2');
}

EtsyService.prototype = {
  // Fetch data from the specified URL, if the response from Etsy is an error,
  // we reject the promise, otherwise we resolve the promise.
  fetchUrl: function (url) {
    var promise = $.Deferred();

    var req = $.getJSON(url).done(function (data) {
      if (!data.ok) {
        // Keep our rejection in line with the standard jQuery
        // rejection, passing req as first argument, status as second
        // and error object as the third
        promise.reject(req, 'Unknown error', data);
      } else {
        promise.resolve(data);
      }
    });

    return promise;
  },
  
  // Gets listings from Etsy
listings: function (args) {
    args = args || {};
    var url = this.baseUrl + '/listings/active.js?includes=MainImage&keywords=' + encodeURIComponent(args.keywords) + '&api_key=' + this.apiKey + '&callback=?';
    return this.fetchUrl(url);
  }
};

module.exports = EtsyService;

},{"jquery":"jquery"}],6:[function(require,module,exports){
'use strict';

module.exports = { 
  etsyApiKey: 's3lw68ocjmg10sbblnpatf6z' 
};
},{}],7:[function(require,module,exports){
function unescapeStr(str) {
  return decodeURIComponent((str || '').replace(/\+/g, ' '));
}

module.exports = function (str) {
  return (str || '').split('&').map(function (k) { 
    return k.split('='); 
  }).reduce(function (obj, pairs) {
    obj[pairs[0]] = unescapeStr(pairs[1]);
    return obj;
  }, {});
};
},{}],8:[function(require,module,exports){
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
},{"backbone":"backbone","underscore":"underscore"}],9:[function(require,module,exports){
'use strict';

var $ = require('jquery');
var _ = require('underscore');

var views = require('views');

module.exports = {
  render: function (templateKey, model) {
    $('.main-content').html(this.hydrate(templateKey, model)); 
  },
  
  hydrate: function (templateKey, model) {
    var viewFn = _.template(views[templateKey], { variable: 'm' });
    return viewFn(model);
  }
};
},{"jquery":"jquery","underscore":"underscore","views":"views"}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY29udHJvbGxlcnMvbGlzdGluZy1jdHJsLmpzIiwic3JjL2pzL2NvbnRyb2xsZXJzL2xpc3RpbmdzLWN0cmwuanMiLCJzcmMvanMvaW5pdC5qcyIsInNyYy9qcy9yb3V0ZXIuanMiLCJzcmMvanMvc2VydmljZXMvZXRzeS1zZXJ2aWNlLmpzIiwic3JjL2pzL3NldHRpbmdzLmpzIiwic3JjL2pzL3V0aWxzL3F1ZXJ5LXN0cmluZy5qcyIsInNyYy9qcy91dGlscy9zb3J0ZWQtcm91dGVyLmpzIiwic3JjL2pzL3V0aWxzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciByb3V0ZXIgPSByZXF1aXJlKCcuLi9yb3V0ZXInKTtcblxucm91dGVyLnJvdXRlKCdsaXN0aW5ncy86aWQnLCBmdW5jdGlvbiAoaWQpIHtcbiAgLy8gVE9ETzogU2hvdyB0aGUgbGlzdGluZyBkZXRhaWxzIHBhZ2UsIGxvYWQgbGlzdGluZyBieSBpZCBmcm9tIEV0c3ksIGV0Yy4uLlxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xudmFyIHJvdXRlciA9IHJlcXVpcmUoJy4uL3JvdXRlcicpO1xudmFyIHNldHRpbmdzID0gcmVxdWlyZSgnLi4vc2V0dGluZ3MnKTtcbnZhciBFdHN5U2VydmljZSA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2V0c3ktc2VydmljZScpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuLi91dGlscy92aWV3Jyk7XG52YXIgcXVlcnlTdHJpbmcgPSByZXF1aXJlKCcuLi91dGlscy9xdWVyeS1zdHJpbmcnKTtcblxucm91dGVyLnJvdXRlKCcnLCAnbGlzdGluZ3M/KnF1ZXJ5JywgZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gIHZhciBldHN5ID0gbmV3IEV0c3lTZXJ2aWNlKHsgYXBpS2V5OiBzZXR0aW5ncy5ldHN5QXBpS2V5IH0pO1xuICB2YXIgc2VhcmNoVmFsdWVzID0gcXVlcnlTdHJpbmcocXVlcnkpO1xuICBcbiAgZXRzeS5saXN0aW5ncyhzZWFyY2hWYWx1ZXMpXG4gICAgLmRvbmUoc2hvd0xpc3RpbmdzKVxuICAgIC5mYWlsKHNob3dFcnJvcik7XG4gICAgXG4gIGZ1bmN0aW9uIHNob3dMaXN0aW5ncyAobGlzdGluZ3MpIHtcbiAgICAvLyBTaG93IGRhdGEgYXMgSFRNTFxuICAgIHZpZXcucmVuZGVyKCdsaXN0aW5ncycsIHsgXG4gICAgICBzZWFyY2hWYWx1ZXM6IHNlYXJjaFZhbHVlcywgXG4gICAgICBsaXN0aW5nczogbGlzdGluZ3MucmVzdWx0cy5tYXAodmlld01vZGVsKSBcbiAgICB9KTtcbiAgICBcbiAgICAvLyBCaW5kIGV2ZW50c1xuICAgICQoJy5zZWFyY2gtbGlzdGluZ3MnKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIFxuICAgICAgdmFyIHNlYXJjaFVybCA9ICQodGhpcykuc2VyaWFsaXplKCk7XG4gICAgICBcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSAnI2xpc3RpbmdzPycgKyBzZWFyY2hVcmw7XG4gICAgfSk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIHNob3dFcnJvcihyZXEsIHN0YXR1cywgZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnIgfHwgc3RhdHVzKTtcbiAgICBhbGVydCgnUnVoIHJvaCEnKTtcbiAgfVxufSk7XG5cblxuLy8gQ29udmVydCB0aGUgRXRzeSBkYXRhIG1vZGVsIGludG8gYSBmb3JtIHRoYXQgaXMgbW9yZSBlYXN5IGZvciBvdXIgdGVtcGxhdGVzXG5mdW5jdGlvbiB2aWV3TW9kZWwobGlzdGluZykge1xuICByZXR1cm4ge1xuICAgIGlkOiBsaXN0aW5nLmxpc3RpbmdfaWQsXG4gICAgaW1nVXJsOiBsaXN0aW5nLk1haW5JbWFnZS51cmxfMTcweDEzNSxcbiAgICBkZXNjcmlwdGlvbjogbGlzdGluZy5kZXNjcmlwdGlvbixcbiAgICBwcmljZTogbGlzdGluZy5wcmljZSxcbiAgICB0YWdzOiBsaXN0aW5nLnRhZ3MsXG4gICAgYnJlYWRDcnVtYjogbGlzdGluZy50YXhvbm9teV9wYXRoLFxuICAgIHRpdGxlOiBsaXN0aW5nLnRpdGxlLFxuICAgIGV4dGVybmFsVXJsOiBsaXN0aW5nLnVybCxcbiAgICB1c2VySWQ6IGxpc3RpbmcudXNlcl9pZCxcbiAgICBTaG9wOiBsaXN0aW5nLnNob3BcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciByb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcicpO1xuXG5cbi8vIFJlcXVpcmUgYWxsIGNvbnRyb2xsZXJzICh3aGljaCByZWdpc3RlciB0aGVpciBvd24gcm91dGVzKVxuKHtcImNvbnRyb2xsZXJzXCI6KHtcImxpc3RpbmctY3RybFwiOnJlcXVpcmUoXCIuL2NvbnRyb2xsZXJzL2xpc3RpbmctY3RybC5qc1wiKSxcImxpc3RpbmdzLWN0cmxcIjpyZXF1aXJlKFwiLi9jb250cm9sbGVycy9saXN0aW5ncy1jdHJsLmpzXCIpfSl9KTtcblxuLy8gU3RhcnQgdGhlIHJvdXRlclxucm91dGVyLmluaXQoKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3J0ZWRSb3V0ZXIgPSByZXF1aXJlKCcuL3V0aWxzL3NvcnRlZC1yb3V0ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU29ydGVkUm91dGVyKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5mdW5jdGlvbiBFdHN5U2VydmljZSAoc3BlYykge1xuICBpZiAoIXNwZWMuYXBpS2V5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBbiBBUEkga2V5IGlzIHJlcXVpcmVkIScpO1xuICB9XG4gIFxuICB0aGlzLmFwaUtleSA9IHNwZWMuYXBpS2V5O1xuICB0aGlzLmJhc2VVcmwgPSAnaHR0cHM6Ly9vcGVuYXBpLmV0c3kuY29tLycgKyAoc3BlYy5hcGlWZXJzaW9uIHx8ICd2MicpO1xufVxuXG5FdHN5U2VydmljZS5wcm90b3R5cGUgPSB7XG4gIC8vIEZldGNoIGRhdGEgZnJvbSB0aGUgc3BlY2lmaWVkIFVSTCwgaWYgdGhlIHJlc3BvbnNlIGZyb20gRXRzeSBpcyBhbiBlcnJvcixcbiAgLy8gd2UgcmVqZWN0IHRoZSBwcm9taXNlLCBvdGhlcndpc2Ugd2UgcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgZmV0Y2hVcmw6IGZ1bmN0aW9uICh1cmwpIHtcbiAgICB2YXIgcHJvbWlzZSA9ICQuRGVmZXJyZWQoKTtcblxuICAgIHZhciByZXEgPSAkLmdldEpTT04odXJsKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBpZiAoIWRhdGEub2spIHtcbiAgICAgICAgLy8gS2VlcCBvdXIgcmVqZWN0aW9uIGluIGxpbmUgd2l0aCB0aGUgc3RhbmRhcmQgalF1ZXJ5XG4gICAgICAgIC8vIHJlamVjdGlvbiwgcGFzc2luZyByZXEgYXMgZmlyc3QgYXJndW1lbnQsIHN0YXR1cyBhcyBzZWNvbmRcbiAgICAgICAgLy8gYW5kIGVycm9yIG9iamVjdCBhcyB0aGUgdGhpcmRcbiAgICAgICAgcHJvbWlzZS5yZWplY3QocmVxLCAnVW5rbm93biBlcnJvcicsIGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH0sXG4gIFxuICAvLyBHZXRzIGxpc3RpbmdzIGZyb20gRXRzeVxubGlzdGluZ3M6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MgfHwge307XG4gICAgdmFyIHVybCA9IHRoaXMuYmFzZVVybCArICcvbGlzdGluZ3MvYWN0aXZlLmpzP2luY2x1ZGVzPU1haW5JbWFnZSZrZXl3b3Jkcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGFyZ3Mua2V5d29yZHMpICsgJyZhcGlfa2V5PScgKyB0aGlzLmFwaUtleSArICcmY2FsbGJhY2s9Pyc7XG4gICAgcmV0dXJuIHRoaXMuZmV0Y2hVcmwodXJsKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdHN5U2VydmljZTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuICBldHN5QXBpS2V5OiAnczNsdzY4b2NqbWcxMHNiYmxucGF0ZjZ6JyBcbn07IiwiZnVuY3Rpb24gdW5lc2NhcGVTdHIoc3RyKSB7XG4gIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoKHN0ciB8fCAnJykucmVwbGFjZSgvXFwrL2csICcgJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIChzdHIgfHwgJycpLnNwbGl0KCcmJykubWFwKGZ1bmN0aW9uIChrKSB7IFxuICAgIHJldHVybiBrLnNwbGl0KCc9Jyk7IFxuICB9KS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgcGFpcnMpIHtcbiAgICBvYmpbcGFpcnNbMF1dID0gdW5lc2NhcGVTdHIocGFpcnNbMV0pO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQmFja2JvbmUgPSByZXF1aXJlKCdiYWNrYm9uZScpO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbi8vIEEgd3JhcHBlciBhcm91bmQgQmFja2JvbmUgcm91dGVyIHRoYXQgdW5kZXJzdGFuZHMgc3BlY2lmaWNpdHlcbmZ1bmN0aW9uIFNvcnRlZFJvdXRlcihyb3V0ZXIpIHtcbiAgdGhpcy5yb3V0ZXIgPSByb3V0ZXIgfHwgbmV3IEJhY2tib25lLlJvdXRlcigpO1xuICB0aGlzLnJvdXRlcyA9IHt9O1xufVxuIFxuU29ydGVkUm91dGVyLnByb3RvdHlwZSA9IHtcbiAgLy8gVGFrZXMgMSBvciBtb3JlIHVybHMgYW5kIGEgY2FsbGJhY2sgZnVuY3Rpb24gYW5kIGFkZHMgdGhlbSBhcyByb3V0ZXNcbiAgcm91dGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDEsXG4gICAgICAgIGNhbGxiYWNrID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0aGlzLnJvdXRlc1thcmd1bWVudHNbaV1dID0gY2FsbGJhY2s7XG4gICAgfVxuICB9LFxuIFxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gQSBtYWdpYyBudW1iZXIgdG8gZm9yY2UgYSByb3V0ZSB0byBiZSBsb3dlc3Qgc3BlY2lmaWNpdHlcbiAgICAvLyBOdW1iZXIuTUlOX1ZBTFVFIGRpZG4ndCB3b3JrLi4uXG4gICAgdmFyIGxvd2VzdFJvdXRlID0gLTEwMDAwMDAsXG4gICAgICAgIG1lID0gdGhpcztcbiBcbiAgICAvLyBSZWdpc3RlciBhbGwgcm91dGVzLCBzb3J0ZWQgYnkgc3BlY2lmaWNpdHlcbiAgICBfLmNoYWluKF8ucGFpcnModGhpcy5yb3V0ZXMpKVxuICAgICAgLnNvcnRCeShmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgdmFyIHVybCA9IHJvdXRlWzBdO1xuIFxuICAgICAgICBpZiAodXJsLmluZGV4T2YoJyonKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGxvd2VzdFJvdXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAtdXJsLnNwbGl0KCc6JykubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmVhY2goZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICAgIG1lLnJvdXRlci5yb3V0ZShyb3V0ZVswXSwgcm91dGVbMV0pO1xuICAgICAgfSk7XG4gXG4gICAgLy8gU3RhcnQgdGhlIGJhY2tib25lIHJvdXRpbmcgc3Vic3lzdGVtXG4gICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydCgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvcnRlZFJvdXRlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxudmFyIHZpZXdzID0gcmVxdWlyZSgndmlld3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlbmRlcjogZnVuY3Rpb24gKHRlbXBsYXRlS2V5LCBtb2RlbCkge1xuICAgICQoJy5tYWluLWNvbnRlbnQnKS5odG1sKHRoaXMuaHlkcmF0ZSh0ZW1wbGF0ZUtleSwgbW9kZWwpKTsgXG4gIH0sXG4gIFxuICBoeWRyYXRlOiBmdW5jdGlvbiAodGVtcGxhdGVLZXksIG1vZGVsKSB7XG4gICAgdmFyIHZpZXdGbiA9IF8udGVtcGxhdGUodmlld3NbdGVtcGxhdGVLZXldLCB7IHZhcmlhYmxlOiAnbScgfSk7XG4gICAgcmV0dXJuIHZpZXdGbihtb2RlbCk7XG4gIH1cbn07Il19
