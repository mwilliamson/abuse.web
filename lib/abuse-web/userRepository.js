var client = require("./redis").client,
    crypto = require("crypto"),
    validUsernameCharacters = "abcdefghijklmnopqrstuvwxyz0123456789-_".split("");

exports.userRepository = function(done) {
    var existsWithUsername = function(name, callback) {
            client.exists("users:" + name + ":realname", function(error, value) {
                callback(error, value === 1);
            });
        },
        anyInvalidUsernameCharacters = function(name) {
            var i;
            for (i = 0; i < name.length; i += 1) {
                if (validUsernameCharacters.indexOf(name[i]) === -1) {
                    return true;
                }
            }
            return false;
        },
        validate = function(user, callback) {
            var key,
                valid = true,
                result = {};
            
            result.missingUsername = user.username.length === 0;
            result.missingRealname = user.realName.length === 0;
            result.missingEmail = user.email.length === 0;
            result.missingPassword = user.password.length === 0;
            result.invalidUsernameCharacters = anyInvalidUsernameCharacters(user.username);
            
            existsWithUsername(user.username, function(error, usernameTaken) {
                result.usernameTaken = usernameTaken;
                for (key in result) {
                    if (result[key]) {
                        valid = false;
                    }
                }
                result.valid = valid;
                
                callback(result);
            });
        };
    done({
        validate: validate,
        create: function(user, callback) {
            var key = function(field) {
                return "users:" + user.username + ":" + field;
            };
            validate(user, function(result) {
                if (!result.valid) {
                    callback(result);
                    return;
                }
                client.rpush("users", user.username, function(error, value) {
                    var salt = [],
                        passwordHash,
                        i,
                        lower = 33,
                        upper = 127,
                        charCode;
                    
                    // SHA1 has 160 bits, and each character is 6 bits (actually more than 6 bits, but nevermind)
                    // so we need 27 characters
                    for (i = 0; i < 27; i += 1) {
                        charCode = Math.floor(Math.random() * (upper - lower)) + lower;
                        salt.push(String.fromCharCode(charCode));
                    }
                    salt = salt.join("");
                    passwordHash = crypto.createHmac("sha1", salt).update(user.password).digest("base64")
                    client.mset(key("realname"), user.realName,
                                key("email"), user.email,
                                key("salt"), salt,
                                key("password"), passwordHash,
                                function(error, msetResult) {
                                    callback(result);
                                });
                });
            });
        }
    });
};
