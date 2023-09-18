const con = require('./connection');
const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/image_select.html', (req, res) => {
    res.sendFile(__dirname + "/image_select.html");
});

let stored_username_; // To store the received username
app.post("/sendUserName", (req, res) => {
    stored_username_ = req.body.stored_username;
    res.json({ message: "Username received successfully." });
});

con.connect(error => {
    if (error) {
        console.error('Error connecting to MySQL:', error);
        return;
    }
    console.log('Connected to MySQL');
});

app.post('/submit', (req, res) => {
    const selectedImageNames = req.body.selectedImageNames;
    console.log('Selected image names:', selectedImageNames);

    con.query('USE mydatabase', (err) => {
        if (err) throw err;
        con.query('SELECT * FROM register WHERE username = ?', [stored_username_], (selectError, selectResult) => {
            if (selectError) {
                console.error('Error selecting row:', selectError);
                return res.status(500).send('Error selecting row');
            }

            if (selectResult.length === 0) {
                return res.status(404).send('User not found');
            }

            const jsonArray = JSON.stringify(selectedImageNames);

            const sql = 'UPDATE register SET images = ? WHERE username = ?';
            con.query(sql, [jsonArray, stored_username_], (updateError, updateResult) => {
                if (updateError) {
                    console.error('Error updating row:', updateError);
                    return res.status(500).send('Error updating row');
                }

                console.log('Updation Successful');
                // Send success response after all operations are complete
                res.json({message:'Registration Successful'});
            });
        });
    });
});

const port = 9001;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
