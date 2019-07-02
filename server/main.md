## URL:
https://polow/classroom/rooms
## Headers:
Content-Type: application/json

## Room:
``` protobuf
message WhiteScreen {
    required string uuid = 1;
    required string roomToken = 2;
}

message Classroom {
    required string roomId = 1;
    optional string roomName = 2;
    optional string createAt = 3; // ISO Date
    optional WhiteScreen whiteScreen = 4;
}

```
## Get Rooms:
http.get(URL)
http.res = Room[]

## Create Room
http.body = Room
http.post(URL)

## Update Room
http.body = Room
http.put(URL)


## Delete Room
http.body = Room
http.delete(URL)
