const HttpResponse = require('./http-response');

class HttpConflict extends HttpResponse {
  status = 409;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpConflict;
