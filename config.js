module.exports = {
  interval   : 3e4,
  histlen    : 2 * 60 * 60 * 1000,
  margin     : 2.00 / 100,
  marketBase : 'EUR',
  basecolor  : '#5AF',
  markets    : [

    {
      alt      : 'ALGO',
      base     : 'EUR',
      price    : 0,
      minimum  : 1,
      precision: 0,
      color    : '#AA0',
    },

    {
      alt      : 'ETH',
      base     : 'EUR',
      price    : 0,
      minimum  : 0.01,
      precision: 4,
      color    : '#AAA',
    },

    {
      alt      : 'XLM',
      base     : 'EUR',
      price    : 0,
      minimum  : 1,
      precision: 0,
      color    : '#0A0',
    },

    {
      alt      : 'ZRX',
      base     : 'EUR',
      price    : 0,
      minimum  : 1,
      precision: 4,
      color    : '#F55',
    },

  ],
};
