'use strict';

function $id(id) { return document.getElementById(id); }

function setoptions(pnode, options) {
    if (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                pnode.setAttribute(key, options[key]);
            }
        }
    }
}

var mdom = {

    clearaDiv: function(divId) {
        var box = $id(divId);
        var newBox = box.cloneNode(false);
        box.parentNode.replaceChild(newBox, box);
        box = newBox;
    },

    addhref: function(pNode, stext, href, options) {
        var aref = document.createElement('a');
        aref.setAttribute('href', href);
        aref.innerHTML = stext;
        setoptions(aref, options);
        pNode.appendChild(aref);
        return aref;
    },

    addbreak: function(pNode, n) {
        n = n || 0;
        for (var i = 0; i < n; i++)
            pNode.appendChild(document.createElement('br'));
    }
};

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
client.configure(feathers.hooks());
// Use localStorage to store our login token
client.configure(feathers.authentication({
    storage: window.localStorage
}));

// Login screen
const loginHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Log in or signup</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>

        <button type="button" id="login" class="button button-primary block signup">
          Log in
        </button>

        <button type="button" id="signup" class="button button-primary block signup">
          Signup
        </button>
      </form>
    </div>
  </div>
</main>`;

// Chat base HTML (without user list and messages)
const chatHTML = `<main class="flex flex-column">
<header class="title-bar flex flex-row flex-center">
  <div class="title-wrapper block center-element">
    <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
      alt="Feathers Logo">
    <span class="title">Chat</span>
  </div>
  <div class="dropdown" style="float:right">
    <button class="dropbtn" id="attchmntButton">Attachments</button>
    <div id="attachmentmenu" class="dropdown-content" style="z-index: 99;">
    <br>
    <div id="currentAttachments"></div>
    <div class="menudivider" id="firstuserMdivider"></div>
    <div id="uploadmoreAttach">
      <input type="file" id="fileselect" name="fileselect" style="display:inline-block;width:300px"/>
      <button id="uploadButton" style="float:right;margin-top:5px">Attach</button>
      <progress id="uploadprgrs" value="0" max="100" style="display:none"></progress>
    </div>
    <br>
    </div>
  </div>
</header>

<div class="flex flex-row flex-1 clear">
  <aside class="sidebar col col-3 flex flex-column flex-space-between">
    <header class="flex flex-row flex-center">
      <h4 class="font-300 text-center">
        <span class="font-600 online-count">0</span> users
      </h4>
    </header>

    <ul class="flex flex-column flex-1 list-unstyled user-list"></ul>
    <footer class="flex flex-row flex-center">
      <a href="#" id="logout" class="button button-primary">
        Sign Out
      </a>
    </footer>
  </aside>

  <div class="flex flex-column col col-9">
    <main class="chat flex flex-column flex-1 clear"></main>

    <form class="flex flex-row flex-space-between" id="send-message">
      <input type="text" name="text" class="flex flex-1">
      <button class="button-primary" type="submit">Send</button>
    </form>
  </div>
</div>
</main>`;

function loginclick(ev) {
    switch (ev.target.id) {
        case 'signup':
            {
                const user = getCredentials();
                // For signup, create a new user and then log them in
                client.service('users').create(user)
                .then(() => login(user));

                break;
            }
        case 'login':
            {
                const user = getCredentials();
                login(user);

                break;
            }
        case 'logout':
            {
                client.logout().then(() => {
                    document.getElementById('app').innerHTML = loginHTML;
                });

                break;
            }
        case 'uploadButton':
            {
                uploadAttachment();
                break;
            }
        case 'attchmntButton':
            {
                document.getElementById('attachmentmenu').classList.toggle('show');
                break;
            }

    }
}
// Show the login page
function showLogin(error) {
    error = error || {};
    if (document.querySelectorAll('.login').length) {
        document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
    } else {
        document.getElementById('app').innerHTML = loginHTML;
    }
}

// Add a new user to the list
function addUser(user) {
    const userList = document.querySelector('.user-list');

    if (userList) {
        // Add the user to the list
        userList.insertAdjacentHTML('beforeend', `<li>
      <a class="block relative" href="#">
        <img src="${user.avatar}" alt="" class="avatar">
        <span class="absolute username">${user.email}</span>
      </a>
    </li>`);

        // Update the number of users
        document.querySelector('.online-count').innerHTML = document.querySelectorAll('.user-list li').length;
    }
}

// Renders a new message and finds the user that belongs to the message
function addMessage(message) {
    // Find the user belonging to this message or use the anonymous user if not found
    const sender = message.user || {};
    const chat = document.querySelector('.chat');

    if (chat) {
        chat.insertAdjacentHTML('beforeend', `<div class="message flex flex-row">
      <img src="${sender.avatar}" alt="${sender.email}" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${sender.email}</span>
          <span class="sent-date font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">${message.text}</p>
      </div>
    </div>`);

        chat.scrollTop = chat.scrollHeight - chat.clientHeight;
    }
}

// Shows the chat page
function showChat() {
    document.getElementById('app').innerHTML = chatHTML;
    // Find the latest 10 messages. They will come with the newest first
    // which is why we have to reverse before adding them
    client.service('messages').find({
        query: {
            $sort: { createdAt: -1 },
            $limit: 25
        }
    }).then(page => page.data.reverse().forEach(addMessage));

    client.service('uploads').find().then(function(uploads) {
        mdom.clearaDiv('currentAttachments');
        uploads.data.forEach(addAttachment);
    });

    // Find all users
    client.service('users').find().then(page => {
        const users = page.data;

        // Add every user to the list
        users.forEach(addUser);
    });
}

// Retrieve email/password object from the login/signup page
function getCredentials() {
    const user = {
        email: document.querySelector('[name="email"]').value,
        password: document.querySelector('[name="password"]').value
    };

    return user;
}

// Log in either using the given email/password or the token from storage
function login(credentials) {
    const payload = credentials ?
        Object.assign({ strategy: 'local' }, credentials) : {};

    return client.authenticate(payload)
        .then(showChat)
        .catch(showLogin);
}

function attclick(e) {
    e.preventDefault();
    var fileId = e.target.getAttribute('data');
    var aref = mdom.addhref(window.document.body, '', '/download/' + fileId + '?t=' + window.localStorage['feathers-jwt']);
    aref.click();
    window.document.body.removeChild(aref);

    // utils.ajaxGet('/download/'+fileId,
    //   function(r) {
    //     return false;     
    //   }

    // ,null,{'Authorization':'Bearer '+window.localStorage['feathers-jwt']});
    return false;
}

function addAttachment(attachment) {
    //console.log(attachment);
    var aattch = attachment;
    var attDiv = $id('currentAttachments');
    //var firstdiv = $id('firstuserMdivider');
    var fileSize;
    if (aattch.filesize > 1024 * 1024) {
        fileSize = (Math.round(aattch.filesize * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    } else {
        fileSize = (Math.round(aattch.filesize * 100 / 1024) / 100).toString() + 'KB';
    }

    var aref = mdom.addhref(attDiv, aattch.filename + ' (' + fileSize + ')', '#', { 'style': 'display:inline-block', 'class': 'attachmentlink', 'data': aattch._id });
    aref.addEventListener('click', attclick);
    //mdom.addbutton(attDiv, "del", "del_"+aattch.att_pk, butcb, {"style":"float:right"});
    mdom.addbreak(attDiv, 1);
    var atcount = document.querySelectorAll('#currentAttachments a').length;
    $id('attchmntButton').innerHTML = atcount + ' Attachment' + ((atcount > 1) ? 's' : '');
}

function uploadAttachment() {
    if (!$id('fileselect').files[0]) return;

    var acceptedTypes = {
        'image/png': true,
        'image/jpeg': true,
        'application/excel': true,
        'application/pdf': true
    };

    var file = $id('fileselect').files[0];
    if (acceptedTypes[file.type] !== true) {
        console.log('file type not supported');
        return;
    }
    if (file.size > 5242880) {
        console.log('file too large. 5MB limit.');
        return;
    }


    $id('uploadButton').style.display = 'none';
    $id('uploadprgrs').value = 0;
    $id('uploadprgrs').style.display = 'inline-block';

    var fd = new FormData();

    fd.append('attchfile', file);

    var xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            var complete = (e.loaded / e.total * 100 | 0);
            $id('uploadprgrs').value = $id('uploadprgrs').innerHTML = complete;
        }
    };

    xhr.onload = function() {
        $id('uploadprgrs').style.display = 'none';
        $id('uploadButton').style.display = 'inline-block';
        $id('fileselect').value = '';
        if (xhr.status === 201) {
            console.log('File Attached');
        } else {
            console.log('Error ' + xhr.status + ': File not Attached');
        }
    };

    xhr.open('POST', '/uploads');
    xhr.setRequestHeader('Authorization', 'Bearer ' + window.localStorage['feathers-jwt']);
    xhr.send(fd);
}

document.addEventListener('click', loginclick);
document.addEventListener('submit', function(ev) {
    if (ev.target.id === 'send-message') {
        // This is the message text input field
        const input = document.querySelector('[name="text"]');

        // Create a new message and then clear the input field
        client.service('messages').create({
            text: input.value
        }).then(() => {
            input.value = '';
        });
        ev.preventDefault();
    }
});

// Listen to created events and add the new message in real-time
client.service('messages').on('created', addMessage);

// We will also see when new users get created in real-time
client.service('users').on('created', addUser);
client.service('uploads').on('created', addAttachment);


login();