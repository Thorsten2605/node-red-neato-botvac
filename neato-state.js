var TranslatorHelper = require('./Translator.js');
var translator;
var node;

module.exports = function(RED) 
{
    function NeatoStateNode(config) {
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
        if (msg.payload.state === undefined || msg.payload.state === null)
        {
            node.send({payload: "", topic:"state"});
        }
        node.send({payload: translator.getString("status_" + msg.payload.state.toString()), topic:"state"});
    }

    RED.nodes.registerType("neato-state", NeatoStateNode);
};