var injectable = require("../../inject").injectable,
    userRepository = require("../../userRepository"),
    content = require("../../content");

module.exports = injectable(
    module, "logout",
    [userRepository, content, "userParameters"],
    function(userRepository, content, params) {
        userRepository.logout(function() {
            content.redirect(params.next || "/");
        });
    }
);
