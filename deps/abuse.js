(function(exports) {
    var nonTerminalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_";

    var trimmed = function(text) {
        return text.replace(/^\s+|\s+$/g, '');
    };

    var nonTerminal = function(name) {
        return {
            text: "",
            name: name,
            isNonTerminal: true,
            expand: function(ruleSet, selector) {
                return ruleSet.expand(name, selector);
            },
            expandAll: function(ruleSet) {
                return ruleSet.expandAll(name);
            }
        };
    };

    var terminal = function(text) {
        return {
            text: text,
            isTerminal: true,
            expand: function(ruleSet, selector) {
                return [];
            },
            expandAll: function(ruleSet) {
                return [];
            }
        };
    };

    var sentence = nonTerminal("SENTENCE");

    var find = function(array, element) {
        var i;
        for (i = 0; i < array.length; i += 1) {
            if (array[i] === element) {
                return i;
            }
        }
        return -1;
    };
    
    var isNonTerminalCharacter = function(char) {
        return nonTerminalChars.indexOf(char) !== -1;
    };
    
    var parseRight = function(right) {
        var nodes = [],
            dollarIndex,
            endOfNonTerminal,
            nonTerminalName;
        
        while ((dollarIndex = find(right, "$")) !== -1) {
            nodes.push(terminal(right.slice(0, dollarIndex)));
            
            if (right[dollarIndex + 1] === "{") {
                endOfNonTerminal = right.indexOf("}");
                nonTerminalName = right.substring(dollarIndex + 2, endOfNonTerminal);
                endOfNonTerminal += 1;
            } else {
                endOfNonTerminal = dollarIndex + 1;
                while (endOfNonTerminal < right.length &&
                       isNonTerminalCharacter(right[endOfNonTerminal])) {
                    endOfNonTerminal += 1;
                }
                nonTerminalName = right.substring(dollarIndex + 1, endOfNonTerminal);
            }
            
            nodes.push(nonTerminal(nonTerminalName));
            right = right.substr(endOfNonTerminal);
            
        }
        if (right !== "") {
            nodes.push(terminal(right));
        }
        
        return nodes;
    };

    var parseLine = function(line) {
        var components = line.split("->"),
            i;
        for (i = 0; i < components.length; i += 1) {
            components[i] = trimmed(components[i]);
        }
        
        return {
            left: nonTerminal(components[0].slice(1)),
            right: parseRight(components[1])
        };
    };
    
    var parse = function(text) {
        var lines = text.split("\n"),
            rules = [],
            i;
        for (i = 0; i < lines.length; i += 1) {
            if (trimmed(lines[i]).length > 0) {
                rules.push(parseLine(lines[i]));
            }
        }
        return rules;
    };
    
    var buildRuleSet = function(ruleArray) {
        var rules = {},
            i,
            left,
            rule;
        for (i = 0; i < ruleArray.length; i += 1) {
            rule = ruleArray[i];
            left = rule.left.name;
            if (rules[left] === undefined) {
                rules[left] = [];
            }
            rules[left].push(rule.right);
        }
        return {
            expand: function(left, selector) {
                var possibleRules = rules[left];
                if (possibleRules === undefined) {
                    return [];
                }
                return possibleRules[selector.select(0, possibleRules.length)];
            },
            expandAll: function(left) {
                return rules[left] || [];
            }
        };
    };
    
    var generate = function(rules, selector) {
        var unexpandedNodes = [sentence],
            node,
            newUnexpandedNodes,
            i,
            result = "",
            ruleSet = buildRuleSet(rules);
        while (unexpandedNodes.length > 0) {
            node = unexpandedNodes.pop();
            result += node.text;
            newUnexpandedNodes = node.expand(ruleSet, selector);
            for (i = newUnexpandedNodes.length - 1; i >= 0; i -= 1) {
                unexpandedNodes.push(newUnexpandedNodes[i]);
            }
        }
        return result;
    };
    
    var reversed = function(array) {
        var copy = array.slice(0);
        copy.reverse();
        return copy;
    };
    
    var generateAllRecursive = function(ruleSet, currentResult, unexpandedNodes) {
        var unexpandedNode,
            rules,
            rule,
            ruleIndex,
            i,
            results,
            subResults;
        if (unexpandedNodes.length === 0) {
            return [currentResult.join("")];
        }
        unexpandedNode = unexpandedNodes.pop();
        currentResult.push(unexpandedNode.text);
        rules = unexpandedNode.expandAll(ruleSet);
        if (rules.length === 0) {
            return generateAllRecursive(ruleSet, currentResult, unexpandedNodes);
        }
        
        results = [];
        for (ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
            rule = rules[ruleIndex];
            subResults = generateAllRecursive(ruleSet, currentResult.slice(0), unexpandedNodes.concat(reversed(rule)));
            for (i = 0; i < subResults.length; i += 1) {
                results.push(subResults[i]);
            }
        }
        return results;
    };
    
    var generateAll = function(rules) {
        return generateAllRecursive(buildRuleSet(rules), [], [sentence]);
    };
    
    exports.nonTerminal = nonTerminal;
    exports.terminal = terminal;
    exports.parse = parse;
    exports.generate = generate;
    exports.generateAll = generateAll;
})(typeof ZWOBBLE === "undefined" ? exports : ZWOBBLE.abuse);
