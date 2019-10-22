var TranslatorHelper = require('./Translator.js');
var translator;
var node;

module.exports = function(RED) 
{
    function NeatoActionNode(config) {
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
        if (msg.payload.action === undefined || msg.payload.action === null)
        {
            node.send({payload: "", topic:"action"});
        }
        
        node.send({payload: translator.getString("action_" + msg.payload.action.toString()), topic:"action"});
    }

    RED.nodes.registerType("neato-action", NeatoActionNode);
};