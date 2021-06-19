var http = require('http');

var server = http.createServer(function (req, res) {

  if (req.url == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' }); 
    res.write('<html><body><p>This is the worker.</p></body></html>');
    res.end();
  }

});

server.listen(process.env.PORT);

console.log('Worker is running on port ' + process.env.PORT)