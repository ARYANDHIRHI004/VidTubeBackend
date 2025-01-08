import connectDB from "./db/index.js";
import dotenv from "dotenv"
import app from "./app.js";

dotenv.config({
    path: "./.env"  
})



const PORT = process.env.PORT || 8000

connectDB()
.then((e) => {
  app.listen(PORT, (par) => {
    console.log(`server is listening at port ${PORT}`);
    })
})
.catch((params) => {
  console.log('connect fail');
  
}
)