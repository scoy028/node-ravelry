var http = require('http'),
    assert = require('assert');

var Ravelry = require('./src');

var rav = new Ravelry({
    ravAccessKey: process.env.RAVACCESSKEY,
    ravSecretKey: process.env.RAVSECRETKEY,
    ravPersonalKey: process.env.RAVPERSONALKEY,
    callbackUrl: 'http://localhost:8080/callback'
}, [
    'forum-write', 'message-write', 'patternstore-read', 'deliveries-read'//, 'library-pdf'
]);
var i = 0, tempFav;
http.createServer(function(req,res){
    var url = req.url;
    console.log(req.method, url); //logging

    if (url === "" || url === "/") {
        rav.signInUrl(function(err, url){
            res.writeHead(302, {'Location': url} );
            res.end();
        });

    } else if (url.match('callback') ) {
        //TODO Can this be removed from User responsibility?
        url = require('url').parse(url, true);
        // rav.oauth_token = url.query.oauth_token; //this is already known.
        rav._oauth_verifier = url.query.oauth_verifier;

        rav.accessToken(function(err, user){
            res.writeHead(200, 'text/plain');
            res.end(JSON.stringify(user));
        });

    } else if (url === "/favicon.ico") {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();

    } else if (url === "/favorites") {
        if(i === 0){ //Get all favorites
            rav.favorites.list({page_size: 5}, function(err, data){
                if(err){
                    res.writeHead(err.statusCode, {'Message':err.data});
                    console.log(err);
                    res.end();
                    ++i;
                } else {
                    tempFav = JSON.parse(data).favorites[0];
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(data);
                    ++i;
                }
            });
        }
        if(i === 1){ //Get the first favorite from that list and store it.
            rav.favorites.show(tempFav.id, function(err, data){
                if(err){
                    res.writeHead(err.statusCode, {'Message':err.data});
                    console.log(err);
                    res.end();
                    ++i;
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(data);
                    ++i;
                }
            });
        }
        if(i === 2){ //Delete that first favorite
            rav.favorites.delete(tempFav.id, function(err, data){
                if(err){
                    res.writeHead(err.statusCode, {'Message':err.data});
                    console.log(err);
                    res.end();
                    ++i;
                } else {
                    console.log("\n***Deleted***\n");
                    console.log(data);
                    console.log("\n*************\n");
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(data);
                    ++i;
                }
            });
        }
        if(i === 3){ //Check that the favorite is deleted
            rav.favorites.list({page_size: 5}, function(err, data){
                if(err){
                    res.writeHead(err.statusCode, {'Message':err.data});
                    console.log(err);
                    res.end();
                    ++i;
                } else {
                    assert(JSON.parse(data).favorites[0] !== tempFav, "It was not deleted");
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(data);
                    ++i;
                }
            });
        }
        if(i === 4){ //Re-add that favorite
            var bundle = {
                comment: tempFav.comment,
                type: tempFav.type,
                favorited_id: tempFav.favorited.id
            };
            rav.favorites.create(bundle, function(err, data){
                if(err){
                    res.writeHead(err.statusCode, {'Message':err.data});
                    console.log(err);
                    res.end();
                    ++i;
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(data);
                    ++i;
                }
            });
        }
        if(i === 5){ //Check that the favorite is deleted
            rav.favorites.list({page_size: 5}, function(err, data){
                if(err){
                    res.writeHead(err.statusCode, {'Message':err.data});
                    console.log(err);
                    res.end();
                    i=0;
                } else {
                    assert(JSON.parse(data).favorites[0] !== tempFav, "It was not deleted");
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(data);
                    i=0;
                }
            });
        }







    } else if (url) {
        rav._get(url, function(err, data){
            if(err){
                res.writeHead(err.statusCode, {'Message':err.data});
                console.log(err);
                res.end();
            } else {
                res.writeHead(200, {'Content-Type':'application/json'});
                res.end( data);
            }
        });

    }else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();
    }

    // fs.createReadStream(__dirname + req.url).pipe(res);

}).listen(8080, '127.0.0.1');
