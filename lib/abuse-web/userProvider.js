var injectable = require("./inject").injectable;

module.exports = injectable("request", "userRepository", function(request, userRepository, done) {
    var session = request.session;
    if (session) {
        userRepository.authenticate(session.userId, session.authToken, done);
    } else {
        done(null);
    }
    
});
