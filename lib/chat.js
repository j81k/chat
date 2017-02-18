/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Server
 * Created On   : 2017-02-13 17:36
 */


var io          = require('socket.io')
,   guestNo     = 1
,   onlineUsers = []
,   currentGroup= 'guest'
,   currentUser = {}
,   params      = []
,   prefix      = 'cht_';

exports.listen = function(server){
    io = io.listen(server);
    
    io.set('log level', 1);
    io.sockets.on('connection', function(socket){
        //socket.emit('App is connected!');
        //console.log('App is connected!');
        
        //guestNo = _guestNo(socket, guestNo, onlineUsers);
        params.socket = socket;
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
        host    : 'mcldisu5ppkm29wf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306',
        user    : 'me3vsztjpki873rv', // me3vsztjpki873rv
        password: 'kbx3ndxm1m3xs0ru', // kbx3ndxm1m3xs0ru
        database: 'mk5ezo38qe9k5wyu' // mk5ezo38qe9k5wyu 
    
        /*host    : 'localhost',
        user    : 'root', // me3vsztjpki873rv
        password: '', // kbx3ndxm1m3xs0ru
        database: 'chat' // mk5ezo38qe9k5wyu */
    
});

con.connect();


/*
 * Chat
 */
function _chat( socket ){
    
    socket.on('chat', function(data){
        
        switch( data.act ) {
            case 'init' :
                //_join(socket, data.to);
                
            break;     
            
            case 'logs' :
                
                /*
                 * Join From & To user into Pipe
                 */
                _join(socket);
                
                /*
                 * Get all prev. chats
                 */
                //var sql = 'DELETE FROM `'+ prefix +'chats` WHERE DATE( `created_on` ) < DATE_SUB( CURDATE(), INTERVAL 1 DAY ); ';
                var sql = 'SELECT * FROM `'+ prefix +'chats` WHERE ( `msg_from` = "'+ data.from.id +'" AND `msg_to` = "'+ data.to.groupId +'" ) OR ( `msg_from` = "'+ data.to.groupId +'" AND `msg_to` = "'+ data.from.id +'" ) AND status = "1" ORDER BY `created_on` DESC LIMIT 10; ';
                //console.log(sql);
                con.query(sql, function(err, rows, fields){
                    
                    socket.emit('chat', {
                        status : rows != '' ? true : false,
                        msg    : 'Showing logs between ' + data.from.name + ' & ' + data.to.name, 
                        data   : {
                            type    : data.type,
                            act     : data.act,
                            res     : rows,
                        }
                    });
                    
                });
                
                
                
            
            break;
            
            case 'message' :
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
        var group = currentGroup; // data.to.group;
        console.log("Broadcast to ... "+group);
        
        var sql = '';//DELETE a FROM `'+ prefix +'chats` a CROSS JOIN (SELECT COUNT(`id`) AS cnt FROM `'+ prefix +'chats` a ) c WHERE c.cnt > 50; ';
        sql += 'INSERT INTO `'+ prefix +'chats` (`msg_from`, `msg_to`, `msg`, `created_on`) VALUES ("'+ data.from.id +'", "'+ data.to.groupId +'", "'+ data.message +'", "'+ now() +'");';
        
        con.query(sql, function(err, rows, fields){
            
            socket.broadcast.to(group).emit('chat', {
                status  : true,
                msg     : data.from.name + ' sent a message!',
                data    : {
                    type    : data.type,
                    act     : data.act,
                    from    : data.from,
                    message : data.message,
                }
            });
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
        ,   type = data.type
        ,   act  = typeof data.act == 'undefined' ? 'list' : data.act;
        
        var res = [];
        switch(type) {
            case 'users':
                
                if( act == 'accept' ) {
                    /*
                     * Save Approved List
                     */
                    var sql = 'SELECT `id` FROM `'+ prefix +'groups` WHERE `created_by` = "'+ data.user.id +'" AND status = 1';
                    con.query(sql, function(err, rows, fields){
                        
                        if( rows == '' ) {
                            // Insert
                            var sql = 'INSERT INTO `'+ prefix +'groups` (`group_slug`,`group_members_id`, `created_by`, `created_on`) VALUES ("group_'+ data.user.id +'", "'+ data.ids +'", "'+ data.user.id +'", "'+ now() +'")';
                            con.query(sql, function(err, rows, fields){ });
                            
                        }else{
                            // update
                            var sql = 'UPDATE `'+ prefix +'groups` SET `group_members_id` = CASE WHEN `group_members_id` IS NULL OR `group_members_id` = "" THEN "'+ data.ids +'" ELSE "'+ ( rows[0]['group_members_id'] +','+ data.ids ) +'" END WHERE `created_by` = '+ data.user.id +';'; 
                            con.query(sql, function(err, rows, fields){ });
                        }
                        
                        // Remove Invited Ids from User Table
                        var sql = 'SELECT `invited_ids` FROM `'+ prefix +'users` WHERE `id` = "'+ data.user.id +'"';
                        con.query(sql, function(err, rows, fields){
                            
                            params.type = type;
                            params.data= data;
                            params.s1  = rows[0]['invited_ids'].split(',');
                            params.ids = data.ids.split(','); 
                            params.i   = params.ids.length; 
                            
                            _insertGroup();
                            
                            
                        });
                        
                        
                        
                    });
                    
                    
                }else if( act == 'invited' ) {
                    /*
                     * Invited Users List
                     */
                    
                    var sql = 'SELECT a.id, a.user_name FROM `cht_users` AS a JOIN `cht_users` AS b ON FIND_IN_SET(a.`id`, b.`invited_ids`) WHERE b.id = "'+ data.user.id +'"';
                    con.query(sql, function(err, rows, fields){
                        
                        if( rows != '' ) {
                            socket.emit('get', {
                                status : true,
                                msg    : 'Invited List', 
                                data   : {
                                    type    : type,
                                    act     : act,
                                    res     : rows,
                                }
                            });
                        }
                    });
                    
                    
                }else if( act == 'invite' ) {
                    // Invite Members
                    
                    var sql = 'UPDATE `cht_users` SET `invited_ids` = CASE WHEN `invited_ids` IS NULL OR `invited_ids` = "" THEN "'+ data.user.id +'" ELSE CONCAT(`invited_ids`, ",'+ data.user.id +'") END WHERE id IN ('+ data.ids +')';
                    con.query(sql, function(err, rows, fields){
                        socket.emit('get', {
                            status : true,
                            msg    : 'Invitation has been sent!', 
                            data   : {
                                type    : type,
                                act     : act,
                            }
                        });
                    });
                    
                }else {
                    
                    var sql  = '';
                    if( act == 'add' ) {
                        sql  = 'SELECT * FROM `'+ prefix +'users` WHERE `status` = 1 AND id != "'+ data.user.id +'";';
                    }else {
                        //sql = 'SELECT u.*, g.id AS group_id, g.group_slug FROM `'+ prefix +'users` AS u JOIN `'+ prefix +'groups` AS g ON FIND_IN_SET(u.`id`, g.`group_members_id`) AND ( g.`created_by` = "'+ data.user.id +'" OR "'+ data.user.id +'" IN (g.`group_members_id`) ) AND g.`group_type` = "1" AND g.`status` = "1" GROUP BY u.`id` ORDER BY u.`user_name` ';
                        sql = 'SELECT u.*, g.id AS group_id, g.group_slug FROM `'+ prefix +'users` AS u JOIN `'+ prefix +'groups` AS g ON FIND_IN_SET(u.`id`, g.`group_members_id`) AND ( g.`created_by` = "'+ data.user.id +'" ) AND g.`group_type` = "1" AND g.`status` = "1" GROUP BY u.`id` ORDER BY u.`user_name` ';
                        //console.log('Q: ' + sql);
                    }
                    
                    con.query(sql, function(err, rows, fields){
                        
                        var invitedIds = ''  
                        ,   users = rows;
                        if( act != 'add' ) {
                            for( var i in users ) {
                                // Ignore Current user
                                if( data.user.id != users[i].id ) {
                                    res.push(users[i]);
                                }
                            }
                        }else {
                            res = users;
                        }

                        if( res.length == 0 ) {
                            // No users
                            msg = 'No more contact(s) found.' + ( act == 'list' ? '<div style="margin: 30px 0px;"> You can "Invite" people by choosing "Menu => Add User Icon"</div>' : '' );
                        }else {
                            msg = 'Success';
                        }

                        socket.emit('get', {
                            status : status,
                            msg    : msg, 
                            data   : {
                                type    : type,
                                act     : act,
                                res     : res,
                            }
                        });
                    })
                }
                
                
            break;    
            
            default:
                status = false;
            break;
        }
        
    })
    
}


/*
 * Join Group
 */
function _join(socket, user){
    var group = typeof user != 'undefined' && typeof user.group != 'undefined' ? user.group : currentGroup;
    socket.join(group);
    currentGroup = group;
    
    /*socket.emit('join', {
        status  : true,
        msg     : group 
    });*/
    
    //console.log('Join Group: '+ group);
    
    // Broadcast
    socket.broadcast.to(group).emit('log', {
        status  : true,
        msg     : ( typeof user != 'undefined' ? user.name : 'Some one' ) + ' has joined on ' + group
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
                 * Check already logged In/Not
                 */
                var found = false;
                for(var i in onlineUsers) {
                    if( data.userId == onlineUsers[i]['id'] ) {
                        found = true;
                        break;
                    }
                }
                
                socket.emit('login', {
                    status : found,
                    msg    : '',
                    data   : data,
                });
            
            break;
            
            case 'login':
            case 'reg':
                /*
                 * Register
                 */
                
                var type     = data.type
                ,   username = data.username;
                
                if(username.indexOf('Guest') == 0) {
                    socket.emit('name', {
                        status  : false,
                        msg     : 'User name can not begin with "Guest"',
                    });
                }else{ 
                    
                    var slug = getVarName(username);
                    var args = {}
                    ,   whr = {
                        user_slug : getVarName(username),
                        status    : 1,  
                    };
                    
                    if( type == 'login' ){
                        /*
                         * Login
                         */
                        
                        var sql = _select('users', whr, args);
                        con.query(sql, function(err, rows, fields){
                            if(err)
                                throw err;

                                if( rows == '' ) {
                                    // Not exists
                                    socket.emit('login', {
                                        status  : false,
                                        msg     : 'Invalid User name or Password!',
                                        data    :  {
                                            type: 'err'
                                        }
                                    });
                                }else {
                                    
                                    currentUser = {
                                        id   : rows[0]['id'],
                                        name : rows[0]['user_name'],
                                        group: 'guest',
                                    };
                                    
                                    onlineUsers.push(currentUser);
                                    _join(socket, currentUser);
                                    
                                    socket.emit('login', {
                                        status  : true,
                                        msg     : 'Successfully Logged in!',
                                        data    : {
                                            type        : data.type,
                                            currentUser : currentUser,
                                            invitedIds  : rows[0]['invited_ids'],
                                        }
                                    });
                                    
                                }
                                
                        });
                        
                        
                    }else {
                        
                        /*
                         * Reg.
                         */
                        
                        // Insert group
                        var sql = 'INSERT INTO `'+ prefix +'groups` (`group_type`, `group_name`, `group_slug`)';
                        
                        
                        args.select =  new Array('id');
                      
                        
                        var sql = _select('users', whr, args);
                        con.query(sql, function(err, rows, fields){
                            if(err)
                                throw err;

                                if( rows == '' ) {
                                    
                                    /*
                                     * Get Last user ID
                                     */
                                    var sql = 'SELECT `id` FROM `'+ prefix +'users` ORDER BY `id` DESC LIMIT 1;'; 
                                    con.query(sql, function(err, rows, fields){
                                        if( err ) throw err;
                                        
                                        currentUser = {
                                            id   : rows == '' ? 1 : ++rows[0]['id'],
                                            name : username,
                                            group: 'guest',
                                        };

                                        onlineUsers.push(currentUser);

                                        // Insert
                                        var args = {
                                            id          : currentUser.id,
                                            user_name   : currentUser.name,
                                            user_slug   : getVarName( currentUser.name ),
                                            password    : data.password,
                                            email       : data.email,
                                            contact_no  : data.contactNo,
                                            created_on  : now(),
                                        };

                                        _query('users', args);
                                        _join(socket, currentUser);

                                        socket.emit('login', {
                                            status  : true,
                                            msg     : 'Successfully Registered!',//'Total User(s): ' + onlineUsers.length,
                                            data    : {
                                                type        : data.type,
                                                currentUser : currentUser, 
                                            }
                                        });
                                        
                                    });
                                    
                                    
                                    
                                }else {
                                    // Already exists
                                    socket.emit('login', {
                                        status  : false,
                                        msg     : 'Sorry, '+ username +' is already taken!',
                                        data    :  {
                                            type: 'err'
                                        }
                                    });
                                }
                                
                        });
                      
                        
                    } // Reg.
                            
                }

                break;    
        }

    });
        
        
    
    
}


function _insertGroup(){
    
    if( --params.i >= 0 ) {
        
        var sql = 'SELECT `id` FROM `'+ prefix +'groups` WHERE `created_by` = "'+ params.ids[params.i] +'" AND status = 1';
        con.query(sql, function(err, rows, fields){
            var i = params.i
            ,   data = params.data
            ,   ids  = params.ids;
            
            if( rows == '' ) {
                // Insert
                var sql = 'INSERT INTO `'+ prefix +'groups` (`group_slug`,`group_members_id`, `created_by`, `created_on`) VALUES ("group_'+ ids[i] +'", "'+ data.user.id +'", "'+ ids[i] +'", "'+ now() +'")';
                con.query(sql, function(err, rows, fields){ });

            }else{
                // update
                var sql = 'UPDATE `'+ prefix +'groups` SET `group_members_id` = CASE WHEN `group_members_id` IS NULL OR `group_members_id` = "" THEN "'+ data.user.id +'" ELSE "'+ ( rows[0]['group_members_id'] +','+ data.user.id ) +'" END WHERE `created_by` = '+ data.ids +';'; 
                con.query(sql, function(err, rows, fields){ });
            }


            if( i == 0 ) {
                
                var invitedIds = ''
                ,   s1         = params.s1;
                
                for( var i in s1 ) {
                    if( ids[i] != s1[i] ) {
                        invitedIds += s1[i] + ','; 
                    }
                }
                invitedIds = invitedIds.substring(0, invitedIds.length-1);

                var sql = 'UPDATE `'+ prefix +'users` SET `invited_ids` = "'+ invitedIds +'" WHERE id = "'+ data.user.id +'"';
                con.query(sql, function(err, rows, fields){

                    params.socket.emit('get', {
                        status : true,
                        msg    : 'Selected Member(s) are Accepted and added to your contacts. Now you can chat with them!', 
                        data   : {
                            type    : params.type,
                            act     : 'accepted',
                            invitedIds : invitedIds,
                        }
                    });
                });
            }else {
                // Next Loop
                _insertGroup();
            
            }

        })

    }
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
    
    //console.log( 'SQL: ' + sql );
    con.query(sql, function(err, rows, fields){
        if(err)
            throw err;

        //console.log(fields);
        return rows || {};
    });
    
   // return {};
}


function getVarName(str) {
    return str ? str.toString().replace(/[^\w\s]/gi, '').replace(' ', '_').toLowerCase() : '';
}

function now(){
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
}

