import { connect } from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
	try {
		const connectionResponce = await connect(
			`${process.env.MONGO_CONNECTION_STRING}/${DB_NAME}`
		);
		console.log(
			`Connected to the Host ${connectionResponce.connection.host}`
		);
	} catch (error) {
		console.error("MongoDB connection failed: " + error);
		process.exit(1);
	}
};

export default connectDB;
