var TranslatorHelper = require('./Translator.js');
var translator;
var node;

module.exports = function(RED) 
{
    function NeatoErrorNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        this.language = config.language;
        translator = new TranslatorHelper(this.language);
        
        //handle input message
		node.on('input', function (msg) {
			handleInputMsg(msg);
		});
    }

    function handleInputMsg(msg)
	{
        if (msg === undefined || msg === null) return;
        if (msg.payload === undefined || msg.payload === null) return;
        if (msg.payload.error === undefined || msg.payload.error === null) return;
        
        node.send({payload: translator.getString(msg.payload.error), topic:"error"});
    }

    RED.nodes.registerType("neato-errors", NeatoErrorNode);
};