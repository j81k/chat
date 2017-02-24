/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Client
 * Created On   : 2017-02-13 17:36
 */

var socket      = io.connect()
,   groupId     = 0
,   currentUser = {} 
//,   userId      = localStorage.getItem('userId') || "" 
,   init        = function(){
    
    var H = $(window).height() - ( $('header').height() + $('footer').height() );
    $('#content > div').css({
        'height' : H + 'px',
    });
    
    var iH = (H-($('#cht-form').height()+70));
    $('#chat-logs').css({
        'max-height' : iH + 'px',
        
    });
    
    socket.emit('login', {
        type    : 'check',
        userId  : getVarName( socket.id )
    });
    
}

function chat( act ){
    var act = typeof act == 'undefined' ? 'message' : act;

    var $act = $('#user-list-plot .cell.active')
    ,   name = $act.find('.name').text()
    ,   toId = $act.attr('data-id') || "";   
    
    if( toId != '' ) {
    
        var data = {
            type : 'chat',
            act  : act,
            from : currentUser,
            to   : {
                id   : toId,
                name : name  
            }
        };

        if( act == 'message' ) {
            data.message = $('#msg').val();
            $('#msg').val('');
        }else if( act == 'logs' ) {

            var grpId = $('#user-list-plot .cell.active').attr('data-group') || "";
            if( grpId != '' ) {
                data.groupId = grpId;
            }
        }

        // Open Chat
        socket.emit('chat', data);
        return true;
    }
    
    return false;
}

function swap(type){
    var type = typeof type == 'undefined' ? 'chat' : type;
    $('.title-bar').removeClass('active').fadeOut();
    
    switch(type) {
        
        case 'chat' :
            // Show Chat logs
            chat('logs');
            
            $('#chat-bar .app-title').html($('#user-list-plot .cell.active .name').text());
            $('#chat-bar').addClass('active');
            $('#plot-bar, #user-list-plot, #sett-bar, #settings').slideUp(400);
            $('#chat-bar, #chat').slideDown(400);
            $('#chat-logs ul').html('<div class="no-results">Fetching data ...</div>');
            
        
        break;
        
        case 'plot' :
            // Show Plot
            $('#plot-bar').addClass('active');
            $('#chat-bar, #chat, #sett-bar, #settings').slideUp(400);
            $('#plot-bar, #user-list-plot').slideDown(400);
            
        
        break;
        
        case 'settings' :
            // Show Settings
            $('#sett-bar').addClass('active');
            $('#chat-bar, #chat, #plot-bar, #user-list-plot').slideUp(400);
            $('#sett-bar, #settings').slideDown(400);
        break;
        
        default : break;
        
    }
}

function showChat(data){ //msg, type, dat){
    var d    = new Date()
    ,   type = typeof data.type == 'undefined' ? 'in' : data.type;
    
    if( typeof data.dat != 'undefined' ) {
        //alert(dat);
        var s  = data.dat.split('T')
        ,   s1 = s[0].split('-')
        ,   s2 = s[1].split(':');
        
        d       = new Date(s1[0], s1[1]-1, s1[2], s2[0], s2[1], s2[2].substring(0,2));
    }
    
    var H     = d.getHours()  
    ,   A     = H > 12 ? 'PM' : 'AM'  
    ,   html  = '<li class="chat-line '+ type +'" >';
        html +=     '<div class="chat-msg">';
        html +=         '<p '+ ( type == 'in' ? 'class="_bg"' : '' ) +' ><span class="cht">'+ data.msg +'</span><br /><span class="status" '+ ( type == 'in' ? 'style="color: #fff;"' : '' ) +'>'+ getDayName( d.getDay() ) +', '+ ( H > 12 ? H-12 : H ) +':'+ d.getMinutes() +':'+ d.getSeconds() + ' ' + A +'</span></p>';
        html +=     '</div>';
        html += '</li>';
    
    $('#chat-logs ul .no-results').remove();
    $('#chat-logs ul').append(html);
    
    
    if( typeof data.from != 'undefined' ) {
        
        var $newMsg = $('#user-list-plot-'+ data.from.id + ' .new-msg');
        if( $newMsg.is(':visible') ) {
            // Not in Chat window
            $newMsg.addClass('active');
            //scrollTo($newMsg);
        }
        
    }else {
        // List Page
        var $newMsg = $('#user-list-plot .cell.active .new-msg');
    }
    
    $newMsg.html((type == 'out' ? 'You: ' : '') + (data.msg.length > 12 ? data.msg.slice(0,12)+' ...' : data.msg));
    
    //scrollTo($('#chat-logs ul li:last-child .chat-msg'));
    $('html, body, #chat-logs').stop().animate({
        scrollTop: $("#chat-logs ul li:last-child .chat-msg").offset().top+$('#chat-logs').height()
    }, 400);
    
}


/*var chatApp = function(socket) {
    return this.socket = socket;
}

chatApp.prototype.sendMsg = function(msg){
    this.socket.emit('message', {
       'msg'   : msg,  
    });
}*/



$(document).on('ready', function(){
    //var chatApp = new chatApp(socket);
    
    socket.on('chat', function(result){
        $('footer').append('<div style="color: #1ba;">'+  result.msg +'</div>');
        var data = result.data;
        
        switch( data.act ) {
            
            case 'logs':
                groupId = data.groupId;
                
                $('#user-list-plot .cell.active').attr('data-group', groupId);
                
                /*
                 * Show Prev. Chat Messages
                 */
                var res = data.res;
                if( res.length > 0 ) {
                    for( var i in res ) {
                        var obj = {
                            msg : res[i]['msg'],
                            type: res[i]['msg_from'] == currentUser.id ? 'out' : 'in',
                            dat : res[i]['created_on'],
                        };
                        
                        showChat(obj);
                    }
                }else {
                    $('#chat-logs ul').html('<div class="no-results">Let\'s start chat ...</div>');
                }
                
            break;
            
            case 'message':
                // Show the broadcast Message
                
                var obj = {
                    msg : data.message,
                    from: data.from
                };
                showChat(obj);
                
            break;    
            
        }
        
        
    })
    
    socket.on('login', function(result){
        var type = result.data.type;
        switch( type ) {
            case 'check' :
                
                if( !result.status ) {
                    // Show Login
                    dialog($('#login-dialog'));
                }else {
                    socket.emit('get', {
                        type: 'users',
                        user: currentUser,
                    });
                }
                
            break;  
            
            case 'login' :
            case 'reg' :
                
                if( result.status ) {
                    // Logged In
                    var options = JSON.parse(result.data.options) || {};
                    currentUser = result.data.currentUser;
                    $('#user-theme .cell[data-color="'+ options.themeClr +'"]').trigger('click');
                    
                    dialog($('#'+ type +'-dialog'), true);
                    
                    if( result.data.invitedIds ) {
                        // Notify
                        $('.notif-invitation').fadeIn(400, function(){
                            var s = result.data.invitedIds.split(',');
                            $(this).find('.tip').html(s.length);
                        });
                    }
                    
                    $('#user-info .user-name h1').html(currentUser.name);
                    
                    // Get users list, for the current user
                    socket.emit('get', {
                        type: 'users',
                        user: currentUser,
                    });

                }else {
                    alert("Error: "+result.msg);
                }

                $('footer').append('<div>'+  result.msg +'</div>');
            break; 
        
            case 'err':   
            default :
                
                alert(result.msg);
            break;    
        }
        
    });
    
    socket.on('get', function(result){
        if( result.status ) {
            var html = ''
            ,   data = result.data
            ,   act   = typeof data.act == 'undefined' ? 'list' : data.act;  
                        
            switch( data.type ) {
            
                case 'users' :
                    
                    if( act == 'accepted' ) {
                        $('#user-invited-dialog .cell.active').fadeOut('slow', function(){
                            $(this).remove();
                            alert(result.msg);
                            dialog( $('#user-invited-dialog'), true );
                            
                            /*
                             * Update Invited List Count
                             */
                            var invitedIds = data.invitedIds || "";
                            if( invitedIds != '' ) {
                               // Notify
                               $('.notif-invitation').fadeIn(400, function(){
                                   var s = result.data.invitedIds.split(',');
                                   $(this).find('.tip').html(s.length);
                               });
                            }else {
                               // No More Invitation
                               $('.notif-invitation').fadeOut(400, function(){
                                   $(this).find('.tip').html('');
                               });
                            }
                            
                            // Update Main page List
                            socket.emit('get', {
                                type: 'users',
                                user: currentUser,
                            });
                        });
                        
                    }else if( act == 'invite' ) {
                        $('#user-add-dialog .cell.active').fadeOut('slow', function(){
                            $(this).remove();
                            alert(result.msg);
                            dialog( $('#user-add-dialog'), true );
                            
                            // Update Main page List
                            socket.emit('get', {
                                type: 'users',
                                user: currentUser,
                            });
                        });
                        
                    }else {
                    
                        /*
                         * List Contacts
                         */
                        var res   = data.res
                        ,   $plot = $('#user-'+ act +'-plot');

                        if( res.length > 0 ) {
                            for(var i in res) {
                                var row = res[i];
                                html += '<div class="cell _bc" id="user-'+ act +'-plot-'+ row['id'] +'" data-id="'+ row['id'] +'" >';
                                html +=     '<div><i class="fa fa-user user-img _bg"></i></div>';
                                html +=     '<div>';
                                html +=         '<div class="name">'+ row['user_name'] +'</div>';
                                html +=         '<div class="new-msg"></div>';
                                html +=     '</div>';
                                html += '</div>';
                            }

                            if( act != 'list' ) {
                                html += '<div>';
                                html +=     '<button class="btn _bg user-mingle-btn" data-act="'+ act +'" >'+ ( act == 'add' ? 'Invite' : 'Accept' ) +'</button>';
                                html += '</div>';
                            }

                            $('#total-user-'+ act +'-cnt').html('('+ res.length +')');
                        }else {
                            html += '<div class="no-results">' + result.msg + '</div>';
                            $('#total-user-'+ act +'-cnt').html('');
                        }

                        $plot.html(html);
                        
                    }
                    
               break;
               
            }
            
            
        }else {
            alert("Error: "+result.msg);
        }
        
    })
    
    
    socket.on('log', function(result){
        console.log(result);
        $('footer').append('<div>'+  result.msg +'</div>');
    });
    
    $('.notif-invitation').on('click', function(){
        dialog( $('#user-invited-dialog') );
        
        /*
         * Get Invited Members list
         */
        socket.emit('get', {
            type: 'users',
            act : 'invited',
            user: currentUser,
        });
    });
    
    $('.popup .clse-btn').on('click', function(){
        var $dialog = $(this).parent().closest('.popup');
        dialog($dialog, true);
    });
    
    $('.login-btn').on('click', function(){
        var $dialog = $(this).parent().closest('.popup');
        
        $dialog.fadeOut(400);
        if( $dialog.attr('id') == 'login-dialog' ) {
            // Show Reg.
            dialog($('#reg-dialog'));
        }else {
            // Show Login.
            dialog($('#login-dialog'));
        }
        
    });
    
    $(document).on('click', '.user-mingle-btn', function(){
        var ids = ''
        ,   act = $(this).attr('data-act') || 'add';
        
        $('#user-'+ act +'-plot .cell.active').each(function(){
            var id = $(this).attr('id') || "";
            if( id != '' ) {
                var s = id.split('-');
                ids += s[3] + ',';
            }
        });
        
        ids = ids.slice(0, ids.length-1);
        socket.emit('get', {
            type: 'users',
            act : act == 'add' ? 'invite' : 'accept',
            user: currentUser,    
            ids : ids
        });
        
    });
    
    $('.add-user-btn').on('click', function(){
        //$('#user-add-dialog .hdr span:first-child').html('Add Members');
        dialog( $('#user-add-dialog') );
        socket.emit('get', {
            type: 'users',
            act : 'add',
            user: currentUser,
        });
    });
    
    $('.exists').on('click', function(){
        var value = $(this).val();
        if( value != '' ) {
            value = getVarName(value);
            $(this).val(value);
            
            socket.emit('login', {
                type     : 'exists',
                value    : value,
            });
        
        }
    });
    
    $('.title-bar .ctrl-btn').on('click', function(){
        var $parent = $(this).parent().closest('.title-bar');
        
        if( $parent.attr('id') == 'plot-bar' ) {
            // Show Settings
            swap('settings');
        }/*else if( $parent.attr('id') == 'sett-bar' ) {
            // Show Plot
            swap('plot');
        }*/else {
            // Show Plot
            swap('plot');
        }
        
    });
    
    $('#chat-form form').submit(function(){
        var msg = $('#msg').val();
        
        if( msg != '' ) {
            var obj = {
                msg : msg,
                type: 'out'
            };
            showChat(obj);
            
            // Broadcast Chat
            chat();
        }
        return false;
    });
    
    $(document).on('click', '.plot .cell', function(){
        var idd = $(this).attr('id')
        ,   s   = idd.split('-');
        
        if( s[1] == 'list' ) {
            // Main List
            
            // Establish connection among this Group
            $('#user-list-plot .cell.active').removeClass('active');
            $(this).addClass('active');
            $(this).find('.new-msg').removeClass('active');
            swap();
        
        }else{
            
            // Add Members || Invited Members
            if( $(this).hasClass('active') ) {
                $(this).removeClass('active');
                $(this).find('.chk').remove();
            }else {
                $(this).addClass('active').append('<i class="fa fa-check _bg chk"></i>');

            }
            
        }
        
    });
    
    $('#login-dialog form').submit(function(){
        var $parent  = $(this).parent().closest('.popup')
        ,   username = $parent.find('.username').val()
        ,   password = $parent.find('.password').val();
        
        if( username != '' ) {
            
            socket.emit('login', {
                type        : 'login',
                username    : username,
                password    : password
            });
            
        }else {
            $('#user-name').focus();
        }
        
        return false;
    });
    
    $('#reg-dialog form').submit(function(){
        var $parent  = $(this).parent().closest('.popup')
        ,   username = $parent.find('.username').val()
        ,   password = $parent.find('.password').val()
        ,   email    = $parent.find('.email').val()
        ,   contactNo    = $parent.find('.contact-no').val();
        
        if( username != '' ) {
            
            socket.emit('login', {
                type        : 'reg',
                username    : username,
                password    : password,
                email       : email,
                contactNo   : contactNo
            });
            
        }else {
            $('#user-name').focus();
        }
        
        return false;
    });
    
    var themes = new Array(
            '15, 157, 88, 1', // Green
            '244, 67, 54, 1', // Red
            '233, 30, 99, 1', // Red (1)
            '156, 39, 176, 1', // Violete
            '103, 58, 183, 1', // Purple
            '63, 81, 181, 1', //  Purple (Dark)   
            '33, 150, 243, 1', // Blue (Light)
            '3, 169, 244, 1', // Blue (2)      
            '0, 188, 212, 1', // Blue Green
            '0, 150, 136, 1', // Green (Dark)       
            '76, 175, 80, 1', // Light Green
            '139, 195, 74, 1', // Light Green (1)        
            '205, 220, 57, 1', // Yellowish Green
            '255, 235, 59, 1', // Yellow
            '255, 193, 7, 1', // Orange
            '255, 152, 0, 1', // Orange (Dark)        
            '255, 87, 34, 1', // Red(2)
            '121, 85, 72, 1', // Brown
            '158, 158, 158, 1', // Grey     
            '96, 125, 139, 1' // Meroon       
        );
    
    var html        = ''
    ,   themeClr    = window.localStorage.getItem('themeColor');
    
    for( var i in themes ) {
        var clr = 'rgba('+ themes[i] +')';
        html += '<div class="cell '+ ( themeClr == clr ? 'active' : '' ) +'" data-color="'+ clr +'"><div style="background: '+ clr +'; ">&nbsp;</div></div>';
    }
    
    $('#user-theme').html(html);
    $('#user-theme .cell').on('click', function(){
        var clr = $(this).attr('data-color') || "";
        if( clr != '' ) {
            $('#user-theme .cell.active').removeClass('active');
            $(this).addClass('active');
            $('#styles').html('<style type="text/css"> ._bg { background-color: '+ clr +' !important; } ._bc{ border-color: '+ clr +' !important; }</style>');
            //window.localStorage.setItem('themeColor', clr);
            socket.emit('set', {
                type : 'options',
                user: currentUser,
                data: {
                    themeClr: clr,
                }
            });
            
        }
    });
    //$('#user-theme .cell.active').trigger('click');
    
    init();
    
});


function dialog($this, toClose){
    
    if( toClose ) {
        $this.fadeOut('slow', function(){
            $('.overlay').fadeOut(700);
        });
            
    }else {
        $('.overlay').fadeIn('slow', function(){
            $this.fadeIn('slow');
        });
    }
    
}

function getDayName(dayNo){
    
    switch(parseInt(dayNo)) {
        case 0 : return 'Sun'; break;
        case 1 : return 'Mon'; break;
        case 2 : return 'Tue'; break;
        case 3 : return 'Wed'; break;
        case 4 : return 'Thu'; break;
        case 5 : return 'Fri'; break;
        case 6 : return 'Sat'; break;
    }
}


function scrollTo($this) {
    if( typeof $this != 'undefined' ) {
        var o = $this.offset();
        $('body, html').animate({
            scrollTop: o.top
        }, 1000);
    }
    
}

function getVarName(str) {
    return str ? str.toString().replace(/[^\w\s]/gi, '').replace(' ', '_').toLowerCase() : '';
}

