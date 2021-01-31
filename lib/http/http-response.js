class HttpResponse {
  status = 200;
  data   = null;
  constructor(data, status) {
    this.data   = data;
    if ('number' === typeof status) {
      this.status = status;
    }
  }
  send(req, res) {
    res.writeHead(this.status, {'content-type': 'application/json'});
    res.end(JSON.stringify(this.data));
  }
};

module.exports = HttpResponse;
