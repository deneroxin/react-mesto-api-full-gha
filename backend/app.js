const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { Status } = require('./error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const allowedCors = [
  'https://mesto.deneroxin.nomoredomains.work',
  'http://localhost:3000',
];
const ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

const app = express();

app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  const { origin } = req.headers;
  const headers = allowedCors.includes(origin)
    ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': true,
    } : {};
  if (req.method === 'OPTIONS') {
    res.set({
      ...headers,
      'Access-Control-Allow-Methods': ALLOWED_METHODS,
      'Access-Control-Allow-Headers': req.headers['access-control-request-headers'],
    }).status(Status.NO_CONTENT).end();
  } else {
    res.set(headers);
    next();
  }
});

app.use(requestLogger);
app.use('/api', require('./routes'));

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = Status.INTERNAL_SERVER_ERROR } = err;
  const message = statusCode === Status.INTERNAL_SERVER_ERROR ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
});

mongoose.connect('mongodb://0.0.0.0:27017/mestodb');

app.listen(PORT, () => {
  console.log(`Port ${PORT} is ready to receive requests`);
});
