const {TimeSeries,SmoothieChart} = require('smoothie');
const markets = {'XLM-EUR':0};
const colors  = {'EUR':'#5AF','XLM':'#F55','XLM-EUR':'#0A0'};

(async () => {

  // Wait for the document to finish loading
  while(document.readyState !== 'complete') {
    await new Promise(r => setTimeout(r, 100));
  }

  // Common chart config
  const chartConf = {
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

  // Market chart
  Object.keys(markets).forEach(marketId => {
    const marketChart  = new SmoothieChart(chartConf);
    const marketSeries = new TimeSeries();
    marketChart.streamTo(document.getElementById(`market-${marketId.toLowerCase()}`));
    marketChart.addTimeSeries(marketSeries, {
      strokeStyle: colors[marketId] || '#FFF',
      lineWidth  : 2,
    });
    setInterval(async () => {
      const marketValue = markets[marketId] = await api.market.get({ id: marketId });
      marketSeries.append(Date.now(), marketValue);
    }, 6e4);
  });

  // Accounts chart
  const accountChart  = new SmoothieChart(chartConf);
  accountChart.streamTo(document.getElementById('accounts'));
  const accountSeries = {};
  setInterval(async () => {
    const accounts = await api.accounts.get();
    const now      = Date.now();
    accounts.sort((a, b) => {
      if (a.currency < b.currency) return -1;
      if (a.currency > b.currency) return 1;
      return 0;
    });
    accounts.forEach(account => {
      if (!accountSeries[account.currency]) {
        accountSeries[account.currency] = new TimeSeries();
        accountChart.addTimeSeries( accountSeries[account.currency], {
          strokeStyle: colors[account.currency] || '#FFF',
          lineWidth  : 2,
        });
      }
      const accountMarket = `${account.currency}-EUR`;
      const accountValue  = (accountMarket in markets) ? (account.balance * markets[accountMarket]) : account.balance;
      accountSeries[account.currency].append(now, accountValue);
    });
  }, 6e4);


  // // Random time series
  // const rnd = new TimeSeries();
  // setInterval(() => {
  //   rnd.append(Date.now(), Math.random() * 10);
  // }, 6e4);

  // // Initialize chart
  // const chart = new SmoothieChart({
  //   timestampFormatter: SmoothieChart.timeFormatter,
  //   labels: {
  //     fontSize: parseInt(window.getComputedStyle(document.body, null).getPropertyValue('font-size')),
  //   },
  //   tooltip: true,
  //   millisPerPixel: 6000,
  //   grid: {
  //     millisPerLine : 3e5,
  //     verticalSections: 8,
  //   },
  //   responsive: true,
  // });
  // chart.addTimeSeries(rnd, {strokeStyle: '#0F0F', fillStyle: '#0F01', lineWidth: 4});
  // chart.streamTo(document.getElementById('market-xlm-eur'));

})();




// document.body.appendChild(ctx);

// var myChart = new Chart(ctx.getContext('2d'), {
//     type: 'bar',
//     data: {
//         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//         datasets: [{
//             label: '# of Votes',
//             data: [12, 19, 3, 5, 2, 3],
//             backgroundColor: [
//                 'rgba(255, 99, 132, 0.2)',
//                 'rgba(54, 162, 235, 0.2)',
//                 'rgba(255, 206, 86, 0.2)',
//                 'rgba(75, 192, 192, 0.2)',
//                 'rgba(153, 102, 255, 0.2)',
//                 'rgba(255, 159, 64, 0.2)'
//             ],
//             borderColor: [
//                 'rgba(255, 99, 132, 1)',
//                 'rgba(54, 162, 235, 1)',
//                 'rgba(255, 206, 86, 1)',
//                 'rgba(75, 192, 192, 1)',
//                 'rgba(153, 102, 255, 1)',
//                 'rgba(255, 159, 64, 1)'
//             ],
//             borderWidth: 1
//         }]
//     },
//     options: {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero: true
//                 }
//             }]
//         }
//     }
// });
