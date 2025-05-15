import jwt from "jsonwebtoken";

const verifyTokenSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) throw new Error("Token not provided");

        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) throw new Error("ACCESS_TOKEN_SECRET is undefined!");

        const decoded = jwt.verify(token, secret);

        console.log("✅ Socket token decoded:", decoded); // Debug
        socket.user = decoded._id;
        next();
    } catch (error) {
        console.log("❌ Socket auth error:", error.message);
        next(new Error("NOT_AUTHORIZED"));
    }
};

export default verifyTokenSocket;
