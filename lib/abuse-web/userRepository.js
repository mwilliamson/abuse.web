var client = require("./redis").client,
    crypto = require("crypto"),
    injectable = require("./inject").injectable,
    uuid = require("node-uuid").v4,
    validUsernameCharacters = "abcdefghijklmnopqrstuvwxyz0123456789-_".split(""),
    keys = require("./dataKeys");

module.exports = injectable(
    ["request", client],
    function(request, client, done) {
        var hashPassword = function(salt, password) {
                return crypto.createHmac("sha1", salt).update(password).digest("base64");
            },
            existsWithUsername = function(name, callback) {
                client.exists(keys.forUser(name).realName, function(error, value) {
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
                var userKeys = keys.forUser(user.username);
                validate(user, function(result) {
                    if (!result.valid) {
                        callback(result);
                        return;
                    }
                    client.rpush(keys.userList, user.username, function(error, value) {
                        var salt = [],
                            passwordHash,
                            i,
                            lower = 33,
                            upper = 127,
                            charCode;
                        
                        for (i = 0; i < 27; i += 1) {
                            charCode = Math.floor(Math.random() * (upper - lower)) + lower;
                            salt.push(String.fromCharCode(charCode));
                        }
                        salt = salt.join("");
                        passwordHash = hashPassword(salt, user.password);
                        client.msetnx(userKeys.realName, user.realName,
                                      userKeys.email, user.email,
                                      userKeys.salt, salt,
                                      userKeys.password, passwordHash,
                        function(error, wasSet) {
                            if (wasSet) {
                                callback(result);
                            } else {
                                callback({
                                    valid: false,
                                    usernameTaken: true
                                });
                            }
                        });
                    });
                });
            },
            login: function(username, password, onSuccess, onFailure) {
                var userKeys = keys.forUser(username);
                client.mget(userKeys.salt, userKeys.password, function(error, result) {
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
                        client.mset(userKeys.authToken, authToken, function(error, result) { 
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
            logout: function(callback) {
                // FIXME: shouldn't be playing around with the request here
                // FIXME: should clear cookie if the authtoken isn't valid
                if (request.session) {             
                    client.del(keys.forUser(request.session.userId).authToken, function(error, result) {
                        request.session = undefined;
                        callback();
                    });
                } else {
                    callback();
                }
            },
            authenticate: function(username, authToken, onSuccess, onFailure) {
                client.get(keys.forUser(username).authToken, function(error, result) {
                    if (result === null || result.toString() != authToken) {
                        (onFailure || onSuccess)(null);
                        return;
                    }
                    onSuccess({username: username});
                });
            }
        });
    }
);
