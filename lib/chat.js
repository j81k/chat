/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Server
 * Created On   : 2017-02-13 17:36
 */


var io          = require('socket.io')
,   guestNo     = 1
,   onlineUsers = []
,   currentGroup= []
,   currentUser = {}
,   prefix      = 'cht_';

exports.listen = function(server){
    io = io.listen(server);
    
    io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        //socket.emit('App is connected!');
        //console.log('App is connected!');
        
        //guestNo = _guestNo(socket, guestNo, onlineUsers);
        
        _login(socket);
        _get(socket);
        _chat(socket);
        
    });
    
    
}


/*
 * Database
 */
// jawsdb-maria-cubed-88859 as JAWSDB_MARIA_URL

// me3vsztjpki873rv:kbx3ndxm1m3xs0ru@mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/mk5ezo38qe9k5wyu
// User: me3vsztjpki873rv
// Pass: kbx3ndxm1m3xs0ru
// Host: mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306
// Databse: mk5ezo38qe9k5wyu

/*
 * Import
 */
// > cd \
// > cd xampp\mysql\bin
// > mysql --host=mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com --user=me3vsztjpki873rv --password=kbx3ndxm1m3xs0ru --reconnect  mk5ezo38qe9k5wyu < C:\xampp\htdocs\_tmp\nodejs\_\chat.sql

var mysql = require('mysql')
,   con   = mysql.createConnection({
        host    : 'localhost', // mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306
        user    : 'root', // me3vsztjpki873rv
        password: '', // kbx3ndxm1m3xs0ru
        database: 'chat' // mk5ezo38qe9k5wyu    
});

con.connect();


/*
 * Chat
 */
function _chat( socket ){
    
    socket.on('chat', function(data){
        //console.log('Chat Type: ' + data.to.name);
        switch( data.type ) {
            case 'init' :
                //_join(socket, data.to);
                
            break;     
            
            case 'logs' :
                /*
                 * Get all prev. chats
                 */
                socket.emit('log', {
                    status  : true,
                    msg     : 'Showing logs between ' + data.from.name + ' & ' + data.to.name,
                })
                
            
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
            msg     : data.from.name + ' sent a message!',
            data    : {
                type    : 'broadcast',
                user    : data.from,
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
        
        var res = [];
        switch(type) {
            case 'users':
                
                var sql  = 'SELECT * FROM `'+ prefix +'users` WHERE `user_id` = "'+ data.user.id +'" AND `status` = 1';
                    sql += '';
                
                
                var users = _sql(sql);
                for( var i in users ) {
                    // Ignore Current user
                    if( data.user.id != users[i].id ) {
                        res.push(users[i]);
                    }
                }
                
                if( res.length == 0 ) {
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
            data   : {
                type    : 'users',
                res     : res,
            }
                
                
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
function _guestNo(socket, guestNo, onlineUsers ){
    
    var name = 'Guest ' + guestNo;
    onlineUsers[socket.id] = name;
    socket.emit('name',{
        status  : true,
        msg     : name 
    });
    
    onlineUsers.push({
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
        
        switch(data.type) {
            case 'check':
                /*
                 * Check already logged In
                 */
                var userId = io.get(data.userId) || "";
                console.log('Log ID: '+ userId);
                socket.emit('login', {
                    status : userId != '' ? true : false,
                    msg    : '',
                    data   : {
                        type : data.type 
                    } 
                });
            
            break;
            
            case 'login':
                /*
                 * Login
                 */
                
            
            break;
            
            case 'reg':
                /*
                 * Register
                 */
                
                var username = data.username;
                if(username.indexOf('Guest') == 0) {
                    socket.emit('name', {
                        status  : false,
                        msg     : 'User name can not begin with "Guest"',
                    });
                }else{ 
                    var whr = {
                        user_slug : getVarName(username),
                        status    : 1,  
                    };
                    
                    var args = {
                        'select' : new Array('id')
                    };
                    
                    var sql = _select('users', whr, args);
                    con.query(sql, function(err, rows, fields){
                        if(err)
                            throw err;

                            if( rows != '' ) {
                                socket.emit('login', {
                                    status  : false,
                                    msg     : 'Sorry, '+ username +' is already taken!',
                                    data    :  {
                                        type: 'err'
                                    }
                                })

                            }else {
                                /*
                                 * Reg.
                                 */
                                currentUser = {
                                    id   : getVarName( socket.id ),
                                    name : username,
                                    group: 'guest',
                                };

                                onlineUsers.push(currentUser);
                                io.set('userId', currentUser.id);

                                // Insert
                                var args = {
                                    user_id     : currentUser.id,
                                    user_name   : currentUser.name,
                                    user_slug   : getVarName( currentUser.name ),
                                    password    : '',
                                    group_id    : currentUser.group,
                                    email       : '',
                                    contact_no  : '',
                                    created_on  : '',
                                };

                                _query('users', args);

                                socket.emit('login', {
                                    status  : true,
                                    msg     : 'Successfully Registered!',//'Total User(s): ' + onlineUsers.length,
                                    data    : {
                                        type        : data.type,
                                        currentUser : currentUser, 
                                    }
                                });

                                _join(socket, currentUser);

                                // Broadcast
                                /*socket.broadcast.to(currentUser.group).emit('log', {
                                    status  : true,
                                    msg     : currentUser.name + ' has joined on ' + currentUser.group

                                });*/
                            }
                    
                    });
                    
                }

                break;    
        }

    });
        
        
    
    
}

/*
 * Helpers
 */
function _query(tblName, args, cond) {
    
    if( typeof cond == 'undefined' ) {
        // Insert
        var sql = 'INSERT INTO `' + prefix + tblName + '` '
        ,   clms = '('
        ,   vals = 'VALUES (';
        
        Object.keys(args).map(function(clm, val){
            clms += '`'+ clm +'`, ';
            vals += '"'+ args[clm] +'", ';
        })
        
        clms = clms.slice(0, clms.length-2);
        vals = vals.slice(0, vals.length-2);
        
        sql += clms + ') ' + vals + ');';
        
        // Execute Query
        _sql(sql);
        
    }else {
        // Update
        
    }
    
}

function _select(tblName, whr, args){
    
    var sql   = 'SELECT ';
    
    if( typeof args != 'undefined' ) {
        
        if( typeof args.select != 'undefined' ) {
            // Select
            sql += '(';
            Object.keys(args.select).map(function(k, v){
                sql += '`'+ args.select[k] +'`, ';
            })
        
            sql = sql.slice(0, sql.length-2) + ') ';
        }else {
            sql += ' * ';
        }
    }
    
    sql += ' FROM `'+ prefix + tblName +'`';
    
    if( typeof whr != 'undefined' ) {
        // Where
        sql += ' WHERE ';
        Object.keys(whr).map(function(clm, val){
            sql += '`'+ clm +'` = "'+ whr[clm] +'" AND ';
        })
        
        sql = sql.slice(0, sql.length-4);
    }
    
    sql + ';';
    
    return sql;
}

function _sql(sql){
    
    console.log( 'SQL: ' + sql );
    con.query(sql, function(err, rows, fields){
        if(err)
            throw err;

        //console.log(fields);
        return rows || {};
    });
    
   // return {};
}


function getVarName(str) {
    return str.replace(/[^\w\s]/gi, '').replace(' ', '_').toLowerCase();
}

