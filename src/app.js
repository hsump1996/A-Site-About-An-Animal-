// app.js

const App = require('./webby.js');
const app = new App();

app.get('/gallery', function(req, res) {
  res.send('foo');
});

app.get('/bar', function(req, res) {
  res.send('<h1>bar</h1>');
});

app.listen(3000, '127.0.0.1');