const express=require('express');
const mongoose = require("mongoose");
require('dotenv').config()
const bodyParser = require('body-parser');
//create express app
const app = express();
//setup server port
const port = 4000;

app.use(express.json());

//parse requests of content-type-application /url
app.use (bodyParser.urlencoded({extended:true}))

//parse requests of content-type-application/json
app.use(bodyParser.json());
app.get('/test',(req,res)=>(
    res.json({'message':'hello nodejs'})
))
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to database");
}).catch(err => console.log(err));

app.listen(port, () => {
    console.log(`Node server is running on port ${port}`);
});