const express = require('express');
const cors = require('cors')
const app = express();


app.use(cors())
const port = 5000;

app.use(express.json());


app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`)
})