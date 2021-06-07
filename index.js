var express = require('express');
var porterAPI = require('./sites/mrporter/porter-api.js');

porterAPI.startLoadingItems();

var app = express();
app.set('view engine', 'jade');
app.set('views', './views');

app.get('/', function(req, res) {
  res.send('Hello');
});

app.get('/api', porterAPI.getAllSaleItems);

app.get('/mrporter', porterAPI.getAllItems);

app.get('/porter-restock', function(req, res) {
    res.render('porter-api', porterAPI.getRestockData());
});


app.get('/porter-all', function(req, res) {
    res.render('porter-api', porterAPI.getAllSaleItems());
});


const server = app.listen(3000);
