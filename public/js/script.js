/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Client
 * Created On   : 2017-02-13 17:36
 */

var socket      = io.connect()
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

function chat( type ){
    var type = typeof type == 'undefined' ? 'message' : type;

    var $act = $('#user-list-plot .cell.active')
    ,   name = $act.find('.name').text()
    ,   group= $act.attr('data-group') || "guest";

    if( group != '' ) {
        console.log('[To] Group: ' + group+' | Name: '+ name );
        
        var data = {
            type : type,
            from : currentUser,
            to   : {
                group : group,
                name  : name  
            }
        };
        
        if( type == 'message' ) {
            data.message = $('#msg').val();
            
            /*if( data.message == '' ) {
                return false;
            }*/
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

function showChat(msg, type){
    var type = typeof type == 'undefined' ? 'in' : type;
    
    var d     = new Date()
    ,   H     = d.getHours()  
    ,   A     = H > 12 ? 'PM' : 'AM'  
    ,   html  = '<li class="chat-line '+ type +'" >';
        html +=     '<div class="chat-msg">';
        html +=         '<p '+ ( type == 'in' ? 'class="_bg"' : '' ) +' ><span class="cht">'+ msg +'</span><br /><span class="status" '+ ( type == 'in' ? 'style="color: #fff;"' : '' ) +'>'+ getDayName( d.getDay() ) +', '+ ( H > 12 ? H-12 : H ) +':'+ d.getMinutes() +':'+ d.getSeconds() + ' ' + A +'</span></p>';
        html +=     '</div>';
        html += '</li>';
            
    $('#chat-logs ul').append(html);
    
    //scrollTo($('#chat-logs ul li:last-child .chat-msg'));
    $('html, body, #chat-logs').stop().animate({
        scrollTop: $("#chat-logs ul li:last-child .chat-msg").offset().top+$('#chat-logs').height()
    }, 400);
    
}

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
        
        $('footer').append('<div style="color: #1ba;">'+  result.msg +'</div>');;
        if( result.status ) {
            var data = result.data;
            
            if( data.type == 'broadcast' ) {
                // Show the broadcast Message
                
                var $newMsg = $('#list-'+getVarName( data.user.id ) + ' .new-msg');
                if( $newMsg.is(':visible') ) {
                    // Not in Chat window
                    $newMsg.addClass('active');
                    //scrollTo($newMsg);
                }
                
                $newMsg.html(data.message.slice(0,20));
                showChat(data.message);
            }
            
        }else {
            alert("Error: "+result.msg);
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
                    currentUser = result.data.currentUser;
                    dialog($('#'+ type +'-dialog'), true);
                    
                    if( result.data.invitedIds ) {
                        // Notify
                        $('.notif-invitation').fadeIn(400, function(){
                            var s = result.data.invitedIds.split(',');
                            $(this).find('.cnt').html(s.length);
                        });
                    }
                    
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
                    
                    if( act == 'invite' ) {
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
                                html += '<div class="cell _bc" id="user-'+ act +'-plot-'+ row['id'] +'" data-group="'+ row['group_id'] +'">';
                                html +=     '<div><i class="fa fa-user user-img _bg"></i></div>';
                                html +=     '<div>';
                                html +=         '<div class="name">'+ row['user_name'] +'</div>';
                                html +=         '<div class="new-msg"></div>';
                                html +=     '</div>';
                                html += '</div>';
                            }

                            if( act == 'add' ) {
                                html += '<div>';
                                html +=     '<button id="user-invite-btn" class="btn _bg">Invite</button>';
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
    
    $(document).on('click', '#user-invite-btn', function(){
        var ids = '';
        $('#user-add-plot .cell.active').each(function(){
            var id = $(this).attr('id') || "";
            if( id != '' ) {
                var s = id.split('-');
                ids += s[3] + ',';
            }
        });
        
        ids = ids.slice(0, ids.length-1);
        
        socket.emit('get', {
            type: 'users',
            act : 'invite',
            user: currentUser,    
            ids : ids
        });
        
    });
    
    $('.add-user-btn').on('click', function(){
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
            showChat(msg, 'out');

            // Broadcast Chat
            chat();
        }
        return false;
    });
    
    $(document).on('click', '#user-list-plot .cell', function(){
        var grp = $(this).attr('data-group') || "";
        
        if( grp != '' ) {
            // Establish connection among this Group
            $('#user-list-plot .cell.active').removeClass('active');
            $(this).addClass('active');
            $(this).find('.new-msg').removeClass('active');
            swap();
        }
        
    });
    
    $(document).on('click', '#user-add-plot .cell', function(){
        if( $(this).hasClass('active') ) {
            $(this).removeClass('active');
            $(this).find('.chk').remove();
        }else {
            $(this).addClass('active').append('<i class="fa fa-check _bg chk"></i>');
            
        }
    })
    
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
    
    init();
    
});