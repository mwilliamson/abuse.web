var injectable = require("./inject").injectable,
    userRepository = require("./userRepository").userRepository,
    content = require("./content").content,
    redirect = require("./content").redirect,
    captcha = require("./captcha");

exports.login = injectable(content, redirect, userRepository, "postParameters", "userParameters",
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

exports.logout = injectable(userRepository, redirect, "userParameters",
                            function(userRepository, redirect, params) {
    userRepository.logout(function() {
        redirect(params.next || "/");
    });
});

exports.register = injectable(content, userRepository, "request", "postParameters",
                              function(content, userRepository, request, post) {
    var errors = [],
        registerContent = function(user, captchaError) {
            content("account/register", {
                username: user.username,
                realname: user.realName,
                email: user.email,
                usernameMaxLength: "50",
                realnameMaxLength: "50",
                errors: errors,
                captchaError: captchaError || ""
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
    captcha.verify(post.recaptcha_challenge_field, post.recaptcha_response_field,
                   request.connection.remoteAddress, function(captchaCorrect, captchaError) {
        var user = {
            username: post.username,
            realName: post.realname,
            email: post.email,
            password: post.password1
        };
        if (!captchaCorrect) {
            errors.push("You got the CAPTCHA wrong, stupid.");
            registerContent(user, captchaError);
            return;
        }
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
                userRepository.login(user.username, user.password, function() {
                    content("account/registered");
                });
            }
        });
    });
});
