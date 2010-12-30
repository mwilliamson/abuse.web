var client = require("redis-client").createClient();

exports.client = function(done) {
    done(client);
};
