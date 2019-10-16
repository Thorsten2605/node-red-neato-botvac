var botvac = require('node-botvac');
var NeatoHelper = require('./NeatoHelper.js');
var crypto = require('crypto');

var helper = new NeatoHelper();
var client = new botvac.Client();
var robots = [];
var node;

module.exports = function(RED) {
    function NeatoStatusNode(config) {
        RED.nodes.createNode(this,config);
        node = this;
        var configNode = RED.nodes.getNode(config.confignode);

        var isValid = helper.validateConfigNode(node, configNode);
		if (!isValid)
			return;

		//clear node status
		node.status({});

        node.email = configNode.email;
        node.password = configNode.password;
        node.robotindex = config.robotindex;

        client.authorize(node.email, node.password, false, function (error) {
            if (error) {
                node.status(error);
                return;
            }
            //get your robots
            client.getRobots(function (error, temprobots) {
                if (error) {
                    node.status(error);
                    console.log(error);
                    return;
                }
                for (i = 0; i < temprobots.length; ++i)
                {
                    robots.push(temprobots[i]);
                }
            });
        });

        //handle input message
		node.on('input', function (msg) {
			handleInputMsg(configNode, msg);
		});
    }

    function handleInputMsg(configNode, msg)
	{
        handleCommand(msg);
    }

    function handleCommand(msg)
	{
        var cmd = msg.payload.command;
        if (robots.length > node.robotindex)
        {
            switch (cmd)
            {
                default:
                    robots[node.robotindex].getState(outputStatus);
                    break;
                case "start":
                    var eco = Boolean(msg.payload.eco) || false;
                    var navigationmode = msg.payload.navigationmode || 1;
                    var nogolines = Boolean(msg.payload.nogolines) || false;
                    robots[node.robotindex].startCleaning(eco, navigationmode, nogolines, outputResult);
                    break;
                case "pause":
                    robots[node.robotindex].pauseCleaning(outputResult);
                    break;
                case "resume":
                    robots[node.robotindex].resumeCleaning(outputResult);
                    break;
                case "stop":
                    robots[node.robotindex].stopCleaning(outputResult);
                    break;
                case "sendtobase":
                    robots[node.robotindex].sendToBase(outputResult);
                    break;
                case "findme":
                    robots[node.robotindex].findMe(outputResult);
                    break;                
            }
        }
    }

    function outputResult(err, result)
    {
        var msg = {payload: result, topic: "result"};
        node.send(msg);
    }

    function outputStatus(err, result)
    {
        var msg = {payload: result, topic: "status"};
        node.send(msg);
    }

    RED.nodes.registerType("neato-status",NeatoStatusNode);
}