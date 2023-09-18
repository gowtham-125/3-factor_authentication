var mysql=require("mysql");
var con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    db_name:'mydatabase'
});
module.exports=con;