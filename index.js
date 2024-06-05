const express = require('express');
const app = express();
const port = 8080;
const connectDB = require('./helpers/connectDB')
const router = require('./helpers/routes');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.json());
app.use("/", router);

connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to my Node.js microservice!');
});
  
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});