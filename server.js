const express = require('express');
const app = express();
const port = 3000;
const router = express.Router();

router.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
  //__dirname : It will resolve to your project folder.
});

// app.get('/', (req,res) => {
//     res.send("Welcome to app");
// })

app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');