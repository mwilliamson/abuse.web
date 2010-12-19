var injectable = require("./inject").injectable,
    jsonTemplate = require("json-template"),
    fs = require('fs'),
    sys = require("sys");

exports.htmlContent = injectable("response", function(response, done) {
    done(function(templateName, json, status) {
        fs.readFile("templates/html/" + templateName + ".html", "utf-8", function(error, templateText) {
            fs.readFile("templates/html/base.html", "utf-8", function(error, baseTemplateText) {
                var template = jsonTemplate.fromString(templateText),
                    baseTemplate = jsonTemplate.fromString(baseTemplateText);
                
                response.writeHead(status || 200, {"Content-Type": "text/html"});
                response.end(baseTemplate.expand({body: template.expand(json), title: "Abuse"}));
            });
        });
    });
});
