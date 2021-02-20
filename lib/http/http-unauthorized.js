const HttpResponse = require('./http-response');

class HttpUnauthorized extends HttpResponse {
  status = 401;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpUnauthorized;
