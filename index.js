require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// test valid url
const testValidURL = (url) => {
  const regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
  return regex.test(url)
}
// post valid url
app.post('/api/shorturl', function(req, res) {
  let url = req.body.url
  console.log(url)
  if(testValidURL(url)){
    return res.json({original_url:url})
  }
  else{
    return res.json({ error: 'invalid url' });
  }
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
