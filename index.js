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

// findone
const findOneURL = async (model,param,res)=>{
  let urlFound = await model.findOne({short_url:param})
  res.json({original_url:urlFound.original_url,short_url:urlFound.short_url})
}
// create&save url
const createAndSaveUrl = (url,number) => {

  // what happens to my url argument?
  let newUrl = new URL({
    original_url:url,
    short_url: number
  })
  newUrl.save(newUrl)
}
// delete many documents
const dropAllDocuments = async (model) => {
  try{
    const deleteAll = await model.deleteMany({short_url:{"$lt": 101}})
    console.log(deleteAll)
  }
  catch(err){
    console.log(err)
  }
}
// check for documents
const check4Documents = async (model) => {
  const url = await model.find()
  console.log(url)
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
    // res.send(dropAllDocuments(URL))
    //check if anything is stored in the db
    check4Documents(URL)
    // view database of urls in the terminal
    // test find document
    // let whale = await URL.find({original_url:"http://whaleSperm.com"})
    // res.send(whale[0].original_url)
  }
  catch(err){
    // error with status code
    res.status(500).json({message:err.message})
  }
})
// Random number for short_url
const randomNum = () => {
  return Math.floor(Math.random()*100);
}
// post valid url
app.post('/api/shorturl', function(req, res) {
  let num = randomNum() 
  let url = req.body.url
  if(testValidURL(url)){
    createAndSaveUrl(url,num)
    return res.json({original_url:url,short_url:num})
  }
  else{
    return res.json({ error: 'invalid url' });
  }
});
// post valid url from short_url
app.get('/api/shorturl/:id', async (req,res)=>{
try{
let id = req.params.id;
findOneURL(URL,id,res)
}
catch(err){
res.status(500).json({message:err.message})
}
})
app.listen(port, function() {
  console.log(`chilling on port: ${port}`);
});
