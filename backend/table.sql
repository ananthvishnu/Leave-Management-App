CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL ,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL
);


CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL ,
    email VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(100) NOT NULL ,
    phonenumber VARCHAR(20) NOT NULL, 
    NIC VARCHAR(30) NOT NULL
);



         
            
qwdo rmfp ihvr xypk