const HttpResponse = require('./http-response');

class HttpError extends HttpResponse {
  status = 500;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpError;
