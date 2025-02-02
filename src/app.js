import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials: true
    }
))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb", extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routers/users.routes.js"

//routes declearation
//http://localhost:3000/api/v1/users/register
app.use("/api/v1/users", userRouter)



export default app