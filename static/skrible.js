let gameStarted = false;
let userid = 0;
let allusers = undefined;
let activeUser = 0;

let sketch = function(p){

    p.setup = function() {
        socket = io.connect('http://' + document.domain + ':' + location.port);
        p.createCanvas(640, 450);
        p.background(230);
        p.strokeWeight(2);
        socket.on('click', p.drawData);
        socket.on('onlineusers', p.refreshUsers);
        socket.on('chatting', p.showmessage);
        socket.on('activeuser', p.changeActiveUser);  
        socket.on('user', p.cout);

    }

    p.drawData = function (JSON) {
        // console.log('working')
        p.stroke(255, 0, 0);
        p.fill(255, 0, 0);
        p.circle(JSON.posX, JSON.posY, 2);
    }

    p.draw = function() {
        if (p.mouseIsPressed && gameStarted && activeUser == userid) {
            p.stroke(255, 0, 0);
            p.fill(255, 0, 0);
            p.circle(p.mouseX, p.mouseY, 2);
            socket.emit('draw', {'posX': p.mouseX, 'posY': p.mouseY});
            // point(mouseX, mouseY);
        }
    }

    p.refreshUsers = function (users){
        var userbox = "<div class=\"box\" id=\"uid\"><h3>username</h3></div >";
        $("#usersbox").empty();
        allusers = users;
        for (const uid in users) {
            const element = users[uid];
            $("#usersbox").append(userbox.replace("username", element).replace("uid", "uid" + uid));
            console.log(element);
        }
    }

    p.showmessage = function (msg){
        console.log(msg);
        var text = '<div class="messagebox"><span class="uname">usr:</span><span class="message">msg</span></div>'
        text = text.replace('usr',allusers[msg.uid]).replace('msg',msg.message);
        $("#messages").append(text);
    }
    p.changeActiveUser = function(auid) {
        activeUser = auid;
        $("#usersbox>.box").each( function(x,y){ $(y).removeClass('active');});
        $("#uid" + auid).addClass('active');
        p.background(255);
    }

    p.cout = function(us) {
        for (const uid in us) {
            console.log(element);
        }
    }
}

function chat(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
        var v = $("#chat").val();
        socket.emit('msg', {'uid': userid, 'message': v});
        $("#chat").val('');
    }
}

function enterUser(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) {
        var v = $("#username").val();
        socket.emit('newuser', v, function (uid){
            console.log("userid:", uid); userid = uid;
        });
        $("#modal-background").hide();
        $("#modal-content").hide();
        $("#chat").focus();
        gameStarted = true;
    }
}

lastmessage = 0;

$(function(){
    $("#modal-background").show();
    $("#modal-content").show();
    $("#username").focus().bind("keypress", {}, enterUser);
    $("#chat").bind("keypress", {}, chat);
    new p5(sketch, 'container');
    window.onbeforeunload = function () {
        socket.emit("disconnecting", userid);
    }
    setInterval(() => {
        $(".messagebox").each( function(x,y) {if(x < lastmessage) $(y).fadeOut(5000);});
        lastmessage += 1;
    }, 5000);
});