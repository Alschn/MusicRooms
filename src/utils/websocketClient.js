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
    const command = parsedData.command;
    if (Object.keys(this.callbacks).length === 0) {
      // if there are no callbacks, cannot respond to command
      return;
    }
    if (command === "new_message") {
      // send new message command
      const {text, time} = parsedData;
      this.callbacks[command]({text, time, user: 1});
    }
    if (command === "messages") {
      this.callbacks[command](parsedData.messages);
    }
  }

  addCallbacks(messagesCallback, newMessageCallback) {
    this.callbacks["messages"] = messagesCallback;
    this.callbacks["new_message"] = newMessageCallback;
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