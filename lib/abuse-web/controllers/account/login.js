var injectable = require("abuse-web/inject").injectable,
    userRepository = require("abuse-web/userRepository").userRepository,
    content = require("abuse-web/content");

module.exports = injectable(content, userRepository, "postParameters", "userParameters",
                           function(content, userRepository, post, params) {
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
});
