const fwebc    = require('fwebc');
const rc4      = require('rc4-crypt');
const supercop = require('supercop');

window.Buffer = require('buffer').Buffer;

window.hydrateKeyPair = kp => {
  const pk = kp.pk || kp.public_key || kp.publicKey;
  const sk = kp.sk || kp.secret_key || kp.secretKey;
  return supercop.keyPairFrom({
    publicKey: Buffer.from(pk),
    secretKey: Buffer.from(sk),
  });
};

window.generateKeyPair = ({username, password}) => {
  const length = supercop.createSeed().length;
  const coder  = rc4(password || '');
  const data   = username.repeat(Math.ceil(length / username.length)).substr(0,length);
  const seed   = coder(data);
  return supercop.createKeyPair(seed);
};

fwebc.load('app-core');

// const {TimeSeries,SmoothieChart} = require('smoothie');

// (async () => {

//   // Wait for the document to finish loading
//   while(document.readyState !== 'complete') {
//     await new Promise(r => setTimeout(r, 100));
//   }

//   // Fetch config
//   const config = await api.config();
//   const cols   = {[config.marketBase]:config.basecolor};

//   console.log({config,cols});

//   // Common chart config
//   const chartconf = {
//     labels: {
//       fontSize: parseInt(window.getComputedStyle(document.body, null).getPropertyValue('font-size')),
//     },
//     grid: {
//       millisPerLine: 36e5,
//       verticalSections: 8,
//     },
//     timestampFormatter: SmoothieChart.timeFormatter,
//     tooltip: true,
//     millisPerPixel: 3e4,
//     responsive: true,
//   };

//   // Initialize legend container
//   const elLegend          = document.createElement('DIV');
//   const elLegendTitle     = document.createElement('P');
//   elLegendTitle.innerText = 'Legend';
//   elLegend.appendChild(elLegendTitle);
//   document.body.appendChild(elLegend);

//   // Initialize legend
//   const legend = {[config.marketBase]:{col:config.basecolor}};
//   config.markets.forEach(market => {
//     legend[market.alt] = {col:market.color};
//     cols[`${market.alt}-${market.base}`] = market.color;
//     cols[`${market.alt}`] = market.color;
//   });
//   Object.keys(legend).forEach(id => {
//     const info = legend[id];
//     if (!info.el) {
//       info.el             = document.createElement('B');
//       info.el.innerText   = id+' ';
//       info.el.style.color = info.col;
//     }
//     elLegend.appendChild(info.el);
//   });

//   // Initialize accounts container
//   const elAccounts       = document.createElement('DIV');
//   const elAccountsTitle  = document.createElement('P');
//   const elAccountsCanvas = document.createElement('CANVAS');
//   elAccountsTitle.innerText = 'Accounts';
//   elAccounts.appendChild(elAccountsTitle);
//   elAccounts.appendChild(elAccountsCanvas);
//   document.body.appendChild(elAccounts);
//   elAccountsCanvas.style.width  = '100%';
//   elAccountsCanvas.style.height = '240px';
//   const AccountsChart = new SmoothieChart(chartconf);
//   AccountsChart.streamTo(elAccountsCanvas);
//   const AccountsSeries = {};

//   // Fetch data to show periodically
//   let   lastData  = 0;
//   const fetchData = async () => {
//     try {
//       const records = await api.data.fetch({since: lastData, limit: 5});
//       if ((!records) || !records.length) return setTimeout(fetchData, config.interval / 2);

//       for(const record of records) {
//         lastData = record.timestamp;

//         // Handle accounts
//         Object.keys(record.account).forEach(currency => {
//           if (record.account[currency].value < 1) return;
//           if (!AccountsSeries[currency]) {
//             AccountsSeries[currency] = new TimeSeries();
//             AccountsChart.addTimeSeries(AccountsSeries[currency], {
//               strokeStyle: cols[currency] || '#FFF',
//               lineWidth  : 2,
//             });
//           }
//           const val = record.account[currency].value;
//           AccountsSeries[currency].append(record.timestamp, val);
//         });

//       }

//       setTimeout(fetchData, 1);
//     } catch(e) {
//       setTimeout(fetchData, config.interval / 2);
//     }
//   };

//   fetchData();
// })();
