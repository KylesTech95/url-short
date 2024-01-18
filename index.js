require('dotenv').config();
require('https');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// connect databasegit 
const db = mongoose.connection
db.on('error',(error)=> console.error(error))
db.once('open',()=>console.log('Connected to database'))
let URL;
// mongoose setup
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@foreveryoung.v54iuua.mongodb.net/?retryWrites=true&w=majority`,{useNewUrlParser:true,useUnifiedTopology:true})
let urlSchema = new Schema({
  original_url:{type:String,required:true},
  short_url:Number
})
// setup counter for short_urls
let counter = 0;
// create&save url
const createAndSaveUrl = (url) => {
  // increment counter by 1
  counter = counter + 1;
  // what happens to my url argument?
  let newUrl = new URL({
    original_url:url,
    short_url: counter
  })
  newUrl.save(newUrl)
}


URL = mongoose.model("URL",urlSchema)
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json())
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// test valid url
const testValidURL = (url) => {
  const regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
  return regex.test(url)
}
// test URL model
app.get('/api/shorturl', async (req,res)=>{
  try{
    const url = await URL.find()
    // view database of urls in the terminal
    console.log(url)
    // test find document
    let whale = await URL.find({original_url:"http://whaleSperm.com"})
    res.send(whale[0].original_url)
  }
  catch(err){
    // error with status code
    res.status(500).json({message:err.message})
  }
})
// post valid url
app.post('/api/shorturl', async function(req, res) {
  let url = req.body.url
  if(testValidURL(url)){
    createAndSaveUrl(url)
    return res.json({original_url:url})
  }
  else{
    return res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`chilling on port: ${port}`);
});
