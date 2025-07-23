import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import router from './Routes/routes.mjs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()
dotenv.config()
app.use(cors())
app.use(cookieParser())
// Use express.json for all routes except Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe-webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
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
