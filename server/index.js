const express = require('express');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');


const app = express();
const io = new Server({ cors:true, });


app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();


io.on('connection' , socket => {
    console.log("New Connection..." , socket.id);

    socket.on('join-room' , ({ emailId , roomId }) => {
        console.log(`User ${emailId} joined the room ${roomId}` , socket.id);

        emailToSocketMapping.set(emailId , socket.id);
        socketToEmailMapping.set(socket.id , emailId);

        socket.join(roomId);
        socket.emit('joined-room' , { roomId });
        socket.broadcast.to(roomId).emit('user-joined' , { emailId });
    });

    socket.on('call-user' , data => {
        const { emailId , offer } = data;

        const socketId = emailToSocketMapping.get(emailId);
        const fromEmail = socketToEmailMapping.get(socket.id);

        console.log('Calling to' , emailId , fromEmail , socketId , socket.id);
        socket.to(socketId).emit('incomming-call' , { from:fromEmail , offer });
    });

    socket.on('call-accepted' , ({ emailId , answer }) => {
        console.log('Call accepted..' , socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-Accepted' , { answer })
    })

    socket.on('disconnect' , () => {
        console.log(`User disconnected` , socket.id);
    });
});

app.listen(8000 , () => {
    console.log(`Server is running at port ${8000}`);
});

io.listen(8001);