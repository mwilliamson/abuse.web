var injectable = require("../../inject").injectable,
    userRepository = require("../../userRepository"),
    content = require("../../content");

module.exports = injectable(
    module, "login",
    [content, userRepository, "postParameters", "userParameters", "user"],
    function(content, userRepository, post, params, user) {
        var errors = [],
            username,
            password,
            next = params.next || "/",
            loginContent = function(username) {
                content("account/login", {
                    username: username || "",
                    next: next,
                    errors: errors
                });
            };
        if (user !== null) {
            content.redirect(next);
            return;
        }
        if (post === null) {
            loginContent();
            return;
        }
        username = post.username;
        password = post.password;
        if (username === "") {
            errors.push("Entering a username might help.");
            loginContent(username);
            return;
        }
        userRepository.login(username, password, function() {
            content.redirect(next);
        }, function() {
            errors.push("Account not found. Check both the username and password.");
            loginContent(username);
        });
    }
);
