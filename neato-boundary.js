var botvac  = require('./node-botvac/index.js');
var NeatoHelper = require('./NeatoHelper.js');
var crypto = require('crypto');

var helper = new NeatoHelper();
var client = new botvac.Client();
var robots = [];
var maps = [];
var node;

module.exports = function(RED) {
    function NeatoBoundaryNode(config) {
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
                case "getMapBoundaries":
                    var mapid = msg.payload.mapid;
                    if (mapid === undefined) 
                    {
                        node.send({payload:"No MapID specified!", topic:"error"});
                        break;
                    }
                    robots[node.robotindex].getMapBoundaries(mapid, outputResult);
                    break;  
                case "setMapBoundaries":
                    var mapid = msg.payload.mapid;
                    var boundaries = msg.payload.boundaries;
                    if (mapid === undefined) 
                    {
                        node.send({payload:"No MapID specified!", topic:"error"});
                        break;
                    }
                    if (boundaries === undefined) 
                    {
                        node.send({payload:"No Boundaries specified!", topic:"error"});
                        break;
                    }
                    robots[node.robotindex].setMapBoundaries(mapid, boundaries, outputResult);
                    break;                    
            }
        }
    }

    function outputResult(err, result)
    {
        var msg = {payload: result, topic: "result", error: err};
        node.send(msg);
    }

    function robotRequest(robot, service, type, endpoint, payload, callback, passthrough) {
        if (robot._serial && robot._secret) {
            payload = JSON.stringify(payload);
            var date = new Date().toUTCString();
            var data = [robot._serial.toLowerCase(), date, payload].join("\n");
            var headers = {
                Date: date
            };
            var url;
            if (service === 'nucleo') {
                var hmac = crypto.createHmac('sha256', robot._secret).update(data).digest('hex');
                headers.Authorization = 'NEATOAPP ' + hmac;
                url = robot._nucleoBaseUrl + robot._serial + endpoint
            } else if (service === 'beehive') {
                headers.Authorization = robot._token;
                url = robot._beehiveBaseUrl + robot._serial + endpoint
            } else {
                callback('Service' + service + 'unknown');
            }
            botvac.api.request(url, payload, type, headers, function (error, body) {
                if (typeof callback === 'function') {
                    callback(error, body, passthrough);
                }
            });
        } else {
            if (typeof callback === 'function') {
                callback('no serial or secret');
            }
        }
    }

    RED.nodes.registerType("neato-boundary",NeatoBoundaryNode);
}