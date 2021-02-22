const HttpResponse = require('./http-response');

class HttpPermissionDenied extends HttpResponse {
  status = 403;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpPermissionDenied;
