module.exports = function(RED) 
{
    function NeatoConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.email = config.email;
        this.password = config.password;
        this.language = config.language;
    }

    RED.nodes.registerType("neato-config", NeatoConfigNode);
};