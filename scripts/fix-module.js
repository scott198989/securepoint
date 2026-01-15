// Post-build script to fix the module type for web export
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Add type="module" to the script tag
  html = html.replace(
    /<script src="(.*?)" defer><\/script>/g,
    '<script type="module" src="$1"></script>'
  );

  fs.writeFileSync(indexPath, html);
  console.log('Fixed index.html - added type="module" to script tag');
} else {
  console.error('dist/index.html not found');
  process.exit(1);
}
