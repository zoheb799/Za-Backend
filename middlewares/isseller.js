import { errorHandler } from "../utils/errorHandle.js";
const isSeller = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler(401, "Unauthorized! User not logged in."));
    }

    if (req.user.role !== "seller") {
        return next(new errorHandler(403, "Access denied! Only sellers can perform this action."));
    }

    next();
};

export default isSeller;
