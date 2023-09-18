const con = require('./connection');
const express = require("express");
const app = express();
const axios = require("axios");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.post('/', (req, res) => {
  var full_name = req.body.full_name;
  var DOB = req.body.DOB;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password_input;

  con.connect(function (error) {
    if (error) throw error;
    con.query('USE mydatabase', (err) => {
      if (err) throw err;
      var sql1 = "SELECT * from register WHERE username='" + username + "'";
      con.query(sql1, function (queryError1, result1) {
        if (queryError1) throw queryError1;
        if (result1.length != 0) res.send("Username already defined.");
        else {
          var sql2 = "INSERT INTO register(full_name,DOB,username,email,password) VALUES ('" + full_name + "','" + DOB + "','" + username + "','" + email + "','" + password + "')";
          con.query(sql2, function (queryError2, result2) {
            if (queryError2) throw queryError2;
            axios.post('http://localhost:9000/sendUsername', { username })
              .then(response => {
                console.log('Username sent successfully');
                res.redirect('http://localhost:9000/index.html');
              })
              .catch(error => {
                console.error('Error sending username:', error);
              });
          });
        }
      });
    });
  });
});

const port = 7000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
