var client = require("./redis").client,
    crypto = require("crypto"),
    injectable = require("./inject").injectable,
    uuid = require("Math.uuid").uuid,
    validUsernameCharacters = "abcdefghijklmnopqrstuvwxyz0123456789-_".split("");

exports.userRepository = injectable("request", function(request, done) {
    var keyForUsername = function(username) {
            return function(field) {
                return "users:" + username + ":" + field;
            };
        },
        hashPassword = function(salt, password) {
            return crypto.createHmac("sha1", salt).update(password).digest("base64");
        }
        existsWithUsername = function(name, callback) {
            client.exists(keyForUsername(name)("realname"), function(error, value) {
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
            var key = keyForUsername(user.username);
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
                    passwordHash = hashPassword(salt, user.password);
                    client.mset(key("realname"), user.realName,
                                key("email"), user.email,
                                key("salt"), salt,
                                key("password"), passwordHash,
                                function(error, msetResult) {
                                    callback(result);
                                });
                });
            });
        },
        login: function(username, password, onSuccess, onFailure) {
            var key = keyForUsername(username);
            client.mget(key("salt"), key("password"), function(error, result) {
                if (result[0] === null) {
                    onFailure();
                    return;
                }
                var salt = result[0].toString(),
                    correctPasswordHash = result[1].toString(),
                    submittedPasswordHash = hashPassword(salt, password),
                    authToken;
                if (correctPasswordHash === submittedPasswordHash) {
                    authToken = uuid();
                    client.mset(key("authToken"), authToken, function(error, result) { 
                        // FIXME: shouldn't be playing around with the request here
                        request.session = {
                            userId: username,
                            authToken: authToken
                        };
                        onSuccess();
                    });
                } else {
                    onFailure();
                }
            });
        },
        authenticate: function(username, authToken, onSuccess, onFailure) {
            client.get(keyForUsername(username)("authToken"), function(error, result) {
                if (result === null) {
                    (onFailure || onSuccess)(null);
                    return;
                }
                onSuccess({username: username});
            });
        }
    });
});
