import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
let socket;

export const initAdminSocket = () => {
    if (!socket) {
        // Admin token could be fetched from local storage if admin auth is implemented.
        // Assuming admin logs in without a token or uses a default admin role for now.
        const token = "admin_token_placeholder"; // Replace with actual token logic if admin is secured

        socket = io(SOCKET_URL, {
            auth: {
                token: token,
                role: 'admin'
            }
        });

        socket.on("connect", () => {
            console.log("Admin Socket Connected");
        });
    }
    return socket;
};

export const getAdminSocket = () => {
    if (!socket) return initAdminSocket();
    return socket;
};
