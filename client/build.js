const vuePlugin = require("esbuild-plugin-vue3");
const esbuild  = require("esbuild");
const rimraf   = require("rimraf");
const copydir  = require("copy-dir");
const less     = require('less');
const fs       = require('fs');

const destDir = __dirname + "/dist";

(async () => {

  // Prepare static
  // await new Promise(r => rimraf(__dirname + "/dist", r));
  await new Promise(r => copydir(__dirname + "/public", destDir, r));

  // Compile less
  const lessSource = fs.readFileSync(destDir + '/global.less').toString();
  const compiled   = await less.render(lessSource);
  fs.writeFileSync(destDir + '/global.css', compiled.css);

  // Build vue
  await esbuild.build({
    plugins: [vuePlugin()],
    entryPoints: [__dirname + "/src/main.js"],
    bundle: true,
    outfile: __dirname + "/dist/main.js"
  });


})();
