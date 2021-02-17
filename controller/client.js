module.exports = [

  {
    method: 'get',
    path  : '/api/manifest.json',
    async handler(req, res) {
      return new app.HttpOk(app.manifest);
    }
  },

  {
    method: 'get',
    path: '/api/client.js',
    async handler(req, res) {
      res.writeHead(200, {
        'content-type': 'application/javascript',
      });
      res.end(`
;(factory => {
  if ('object' === typeof module) {
    module.exports = factory(require('node-fetch'));
  } else if ('object' === typeof window) {
    window.api = factory(window.fetch);
  }
})(fetch => {
  let   token    = null;
  const baseuri  = document.location.protocol + "//${req.headers.host}";
  const api      = {
    setToken(newToken) {
      token = newToken;
    },
    getToken() {
      return token;
    },
    pathParams(path, data) {
      Object
        .keys(data||{})
        .sort((a,b)=>b.length-a.length)
        .forEach(key => {
          path = path
            .split(':'+key)
            .join(data[key]);
        });
      return path;
    },
  };
  const manifest = ${JSON.stringify(app.manifest)};
  manifest.forEach(entry => {
    const path = entry.name.split('.');
    const last = path.pop();
    let   ref  = api;
    for(const tok of path) {
      ref = ref[tok] = ref[tok] || {};
    }
    ref[last] = async data => {
      const options   = {};
      options.method  = entry.method.toUpperCase();
      options.headers = {};
      if (options.method !== 'GET') {
        options.headers['content-type'] = 'application/json';
        options.body                    = JSON.stringify(data);
      }
      if (token) {
        options.headers['authorization'] = 'Bearer ' + token;
      }
      return (await fetch(baseuri + api.pathParams(entry.path,data), options)).json();
    };
  });
  return api;
});`);
    },
  },

];
