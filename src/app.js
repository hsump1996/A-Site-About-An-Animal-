// app.js

const webby = require('./webby.js');

const app = new webby.App();

const path = require('path');

console.log(path.join(__dirname, '..', 'public'));

app.use(webby.static(path.join(__dirname, '..', 'public')));


app.get('/gallery', function(req, res) {
  const numberOfImages = Math.floor(Math.random() * 4) + 1; 
  const imageNumberArray = [];
  for (let i = 0; i < numberOfImages; i++) {
    const imageNumber = Math.floor(Math.random() * 4) + 1; 
    imageNumberArray.push(imageNumber);
  }
  const map1 = imageNumberArray.map(x => `<img src = "/img/animal${x}.jpg">`).join();
  res.send(`<html><head><link rel="stylesheet" href="/css/styles.css"></head><body>${map1}</body></html>`);
});


app.get('/pics', function(req, res) {
  res.status(308);
  res.set('Location','/gallery');
  res.send('');
});

app.listen(3000, '127.0.0.1');


