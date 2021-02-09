module.exports = {
  interval   : 3e4,
  histlen    : 8 * 60 * 60 * 1000,
  margin     : 2.00 / 100,
  marketBase : 'EUR',
  basecolor  : '#FFF',
  markets    : [

    {
      alt      : 'ALGO',
      base     : 'EUR',
      price    : 0,
      minimum  : 1,
      precision: 0,
      color    : '#FFF',
    },

    {
      alt      : 'BTC',
      base     : 'EUR',
      price    : 0,
      minimum  : 0.001,
      precision: 4,
      color    : '#FFF',
    },

    {
      alt      : 'ETH',
      base     : 'EUR',
      price    : 0,
      minimum  : 0.01,
      precision: 4,
      color    : '#FFF',
    },

    {
      alt      : 'XLM',
      base     : 'EUR',
      price    : 0,
      minimum  : 1,
      precision: 0,
      color    : '#FFF',
    },

    {
      alt      : 'ZRX',
      base     : 'EUR',
      price    : 0,
      minimum  : 1,
      precision: 4,
      color    : '#FFF',
    },

  ],
};

// Auto-color base & markets (50% saturation, 50% brightness)
const {gen_colors,rgb_to_hex} = require('./colgen');
const colors = gen_colors(1+module.exports.markets.length, 0.5, 128);
module.exports.basecolor = rgb_to_hex(colors.shift());
module.exports.markets.forEach(market => {
  market.color = rgb_to_hex(colors.shift());
});
