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
  
  addStream: function(streamData, streamName) {
    if(streamData.stream){
    this.streamers.push({
      streamName: streamData.stream.channel.display_name,
      currentGame: streamData.stream.channel.game,
      streamUrl: streamData.stream.channel.url,
      profilePicture: streamData.stream.channel.logo,
      isOnline: true
    });
    } else {
      this.streamers.push({
       streamName: streamName,
       streamUrl: 'https://twitch.tv/' + streamName,
       isOnline: false
      });
    }

    view.displayStreams();
  },
  
  deleteStream: function(position) {
    console.log('deleting position', position);
    this.streamers.splice(position, 1);
  },
  
  //will check for duplicates at a later date. Just need to get the MVP working
  checkDuplicateStream: function(streamData, streamName) {
    for(var i = 0; i < streamerList.streamers.length; i++){
      if(streamerList.streamers[i].streamName !== streamName) {
        streamerList.addStream(streamData, streamName);
      } else {
        console.log('Stream already listed.');
      }
    }
  }
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
        callbackFunction(null, data, streamName);
      }
    };

    request.onerror = function() {
      console.log('error');
      callbackFunction('error', null);
    };

    request.send();
  },

  // if the stream is offline, get info 
  streamOfflineCall: function (streamName) {
    var data;
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.twitch.tv/kraken/channels/' + streamName + '?', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        callbackFunction(null, data, streamName);
      }
    };

    request.onerror = function() {
      console.log('error');
      callbackFunction('error', null);
    };

    request.send();
  },

  //Sends successful info and name to the addStream method
	onSuccess: function(error, data, streamName){
    console.log(streamName, data);
    streamerList.addStream(data, streamName);
	}
};



var view = {
  displayStreams: function(){
    //Clear and refresh the list of streams every time one is added or deleted
    var streamDocumentUl = document.querySelector('#stream-list');
    streamDocumentUl.innerHTML = '';

    streamerList.streamers.forEach(function(streamInfo, position) {
      var streamerLi = document.createElement('li');
      streamerLi.id = position;
      streamerLi.className = 'streamerLi';
      console.log(streamInfo.streamName, position);

      streamerLi.appendChild(this.createStreamInfoDiv(streamInfo));
      streamerLi.appendChild(this.createStreamStatusIcon(streamInfo));
      streamerLi.appendChild(this.createDeleteButton());
      streamDocumentUl.appendChild(streamerLi);

    }, this);  
  },

  createStreamInfoDiv: function(streamInfo) {
    var streamInfoDiv = document.createElement('div');
    streamInfoDiv.className = 'streamInfoDiv';
    streamInfoDiv.appendChild(this.createStreamName(streamInfo.streamName));
    streamInfoDiv.appendChild(this.createIsOnlineInfo(streamInfo));
    return streamInfoDiv;
  },

  createStreamAvatar: function(streamInfo) {
    
  },

  createStreamName: function(streamName) {
    var name = document.createElement('a');
    name.innerHTML = '<h4>' + streamName + '</h4>';
    name.className = 'streamName';
    return name;
  },

  createIsOnlineInfo: function(streamInfo) {
    var onlineStatus = document.createElement('p');
    onlineStatus.className = 'streamOnlineStatus';

    if(streamInfo.isOnline) {
      onlineStatus.textContent = streamInfo.currentGame;
    } else {
      onlineStatus.textContent = 'Offline';
    }

    return onlineStatus;
  },

  createDeleteButton: function() {
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },

  createStreamStatusIcon: function(streamInfo) {
    var streamStatusIcon = document.createElement('div');

    if(streamInfo.isOnline === true) {
      streamStatusIcon.className = 'streamStatusIcon isOnline';
    } else {
      streamStatusIcon.className = 'streamStatusIcon isOffline';
    }

    return streamStatusIcon;
  },

  eventHandlerSetUp: function() {
    var streamDocumentUl = document.querySelector('#stream-list');

    streamDocumentUl.addEventListener('click', function(event) {
      var elementClicked = event.target;

      if(elementClicked.className === 'deleteButton') {
        handlers.deleteStreamItem(parseInt(elementClicked.parentNode.id));
      }

    var addStreamInput = document.querySelector('#add-stream-input');
    addStreamInput.addEventListener('submit', function(event) {
      event.preventDefault();
    });

    });
  }
}
  
var handlers = {
  addStreamInput: function(){
    var addStreamInput = document.querySelector('#add-stream-input');
    //Performs request to Twitch API
    twitchRequest.twitchCall(addStreamInput.value, twitchRequest.onSuccess);
    addStreamInput.value = '';
  },
 
  deleteStreamItem: function(position) {
    streamerList.deleteStream(position);
    view.displayStreams();
  }
}

view.eventHandlerSetUp();