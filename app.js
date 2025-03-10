const express = require('express');
const app = express(); 
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
 require('dotenv/config');
const api = process.env.API_URL;
const port = process.env.PORT || 3001; 

 
const usersRouter = require('./routers/user.js');
const sessionRouter = require('./routers/session');

  
 
app.use(cors()); 
app.options('*',cors ());


app.use(express.json()); 
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

//Routes
app.use(`${api}/users`, usersRouter);
app.use(`${api}/session`, sessionRouter);

//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'salle_de_jeuxx-database'
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

app.get('/', (req, res) => { 
    res.send('Hello, Azure! This is a Node.js application.'); 
  }); 
    
 app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`); 
})


module.exports = app;
 