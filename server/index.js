const express = require('express');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');


const app = express();
const io = new Server({ cors:true, });


app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();


io.on('connection' , socket => {
    console.log("New Connection...");

    socket.on('join-room' , data => {
        const { emailId , roomId } = data;
        console.log(`User ${emailId} joined the room ${roomId}`);

        emailToSocketMapping.set(emailId , socket.id);
        socketToEmailMapping.set(socket.id , emailId);

        socket.join(roomId);
        socket.emit('joined-room' , {roomId});
        socket.broadcast.to(roomId).emit('user-joined' , { emailId });
    });

    socket.on('call-user' , data => {
        const { emailId , offer } = data;

        const sockeId = emailToSocketMapping.get(emailId);
        const fromEmail = socketToEmailMapping.get(sockeId.id);

        socket.to(sockeId).emit('incomming-call' , { from:fromEmail , offer });
    });

    socket.on('disconnect' , () => {
        console.log(`User disconnected`);
    });
});

app.listen(8000 , () => {
    console.log(`Server is running at port ${8000}`);
});

io.listen(8001);