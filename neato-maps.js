var botvac = require('node-botvac');
var NeatoHelper = require('./NeatoHelper.js');
var crypto = require('crypto');

var helper = new NeatoHelper();
var client = new botvac.Client();
var robots = [];
var maps = [];
var node;

module.exports = function(RED) {
    function NeatoMapsNode(config) {
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
                    robotRequest(robots[node.robotindex], 'beehive', 'GET', '/maps', null, outputMaps);
                    break;
                case "getpersistantmap":
                    robots[node.robotindex].getPersistentMaps(outputResult);
                    break;  
                case "getmapdata":
                    if (msg.payload.index !== undefined && Number.isInteger(msg.payload.index))
                    {
                        robotRequest(robots[node.robotindex], 'beehive', 'GET', '/maps', null, getMaps, msg.payload.index);
                    }
                    else
                    {
                        node.send({payload:"No index specified!", topic:"error"});
                    }
                    break;                   
            }
        }
    }

    function outputResult(err, result)
    {
        var msg = {payload: result, topic: "result"};
        node.send(msg);
    }

    function outputMaps(err, result)
    {
        var msg = {payload: result, topic: "error"};
        if (err === undefined)
        {
            msg = {payload: result, topic: "maps"};
        }
        node.send(msg);
    }

    function getMaps(err, result, index)
    {
        if (err === undefined && index !== undefined) 
        {
            maps = [];
            for (i = 0; i < result.maps.length; ++i)
            {
                maps.push(result.maps[i]);
            }
            if (maps.length > index)
            {
                var result = maps[index];
                var msg = {payload: result, topic: "mapdata"};
                node.send(msg);
            }
        }
        else
        {
            node.send({payload: err, topic: "error"});
        }
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

    RED.nodes.registerType("neato-maps",NeatoMapsNode);
}