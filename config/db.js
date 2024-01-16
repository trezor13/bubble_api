const dotenv = require("dotenv");
dotenv.config()
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const connectDB = async () => {
  try {
    // const uri = ;
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/bubble";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(process.env.MONGO_URI)
    console.error("Error connecting to MongoDB:", error.message);
  }
};
module.exports = connectDB;
