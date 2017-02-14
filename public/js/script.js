/* 
 * Author       : Jai K
 * Purpose      : Script for Chat Client
 * Created On   : 2017-02-13 17:36
 */

var userId = localStorage.getItem('userId') || "1" 
,   init   = function(){
    var H = $(window).height() - ( $('header').height() + $('footer').height() );
    $('#content > div').css({
        'height' : H + 'px',
    });
    
    if( userId == '' ) {
        // Show Login
        dialog($('#login-form'));
    }
}

function swap(){
    if( $('#menu-btn').hasClass('active') ) {
        // Show List
        $('#plot').slideDown(800);
        $('#chat').slideUp(800);

        $('#menu-btn').removeClass('active fa-times').addClass('fa-bars');
    }else {
        // Show Chat
        $('#plot').slideUp(400);
        $('#chat').slideDown(400);

        $('#menu-btn').addClass('active fa-times').removeClass('fa-bars');
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

var Chat = function(socket) {
    return this.socket = socket;
}

Chat.prototype.sendMsg = function(msg){
    this.socket.emit('message', {
       'msg'   : msg,  
    });
}


var socket = io.connect();
$(document).on('ready', function(){
    var chatApp = new Chat(socket);
    
    socket.on('name', function(result){
        if( result.status ) {
            // Logged In
            dialog($('#login-form'), true);
            
            userId = result.id;
            //window.localStorge.setItem('userId', userId);
            
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
                    html += '<div class="cell _bc">';
                    html +=     '<div><i class="fa fa-user user-img _bg"></i></div>';
                    html +=     '<div>'+ data[i] +'</div>';
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
    
    $('#menu-btn').on('click', function(){
        swap();
    });
    
    $('#chat-form form').submit(function(){
       
       
        return false;
    });
    
    $('#plot .cell').on('click', function(){
        
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