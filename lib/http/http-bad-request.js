const HttpResponse = require('./http-response');

class HttpBadRequest extends HttpResponse {
  status = 400;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpBadRequest;
