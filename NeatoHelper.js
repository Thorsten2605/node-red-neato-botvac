'use strict';

class NeatoHelper
{
    constructor() {
    }

    validateConfigNode(node, configNode)
    {
        if (configNode === undefined || configNode === null) {
            node.status({fill:"red", shape:"ring", text:"please select a config node"});
            return false;
        }
        var hasEmail = configNode.email !== undefined && configNode.email !== null && configNode.email.trim().length > 5;
        var hasPassword = configNode.password !== undefined && configNode.password !== null && configNode.password.trim().length > 5;
        if (!hasEmail && !hasPassword) {
            node.status({fill:"red", shape:"ring", text:"missing email and password in config node"});
            return false;
        }

        //clear node status
        node.status({});
        return true;
    }
}
module.exports = NeatoHelper;
