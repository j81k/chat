/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Client
 * Created On   : 2017-02-13 17:36
 */

var socket = io.connect()
,   userId = socket.userId //localStorage.getItem('userId') || "1" 
,   init   = function(){
    var H = $(window).height() - ( $('header').height() + $('footer').height() );
    $('#content > div').css({
        'height' : H + 'px',
    });
    
    if( userId == '' ) {
        // Show Login
        dialog($('#login-form'));
    }else {
        alert("Your Login ID: "+ userId);
    }
}

function chat( type ){
    var type = typeof type == 'undefined' ? 'message' : type;

    var $act = $('#plot .cell.active')
    ,   name = $act.find('.name').text()
    ,   group= $act.attr('data-group') || "guest";

    if( group != '' ) {
        console.log('[To] Group: ' + group+' | Name: '+ name );
        
        var data = {
            type : type,
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
            // Show Chat
            chat('init');
            
            $('#chat-bar .app-title').html($('#plot .cell.active .name').text());
            $('#chat-bar').addClass('active');
            $('#plot').slideUp(400);
            $('#chat-bar, #chat').slideDown(400);
            
        
        break;
        
        case 'menu' :
            // Show Plot
            $('#plot-bar').addClass('active');
            $('#chat-bar, #chat').slideUp(400);
            $('#plot-bar, #plot').slideDown(400);
            
        
        break;
        
        default : break;
        
    }
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
                $('#chat').append('<div class="chat-msg">'+ data.message +'</div>');
            }
            
        }else {
            alert("Error: "+result.msg);
        }
        
    })
    
    socket.on('name', function(result){
        if( result.status ) {
            // Logged In
            dialog($('#login-form'), true);
            
            userId = result.id;
            //window.localStorge.setItem('userId', userId);
            socket.userId = userId;
            
            // Get users list
            socket.emit('get', {
                type: 'users',
                userId: userId,
            });
            
        }else {
            alert("Error: "+result.msg);
        }
        
        $('footer').append('<div>'+  result.msg +'</div>');
        
    });
    
    socket.on('get', function(result){
        if( result.status ) {
            var html = ''
            ,   data = result.data;
            
            if( data.length > 0 ) {
                for(var i in data) {
                    var row = data[i];
                    html += '<div class="cell _bc" data-group="'+ row['group'] +'">';
                    html +=     '<div><i class="fa fa-user user-img _bg"></i></div>';
                    html +=     '<div class="name">'+ row['name'] +'</div>';
                    html += '</div>';
                }
                
                $('#total-users-cnt').html('('+ data.length +')');
            }else {
                html += '<div class="no-result">No More Contact(s) found!</div>';
                $('#total-users-cnt').html('');
            }
            
            $('#plot').html(html);
        }else {
            alert("Error: "+result.msg);
        }
        
    })
    
    
    socket.on('log', function(result){
        console.log(result);
        $('footer').append('<div>'+  result.msg +'</div>');
    })
    
    $('.title-bar .ctrl-btn').on('click', function(){
        
        if( $('#chat-bar').hasClass('active') ) {
            // Show Menu
            swap('menu');
        }else {
            swap();
        }
        
    });
    
    $('#chat-form form').submit(function(){
        // Broadcast Chat
        chat();
    });
    
    $(document).on('click', '#plot .cell', function(){
        var grp = $(this).attr('data-group') || "";
        
        if( grp != '' ) {
            // Establish connection among this Group
            $('#plot .cell.active').removeClass('active');
            $(this).addClass('active');
            swap();
        }
        
    });
    
    $('#login-form form').submit(function(){
        var username = $('#user-name').val()
        ,   password   = '';
        
        if( username != '' ) {
            //var message = chatApp.login(username, 'he');
            socket.emit('login', {
                'username'  : username,
                'password'  : password
            });
            
        }else {
            $('#user-name').focus();
        }
        
        return false;
    })
    
    init();
    
    //$('#menu-btn').trigger('click');
});