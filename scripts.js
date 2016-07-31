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
  
  addOnlineStream: function(streamData) {
    this.streamers.push({
    streamName: streamData.stream.channel.display_name,
    currentGame: streamData.stream.channel.game,
    streamUrl: streamData.stream.channel.url,
    profilePicture: streamData.stream.channel.logo,
    isOnline: true
    });

    view.displayStreams();
  },

  addOfflineStream: function(streamData) {
    this.streamers.push({
      streamName: streamData.display_name,
      streamUrl: streamData.url,
      profilePicture: streamData.logo,
      isOnline: false
    });

    view.displayStreams();
  },
  
  deleteStream: function(position) {
    console.log('deleting position', position);
    this.streamers.splice(position, 1);
  },
  
  //Checks for duplicates and give error if that is the case
  checkDuplicateStream: function(streamName) {
    //crazy bug about reloading the page once it gets to streamName
    var isDuplicate = false;

    this.streamers.forEach(function(streamerData) {
      if(streamerData.streamName.toLowerCase() == streamName.toLowerCase()) {
        isDuplicate = true;
        console.log('Stream already exists');
        view.displayStreams();
      }
    });

    console.log('forEach is done. isDuplicate is:', isDuplicate);
    
    if(isDuplicate == false) {
      twitchRequest.twitchCall(streamName, twitchRequest.onSuccess);
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
      } else if (request.status == 404) {
        console.log('The stream', streamName, 'does not exist');
      }
    };

    request.onerror = function() {
      console.log('error');
      callbackFunction('error', null);
    };

    request.send();
  },

  // if the stream is offline, get info 
  streamOfflineCall: function (streamName, callbackFunction) {
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

  //Checks if the stream is currently online or offline
	onSuccess: function(error, data, streamName){
    console.log(streamName, data);

    if(data.stream === null){
      twitchRequest.streamOfflineCall(streamName, twitchRequest.onStreamOfflineSuccess);
    } else {
      streamerList.addOnlineStream(data, streamName);
    }
	},

  onStreamOfflineSuccess: function(error, data){
    streamerList.addOfflineStream(data);
  }
};



var view = {
  displayStreams: function(){
    //Clear and refresh the list of streams every time one is added or deleted
    var onlineStreamList = document.querySelector('#online-stream-list');
    var offlineStreamList = document.querySelector('#offline-stream-list');
    onlineStreamList.innerHTML = '';
    offlineStreamList.innerHTML = '';

    streamerList.streamers.forEach(function(streamInfo, position) {
      var streamerLi = document.createElement('li');
      streamerLi.id = position;
      streamerLi.className = 'streamerLi';
      console.log(streamInfo.streamName, position);

      streamerLi.appendChild(this.createStreamInfoDiv(streamInfo));
      streamerLi.appendChild(this.createStreamStatusIcon(streamInfo));
      streamerLi.appendChild(this.createDeleteButton());

      if(streamInfo.isOnline) {
        onlineStreamList.appendChild(streamerLi);
      } else {
        offlineStreamList.appendChild(streamerLi);
      }

    }, this);
  },

  createStreamInfoDiv: function(streamInfo) {
    var streamInfoDiv = document.createElement('div');
    streamInfoDiv.className = 'streamInfoDiv';
    streamInfoDiv.appendChild(this.createStreamAvatar(streamInfo));
    streamInfoDiv.appendChild(this.createStreamName(streamInfo));
    streamInfoDiv.appendChild(this.createIsOnlineInfo(streamInfo));
    return streamInfoDiv;
  },

  createStreamAvatar: function(streamInfo) {
    var profileAvatar = new Image();
    profileAvatar.src = streamInfo.profilePicture;
    profileAvatar.className = 'profileAvatar';
    return profileAvatar;
  },

  createStreamName: function(streamInfo) {
    var name = document.createElement('a');
    name.className = 'streamName';
    name.textContent = streamInfo.streamName;
    name.href = streamInfo.streamUrl;
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

  showAllStreams: function(element) {
    var offlineStreams = document.querySelector('#offline-stream-list');
    var onlineStreams = document.querySelector('#online-stream-list');

    if(offlineStreams.classList.contains('hidden')) {
      offlineStreams.classList.remove('hidden');
    }

    if(onlineStreams.classList.contains('hidden')) {
      onlineStreams.classList.remove('hidden');
    }
  },

  showOnlineOnly: function(element) {
    var offlineStreams = document.querySelector('#offline-stream-list');
    var onlineStreams = document.querySelector('#online-stream-list');

    if(onlineStreams.classList.contains('hidden')) {
      onlineStreams.classList.remove('hidden');
    }
    offlineStreams.classList.add('hidden');
  },

  showOfflineOnly: function() {
    var offlineStreams = document.querySelector('#offline-stream-list');
    var onlineStreams = document.querySelector('#online-stream-list');

    if(offlineStreams.classList.contains('hidden')) {
      offlineStreams.classList.remove('hidden');
    }
    onlineStreams.classList.add('hidden');
  },

  eventHandlerSetUp: function() {
    // Delete Stream button setup
    var streamDocumentUl = document.querySelector('#stream-list');

    streamDocumentUl.addEventListener('click', function(event) {
      var elementClicked = event.target;

      if(elementClicked.className === 'deleteButton') {
        handlers.deleteStreamItem(parseInt(elementClicked.parentNode.id));
      }
    });
    
    // Add Stream Input event handler
    var addStreamInput = document.querySelector('#add-stream-input');
    addStreamInput.addEventListener('submit', function(event) {
      event.preventDefault();
    });

    // Online only tab
    var showOnlineOnly = document.querySelector('#status-online-only');
    showOnlineOnly.addEventListener('click', function() {
      view.showOnlineOnly();
    });

    // Offline only tab
    var showOfflineOnly = document.querySelector('#status-offline-only');
    showOfflineOnly.addEventListener('click', function() {
      view.showOfflineOnly();
    });

    // Show all streams tab
    var showAllStreams = document.querySelector('#status-all');
    showAllStreams.addEventListener('click', function() {
      view.showAllStreams();
    });
  }
}
  
var handlers = {
  addStreamInput: function(){
    var addStreamInput = document.querySelector('#add-stream-input');
    //Checks for duplicate streams entered
    streamerList.checkDuplicateStream(addStreamInput.value);
    addStreamInput.value = '';
  },
 
  deleteStreamItem: function(position) {
    streamerList.deleteStream(position);
    view.displayStreams();
  }
}

view.eventHandlerSetUp();