const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const path = require('path');


//middlewares
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//mongodb connection
mongoose.set('strictQuery', false);
const db = mongoose.connection;
mongoose.connect('mongodb://127.0.0.1:27017/subadmin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () =>{
    console.log("database connected")
});

//schema

const subAdminSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  });

  
  
const SubAdmin = mongoose.model('SubAdmin', subAdminSchema);



//api to signup
app.post("/signup", async(req,res) =>{
    try{
        const {username, password, email, address, phoneNumber} = req.body;

         // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Check if username or email already exists
        const existingUser = await SubAdmin.findOne({
          $or: [{ username }, { email}] });
        if (existingUser) {
          return res.status(409).json({ message: 'Username or email already exists' });
        };

        
        // Create a new SubAdmin instance
        const subAdmin = new SubAdmin({
          username,
          password: hashedPassword,
          email,
          address,
          phoneNumber
        });
  
        // Save the subAdmin to the database
        await subAdmin.save();
        //res.status(201).json({ message: 'Sub-Admin signup successful' });
        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      };
});

//api to login
app.post("/login", async(req, res) =>{
    try{
        const { username, password} = req.body; 
        
        // Check if the user exists in the database
        const user = await SubAdmin.findOne({ username });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Check if the provided password matches the stored password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid password' });
        }
    
        res.status(200).json({ message: 'Login successful' });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      };
    
});

app.get("/login", (req, res) =>{
    const filePath = path.join(__dirname, 'frontend/login.html');
    res.sendFile(filePath);
});

app.get("/", (req, res) =>{
    const filePath = path.join(__dirname, 'frontend/signup.html');
    res.sendFile(filePath);
});


//server listening
app.listen(port, () =>{
    console.log(`server is running at port no ${port}`);
});
