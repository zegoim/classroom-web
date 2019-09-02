const apiUrl = "https://test.zegonetwork.com:599/class-room/rooms";
const headers = { "content-type": "application/json" };

export interface Room {
  roomId: string;
  roomName?: string;
  createAt?: number; // timestamp
  teacherId?: string;
  replayUrl?: string; // roomId + "_" + serverTimestamp
  whiteScreen?: {
    uuid?: string;
    roomToken?: string;
  };
}

export async function getRooms() {
  let rooms: any = [];
  const res = await fetch(apiUrl, { headers, mode: "cors", method: "GET" });

  if (res) {
    rooms = await res.json();
  }

  return Promise.resolve(rooms);
}

export async function createRoom(room: Room) {
  let success: boolean = false;
  const res = await fetch(apiUrl, { headers, mode: "cors", method: "POST", body: JSON.stringify(room) });

  if (res) {
    success = true;
  }

  return Promise.resolve(success);
}


export async function updateRoom(room: Room) {
  let success: boolean = false;
  const res = await fetch(apiUrl, { headers, mode: "cors", method: "PUT", body: JSON.stringify(room) });

  if (res) {
    success = true;
  }

  return Promise.resolve(success);
}

export async function deleteRoom(room: Room) {
  let success: boolean = false;
  const res = await fetch(apiUrl, { headers, mode: "cors", method: "DELETE", body: JSON.stringify(room) });

  if (res) {
    success = true;
  }

  return Promise.resolve(success);
}


export const recordUrl = "https://record.zegonetwork.com:8000";
export async function startRecord(param: { appId: number; roomId: string; signature: string; }) {
  return fetch(`${recordUrl}/start`, {
    headers: { "content-type": "application/json" },
    mode: "cors",
    method: "POST", body: JSON.stringify({
      app_id: param.appId,
      room_id: param.roomId,
      signature: param.signature,
      mode: 2
    })
  });
}

export async function stopRecord(param: { appId: number; roomId: string; signature: string; }) {
  return fetch(`${recordUrl}/stop`, {
    headers: { "content-type": "application/json" },
    mode: "cors",
    method: "POST", body: JSON.stringify({
      app_id: param.appId,
      room_id: param.roomId,
      signature: param.signature
    })
  });
}
