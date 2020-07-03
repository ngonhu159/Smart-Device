#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <Arduino_JSON.h>
#include <SocketIoClient.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"

LiquidCrystal_I2C lcd(0x27,16,2);
SocketIoClient webSocket;

#define pin_dht 0

const int DHT_type = DHT22;  //Khai báo loại cảm biến, có 2 loại là DHT11 và DHT22
DHT dht(pin_dht, DHT_type);

const char* Host_Socket = "192.168.0.116";
unsigned int Port_Socket=3000;

const String ssid = "MQ_Network";
const String pwdWifi = "1denmuoi1";

int statusDevice[3] ={0, 0 , 0};
String Msg = "";

#define btnLight D3
#define btnFan D4

#define pinLight D5
#define pinFan D6
#define pinPump D7
#define maxScreen 1

int screenLCD = 0;    // co 3 trang: trang thai thiet bi, nhiet do - do am, messenger
float T = 0;  // nhiet do
float H = 0;  // do am
double beginTime = 0;
double endTime = 0;

void setup() {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0,0);
  lcd.print("Connecting...");
  
  pinMode(pinLight, OUTPUT);
  pinMode(pinFan, OUTPUT);
  pinMode(pinPump, OUTPUT);
  
  WiFi.begin(ssid, pwdWifi);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }  
  webSocket.begin(Host_Socket, Port_Socket, "/socket.io/?transport=websocket");
  
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Connected");
  Serial.println("Connected");
  delay(1000);
  webSocket.emit("clientUpdateStatus","");
  webSocket.on("deviceUpdateSuccessful", updateStatus_Device);
  webSocket.on("sendMsg", chatBox_LCD);
  beginTime = millis();
}

void loop() {
//  readSensor_DHT();
//  checkButton_DeviceControl();
  display_LCD();
  webSocket.loop();
}
void updateStatus_Device(const char * payload, size_t length){
  Serial.print(payload);
  pareJson_Data(payload);
  digitalWrite(pinLight, statusDevice[0]);
  digitalWrite(pinFan, statusDevice[1]);
  digitalWrite(pinPump, statusDevice[2]);
}
void chatBox_LCD(const char * payload, size_t length){
  Serial.print(payload);
  if (payload != "")
  {
    DynamicJsonBuffer jsonBuffer;       // khai báo biến
    JsonObject &root = jsonBuffer.parseObject(payload);     // chuỗi Json từ nodeMCU truyền qua là dạng chuỗi JsonArray (ví dụ chuỗi có dạng: [{"S1":"1"},{"S2":"0"},{"S3":"0"}]  trong mỗi cặp dấu {} là 1 Object - nghĩa là Array bao gồm nhiều Object - mỗi Object bao gồm định danh và giá trị) nên sẽ pair theo dạng mảng 2 chiều
    if (!root.success()) {
      Serial.println("parseArray() failed");              // vào đây tức là parse thất bại
    } else {
      int A=root.size(); //root[index]["Obj"]             // nếu parse thành công thì sẽ gán 3 trạng thái lấy được trên server thông qua nodeMCU gán vào mảng tạm tempStatus
      Msg = root["dataMsg"].as<String>();;
    }
  }
}
void checkButton_DeviceControl(){
  if (!digitalRead(btnLight)){
    while(!digitalRead(btnLight)){};
    statusDevice[0] = !statusDevice[0];
    digitalWrite(pinLight, statusDevice[0]);
    String strData = "{\"deviceName\":\"light\",\"deviceStatus\":"+(String)statusDevice[0]+"}";
    int lenght=0;
    while (strData[lenght] != NULL){
      lenght++;
    }
    char data[lenght+1];
    strData.toCharArray(data, lenght+1);
    Serial.print(data);
    webSocket.emit("controlStatusDevice", data);
  }
  if (!digitalRead(btnFan)){
    while(!digitalRead(btnFan)){};
    statusDevice[1] = !statusDevice[1];
    digitalWrite(pinFan, statusDevice[1]);
    String strData = "{\"deviceName\":\"fan\",\"deviceStatus\":"+(String)statusDevice[1]+"}";
    int lenght=0;
    while (strData[lenght] != NULL){
      lenght++;
    }
    char data[lenght+1];
    strData.toCharArray(data, lenght+1);
    Serial.print(data);
    webSocket.emit("controlStatusDevice", data);
  }
}
void pareJson_Data(String strJson)
{
  if (strJson != "")
  {
    DynamicJsonBuffer jsonBuffer;       // khai báo biến
    JsonArray &root = jsonBuffer.parseArray(strJson);     // chuỗi Json từ nodeMCU truyền qua là dạng chuỗi JsonArray (ví dụ chuỗi có dạng: [{"S1":"1"},{"S2":"0"},{"S3":"0"}]  trong mỗi cặp dấu {} là 1 Object - nghĩa là Array bao gồm nhiều Object - mỗi Object bao gồm định danh và giá trị) nên sẽ pair theo dạng mảng 2 chiều
    if (!root.success()) {
      Serial.println("parseArray() failed");              // vào đây tức là parse thất bại
    } else {
      
      int A=root.size(); //root[index]["Obj"]             // nếu parse thành công thì sẽ gán 3 trạng thái lấy được trên server thông qua nodeMCU gán vào mảng tạm tempStatus
      statusDevice[0] = root[0]["status"]; 
      statusDevice[1] = root[1]["status"];
      statusDevice[2] = root[2]["status"];                  // sau khi lấy giá trị trạng thái xong thì phải làm sạch chuỗi để chuẩn bị cho lần nhận tiếp theo
    }
  }
}
void readSensor_DHT()     // hàm đọc giá trị nhiệt độ - độ ẩm
{
  H = dht.readHumidity();          //Read Humidity
  T = dht.readTemperature();       //Read Temperature
}
void display_LCD(){
  endTime = millis();
  if (endTime - beginTime >= 5000){
     if (screenLCD >= maxScreen){
        screenLCD=0;
     } else {
        screenLCD++;
     }
     lcd.clear();
     beginTime = millis();
  }
  switch(screenLCD){
    case 0:
      lcd.setCursor(0,0);
      lcd.print("L: " + (String)statusDevice[0]);
      lcd.setCursor(6,0);
      lcd.print("F: " + (String)statusDevice[1]);
      lcd.setCursor(12,0);
      lcd.print("P: " + (String)statusDevice[2]);
      lcd.setCursor(0,1);
      lcd.print("Temp: " + (String)((int)T));
      lcd.setCursor(9,1);
      lcd.print("Humi: " + (String)((int)H));
      break;
    case 1:
      lcd.setCursor(4,0);
      lcd.print("Messenger");
      lcd.setCursor(0,1);
      lcd.print(Msg);
      break;
    default:
      break;
  }
}
