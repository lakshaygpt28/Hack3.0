from flask import *
from flask_socketio import *

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

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True)
