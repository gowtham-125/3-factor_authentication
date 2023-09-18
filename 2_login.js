var express = require("express");
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const cors=require("cors");
app.use(cors());

let sent_otp;
app.post('/sendOTP',(req,res)=>{
    sent_otp=req.body.otp;
    res.json({message:"OTP recieved successfully"});
});

app.get("/otp_login.html",(req,res)=>{
    res.sendFile(__dirname+"/second.html");
});

app.post("/verifyOTP", (req, res) => {
    const enteredOTP = req.body.enteredOTP; // OTP entered by the user

    if (enteredOTP === sent_otp.toString()) {
        // OTP verified successfully
        console.log("OTP verified successfully");
        res.json({ message: "OTP verified successfully.", redirectTo: "http://localhost:3003/graphical_login.html" });
    } else {
        // OTP not verified
        console.log("OTP not verified");
        res.json({ message: "OTP verification failed." });
    }
});

const port = 3002;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});