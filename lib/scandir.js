const fs   = require('fs');
const path = require('path');

// How to iterate through a directory
// Automatically loads the file
function scandir(dir, handler, extensions = ['json','js']) {
  fs.readdirSync(dir).forEach(entry => {
    const fullpath = path.resolve(dir,entry);
    const stat     = fs.statSync(fullpath)

    // Iterate down directories
    if (stat.isDirectory()) {
      return scandir(fullpath, handler, extensions);
    }

    // Ensure it's the right file
    if (!stat.isFile()) return;
    const ext = entry.split('.').pop();
    if (!~extensions.indexOf(ext)) return;

    // Hand over to the handler
    handler(require(fullpath));
  });
}

module.exports = scandir;
