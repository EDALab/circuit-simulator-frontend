import { $ } from './jquery';

//css animation attribute class
class styleRule {
    constructor(name) {
        let styleSheet = document.styleSheets;
        let index = -1;
        for (let i = 0; i < styleSheet.length; i++) {
            if (!styleSheet[i].href) index = i;
            if (styleSheet[i].cssRules) for (let j = 0; j < styleSheet[i].cssRules.length; j++){
                if (styleSheet[i].cssRules[j].name === name) {
                    this.original = styleSheet[i].cssRules[j];
                    return (this);
                }
            }
        }
        //If there is no style named index in the current style sheet, then create a style named index in the local style sheet
        //There is no local style sheet, then create one
        if (index === -1) {
            const head = $('head');
            head.append($('<style>'));
            //Update list
            styleSheet = document.styleSheets;
            index = styleSheet.length - 1;
        }
        //css rule collection
        const cssStyleSheet = styleSheet[index];
        cssStyleSheet.insertRule('@keyframes ' + name + '{}', cssStyleSheet.cssRules.length);
        this.original = cssStyleSheet.cssRules[cssStyleSheet.cssRules.length - 1];
        return (this);
    }
    setRule(index, rules) {
        const cssRule = this.original;
        cssRule.deleteRule(index);
        let tempRule = '';
        for (const i in rules) if (rules.hasOwnProperty(i)) {
            tempRule += i + ':' + rules[i] + ';';
        }
        tempRule = index + ' {' + tempRule + '}';
        cssRule.appendRule(tempRule);
    }
}

export { styleRule };
