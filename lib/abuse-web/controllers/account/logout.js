var injectable = require("abuse-web/inject").injectable,
    userRepository = require("abuse-web/userRepository"),
    content = require("abuse-web/content");

module.exports = injectable(
    module, "logout",
    [userRepository, content, "userParameters"],
    function(userRepository, content, params) {
        userRepository.logout(function() {
            content.redirect(params.next || "/");
        });
    }
);
