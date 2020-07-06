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
        async function updateData(){
            var resultDevice = await db.queryStatusDevice();
            if (resultDevice != "queryStatusDevice-ERROR"){
                io.emit("deviceUpdateSuccessful", resultDevice);
            }
            var resultSensor = await db.queryValueSensor();
            if (resultSensor != "queryValueSensor-ERROR"){
                io.emit("sensorUpdateSuccessful", resultSensor);
            }
        }
        updateData();
    });

    socket.on("controlStatusDevice", function(msg){
        console.log(msg);
        async function controlDevice(msg){
            var result = await db.queryControlDevice(msg);
            if (result == "queryControlDevice-OK"){
                var resultDevice = await db.queryStatusDevice();
                if (resultDevice != "queryStatusDevice-ERROR"){
                    io.emit("deviceUpdateSuccessful", resultDevice);
                }
            } 
        }
        controlDevice(msg);
    });
    socket.on("NodeMCUcontrolStatusDevice", function(msg){
        var str = msg.split('.');
        const obj = {
            deviceName: str[0],
            deviceStatus: Number(str[1])
        };
        console.log(obj);
        async function controlDevice(obj){
            var result = await db.queryControlDevice(obj);
            if (result == "queryControlDevice-OK"){
                var resultDevice = await db.queryStatusDevice();
                if (resultDevice != "queryStatusDevice-ERROR"){
                    io.emit("deviceUpdateSuccessful", resultDevice);
                }
            } 
        }
        controlDevice(obj);
    });
    socket.on("NodeMCUsendValueSensor", function(msg){
        var str = msg.split('.');
        const obj = {
            temp: str[0],
            tempValue: Number(str[1]),
            humi: str[2],
            humiValue: Number(str[3])
        };
        console.log(obj);
        async function updateValueSensor(msg){
            var result = await db.queryUpdateValueSensor(msg);
            if (result == "queryUpdateValueSensor-OK"){
                var resultSensor = await db.queryValueSensor();
                if (resultSensor != "queryValueSensor-ERROR"){
                    io.emit("sensorUpdateSuccessful", resultSensor);
                }
            }
        }
        updateValueSensor(obj);
    });

    socket.on("sendChatBox", function(msg){
        console.log("Server: Send Messager")
        io.emit("sendMsg", msg);
    });
});











app.get("/", function(req, res){
    res.render("index");
});

