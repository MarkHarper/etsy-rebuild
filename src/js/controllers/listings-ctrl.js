'use strict';

var router = require('../router');
var settings = require('../settings');
var EtsyService = require('../services/etsy-service');
var view = require('../utils/view');

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
    userId: listing.user_id 
  };
}

router.route('', 'listings', function () {
  // TODO: Show the listings page, load listings from Etsy, etc...
  new EtsyService({ apiKey: settings.etsyApiKey })
    .listings()
    .done(function (data) {
      console.log(data);
      view.render('listings', { listings: data.results.map(viewModel) });
    })
    .fail(function (req, status, err) {
      console.error(err || status);
    });
});