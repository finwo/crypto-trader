const HttpResponse = require('./http-response');

class HttpNotFound extends HttpResponse {
  status = 404;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpNotFound;
