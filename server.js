const express = require('express');
const mongodb = require('mongodb');
const sanitizeHTML = require('sanitize-html')
const env = require('./environment.js')

const app = express();
let db;

app.use(express.static('public'));

const connectionString = `mongodb+srv://${env.mongoUser}:${env.mongoPass}@cluster0-gh5ky.mongodb.net/${env.dbName}?retryWrites=true&w=majority`;
mongodb.connect(connectionString, {useNewUrlParser:true}, (err,client) => {
  db = client.db();
  app.listen(process.env.PORT || port);
});

// automatically take asynchronous requests (axios from browser) + add to body object lives on req object
app.use(express.json())

// automatically take submitted form data + add to body object lives on req object
app.use(express.urlencoded({extended:false}));

let port = 3000;

let passwordProtected = (req, res, next) => {
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"');
  if(req.headers.authorization == env.auth) { //"Basic YXV0aG9yOm9zY2FpbEFOZDByYXo="
    next()
  } else {
    res.status(401).send("Authentication required")
  }
}

// add password protection function to all urls
app.use(passwordProtected);

app.get('/', (req,res) => {
  db.collection('items').find().toArray( (err,items) => {
    items.forEach( (item) => console.log(item.text));
    res.send(`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
        </ul>
        
      </div>

      <script>
        let items = ${JSON.stringify(items)}
      </script>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
    </body>
    </html>`);
  });
})

app.post('/create-item', (req,res) => {
  // sanitize user input to prevent malicious html or js being injected into page
  let sanitaryText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').insertOne({text:sanitaryText}, (err, doc) => {
    // res.redirect('/');
    res.json(doc.ops[0])
  })
})

app.post('/update-item', (req, res) => {
  let sanitaryText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  // collection named 'items' | update field named 'text'
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)},{$set:{text: sanitaryText}}, () => {
    res.send("Success");
  })
})


app.post('/delete-item', (req, res) => {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, () => {
    res.send("Success");
  })
})

console.log('Running at Port: ' + port);