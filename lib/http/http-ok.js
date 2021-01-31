const HttpResponse = require('./http-response');

class HttpOk extends HttpResponse {
  status = 200;
  constructor(...args) {
    super(...args);
  }
};

module.exports = HttpOk;
