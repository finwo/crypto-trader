const vuePlugin = require("esbuild-plugin-vue3");
const esbuild = require("esbuild");
const rimraf = require("rimraf");
const copydir = require("copy-dir");

const destDir = __dirname + "/dist";

(async () => {
  // await new Promise(r => rimraf(__dirname + "/dist", r));
  await new Promise(r => copydir(__dirname + "/public", destDir, r));

  esbuild.build({
    plugins: [vuePlugin()],
    entryPoints: [__dirname + "/src/main.js"],
    bundle: true,
    outfile: __dirname + "/dist/main.js"
  });
})();
