/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: cssRule.js      Ver: 1.0.0
    Author: DNC Thomas      Jan 2026
    Edited: 2026-01-10 17:04:06
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   To correct getCSSRule() by MCrossley
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var mcGetCSSRule = getCSSRule;

function getCSSRule(search) {
    for (let sheet of document.styleSheets) {
   		if (sheet.href != null && sheet.href.includes('alpaca')) {
       		let rules = sheet.cssRules || sheet.rules;
       		for (let rule of rules) {
           		if (rule.selectorText && rule.selectorText.lastIndexOf(search) >= 0) {
               		return rule;
           		}
       		}
   		}
	}
    return null;
}

