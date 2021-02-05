const {HttpOk} = app;

module.exports = [

  {
    method: 'post',
    path: '/data',
    name: 'data.fetch',
    async handler(req, res, next) {
      const since = req.body.since || 0;
      return new HttpOk(app.history.filter(record => record.timestamp > since));
    },
  },

];
