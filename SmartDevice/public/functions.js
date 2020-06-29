var sttLight = 0;
var sttFan = 0;
var sttPump = 0;

var valTemperature = 0;
var valHumidity = 0;

$(document).ready(function(){
    setInterval(clock, 1000);
    
    var socket = io();
    
    socket.emit("clientUpdateStatus");

    document.getElementById("temp").innerHTML = valTemperature + "&ordmC";
    document.getElementById("humi").innerHTML = valHumidity + "%";
// ------------------------------- Kiểm tra checkox và gọi hàm controlDevice gửi đi ---------------------------- //
    $("#doggo").click(function(){
        if (document.getElementById("doggo").checked) {
            sttLight = 1;
        } else {
            sttLight = 0;
        }
        controlDevice("light");
        console.log("Light state: " + sttLight);
    });

    $("#doggo1").click(function(){
        if (document.getElementById("doggo1").checked) {
            sttFan = 1;
        } else {
            sttFan = 0;
        }
        controlDevice("fan");
        console.log("Fan state: " + sttFan);
    });

    $("#doggo2").click(function(){
        if (document.getElementById("doggo2").checked) {
            sttPump = 1;
        } else {
            sttPump = 0;
        }
        controlDevice("pump");
        console.log("Pump state: " + sttPump);
    });

// -------------------------------- Các sự kiện nhận về  ----------------------------------------- //
    socket.on("deviceUpdateSuccessful", function(msg){
        displayDevice(msg);
    });

    socket.on("sensorUpdateSuccessful", function(msg){
        displaySensor(msg);
    });

// --------------------------------------- Hàm lấy trạng thái thiết bị và gửi đi ------------------------------------------ //
    function controlDevice(devicename){
        var dataJSON = new Object();
        dataJSON.deviceName = devicename; 
        dataJSON.deviceStatus = null;
    
        if(dataJSON.deviceName == "light"){
            dataJSON.deviceStatus = sttLight;
        } 
        else if(dataJSON.deviceName == "pump"){
            dataJSON.deviceStatus = sttPump;
        } 
        else if(dataJSON.deviceName == "fan"){
            dataJSON.deviceStatus = sttFan;
        }
        socket.emit("controlStatusDevice", dataJSON);
    }

// ------------------------------- Hàm hiển thị ra web trạng thái thiết bị và giá trị sensor ---------------------------- //
    function displayDevice(msg){
        console.log(msg);
        var sttDevice = JSON.parse(JSON.stringify(msg)); // Tách JSON
        // chuỗi đã parse ra có dạng ArrayObject: {{"id":"1","name":"light","status":"1"},{"id":"2","name":"fan","status":"0"},{"id":"3","name":"pump","status":"0"}}
        sttLight = sttDevice[0]["status"];               
        sttFan = sttDevice[1]["status"];
        sttPump = sttDevice[2]["status"];

        if (sttLight == 1){
            document.getElementById("doggo").checked = true;
        } else {
            document.getElementById("doggo").checked = false;
        }

        if (sttFan == 1){
            document.getElementById("doggo1").checked = true;
        } else {
            document.getElementById("doggo1").checked = false;
        }

        if (sttPump == 1){
            document.getElementById("doggo2").checked = true;
        } else {
            document.getElementById("doggo2").checked = false;
        }
    }

    function displaySensor(msg){
        console.log(msg);
        var valueSensor = JSON.parse(JSON.stringify(msg)); // Tách JSON
        valTemperature = valueSensor[0]["value"];
        valHumidity = valueSensor[1]["value"];

        document.getElementById("temp").innerHTML = valTemperature + "&ordmC";
        document.getElementById("humi").innerHTML = valHumidity + "%";
    }


// ---------------------------------------- Lấy trạng thái thiết bị và gửi đi ----------------------------------------- //
    function clock() {
        let timer = new Date();
        //Gọi các phương thức của đối tượng timer
        let hour = timer.getHours();  //Lấy giờ hiện tại (giá trị từ 0 - 23)
        let minute = timer.getMinutes();  //Lấy phút hiện tại
        let second = timer.getSeconds();  //Lấy giây  hiện tại

        if (hour < 10) {
            hour = "0" + hour;
        }
        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }
        //Hiện thị thời gian lên thẻ div id="clock" với phương thức innerHTML
        document.getElementById("clock").innerHTML = hour + " : " + minute + " : " + second;
    }

// ---------------------------------------- Send Messenger ----------------------------------------- //
    $("#btn-SendMsg").click(function(){
        var msg = document.getElementById("chatMsg").value;
        document.getElementById("chatMsg").value = "";
        socket.emit("sendChatBox", msg);
    });
});











