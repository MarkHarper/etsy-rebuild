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