const http = require("http");
const db = require("./database & servers/database");

http.createServer((req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("Server running with MySQL connected");
    res.end();
}).listen(3000);

console.log("Running on port 3000");