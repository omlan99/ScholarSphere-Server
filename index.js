const express = require('express');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(express())
app.use(express.json())

app.get('/', (req,res) =>{
    res.send('Data coming soon')
})

app.listen(port, () =>{
    console.log('app is running at port :', port)
})