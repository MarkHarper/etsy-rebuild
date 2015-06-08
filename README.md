# Etsy Starter

Multi-day assignment

- We cover testing on Tuesday
- We cover validation on Wednesday

So don't tackle those tasks until those days, unless you're a glutton for punishment!

## Description 

Etsy 2.0 is coming out, and you're in charge of building it. The Etsy 2.0 team has already started the 
project, but it's in rough shape.

There's a long todo list, including:

- Style the landing page (see styling materials at the end of this page for some ideas)
- Add the ability to search listings
  - By keyword
  - By color
  - By min/max price
  - Write a function that takes keyword, color, min, max (or a hash with those properties) as arguments and 
  returns the proper ETSY API url
  - Test that function using Jasmine
  - *Be sure to encode user input* using `encodeURIComponent`
- Add nice-looking form validation to the color, min, and max fields
- Show a listing's details
  - [See the API docs](https://www.etsy.com/developers/documentation/reference/listing#method_getlisting)
- Add a color picker jQuery plugin to make search by color better
- Sort by price low-high, price high-low
- Allow users to paginate through results
- Collect payment information from the user
  - Name
  - Email
  - Phone
  - Credit card number
  - Expiration date
  - CCV
- Allow users to add/remove items to/from their cart
  - Show a running total of their purchases

## Getting started

- Clone this project
- Remove the .git folder `rm -rf .git`
- Initialize git `git init`, etc
- Be sure to run `npm install`
- Register for the Etsy API
  - [Go here](https://www.etsy.com/developers/register) and sign up
  - [Find your app's API key](https://www.etsy.com/developers/your-apps)
  - It's labeled `KEYSTRING` under the `SEE API KEY DETAILS` link
  - Put the API key in `src/js/settings.js` as the value of the `etsyApiKey` property

## Think like a developer

- Choose a feature, and focus on completing it
  - Break the feature down into clear steps
  - If you aren't sure how you'll do part of the feature, explore possibilities in jsBin or somewhere
  - Build your feature step-by-step until it's complete 
  - Check it in
  - Choose another feature and repeat

## Normal mode

- Styling
- Search listings by keyword
- Search listings by keyword and at least one of color, min price, max price
- Jasmine tests (at least for your URL building logic)
- Validation for any input that requires it
- The listing detail page, so users can go to `#listings/3333` where 3333 is the listing id, and they'll see
the details of the appropriate listing
  - This route is already configured in `listing-ctrl.js`
  - You still have to do the hard work of making the right API call, filling out the listing-details template, and showing it

## Hard mode

Normal mode + any/all of

- Allow a single search box where users could type: 'Dress #F00 $10-100'
  - Use regex to pull the color and price info from such a search
  - Intelligently search based on keyword "Dress", color "F00", and min-max price range
  - Use Jasmine to test this logic
- Any items from the todo list listed in the project description

## Styling materials, courtesy of Dribbble

[![Store](https://d13yacurqjgara.cloudfront.net/users/124059/screenshots/986548/2.png)](https://dribbble.com/shots/986548-Product-Catalog)
    
[![Relay](https://d13yacurqjgara.cloudfront.net/users/184/screenshots/1570859/screen-shot-2014-05-27-at-1.00.09-pm.png)](https://dribbble.com/shots/1570859-RelayFoods-com?list=searches&tag=ecommerce&offset=160)