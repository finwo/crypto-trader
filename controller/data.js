const {HttpOk} = app;

module.exports = [

  {
    method: 'post',
    path: '/data',
    name: 'data.fetch',
    async handler(req, res, next) {
      const since  = req.body.since || 0;
      const limit  = req.body.limit || 100;
      const result = [];

      for(const record of app.history) {
        if (result.length    >= limit) break;
        if (record.timestamp <= since) continue;
        result.push(record);
      }

      return new HttpOk(result);
    },
  },

];
