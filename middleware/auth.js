const handlers = [
  require('./auth-jwt-ed25519'),
];

module.exports = (req, res, next) => {

  // Request is un-authenticated here
  req.auth = { 
    ok: false,
  };

  // Pass through to all handlers
  (function runHandlers(queue) {
    if (req.auth.ok) return next();
    if (!queue.length) return next();
    const handler = queue.shift();
    if ('function' !== typeof handler) return runHandlers(queue);
    handler(req, res, () => runHandlers(queue));
  })(handlers.slice());
};
