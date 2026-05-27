import { io } from "socket.io-client";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const socketURL = apiURL.endsWith("/api") ? apiURL.slice(0, -4) : apiURL;

const socket = io(socketURL, {
  transports: ["websocket"],
  withCredentials: true
});

export default socket;
