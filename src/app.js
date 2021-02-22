// app.js

const App = require('./demo.js');
const app = new App();

app.get('/foo', function(req, res) {
  res.send('foo');
});

app.get('/bar', function(req, res) {
  res.send('<h1>bar</h1>');
});

app.listen(3000, '127.0.0.1');