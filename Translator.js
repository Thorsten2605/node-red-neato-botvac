'use strict';

class Translator
{
    constructor(language) {
        if (language === undefined || language === null || language === "") language = "en";
        this.lang = require("./translate/" + language + ".json");
    }

    getString(key)
    {
        console.log(this.lang[key]);
        return this.lang[key];
    }
}
module.exports = Translator;