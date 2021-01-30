module.exports = {
  method: 'get',
  path: '/test',
  handler: (req, res, next) => {
    return new HttpOk({
      hello: 'world',
    });
  },
};
