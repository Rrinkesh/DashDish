import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket;

export const initSocket = (token, role = 'customer') => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        auth: {
            token: token,
            role: role
        }
    });

    socket.on("connect", () => {
        console.log("Connected to real-time order server");
    });

    socket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};
