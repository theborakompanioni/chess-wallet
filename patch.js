const fs = require('fs');
const f = 'node_modules/react-scripts/config/webpack.config.js';

fs.readFile(f, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/resolve: {/g, `resolve: {\
  fallback: {\
    "stream": require.resolve("stream-browserify")\
  },`);

  fs.writeFile(f, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});