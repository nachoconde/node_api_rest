const express = require ('express');
const bodyParser = require('body-parser');
const app = express ();
const feedRoutes = require ('./routes/feed')

//https://medium.com/@mmajdanski/express-body-parser-and-why-may-not-need-it-335803cd048c
app.use(express.json());


app.use ( (req, res, next ) => {
    console.log ('headers');
    
    res.setHeader ('Access-Control-Allow-Origin', '*') ; //admitimos cualquier cliente
	res.setHeader ('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE' );
	res.setHeader ('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next ();

})
app.use ('/feed',feedRoutes);

app.listen (8080);


