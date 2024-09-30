require('dotenv').config();
const connectToMongo = require('./db.js');
connectToMongo();
const express = require('express');
const cors = require('cors')
const app = express();


app.use(cors())
const port = process.env.PORT;

app.use(express.json());

app.use('/auth/user', require('./Routes/authUser.js'));
app.use('/auth/admin', require('./Routes/authAdmin.js'));
app.use('/auth/superAdmin', require('./Routes/authSuperAdmin.js'));
app.use('/superAdmin/clothes', require('./Routes/clothes.js'));
app.use('/user/address', require('./Routes/address.js'));
app.use('/user/complains', require('./Routes/complains.js'));
app.use('/forgotPassword', require('./Routes/forgotPassword.js'));

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`)
})