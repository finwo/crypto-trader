const {TimeSeries,SmoothieChart} = require('smoothie');
const config = require('../config');
const cols   = {[config.marketBase]:config.basecolor};

(async () => {

  // Wait for the document to finish loading
  while(document.readyState !== 'complete') {
    await new Promise(r => setTimeout(r, 100));
  }

  // Common chart config
  const chartconf = {
    labels: {
      fontSize: parseInt(window.getComputedStyle(document.body, null).getPropertyValue('font-size')),
    },
    grid: {
      millisPerLine: 36e5,
      verticalSections: 8,
    },
    timestampFormatter: SmoothieChart.timeFormatter,
    tooltip: true,
    millisPerPixel: 3e4,
    responsive: true,
  };

  // Initialize interface

  // Initialize legend container
  const elLegend          = document.createElement('DIV');
  const elLegendTitle     = document.createElement('P');
  elLegendTitle.innerText = 'Legend';
  elLegend.appendChild(elLegendTitle);
  document.body.appendChild(elLegend);

  // Initialize legend
  const legend = {[config.marketBase]:{col:config.basecolor}};
  config.markets.forEach(market => {
    legend[market.alt] = {col:market.color};
    cols[`${market.alt}-${market.base}`] = market.color;
    cols[`${market.alt}`] = market.color;
  });
  Object.keys(legend).forEach(id => {
    const info = legend[id];
    if (!info.el) {
      info.el             = document.createElement('B');
      info.el.innerText   = id+' ';
      info.el.style.color = info.col;
    }
    elLegend.appendChild(info.el);
  });

  // // Initialize markets container
  // const elMarkets       = document.createElement('DIV');
  // const elMarketsTitle  = document.createElement('P');
  // const elMarketsCanvas = document.createElement('CANVAS');
  // elMarketsTitle.innerText = 'Markets';
  // elMarkets.appendChild(elMarketsTitle);
  // elMarkets.appendChild(elMarketsCanvas);
  // document.body.appendChild(elMarkets);
  // elMarketsCanvas.style.width  = '100%';
  // elMarketsCanvas.style.height = '240px';
  // const MarketsChart = new SmoothieChart(chartconf);
  // MarketsChart.streamTo(elMarketsCanvas);
  // const MarketsSeries = {};

  // Initialize accounts container
  const elAccounts       = document.createElement('DIV');
  const elAccountsTitle  = document.createElement('P');
  const elAccountsCanvas = document.createElement('CANVAS');
  elAccountsTitle.innerText = 'Accounts';
  elAccounts.appendChild(elAccountsTitle);
  elAccounts.appendChild(elAccountsCanvas);
  document.body.appendChild(elAccounts);
  elAccountsCanvas.style.width  = '100%';
  elAccountsCanvas.style.height = '240px';
  const AccountsChart = new SmoothieChart(chartconf);
  AccountsChart.streamTo(elAccountsCanvas);
  const AccountsSeries = {};

  // Fetch data to show periodically
  let   lastData  = 0;
  const fetchData = async () => {
    (await api.data.fetch({since: lastData}))
      .forEach(record => {
        lastData = record.timestamp;

        // // Handle markets
        // Object.keys(record.market).forEach(marketId => {
        //   if (!MarketsSeries[marketId]) {
        //     MarketsSeries[marketId] = new TimeSeries();
        //     MarketsChart.addTimeSeries(MarketsSeries[marketId], {
        //       strokeStyle: cols[marketId] || '#FFF',
        //       lineWidth  : 2,
        //     });
        //   }
        //   MarketsSeries[marketId].append(record.timestamp, record.market[marketId]);
        // });

        // Handle accounts
        Object.keys(record.account).forEach(currency => {
          if (record.account[currency].value < 1) return;
          if (!AccountsSeries[currency]) {
            AccountsSeries[currency] = new TimeSeries();
            AccountsChart.addTimeSeries(AccountsSeries[currency], {
              strokeStyle: cols[currency] || '#FFF',
              lineWidth  : 2,
            });
          }
          const val = record.account[currency].value / (currency == config.marketBase ? config.markets.length : 1);
          AccountsSeries[currency].append(record.timestamp, val);
        });
      });
  };
  await fetchData();
  setInterval(fetchData,9e3);
})();
