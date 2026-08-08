const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust this to your specific frontend URLs in production
            methods: ["GET", "POST"]
        }
    });

    // Middleware for Socket Authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const role = socket.handshake.auth?.role || 'customer';

        if (role === 'display') {
            socket.role = 'display';
            socket.userId = null;
            return next();
        }

        if (!token) {
            socket.role = role;
            socket.userId = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.role = role;
            next();
        } catch (err) {
            socket.role = role;
            socket.userId = null;
            next();
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id} | Role: ${socket.role} | UserID: ${socket.userId}`);

        // Join Rooms based on role
        if (socket.role === 'admin') {
            socket.join("admin");
            socket.join("kitchen"); // Admins also get kitchen updates
        } else if (socket.role === 'kitchen') {
            socket.join("kitchen");
        } else if (socket.role === 'display') {
            socket.join("display_screen");
        } else if (socket.userId) {
            socket.join(`customer_${socket.userId}`);
        }

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });

        // Live Tracking Events
        socket.on("driver_location_updated", async (data) => {
            // data: { orderId, location, eta, distance }
            // Broadcast to admin room for Owner Tracking Map
            io.to("admin").emit("driver_location_updated", data);
            
            // Broadcast to a specific order room so the customer tracking page can listen
            io.to(`order_${data.orderId}`).emit("driver_location_updated", data);

            // Throttle DB updates: Only update DB occasionally, not on every ping
            // In a real app we might use Redis or rate-limiting. For Phase 3B, we'll
            // just emit via socket to keep it lightweight.
        });

        socket.on("eta_updated", (data) => {
            // data: { orderId, estimatedArrival, remainingDistance }
            io.to("admin").emit("eta_updated", data);
            io.to(`order_${data.orderId}`).emit("eta_updated", data);
        });

        socket.on("join_order_room", (orderId) => {
            // Customer joins this room from the Tracking Page
            socket.join(`order_${orderId}`);
        });

        // Delivery Status Updates
        socket.on("delivery_started", (data) => {
            io.to("admin").emit("order:updated", data);
            io.to(`order_${data.orderId}`).emit("order:updated", data);
        });

        socket.on("delivery_nearby", (data) => {
            io.to("admin").emit("order:updated", data);
            io.to(`order_${data.orderId}`).emit("order:updated", data);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
