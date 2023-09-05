const express = require('express')
const bodyParser = require('body-parser')
const server = express();
server.use(bodyParser.json());
 const db = require('./database/db');
 const bcrypt = require('bcrypt'); // for password hashing
 const jwt = require('jsonwebtoken'); // for JWT authentication


  

//Establish the Port
  server.listen(8085,function check(error) {
    if (error) 
    {
    console.log("Error....dddd!!!!");
    }
    else 
    {
        console.log("Started....!!!! 8085");
    }
});



const jwtSecretKey = 'ananthvishnuananthvishnu'; // Replace 'your-secret-key' with your actual secret key


server.post('/api/users/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Check if required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ status: false, message: 'All fields are required' });
  }

  // Check if the email already exists in the database
  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';

  db.query(checkEmailSql, email, (error, results) => {
    if (error) {
      return res.status(500).json({ status: false, message: 'Database error' });
    }

    if (results.length > 0) {
      // Email already exists
      return res.status(409).json({ status: false, message: 'Email already exists' });
    }

    // Hash the password before storing it in the database
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ status: false, message: 'Password hashing failed' });
      }

      const userDetails = {
        name: name,
        email: email,
        password: hash, // Store the hashed password
      };

      const insertUserSql = 'INSERT INTO users SET ?';

      db.query(insertUserSql, userDetails, (insertError) => {
        if (insertError) {
          return res.status(500).json({ status: false, message: 'User creation failed' });
        }

        // Generate a JWT token upon successful user creation
        const token = jwt.sign({ email: email }, jwtSecretKey, { expiresIn: '1h' });

        res.status(201).json({ status: true, message: 'User created successfully', token: token });
      });
    });
  });
});




//Create the Records
server.post("/api/users/add", (req, res) => {
  console.log(req.body);
    let details = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    let sql = "INSERT INTO users SET ?";
    db.query(sql, details, (error) => {
      if (error) {
        res.send({ status: false, message: "User created Failed" });
      } else {
        res.send({ status: true, message: "User created successfully" });
      }
    });
  });


//view the Records
server.get("/api/student", (req, res) => {
    var sql = "SELECT * FROM users";
    db.query(sql, function (error, result) {
      if (error) {
        console.log("Error Connecting to DB");
      } else {
        res.send({ status: true, data: result });
      }
    });
  });


//Search the Records
server.get("/api/student/:id", (req, res) => {
    var userid = req.params.id;
    var sql = "SELECT * FROM student WHERE id=" + userid;
    db.query(sql, function (error, result) {
      if (error) {
        console.log("Error Connecting to DB");
      } else {
        res.send({ status: true, data: result });
      }
    });
  });


//Update the Records
server.put("/api/student/update/:id", (req, res) => {
    let sql =
      "UPDATE student SET name='" +
      req.body.name +
      "', email='" +
      req.body.email +
      "',password='" +
      req.body.password +
      "'  WHERE id=" +
      req.params.id;
  
    let a = db.query(sql, (error, result) => {
      if (error) {
        res.send({ status: false, message: "Student Updated Failed" });
      } else {
        res.send({ status: true, message: "Student Updated successfully" });
      }
    });
  });


  //Delete the Records
  server.delete("/api/student/delete/:id", (req, res) => {
    let sql = "DELETE FROM student WHERE id=" + req.params.id + "";
    let query = db.query(sql, (error) => {
      if (error) {
        res.send({ status: false, message: "Student Deleted Failed" });
      } else {
        res.send({ status: true, message: "Student Deleted successfully" });
      }
    });
  });

 