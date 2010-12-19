var injectableKey = "ZWOBBLE.abuse-web.inject.injectable.tokenKey";

// TODO: need to support async providers

exports.injector = function() {
    var bindings = {},
        get = function(key, done) {
            done = done || function(value) {
                return value;
            };
            if (key in bindings) {
                return inject(bindings[key], done);
            }
            if (typeof key === "function") {
                return inject(key, done);
            }            
            require("sys").print("Key not in bindings: " + key);
            throw "Key not in bindings: " + key;
        },
        injectInjectable = function(func, done) {
            var tokens = func[injectableKey],
                funcArgs = new Array(tokens.length),
                i = 0,
                isCallback = false,
                result,
                nextArg = function() {
                    isCallback = false;
                    if (i < tokens.length) {
                        return get(tokens[i], setNextArg);
                    } else {
                        funcArgs.push(done);
                        result = func.apply(undefined, funcArgs);
                        if (result !== undefined) {
                            return done(result);
                        }
                    }
                },
                setNextArg = function(value) {
                    if (value === undefined && !isCallback) {
                        isCallback = true;
                    } else {
                        funcArgs[i] = value;
                        i += 1;
                        return nextArg();
                    }
                };
            return nextArg();
        },
        inject = function(func, done) {
            if (func[injectableKey] === undefined) {
                return done(func());
            }
            return injectInjectable(func, done);
        },
        bind = function(key) {
            return {
                toInstance: function(value) {
                    bindings[key] = function() { return value; };
                },
                toProvider: function(func) {
                    bindings[key] = func;
                },
                toFunction: function(func) {
                    bindings[key] = exports.injectable("injector", function(injector) {
                        return function() {
                            return injector.get(func);
                        };
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
