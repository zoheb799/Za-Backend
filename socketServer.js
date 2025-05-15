import { Server } from "socket.io";

import authSocket from "./middlewares/authSocket.middleware.js";

import disconnectHandler from "./socketHandlers/disconnectHandler.js";
import chatHistoryHandler from "./socketHandlers/getMessageHistoryHandler.js";
import newConnectionHandler from "./socketHandlers/newConnectionHandler.js";
import newMessageHandler from "./socketHandlers/newMessageHandler.js";


export const registerSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.use(authSocket);

    io.on("connection", (socket) => {
        newConnectionHandler(socket, io);
        console.log("connected")
        socket.on("disconnect", () => disconnectHandler(socket));
        socket.on("new-message", (data) => {
            if (data) {
                newMessageHandler(socket, data, io);
            }
        });
        socket.on("direct-chat-history", (data) => chatHistoryHandler(socket, data));
    });

    setInterval(() => {}, 1000 * 8);
};
