module.exports = function(RED) {

    const Analytics = require('analytics-node');
    
    function SetupSegmentNode(config) {
        
        var user_id;
        var anonymous_id;
        var group_id;
        var callResponse;

        RED.nodes.createNode(this,config);
        this.writekey = config.writekey;
        this.action = config.action;
        var node = this;
        node.on('input', function(msg) {

        console.log(msg.payload);
        console.log(this.action);

        if(msg.payload.user_id) {
          user_id = msg.payload.user_id;
          msg.payload.user_id = '';
        }
        if(msg.payload.anonymous_id){
          anonymous_id = msg.payload.anonymous_id;
          msg.payload.anonymous_id = '';
        }
        if(msg.payload.group_id){
          group_id = msg.payload.group_id;
          msg.payload.group_id = '';
        }

        try {
            node.log(JSON.stringify(this));

            const client = new Analytics(this.writekey);

             if (this.action === 'trackPage') {
              //You must pass either an "anonymousId" or a "userId"
              callResponse = client.page({
                'anonymousId': anonymous_id,
                'userId': user_id,
                'type': 'page',
                'properties': msg.payload
              });
            } else if (this.action === 'trackEvent') {
              //You must pass either an "anonymousId" or a "userId"!!!
              callResponse = client.track({
                'anonymousId': anonymous_id,
                'userId': user_id,
                'type': 'track',
                'event': 'default event title',
                'properties': msg.payload
              });
            } else if (this.action === 'identifyUser') {
              //You must pass either an "anonymousId" or a "userId"!!!
              callResponse = client.identify({
                'userId': user_id,
                'type': 'identify',
                'properties': msg.payload
              });

            } else if (this.action === 'groupUser') {
              //groupId
              callResponse = client.group({
                'groupId': group_id,
                'type': 'group',
                'properties': msg.payload
              });
            } else {
              msg.payload = { "message":"not supported, please contact nyan325@gmail.com"};
            }

            msg.payload = {"result": callResponse, "action":this.action};
            node.send(msg);

        } catch (e) {
          console.log("Exception happens!");
          console.log (e);
          node.send({"error": "Exception happens!"});
        } 

      });
    }
    RED.nodes.registerType("segment",SetupSegmentNode);
}
