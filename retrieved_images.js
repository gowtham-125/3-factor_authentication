const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const con=require('./connection');

app.get('/',(req,res)=>{
    con.connect(function(error){
        con.query('USE mydatabase',(err)=>{
            if(err) throw err;
            var sql="SELECT images from register WHERE username='Unlucky1'";
            con.query(sql,function(queryError,results){
                if(queryError)  throw queryError;
                const retrievedImagesJSON = results[0].images;
                const retrievedImages = JSON.parse(retrievedImagesJSON);

                // Now you can use retrievedImages as an array
                retrievedImages.forEach(element => {
                    console.log(element);
                });
            })
        });
    });
});

const port = 3007;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});