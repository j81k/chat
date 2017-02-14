/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Server
 * Created On   : 2017-02-13 17:36
 */


var io          = require('socket.io')
,   guestNo     = 1
,   users       = []
,   namesUsed   = []
,   currentGroup = [];


exports.listen = function(server){
    io = io.listen(server);
    
    io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        //socket.emit('App is connected!');
        //console.log('App is connected!');
        
        //guestNo = _guestNo(socket, guestNo, users, namesUsed);
        
        _login(socket);
        _get(socket);
        
    });
    
    
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
                
                for( var i in namesUsed ) {
                    // Ignore Current user
                    //if( data.userId != users[i].id ) {
                        data[i] = namesUsed[i];
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
function _join(socket, group){
    group = typeof group == 'undefined' ? 'Guest' : group;
    socket.join(group);
    currentGroup[socket.id] = group;
    
    /*socket.emit('join', {
        status  : true,
        msg     : group 
    });
    
    // Broadcast
    socket.broadcast.to(group).emit('message', {
        status  : true,
        msg     : users[socket.id] + ' has joined on ' + group
        
    });*/
    
}

/*
 * Guest Name
 */
function _guestNo(socket, guestNo, users, namesUsed){
    
    var name = 'Guest ' + guestNo;
    users[socket.id] = name;
    socket.emit('name',{
        status  : true,
        msg     : name 
    });
    
    namesUsed.push(name);
    
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
        }else if( namesUsed.indexOf(username) >= 0 ) {
            socket.emit('name', {
                status  : false,
                msg     : 'Name is already used',
            })
        }else {
            users[socket.id] = username;    
            namesUsed.push(username);
            currentGroup[socket.id] = username;
            
            //_join(socket);

            socket.emit('name', {
                status  : true,
                msg     : '',//'Total User(s): ' + namesUsed.length,
            })
        }

    });
        
        
    
    
}

