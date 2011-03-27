var injectable = require("./inject").injectable,
    userRepository = require("./userRepository");

module.exports = injectable(
    module, "userProvider", 
    ["request", userRepository],
    function(request, userRepository, done) {
        // FIXME: should convert this to middleware and just return the user here
        var session = request.session;
        if (session) {
            userRepository.authenticate(session.userId, session.authToken, done);
        } else {
            done(null);
        }
    }
);
