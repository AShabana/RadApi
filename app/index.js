var express = require('express') ;
var sql = require('mysql') ;
var util = require('util') ;
var log4js = require('log4js');

var log = log4js.getLogger();
log.level = 'trace';
var app = express();


log.info("Appliocation starting ...") ;
log.info("Application current log level = " + log.level);
log.info("Initiating the DataBase Connection");

var con = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "redhat",
  database : "radius"
});

con.connect(function(err){
    if (err) throw err;
    log.debug("DB Connected!") ;
});

var normalizeInput = function(input) {
    var inputBadCharsRegex = /(\s+)|;|\||\*|(|)|"|'|&/g; // black listed char collectin
    return input.replace(inputBadCharsRegex, '') ;
} ;

app.get("/", function(req, resp) {
    resp.status(200).send("Done.") ;
}) ;

app.get("/Accounts", function(req, resp){
    query_string = "select * from radcheck;";
    con.query(query_string, function(err, result){
            if (err) throw err; 
            log.debug("Result: " + util.inspect(result));
            resp.status(200).send(result);
    });
}) ;

//Add account
app.put("/Account", function(req ,resp) {
   log.info("Add new account request")  ;
   log.trace("req.params ->" + util.inspect(req.params));
   log.trace("req.query ->" + util.inspect(req.query));
   if (req.query.name === undefined || req.query.password === undefined ){
         log.warn("Invalid add new account request  you should use password and name paramter in the query string");
         resp.status(400).send("Invalid add new account request you should use password and name paramter in the query string") ;
   }else{
        log.info("Adding new account proceedure") ;
        query_string = util.format(
            "select count(*) as count from radcheck where username = \'%s\';"
            ,normalizeInput( req.query.name)) ;
        log.trace("DB query : " + query_string);
        con.query(query_string, function(err, result){
            if (err) throw err;
            log.trace("Query result : \n\t"  + util.inspect(result));
            log.trace(result[0].count);
            result = result[0].count;
            if (parseInt(result) == 0){
                query_string = util.format("INSERT INTO radcheck (username,value,attribute) VALUES (\"%s\",\"%s\", \"Cleartext-Password\")\;" ,normalizeInput(req.query.name),normalizeInput(req.query.password));
                log.trace("DB query : " + query_string);
                con.query(query_string, function(err, result){
                    if (err) throw err ;
                    log.trace("Query result : \n\t"  + util.inspect(result));
                    resp.status(200).send("Done.\<br> inserted id = " + result.insertId);
                });
            }else{
                log.warn("User exist before");
                resp.status(400).send("User " + this.user + " exist before</br>");
            }
        });
    }
});

//Delete account
app.delete("/Account/:acc_name", function(req ,resp){
   log.info("Remove account request")  ;
   log.trace("req.params ->" + util.inspect(req.params));
   log.trace("req.query ->" + util.inspect(req.query));
   acc_name = req.params.acc_name ;
   if (acc_name === undefined){
         log.warn("Invalid remove account request  you should use name paramter in the query string");
         resp.status(400).send("Invalid delete account request you should use and name paramter in the query string") ;
   }else{
        log.info("Deleting new account proceedure") ;
        query_string = util.format(
            "select count(*) as count from radcheck where username = \'%s\';"
            ,normalizeInput(acc_name)) ;
        log.trace("DB query : " + query_string);
        con.query(query_string, function(err, result){
            if (err) throw err;
            log.trace("Query result : \n\t"  + util.inspect(result));
            log.trace(result[0].count);
            result = result[0].count;
            if (parseInt(result) > 0){
                query_string = util.format("DELETE FROM radcheck where username = \'%s\';" ,normalizeInput(acc_name));
                log.trace("DB query : " + query_string);
                con.query(query_string, function(err, result){
                    if (err) throw err ;
                    log.trace("Query result : \n\t"  + util.inspect(result));
                    resp.status(200).send("Done.\<br> inserted id = " + result.insertId);
                });
            }else{
                log.warn("User does not exist before");
                resp.status(400).send("User " + this.user + " does not exist before</br>");
            }
        });
    }
});



//Update account info
app.post("/Account/:acc_name", function(req ,resp){
   log.trace("req.params ->" + util.inspect(req.params));
    if ( typeof req.params.acc_name === undefined || req.params.acc_name === null)
        resp.status(400).send("Invalid request, missing acc_name as /Account/:acc_name");
    resp.send("Updating account -> " + req.params.acc_name);
});

//Get account info
app.get("/Account/:acc_name", function(req ,resp){
   log.trace("req.params ->" + util.inspect(req.params));
    if ( typeof req.params.acc_name === undefined || req.params.acc_name === null)
        resp.status(400).send("Invalid request, missing acc_name as /Account/:acc_name");
    resp.send("Get account info for account -> " + req.params.acc_name);
});



//app.prototype.conn = con ;

log.info('Application start listening @ tcp.port = 3000 ...') ;
app.listen(3000) ;