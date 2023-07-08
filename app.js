var express = require('express');
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var dataSearchRouter = require('./routes/dataSearchRouter');
app.use('/data', dataSearchRouter);

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});

module.exports = app;
