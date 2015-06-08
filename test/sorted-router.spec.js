/// <reference path="../typings/jasmine/jasmine.d.ts"/>
var proxyquire =  require('proxyquire').noCallThru();
var SortedRouter = proxyquire('../src/js/utils/sorted-router', {
  'backbone': {
    Router: MockRouter,
    history: {
      start: function () {
      }
    }
  }
});

// Mock out the backbone router
function MockRouter() {
  this.routes = [];
}

MockRouter.prototype = {
  route: function (path) {
    this.routes.push(path);
  }
};

function registerRoutes(router, arr) {
  var r = new SortedRouter(router);

  arr.forEach(function (path) {
    r.route(path, function () { });
  });
  
  r.init();
}

describe('sorted-router', function () {
  it('Puts colon routes first', function () {
    var mock = new MockRouter();

    registerRoutes(mock, ['stuff/one', 'stuff/:id', 'stuff/two']);
    
    expect(mock.routes).toEqual(['stuff/:id', 'stuff/one', 'stuff/two']);
  });
  
  it('Puts * routes first', function () {
    var mock = new MockRouter();

    registerRoutes(mock, ['stuff/one', 'stuff/:id', 'stuff/two', '*404']);
    
    expect(mock.routes).toEqual(['*404', 'stuff/:id', 'stuff/one', 'stuff/two']);
  });
  
  it('Understands multiple colons', function () {
    var mock = new MockRouter();

    registerRoutes(mock, ['stuff/:id', 'stuff/:id/one/:test', 'stuff/two', '*404']);
    
    expect(mock.routes).toEqual(['*404', 'stuff/:id/one/:test', 'stuff/:id', 'stuff/two']);
  });
});