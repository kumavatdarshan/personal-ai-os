// This line reads your .env file and loads your secret keys
// After this, process.env.MONGO_URI gives you the MongoDB link
require('dotenv').config();

// Import the libraries we installed
const express = require('express');     // the server
const mongoose = require('mongoose');   // the database connector
const cors = require('cors');           // allow frontend to talk to backend

// Create your server
// Think of "app" as the main object that controls everything
const app = express();

// These two lines tell the server how to handle incoming data
app.use(cors());          // allow requests from other origins (your frontend)
app.use(express.json());  // understand JSON data in requests

// Connect to MongoDB
// process.env.MONGO_URI reads the value from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // .then() runs when connection SUCCEEDS
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    // .catch() runs when connection FAILS
    console.log('❌ MongoDB connection failed:', error.message);
  });

// This is a "route" — when someone visits /test in the browser
// the server runs this function and sends back a response
app.get('/test', (req, res) => {
  // req = request (what the user sent)
  // res = response (what we send back)
  res.json({ message: 'Server is working perfectly!' });
});

// Start the server and listen for requests on port 5000
// A port is like a door number — 5000 is what we chose
app.use('/api/goals', require('./routes/goals'));

app.use('/api/habits', require('./routes/habits'));

app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 5000;
// process.env.PORT uses the value from .env
// || 5000 means "use 5000 if PORT is not set"

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});