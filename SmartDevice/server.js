var express = require("express");
var app = express();

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var db = require("./database/database.js");

var server = require("http").Server(app);
var io = require("socket.io")(server);

const port_Listen = 3000;
server.listen(port_Listen);

io.on("connection", function(socket){
    console.log("Server: Client connected: " + socket.id);

    // ------------------------ Lắng nghe các sự kiện ------------------------- //
    socket.on("clientUpdateStatus", function(){
        console.log("Server: Client request data from server");
        async function updateData(){
            var resultDevice = await db.queryStatusDevice();
            if (resultDevice != "queryStatusDevice-ERROR"){
                socket.emit("deviceUpdateSuccessful", resultDevice);
            }
            var resultSensor = await db.queryValueSensor();
            if (resultSensor != "queryValueSensor-ERROR"){
                socket.emit("sensorUpdateSuccessful", resultSensor);
            }
        }
        updateData();
    });

    socket.on("controlStatusDevice", function(msg){
        console.log("Server: Client control device");
        async function controlDevice(msg){
            var result = await db.queryControlDevice(msg);
            if (result == "queryControlDevice-OK"){
                var resultDevice = await db.queryStatusDevice();
                if (resultDevice != "queryStatusDevice-ERROR"){
                    socket.emit("deviceUpdateSuccessful", resultDevice);
                    console.log("Vao Day 1");
                }
            }
        }
        controlDevice(msg);
    });

    socket.on("sendValueSensor", function(msg){
        console.log("Server: Node send value data sensor");
        async function updateValueSensor(msg){
            var result = await db.queryUpdateValueSensor(msg);
            if (result == "queryUpdateValueSensor-OK"){
                var resultSensor = await db.queryValueSensor();
                if (resultSensor != "queryValueSensor-ERROR"){
                    socket.emit("sensorUpdateSuccessful", resultSensor);
                }
            }
        }
        updateValueSensor(msg);
    });


    socket.on("sendChatBox", function(msg){
        console.log("Server: Send Messager")
        socket.emit("sendMsg", msg);
    });
});











app.get("/", function(req, res){
    res.render("index");
});

