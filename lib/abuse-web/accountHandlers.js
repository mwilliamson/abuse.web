var injectable = require("./inject").injectable,
    content = require("./content").content;

// FIXME: should import htmlContent function directly, instead of using "htmlContent".
// If at some later date we decide to provide multiple implementations of htmlContent,
// we just change htmlContent to a string rather than a function

exports.login = injectable(content, "redirect", "userRepository", "postParameters", "userParameters",
                           function(content, redirect, userRepository, post, params) {
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
        redirect(next);
    }, function() {
        errors.push("Account not found. Check both the username and password.");
        loginContent(username);
    });
});

exports.register = injectable(content, "userRepository", "postParameters", function(content, userRepository, post) {
    var errors = [],
        user,
        registerContent = function(user) {
            content("account/register", {
                username: user.username,
                realname: user.realName,
                email: user.email,
                usernameMaxLength: "50",
                realnameMaxLength: "50",
                errors: errors
            });
        };
    if (post === null) {
        registerContent({
            username: "",
            realName: "",
            email: ""
        });
        return;
    }
    user = {
        username: post.username,
        realName: post.realname,
        email: post.email,
        password: post.password1
    };
    if (post.password1 !== post.password2) {
        errors.push("It helps if you enter the <strong>same</strong> password twice.");
        registerContent(user);
        return;
    }
    userRepository.create(user, function(result) {
        if (!result.valid) {
            if (result.missingUsername) {
                errors.push("Try entering a username, numbnuts.");
            }
            if (result.missingRealname) {
                errors.push("You need to enter your real name, you eejit.");
            }
            if (result.missingEmail) {
                errors.push("If you don't enter your e-mail address, I can't not sign you up for all sorts of spam.");
            }
            if (result.missingPassword) {
                errors.push("You see that password field? Try putting a password in.");
            }
            if (result.usernameTaken) {
                errors.push("Try being a bit more original. Somebody's already taken that username.");
            }
            if (result.invalidUsernameCharacters) {
                errors.push("Learn to read instructions. Your username was in the wrong format.");
            }
            registerContent(user);
        } else {
            content("account/registered");
        }
    });
});
