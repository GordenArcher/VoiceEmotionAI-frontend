import "dotenv/config";

export default {
    expo: {
        ...require("./app.json").expo,
        extra: {
            API_URL: process.env.API_URL,
        }
    }
};
