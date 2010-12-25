var injectable = require("./inject").injectable,
    jsonTemplate = require("json-template"),
    fs = require('fs'),
    sys = require("sys");

exports.redirect = injectable("response", function(response, done) {
    done(function(target) {
        response.writeHead(302, {"Location": target});
        response.end();
    });
});

exports.htmlContent = injectable("response", function(response, done) {
    done(function(templateName, json, status) {
        json = json || {};
        // TODO: implement readfiles that reads multiple files with utf8 charset
        fs.readFile("templates/html/" + templateName + ".html", "utf-8", function(error, templateText) {
            fs.readFile("templates/html/base.html", "utf-8", function(error, baseTemplateText) {
                var options = {
                        more_formatters: function(str) {
                            if (str.slice(0, 4) === "nav ") {
                                return function() {
                                    // TODO: should split out formatters
                                    // TODO: possibly move formatting into templates themselves
                                    // TODO: should read files once on load (at least for the formatters/base)
                                    var components = str.split(" ");
                                    if (components[1] === "start") {
                                        return '<ul class="links">';
                                    }
                                    if (components[1] === "end") {
                                        return '</ul>';
                                    }
                                    // TODO: escaping
                                    return '<li><a href="' + components[1] + '"><span class="linkArrow">&gt;</span>' + components.slice(2).join(" ") + '</a></li>'
                                };
                            }
                            return null;
                        }
                    },
                    template = jsonTemplate.fromString(templateText, options),
                    baseTemplate = jsonTemplate.fromString(baseTemplateText, options);
                
                response.writeHead(status || 200, {"Content-Type": "text/html"});
                response.end(baseTemplate.expand({body: template.expand(json), title: "Abuse"}));
            });
        });
    });
});
