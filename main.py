from flask import *
from flask_socketio import *
from threading import Lock

thread = None
thread_lock = Lock()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

users = {}

@app.route("/")
def homepage():
    return render_template("homepage.html")

@app.route("/skrible")
def skrible(): 
    return render_template("skrible.html")


@socketio.on("draw")
def recvmsg(JSON):
    emit('click', JSON, broadcast = True)

uid_max = 0

@socketio.on("newuser")
def newuser(username):
    global users, uid_max
    uid_max += 1
    users[uid_max] = username
    emit("onlineusers", users, broadcast=True)
    print("debug:",users)
    return uid_max

@socketio.on("msg")
def chatting(msg):
    emit('chatting', msg, broadcast = True)


@socketio.on("disconnecting")
def disc(userid):
    users.pop(userid)
    emit("onlineusers", users, broadcast=True)

def backgroundThread(users):
    activeuser = 0
    while True:
        if (len(users) == 0):
            socketio.sleep(10)
        else:
            dic = dict(users)
            print(dic)
            for uid in dic:
                print(uid)
                socketio.emit("activeuser", uid, broadcast=True)
                socketio.sleep(20)       
        
@socketio.on('connect')
def connect():
    global thread
    global users
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(backgroundThread, users)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True)