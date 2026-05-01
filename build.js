const fs = require('fs');

// ======================
// JS BUILD
// ======================
const files = [
  'src/Store.js',
  'src/Reducer.js',
  'src/Interceptors.js',
  'src/UIComponents.js',
  'src/App.js'
];

const bundle = files
  .map(file => {
    let code = fs.readFileSync(file, 'utf8');

    // Remove CommonJS exports
    code = code.replace(/module\.exports\s*=\s*\{.*?\};?/gs, '');
    code = code.replace(/if\s*\(typeof\s*module\s*!==\s*'undefined'.*?\}/gs, '');

    return `\n;/* ---- ${file} ---- */\n(function(){\n${code}\n})();`;
  })
  .join('\n');

// Wrap for GAS safety
const wrappedBundle = `<script>\n${bundle}\n</script>`;

fs.writeFileSync('dist/bundle.js.html', wrappedBundle);
console.log("✅ JS bundle built: dist/bundle.js.html");


// ======================
// CSS BUILD
// ======================
const css = fs.readFileSync('src/style.css', 'utf8');

const cssHtml = `<style>\n${css}\n</style>`;

fs.writeFileSync('dist/style.css.html', cssHtml);
console.log("✅ CSS built: dist/style.css.html");