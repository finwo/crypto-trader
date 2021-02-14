module.exports = {
  interval   : 3e4,
  histlen    : 8 * 60 * 60 * 1000,
  margin     : 2.00 / 100,
  marketBase : 'EUR',
  basecolor  : '#FFF',
  markets    : [],
};

// Select market base
if (process.env.MARKET_BASE) {
  module.exports.marketBase = process.env.MARKET_BASE.toUpperCase();
}

// Select markets themselves
if (process.env.MARKETS) {
  module.exports.markets = process.env.MARKETS.split(',').map(alt => ({
    alt       : alt.toUpperCase(),
    base      : module.exports.marketBase,
    minimum   : 10,
    precision : 10,
    color     : '#FFF',
  }));
}

// Auto-color base & markets (50% saturation, 50% brightness)
const {gen_colors,rgb_to_hex} = require('./colgen');
const colors = gen_colors(1+module.exports.markets.length, 0.5, 128);
module.exports.basecolor = rgb_to_hex(colors.shift());
module.exports.markets.forEach(market => {
  market.color = rgb_to_hex(colors.shift());
});
