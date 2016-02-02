var injectable = require("../../inject").injectable,
    userRepository = require("../../userRepository"),
    content = require("../../content");

module.exports = injectable(
    [userRepository, content, "userParameters"],
    function(userRepository, content, params) {
        userRepository.logout(function() {
            content.redirect(params.next || "/");
        });
    }
);
