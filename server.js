require("dotenv").config()
const express = require("express")
const { initializeFirebaseApp } = require("./lib/firebase")

const PORT = process.env.PORT || 4000

const app = express()
const http = require("http")
const server = http.createServer(app)

const bodyParser = require("body-parser")

const testRoutes = require("./routes/test_routes")

initializeFirebaseApp()
app.use(express.json())
app.use("/api", testRoutes)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
