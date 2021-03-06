var mockInstance = require('../test/mocks/instance');
var mockAPI = require('../test/mocks/api');
var initCommonCalls = require('./commonCalls');

const common = initCommonCalls(mockInstance, mockAPI);
test('all methods return Promises', function () {
  expect(common.get('/endpoint') instanceof Promise).toBe(true);
  expect(common.post('/endpoint') instanceof Promise).toBe(true);
  expect(common.put('/endpoint') instanceof Promise).toBe(true);
  expect(common.delete('/endpoint') instanceof Promise).toBe(true);
});

test('all methods accept callback', function (done) {
  common.get('/endpoint', function () {
    common.post('/endpoint', null, function () {
      common.put('/endpoint', null, function () {
        common.delete('/endpoint', function () {
          done();
        });
      });
    });
  });
});

test('#get accepts a url', function (done) {
  common.get('/url-path')
    .then(function (res) {
      expect(res)
        .toEqual({
          method: 'GET',
          path: '/url-path'
        });
    })
    .then(done);
});

test('#get accepts a url', function (done) {
  common.get('/url-path')
    .then(function (res) {
      expect(res)
        .toEqual({
          method: 'GET',
          path: '/url-path'
        });
    })
    .then(done);
});

test('#get accepts a querystring object', function (done) {
  common.get('/url-path', {foo: 'bar'})
    .then(function (res) {
      expect(res)
        .toEqual({
          method: 'GET',
          path: '/url-path?foo=bar'
        });
    })
    .then(done);
});

test('#post accepts a url and data', function (done) {
  var data = {foo: 'bar'};

  common.post('/url-path', data)
    .then(function (res) {
      expect(res)
        .toEqual({
          method: 'POST',
          body: data,
          path: '/url-path'
        });
    })
    .then(done);
});

test('#put accepts a url and data', function (done) {
  var data = {foo: 'bar'};

  common.put('/url-path', data)
    .then(function (res) {
      expect(res)
        .toEqual({
          method: 'PUT',
          body: data,
          path: '/url-path'
        });
    })
    .then(done);
});

test('#delete accepts a url', function (done) {
  common.put('/url-path')
    .then(function (res) {
      expect(res)
        .toEqual({
          method: 'PUT',
          path: '/url-path'
        });
    })
    .then(done);
});
