/* Twitch Stream List Rewrite
 Originally coded for FreeCodeCamp and hosted on Codepen.io 
 Original Link: http://codepen.io/krames12/pen/EKVjxq

User Stories {
  - I can see whether my favorite user is currently streaming on Twitch.tv.
  - I can click the status output and be sent directly to the user's Twitch.tv channel.
  - If a Twitch user is currently streaming, I can see additional details about what they are 
    streaming.
  - I will see a placeholder notification if a streamer has closed their Twitch account \
    (or the account never existed).
    }

Purpose of rewrite: {
  - Use vanilla JS to handle things instead of jQuery.
  - Learn to use Object Oriented Programming to easily group and handle things in a much cleaner and easier to reason about manner.
  
}

Object Planning Structure {
  - send request
  	- send the request and return data
  - view
  	- refresh / display list
  	- delete item
  - handlers
  	- grabs input and passes to request
  	- delete stream item
  - process the stream data
  	- check if account exists
  	- check if online          ---- this section can be taken care of in the add by using an object per streamer.
  	- get game info
  	- get profile picture
  - stream list check and handler
  	- list itself
  	- add to list
  	- delete from list
  	- check if on list already
}
*/

var streamerList = {
  streamers: [],
  
  addStream: function(isOnline, streamName, streamData) {
    if(isOnline === true){
    this.streamers.push({
      streamName: streamName,
      currentGame: streamData.stream.channel.game,
      streamUrl: 'https://twitch.tv/' + streamName,
      profilePicture: streamData.stream.channel.logo
    });
    } else {
      this.streamers.push({
       streamName: streamName,
       streamUrl: 'https://twitch.tv/' + streamName,
      });
    }
    
    view.displayStreams();
  },
  
  deleteStream: function(position) {
    this.streamers.splice(position, 1);
    view.displayStreams();
  },
  
  streamStatus: function(streamData) {
    if(streamData.stream === true) {
      return true;
    } else {
      return false;
    }
  },
  
  checkDuplicateStream: function(streamData) {}
}

// Should pass in this.onSuccess for the callback
var twitchRequest = {
  twitchCall: function(streamName, callbackFunction){
    var data;
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.twitch.tv/kraken/streams/' + streamName + '?', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        callbackFunction(null, data);
      }
    };

    request.onerror = function() {
      console.log('error');
      callbackFunction('error', null);
    };

    request.send();
  },

	onSuccess: function(error, data){
    console.log('success!', data);
	}
};


var view = {
  displayStreams: function(){
    var streamDocumentList = document.querySelector('ul');
    console.log(streamerList.streamers);
  }
}

var handlers = {
  addStreamInput: function(streamName){
    var streamData = twitchRequest.twitchCall(streamName);
    
    var streamState;
    
    if(data.stream === null){
      streamState = false;
    } else {
      streamState = true;
    }
    console.log(streamState);
    streamerList.addStream(streamState, streamName, streamData);
  },
 
  deleteStreamItem: function(position) {}
}