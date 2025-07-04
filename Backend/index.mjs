import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import router from './Routes/routes.mjs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()
dotenv.config()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
main().catch(err => console.log(err));
const port = process.env.PORT

async function main() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
}

app.use('/',router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
