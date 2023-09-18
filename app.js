const con = require('./connection');
const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const accountSid = 'AC005d72ed2bfc45c895b40de4d77bd3ab';
const authToken = '2adaeddf25d12f07961b75c0fe35020f';
const twilioClient = twilio(accountSid, authToken);

app.get("/index.html", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
let stored_otp;
let stored_username // Initialize with a default value

app.post("/sendUsername", (req, res) => {
  stored_username = req.body.username; // Update the value of stored_username
  res.json({ message: "Username received successfully." });
});

app.post("/sendOTP", (req, res) => {
  const phoneNumber = req.body.phone_num;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Please provide a valid phone number." });
  }

  con.connect(function (error) {
    if (error) throw error;
    con.query('USE mydatabase', (err) => {
      if (err) throw err;
      var sql = "UPDATE register SET phone_no='" + phoneNumber + "' WHERE username='" + stored_username + "'";
      con.query(sql, function (queryError, result) {
        if (queryError) throw queryError;
        else {
          const otp = Math.floor(100000 + Math.random() * 900000);
          stored_otp = otp;
          twilioClient.messages
            .create({
              from: "+15739833475",
              to: phoneNumber,
              body: `Your OTP to complete the verification: ${otp}`,
            })
            .then(() => {
              res.json({ message: "OTP sent successfully." });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ message: "Failed to send OTP." });
            });
        }
      });
    });
  });
});

app.post("/verifyOTP", (req, res) => {
  const entered_otp = parseInt(req.body.OTP);
  if (entered_otp === stored_otp) {
    // OTP verified successfully
    console.log("OTP verified successfully");
    axios.post('http://localhost:9001/sendUserName', { stored_username })
      .then(_response => {
        console.log('Username sent successfully');
        res.json({ message: 'OTP verified and username sent successfully.' });
      })
      .catch(error => {
        console.error('Error sending username:', error);
        res.status(500).json({ message: 'Error sending username' });
      });
  } else {
    // OTP not verified
    res.status(400).json({ message: 'OTP not verified' });
  }
});



const port = 9000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
