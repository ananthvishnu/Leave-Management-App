const mysql = require("mysql");


//Establish the database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Vishnu2002@",
    database: "mydatabase",
});
db.connect(function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("successfully Connected to DB");
    }
  }); 



  

  module.exports = db;