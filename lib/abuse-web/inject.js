var injectableKey = "ZWOBBLE.abuse-web.inject.injectable.tokenKey";

exports.injector = function() {
    var bindings = {},
        get = function(key, done) {
            done = done || function() { };
            if (key in bindings) {
                inject(bindings[key], done);
            } else if (typeof key === "function") {
                inject(key, done);
            } else {
                require("sys").print("Key not in bindings: " + key);
                throw "Key not in bindings: " + key;
            }
        },
        injectInjectable = function(func, done) {
            var tokens = func[injectableKey],
                funcArgs = new Array(tokens.length),
                i = 0,
                nextArg = function() {
                    if (i < tokens.length) {
                        get(tokens[i], setNextArg);
                    } else {
                        funcArgs.push(done);
                        func.apply(undefined, funcArgs);
                    }
                },
                setNextArg = function(value) {
                    funcArgs[i] = value;
                    i += 1;
                    nextArg();
                };
            nextArg();
        },
        inject = function(func, done) {
            if (!(injectableKey in func)) {
                func(done);
            } else {
                injectInjectable(func, done);
            }
        },
        bind = function(key) {
            return {
                toInstance: function(value) {
                    bindings[key] = function(done) { done(value); };
                },
                toProvider: function(func) {
                    bindings[key] = func;
                },
                toFunction: function(func) {
                    bindings[key] = exports.injectable("injector", function(injector, done) {
                        done(function(done) {
                            injector.get(func, done);
                        });
                    });
                }
            };
        },
        injector = {
            bind: bind,
            get: get
        };
    
    injector.bind("injector").toInstance(injector);
    
    return injector;
};

exports.injectable = function() {
    var tokens = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        func = arguments[arguments.length - 1];
    func[injectableKey] = tokens;
    return func;
};
