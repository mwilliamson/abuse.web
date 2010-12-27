var injectable = require("./inject").injectable;

module.exports = injectable("request", "userRepository", function(request, userRepository, done) {
    // FIXME: should convert this to middleware and just return the user here
    var session = request.session;
    if (session) {
        userRepository.authenticate(session.userId, session.authToken, done);
    } else {
        done(null);
    }
    
});
