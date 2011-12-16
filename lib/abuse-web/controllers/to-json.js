var client = require("abuse-web/redis").client,
    injectable = require("abuse-web/inject").injectable;

module.exports = injectable(
    module, "to-json",
    [client, "response"],
    function(redis, response) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("{}");
    }
);
