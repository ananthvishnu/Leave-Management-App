const express = require('express')
const bodyParser = require('body-parser')
const server = express();
server.use(bodyParser.json());
 const db = require('./database/db');
 const bcrypt = require('bcrypt'); // for password hashing
 const jwt = require('jsonwebtoken'); // for JWT authentication
 const nodemailer = require('nodemailer');
 const crypto = require('crypto'); // Add this at the top of your file

  

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



const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};






const jwtSecretKey = 'ananthvishnuananthvishnu'; // Replace 'your-secret-key' with your actual secret key

//Signup function  user
server.post('/api/users/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ status: false, message: 'All fields are required' });
    }

    // Check if the email already exists in the database
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';

    const results = await query(checkEmailSql, email);

    if (results.length > 0) {
      // Email already exists
      return res.status(409).json({ status: false, message: 'Email already exists' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = {
      name: name,
      email: email,
      password: hashedPassword, // Store the hashed password
    };

    const insertUserSql = 'INSERT INTO users SET ?';

    await query(insertUserSql, userDetails);

    // Generate a JWT token upon successful user creation
    const token = jwt.sign({ email: email }, jwtSecretKey, { expiresIn: '1h' });

    res.status(201).json({ status: true, message: 'User created successfully', token: token });
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ status: false, message: 'An error occurred during user creation' });
  }
});


// login function for user
server.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({ status: false, message: 'Email and password are required' });
    }

    // Check if the email exists in the database
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';

    const results = await query(checkEmailSql, email);

    if (results.length === 0) {
      // Email not found
      return res.status(401).json({ status: false, message: 'Email not found' });
    }

    // Compare the provided password with the stored hashed password
    const storedHashedPassword = results[0].password;

    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ status: false, message: 'Incorrect password' });
    }

    // Password is correct, generate a JWT token
    const token = jwt.sign({ email: email }, jwtSecretKey, { expiresIn: '1h' });

    res.status(200).json({ status: true, message: 'Login successful', token: token });
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ status: false, message: 'An error occurred during login' });
  }
});



//! Password Change function
// server.put("/api/users/change-password", async (req, res) => {
//   const { email, currentPassword, newPassword } = req.body;

//   try {
//     // Check if required fields are provided
//     if (!email || !currentPassword || !newPassword) {
//       return res.status(400).json({ status: false, message: 'Email, current password, and new password are required' });
//     }

//     // Check if the email exists in the database
//     const checkEmailSql = 'SELECT * FROM users WHERE email = ?';

//     const results = await query(checkEmailSql, email);

//     if (results.length === 0) {
//       // Email not found
//       return res.status(401).json({ status: false, message: 'Email not found' });
//     }

//     // Compare the provided current password with the stored hashed password
//     const storedHashedPassword = results[0].password;

//     const passwordMatch = await bcrypt.compare(currentPassword, storedHashedPassword);

//     if (!passwordMatch) {
//       return res.status(401).json({ status: false, message: 'Current password is incorrect' });
//     }

//     // Hash the new password before updating it in the database
//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     // Update the password in the database
//     const updatePasswordSql = 'UPDATE users SET password = ? WHERE email = ?';

//     await query(updatePasswordSql, [hashedNewPassword, email]);

//     res.status(200).json({ status: true, message: 'Password changed successfully' });
//   } catch (error) {
//     console.error(error); // Log any errors for debugging
//     res.status(500).json({ status: false, message: 'An error occurred during password change' });
//   }
// });


//!!! START **********************
server.post('/api/users/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(checkEmailSql, email);

    if (results.length === 0) {
      // Email not found
      return res.status(401).json({ status: false, message: 'Email not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store the reset token in your database associated with the user (update the user's record)
    const updateTokenSql = 'UPDATE users SET reset_token = ? WHERE email = ?';
    await query(updateTokenSql, [resetToken, email]);

    // Send the reset email
    sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ status: true, message: 'Password reset email sent', resetToken });
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ status: false, message: 'An error occurred during password reset request' });
  }
});

// Step 2: Create a function to send the password reset email
function sendPasswordResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    // Configure your email service provider here
    service: 'Gmail',
    auth: {
      user: 'athvicbaby@gmail.com', // Your email address
      pass: 'qwdo rmfp ihvr xypk',   // Your email password
    },
  });

  const mailOptions = {
    from: 'athvicbaby@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://yourwebsite.com/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ' + error);
    } else {
      console.log('Email sent: ' + info.response);
      // You can add additional logging or error handling here if needed
      res.status(200).json({message:"send mail successfully",token:resetToken})
    }
  });
}

// Step 3: Create an endpoint for resetting the password using the token
server.post('/api/users/change-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    // Verify the token and find the associated user
    const checkTokenSql = 'SELECT * FROM users WHERE email = ? AND reset_token = ?';
    const results = await query(checkTokenSql, [email, token]);

    if (results.length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid token or email' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    const updatePasswordSql = 'UPDATE users SET password = ?, reset_token = NULL WHERE email = ?';
    await query(updatePasswordSql, [hashedPassword, email]);

    res.status(200).json({ status: true, message: 'Password reset successful' });
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ status: false, message: 'An error occurred during password reset' });
  }
});


//view the All users in Registerd
server.get("/api/users", (req, res) => {
    var sql = "SELECT * FROM users";
    db.query(sql, function (error, result) {
      if (error) {
        console.log("Error Connecting to DB");
      } else {
        res.send({ status: true, data: result });
      }
    });
  });


//Search the Records of All register users
server.get("/api/users/:id", (req, res) => {
    var userid = req.params.id;
    var sql = "SELECT * FROM users WHERE id=" + userid;
    db.query(sql, function (error, result) {
      if (error) {
        console.log("Error Connecting to DB");
      } else {
        res.send({ status: true, data: result });
      }
    });
  });



//Update the Records
server.put("/api/users/update/:id", (req, res) => {
    let sql =
      "UPDATE users SET name='" +
      req.body.name +
      "', email='" +
      req.body.email +
      "',password='" +
      req.body.password +
      "'  WHERE id=" +
      req.params.id;
  
    let a = db.query(sql, (error, result) => {
      if (error) {
        res.send({ status: false, message: "User Updated Failed" });
      } else {
        res.send({ status: true, message: "User Updated successfully" });
      }
    });
  });


  //Delete the Records
  server.delete("/api/users/delete/:id", (req, res) => {
    let sql = "DELETE FROM users WHERE id=" + req.params.id + "";
    let query = db.query(sql, (error) => {
      if (error) {
        res.send({ status: false, message: "User Deleted Failed" });
      } else {
        res.send({ status: true, message: "User Deleted successfully" });
      }
    });
  });

 

  //!  Employees cruds for Admin
  // Create a Employee
server.post('/api/employee/add', (req, res) => {
  try {
      let details = {
          name: req.body.name,
          email: req.body.email,
          address: req.body.address,
          phonenumber: req.body.phonenumber,
          NIC:req.body.NIC,
      };

      // Add to the database
      let sql = "INSERT INTO employees SET ?";
      db.query(sql, details, (error, results) => {
          if (error) {
              console.log('Error inserting data:', error);
              res.status(500).json({ status: false, message: "Failed to insert data" });
          } else {
              console.log('Data inserted successfully');
              res.status(200).json({ status: true, message: "Data inserted successfully" });
          }
      });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ status: false, message: "An error occurred while processing your request" });
  }
});



// view the Employee details
server.get("/api/employee", (req,res) => {
  var sql = 'SELECT * FROM employees';
  db.query(sql, function(error, result){
      if(error){
          console.log("not found!")
      }else{
          res.send({status:true, data:result})
      }
  })
})


// get the single data for Employee
server.get("/api/employee/:id", (req,res) => {
var employeeid = req.params.id;
var sql = 'SELECT * FROM employees WHERE id=' + employeeid;
db.query(sql, function(error, result){
  if(error) {
      console.log("error connecting for the db search")
  } else {
      res.send({status:true, data: result})
  }
}) 
})


// update the Employee data
server.put("/api/employee/update/:id", (req, res) => {
  let sql =
    "UPDATE employees SET name='" +
    req.body.name +
    "', email='" +
    req.body.email +
    "',address='" +
    req.body.address +
    "',phonenumber='" +
    req.body.phonenumber +
    "',NIC'" +
    req.body.NIC +
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

// delete the Employee 
server.delete("/api/employee/delete/:id", (req,res) => {
  let sql = "DELETE FROM employees WHERE id=" +
  req.params.id + "";
  let query = db.query(sql, (error) => {
      if(error) {
          res.send({status: false , message:"deleted failed"})
      } else{
          res.send({status:true, message:"deleted Successfully"})
      }
  })
});


