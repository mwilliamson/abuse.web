var injectable = require("./inject").injectable;

exports.register = injectable("htmlContent", "userRepository", "postParameters", function(content, userRepository, post) {
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
