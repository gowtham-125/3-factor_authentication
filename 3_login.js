const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const con = require('./connection');

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let received_username;

app.post('/sendUN', (req, res) => {
    received_username = req.body.username;
    res.send('UserName received successfully');
});

app.get('/graphical_login.html', (req, res) => {
    res.sendFile(__dirname + "/graphical_login.html");
});

app.post('/submit', (req, res) => {
    const selectedItems = req.body.selectedItems;
    let direction = req.body.direction;
    const frontend_images = req.body.images;
    console.log('Selected items:', selectedItems);
    console.log('Direction:', direction);
    if (direction === '←') {
        direction = 'left';
    } else if (direction === '→') {
        direction = 'right';
    } else if (direction === '↑') {
        direction = 'up';
    } else if (direction === '↓') {
        direction = 'down';
    }

    // Logic to retrieve images from the database
    con.connect(function (error) {
        if (error) throw error;
        con.query('USE mydatabase', (err) => {
            if (err) throw err;
            var sql = "SELECT images from register WHERE username='" + received_username + "'";
            con.query(sql, function (queryError, results) {
                if (queryError) throw queryError;
                const retrievedImagesJSON = results[0].images;
                const retrievedImages = JSON.parse(retrievedImagesJSON);

                // Logic to compare retrieved images with frontend images
                let success = true;
                const matchedIndices = [];

                selectedItems.forEach((selectedItem) => {
                    const { row, col } = calculateRowCol(selectedItem, frontend_images);

                    let newRow = row;
                    let newCol = col;
                    
                    if (direction === 'left') {
                        newCol = (col + 1) % totalColumns;
                    } else if (direction === 'right') {
                        newCol = (col - 1 + totalColumns) % totalColumns;
                    } else if (direction === 'up') {
                        newRow = (row + 1) % totalColumns;
                    } else if (direction === 'down') {
                        newRow = (row - 1 + totalColumns) % totalColumns;
                    }
                    console.log(newRow,newCol);
                    const newIndex = calculateFlattenedIndex(newRow, newCol);
                    const imageName = frontend_images[newIndex];
                    const imageNameOnly = path.basename(imageName); 
                    console.log(imageName);
                    const matchedIndex = retrievedImages.findIndex(image => image === imageNameOnly);

                    if (matchedIndex !== -1) {
                        matchedIndices.push(matchedIndex);
                        retrievedImages.splice(matchedIndex, 1);
                    } else {
                        success = false;
                    }
                });

                if (success) {
                    console.log('Login successful');
                    res.json({ message: 'Login successful' });
                } else {
                    console.log('Login failed');
                    res.json({ message: 'Login failed' });
                }
            });
        });
    });
});

function calculateRowCol(index, frontendImages) {
    const { row, col } = index; // Assuming index contains row and col properties
    return { row, col };
}

function calculateFlattenedIndex(row, col) {
    return row * totalColumns + col;
}

const totalColumns = 5; // Change this to the actual number of columns
const port = 3003;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
