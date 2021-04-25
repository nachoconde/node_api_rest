const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/user');

const mongoose = require('mongoose');
const MONGO_URI =
  'mongodb+srv://jfY8xA9DEGFlabL9:jfY8xA9DEGFlabL9@cluster0.spi4x.mongodb.net/feeds';
const path = require('path');
const multer = require('multer');
const winston = require('winston');

// const logger = winston.createLogger({
//   level: 'info',
//   transports: [
//     new winston.transports.Console(),
//     // Add Stackdriver Logging
//     loggingWinston,
//   ],
// });

// logger.add(
//   new winston.transports.Console({
//     format: winston.format.simple(),
//   })
// );

//configuro el almacenamiento en la carpeta images y el nombre que le doy en esa carpeta
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

//configuro los archivos admitidos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//confiuro que express suba las imágenes
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

//para parsear archivos json
app.use(express.json());

//para dar acceso a la carpeta images
app.use('/images', express.static(path.join(__dirname, 'images')));

//en la respuesta, añado las headers necesarias
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
//rutas de la aplicacion
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

//Manejo de errores, lo invoco desde los controladores y envio mensajes de error
app.use((error, req, res, next) => {
  console.log('errorMiddleware: ' + error);
  const status = error.statusCode || 500;
  const message = error.messsage;
  const data = error.data;

  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGO_URI)
  .then((sucess) => {
    const server = app.listen(8080);

    // logger.log({
    //   level: 'info',
    //   message: 'Hello distributed log files!',
    // });
    // logger.info('Hello again distributed logs');

    const io = require('./socket').init(server);

    io.on('connection', (socket) => {
      console.log('Client socket connected');
    });
  })
  .catch((err) => {
    console.log(err);
  });
