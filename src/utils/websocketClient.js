import { SOCKET_URL } from "./config";

// singleton websocket client
class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  connect(roomCode) {
    const path = `${SOCKET_URL}/ws/rooms/${roomCode}/`;
    this.socketRef = new WebSocket(path);
    this.socketRef.onopen = () => {
      console.log("WebSocket open");

      this.fetchListeners(roomCode);
      this.fetchChatMessages(roomCode);
    };
    this.socketRef.onmessage = e => {
      // actions handler
      this.socketMessageHandler(e.data);
    };
    this.socketRef.onerror = e => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log("WebSocket closed");
      // this.connect();
    };
  }

  disconnect() {
    this.socketRef.close();
  }

  socketMessageHandler(data) {
    const parsedData = JSON.parse(data);
    // if there are no callbacks, cannot respond to command
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }

    const command = parsedData.command;
    switch (command) {
      case "set_new_message":
        const {sender, content, timestamp} = parsedData;
        this.callbacks[command]({sender, content, timestamp})
        break;
      case "set_fetched_messages":
        this.callbacks[command](parsedData);
        break;
      case "set_listeners":
        this.callbacks[command](parsedData);
        break;
      case "send_current_song":
        this.callbacks[command](parsedData);
        break;
      case "set_current_song":
        this.callbacks[command](parsedData);
        break;
      default:
        break;
    }
  }

  setCallbacks(...newCallbacks) {
    // accepts multiple objects: {cb: (arg) => {// body}}
    newCallbacks.forEach((callbackObject) => {
      this.callbacks = {...this.callbacks, ...callbackObject}
    });
  }

  fetchChatMessages(room) {
    this.sendMessage({
      command: "fetch_messages",
      room_code: room
    });
  }

  fetchListeners(room) {
    this.sendMessage({
      command: 'get_listeners',
      room_code: room
    })
  }


  sendMessage(data) {
    try {
      this.socketRef.send(JSON.stringify({...data}));
    } catch (err) {
      console.log(err.message);
    }
  }

  state() {
    return this.socketRef.readyState;
  }
}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;
