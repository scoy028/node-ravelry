var https = require('https');

var OAuth = require('oauth').OAuth;

var API_ROOT = 'https://api.ravelry.com';
var API_HOSTNAME = 'api.ravelry.com';

module.exports = function (authorization, options, permissions) {
  const instance = {
    ravAccessKey: options.ravAccessKey,
    ravSecretKey: options.ravSecretKey,
    ravPersonalKey: options.ravPersonalKey,
    api: {}
  };

  if (authorization === 'basic_auth') {
    addBasic(options, instance);
    addBasicMethods(instance);
  }
  if (authorization === 'oauth1.0') {
    addOAuth(options, permissions, instance);
    addOAuthMethods(instance);
  }

  return instance.api;
};

function addBasic (options, instance) {
  const authorization = {
    hostname: API_HOSTNAME,
    auth: `${instance.ravAccessKey}:${instance.ravPersonalKey}`
  };

  Object.assign(instance, {
    ravPersonalKey: options.ravPersonalKey,
    auth: {
      get: function (path) {
        return new Promise(function (resolve, reject) {
          https.get(Object.assign({path: path}, authorization), function (res) {
            var data = '';

            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', function () {
              if (res.statusCode === 200) resolve(JSON.parse(data));
              else reject(data);
            });
          });
        });
      },
      post: function (path, body) {
        return new Promise(function (resolve, reject) {
          var req = https.post(Object.assign({path: path}, authorization), function (res) {
            var data = '';

            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', function () {
              if (res.statusCode === 200) resolve(JSON.parse(data));
              else reject(data);
            });
          });

          if (body) req.write(JSON.stringify(body));
        });
      },
      put: function (path, body, cb) {
        return new Promise(function (resolve, reject) {
          var req = https.put(Object.assign({path: path}, authorization), function (res) {
            var data = '';

            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', function () {
              if (res.statusCode === 200) resolve(JSON.parse(data));
              else reject(data);
            });
          });

          if (body) req.write(JSON.stringify(body));
        });
      },
      delete: function (path, cb) {
        return new Promise(function (resolve, reject) {
          https.delete(Object.assign({path: path}, authorization), function (res) {
            var data = '';

            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', function () {
              if (res.statusCode === 200) resolve(JSON.parse(data));
              else reject(data);
            });
          });
        });
      }
    }
  });
}

function addOAuth (options, permissions, instance) {
  Object.assign(instance, {
    ravSecretKey: options.ravSecretKey,
    // Defaults to 'oob' as per OAuth 1.0A specification
    callbackUrl: options.callbackUrl || 'oob',
    // Aids in more seamless login for user
    responseUrl: options.responseUrl,
    auth: new OAuth(
      'https://www.ravelry.com/oauth/request_token' + (permissions ? '?scope=' + permissions.join('+') : ''),
      'https://www.ravelry.com/oauth/access_token',
      options.ravAccessKey,
      options.ravSecretKey,
      '1.0A',
      this._callbackUrl,
      'HMAC-SHA1'
    )
  });
}

function addBasicMethods (instance) {
  Object.assign(instance.api, {
    get: instance.auth.get,
    post: instance.auth.post,
    put: instance.auth.put,
    delete: instance.auth.delete
  });
}

function addOAuthMethods (instance) {
  Object.assign(instance.api, {
    getSignInUrl: function (cb) {
      instance.auth.getOAuthRequestToken(
        function (err, oauthToken, oauthSecret, results) {
          if (err) return cb(err);
          else {
            instance.oauthToken = oauthToken;
            instance.oauthSecret = oauthSecret;
            var url = instance.auth.signUrl(
              'https://www.ravelry.com/oauth/authorize',
              instance.oauthToken,
              instance.oauthSecret,
              'GET'
            );

            cb(null, url);
          }
        }
      );
    },
    getAccessToken: function (oauthVerifier, cb) {
      if (!oauthVerifier) {
        // TODO check wording
        return new Error('You must supply the OAuth verifier from the authorization response');
      }
      instance.auth.getOAuthAccessToken(
        instance.oauthToken,
        instance.oauthSecret,
        oauthVerifier,
        function (err, oauthAccessToken, oauthAccessTokenSecret, results) {
          instance.accessToken = oauthAccessToken;
          instance.accessSecret = oauthAccessTokenSecret;
          return cb(err, results);
        }
      );
    },
    get: function (endpoint, cb) {
      instance.auth.get(
        API_ROOT + endpoint,
        instance.accessToken,
        instance.accessSecret,
        cb // args: err, data, response
      );
    },
    post: function (endpoint, params, cb) {
      instance.auth.post(
        API_ROOT + endpoint,
        instance.accessToken,
        instance.accessSecret,
        params,
        'application/json',
        cb // args: err, data, response
      );
    },
    put: function (endpoint, params, cb) {
      instance.auth.put(
        API_ROOT + endpoint,
        instance.accessToken,
        instance.accessSecret,
        params,
        'application/json',
        cb // args: err, data, response
      );
    },
    delete: function (endpoint, cb) {
      instance.auth.delete(
        API_ROOT + endpoint,
        instance.accessToken,
        instance.accessSecret,
        cb // args: err, data, response
      );
    }
  });
}
