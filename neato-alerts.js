var TranslatorHelper = require('./Translator.js');
var translator;
var node;

module.exports = function(RED) 
{
    function NeatoAlertNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        var configNode = RED.nodes.getNode(config.confignode);
        if (configNode !== null) this.language = configNode.language;
        else this.language = "en";
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
        if (msg.payload.alert === undefined || msg.payload.alert === null)
        {
            node.send({payload: "", topic:"alert"});
        }
        
        node.send({payload: translator.getString(msg.payload.alert), topic:"alert"});
    }

    RED.nodes.registerType("neato-alerts", NeatoAlertNode);
};