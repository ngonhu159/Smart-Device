var mysql = require('mysql');

var conn = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'smartdevice',
});


exports.queryStatusDevice = function(){
    return new Promise (function(resolve, reject){
        conn.query("SELECT * FROM device;", function(err, rows){
            if (err) reject(err);
            if (rows.length>0){
                resolve(rows);
            } else resolve("queryStatusDevice-ERROR");
        });
    });
}

exports.queryValueSensor = function(){
    return new Promise (function(resolve, reject){
        conn.query("SELECT * FROM sensor;", function(err, rows){
            if (err) reject(err);
            if (rows.length>0){
                resolve(rows);
            } else resolve("queryValueSensor-ERROR");
        });
    });
}

exports.queryControlDevice = function(cmd){
    var getJSON = JSON.parse(JSON.stringify(cmd)); // Tách JSON
    var getDevicesName = getJSON["deviceName"]; // Lấy tên thiết bị sẽ điều khiển
    var getDevicesStt = getJSON["deviceStatus"]; // Lấy trạng thái thiết bị sẽ điều khiển và đảo trạng thái 
    console.log("getDevicesName = " + getDevicesName + " getDevicesStt = " + getDevicesStt);
    return new Promise (function(resolve, reject){
        conn.query("UPDATE device SET status = " + getDevicesStt + " WHERE name = '" + getDevicesName + "';", function(err, rows){
            if (err) reject(err);
            resolve("queryControlDevice-OK");
        });
    });
}


exports.queryUpdateValueSensor = function(cmd){
    var getJSON = JSON.parse(JSON.stringify(cmd)); // Tách JSON
    var getTemperature = getJSON[0]["sensorName"]; 
    var getTemperatureValue = getJSON[0]["sensorValue"]; 
    var getHumidity = functiongetJSON[1]["sensorName"]; 
    var getHumidityValue = getJSON[1]["sensorValue"]; 
    console.log("Sensor1 = " + getTemperature + " Value1 = " + getTemperatureValue + " Sensor2 = " + getHumidity + " Value2 = " + getHumidityValue );
    return new Promise (function(resolve, reject){
        conn.query("UPDATE device SET value = " + getTemperatureValue + " WHERE name = '" + getTemperature + "';", function(err, rows){
            if (err) reject(err);
            conn.query("UPDATE device SET value = " + getHumidityValue + " WHERE name = '" + getHumidity + "';", function(err, rows){
                resolve("queryUpdateValueSensor-OK");
            });
        });
    });
}