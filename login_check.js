var con = require('./connection');
var express = require("express");
var app = express();
const cors = require("cors");
const axios = require("axios");
const twilio = require("twilio");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); // Use cors as a function by invoking it with parentheses

const accountSid = 'AC005d72ed2bfc45c895b40de4d77bd3ab';
const authToken = '2adaeddf25d12f07961b75c0fe35020f';
const twilioClient = twilio(accountSid, authToken);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.post('/login_check', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    con.connect(function (error) {
        if (error) throw error;
        con.query('USE mydatabase', (err) => {
            if (err) throw err;
            var sql = "SELECT * from register WHERE username= '" + username + "'";
            con.query(sql, (er, results) => {
                if (er) throw er;
                if (results.length === 0) res.send("You are not registered");
                else {
                    if (password != results[0].password) res.send("Wrong credentials. Check your username and password and try again");
                    else {
                        const otp = Math.floor(100000 + Math.random() * 900000);
                        var sql1 = "SELECT phone_no from register WHERE username='" + username + "'";
                        con.query(sql1, (err, results1) => {
                            if (err) throw err;
                            const phoneNumber = results1[0].phone_no; // Get the first phone_no from the result
                            twilioClient.messages
                                .create({
                                    from: "+15739833475",
                                    to: phoneNumber,
                                    body: `Your OTP to complete the verification: ${otp}`,
                                })
                                .then(() => {
                                    // Send OTP to another server
                                    axios.post('http://localhost:3002/sendOTP', { otp })
                                        .then(response => {
                                            console.log('OTP sent successfully');
                                            res.redirect('http://localhost:3002/otp_login.html');
                                        })
                                        .catch(error => {
                                            console.error('Error sending OTP:', error);
                                            res.status(500).json({ message: "Failed to send OTP to webpaege." });
                                        });
                                    axios.post('http://localhost:3003/sendUN',{username})
                                        .then(response=>{
                                            console.log('Username sent successfully');
                                        })
                                        .catch(error=>{
                                            console.error("Error sending Username: ",error);
                                            res.status(500).json({})
                                        })
                                })
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json({ message: "Failed to send OTP." });
                                });
                        });
                    }
                }
            });
        });
    });
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
