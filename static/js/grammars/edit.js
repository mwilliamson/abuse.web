$(document).ready(function() {
    var timer,
        undefined,
        scrollToLine = function(element, line, totalLines) {
            var lineHeight = element.scrollHeight / totalLines,
                scrollTo = line * lineHeight;
            if (scrollTo <  element.scrollTop ||
                    scrollTo + lineHeight > element.scrollTop + element.clientHeight) {
                element.scrollTop = scrollTo;
            }
        },
        setCursorPosition = function(elements, line, character) {
            elements.each(function(index, element) {
                var range,
                    pos = 0,
                    lines = $(element).val().split("\n"),
                    i = 0;
                if (line >= lines.length) {
                    return;
                }
                while (i < line) {
                    pos += lines[i].length + 1;
                    i += 1;
                }
                //pos += character;
                if (element.setSelectionRange) {
                    element.setSelectionRange(pos, pos + lines[line].length);
                } else if (element.createTextRange) {
                    range = element.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', pos);
                    range.moveEnd('character', lines[line].length);
                    range.select();
                }
                scrollToLine(element, line, lines.length);
                $(element).focus();
            });
        },
        createWarningLink = function(warning) {
            var linkElement = $(document.createElement("span")).css({
                    cursor: "pointer",
                    color: "#003399",
                    "text-decoration": "underline"
                }).html(warning.str).click(function() {
                    if (warning.lineNumber !== undefined) {
                        setCursorPosition($("#grammarBody"), warning.lineNumber - 1, 0);
                    }
                }),
                liElement = $(document.createElement("li")).html(linkElement);
            return liElement;
        };
        updateWarnings = function() {
            var body = $("#grammarBody").val(),
                grammar = ZWOBBLE.abuse.parse(body),
                warnings = grammar.errors,
                //allSentences = ZWOBBLE.abuse.generateAll(grammar.rules, 100),
                warningsListElement = $("#warningsList"),
                i;
            if (warnings.length > 0) {
                $("#warnings").show();
                warningsListElement.html("");
                for (i = 0; i < warnings.length; i += 1) {
                    warningsListElement.append(createWarningLink(warnings[i]));
                }
            } else {
                $("#warnings").hide();
            }
        };
    $("#grammarBody").keydown(function() {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        setTimeout(updateWarnings, 1000);
    });
    updateWarnings();
    
});
