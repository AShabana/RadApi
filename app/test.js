var sql = require("mysql") ;
var util = require("util") ;


var con = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "redhat",
  database : "radius"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  query_string = "select * from radcheck; " ;
  con.query(query_string, function (err, result) {
    if (err) throw err;
    console.log("Result: " + util.inspect(result));
  });
});