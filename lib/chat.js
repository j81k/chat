/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Server
 * Created On   : 2017-02-13 17:36
 */


var io          = require('socket.io')
,   guestNo     = 1
,   users       = []
,   currentGroup = []
,   currentUser = {};

exports.listen = function(server){
    io = io.listen(server);
    
    io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        //socket.emit('App is connected!');
        //console.log('App is connected!');
        
        //guestNo = _guestNo(socket, guestNo, users);
        
        _login(socket);
        _get(socket);
        _chat(socket);
        
    });
    
    
}

/*
 * Chat
 */
function _chat( socket ){
    
    socket.on('chat', function(data){
        //console.log('Chat Type: ' + data.to.name);
        switch( data.type ) {
            case 'init' :
                _join(socket, data.to);
            break;     
            
            case 'message' :
                //console.log('Broadcasting to ...' + data.to.group);
                _broadcast(socket, data);
            break;
            
            case 'leave' :
                
            break;     
        }
        
        
    })
    
}

/*
 * Broadcast the Message to the given group
 */
function _broadcast(socket, data){
    
    if( data.message != '' ) {
        var group = data.to.group;
        console.log("Broadcast to ... "+group);
        socket.broadcast.to(group).emit('chat', {
            status  : true,
            msg     : data.to.name + ' sent a message!',
            data    : {
                type    : 'broadcast',
                message : data.message,
            }
        });
        
    }
    //return false;
}

/*
 * Get
 */
function _get(socket) {
    
    socket.on('get', function(data){
        var msg     = ''
        ,   status  = true
        ,   type = data.type;
        
        data = [];
        switch(type) {
            case 'users':
                
                for( var i in users ) {
                    // Ignore Current user
                    //if( data.userId != users[i].id ) {
                        var user = users[i];
                        data.push({
                            name : user['name'],
                            group: user['group'],
                        });
                    //}
                }
                
                if( data.length == 0 ) {
                    // No users
                    msg = 'No more contact(s) found.';
                }else {
                    msg = 'Success';
                }
                
            break;    
            
            default:
                status = false;
            break;
        }
        
        socket.emit('get', {
            status : status,
            msg    : msg, 
            data   : data
        })
        
    })
    
}


/*
 * Join Group
 */
function _join(socket, user){
    var group = typeof user.group == 'undefined' ? 'guest' : user.group;
    socket.join(group);
    currentGroup[socket.id] = group;
    
    /*socket.emit('join', {
        status  : true,
        msg     : group 
    });*/
    
    //console.log('Join Group: '+ group);
    
    // Broadcast
    socket.broadcast.to(group).emit('log', {
        status  : true,
        msg     : user.name + ' has joined on ' + group
    });
    
}

/*
 * Guest Name
 */
function _guestNo(socket, guestNo, users ){
    
    var name = 'Guest ' + guestNo;
    users[socket.id] = name;
    socket.emit('name',{
        status  : true,
        msg     : name 
    });
    
    users.push({
        name : name,
        group: name,
    });
    
    return ++guestNo;
}

/*
 * List all users in particular group
 */
function _getUsers(socket, group) {
    
    return io.of('/').in(group).clients;
}


/*
 * Login
 */
function _login(socket){
    // Login
    socket.on('login', function(data) {
        var username = data.username;

        if(username.indexOf('Guest') == 0) {
            socket.emit('name', {
                status  : false,
                msg     : 'User name can not begin with "Guest"',
            });
        }else{ 
            var found = false;
            for( var i in users ) {
                if( users[i]['name'].indexOf(username) > 0 ) {
                    found = true;
                }
            }
            if( found ) {
                socket.emit('name', {
                    status  : false,
                    msg     : 'Name is already used',
                })
                
            }else {
                currentUser = {
                    name : username,
                    group: 'guest',
                };
                
                users.push(currentUser);
                
                socket.emit('name', {
                    status  : true,
                    msg     : '',//'Total User(s): ' + users.length,
                });
                
                _join(socket, currentUser);
                
                // Broadcast
                /*socket.broadcast.to(currentUser.group).emit('log', {
                    status  : true,
                    msg     : currentUser.name + ' has joined on ' + currentUser.group

                });*/
            }
        }

    });
        
        
    
    
}

