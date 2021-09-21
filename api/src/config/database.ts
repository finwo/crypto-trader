const parseUrl = require('parse-url');
const parsed   = parseUrl(process.env.DB_URL || '');

// parsed: {
//   protocols: [ 'mysql' ],
//   protocol: 'mysql',
//   port: null,
//   resource: 'mysql',
//   user: 'user:password',
//   pathname: '/database',
//   hash: '',
//   search: '',
//   href: 'mysql://user:password@mysql/database',
//   query: [Object: null prototype] {}
// }

if ('string' === typeof parsed.user) {
  const [username,password] = parsed.user.split(':');
  parsed.username = username;
  parsed.password = password;
}

if ('undefined' !== typeof process.env.DB_TYPE    ) parsed.protocol =          process.env.DB_TYPE     ;
if ('undefined' !== typeof process.env.DB_NAME    ) parsed.pathname =          process.env.DB_NAME     ;
if ('undefined' !== typeof process.env.DB_HOST    ) parsed.resource =          process.env.DB_HOST     ;
if ('undefined' !== typeof process.env.DB_PORT    ) parsed.port     = parseInt(process.env.DB_PORT    );
if ('undefined' !== typeof process.env.DB_USER    ) parsed.username =          process.env.DB_USER     ;
if ('undefined' !== typeof process.env.DB_USERNAME) parsed.username =          process.env.DB_USERNAME ;
if ('undefined' !== typeof process.env.DB_PASS    ) parsed.password =          process.env.DB_PASS     ;
if ('undefined' !== typeof process.env.DB_PASSWORD) parsed.password =          process.env.DB_PASSWORD ;

const [username,password] = parsed.user.split(':');

export const database = {
  type        : parsed.protocol  || 'mysql',
  host        : parsed.resource  || 'localhost',
  port        : parsed.port      || 3306,
  database    : (parsed.pathname || 'database').replace(/(^\/|\/$)/,''),
  username    : parsed.username,
  password    : parsed.password,
  synchronize : true,
  entities    : [],
};
