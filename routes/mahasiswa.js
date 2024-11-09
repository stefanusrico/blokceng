const express = require("express")
const router = express.Router()
const blockchainService = require("../services/MahasiswaBlockchain")

// Middleware untuk error handling
const errorHandler = (res, status = 400, message = "Terjadi kesalahan") => {
  return res.status(status).json({
    success: false,
    status,
    message,
  })
}

// Middleware untuk response handling
const responseHandler = (res, result) => {
  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      status: result.status,
      message: result.message,
    })
  }

  return res.status(result.status).json({
    success: true,
    status: result.status,
    message: result.message,
    data: result.data,
  })
}

// Route untuk menambah block baru
router.post("/upload-data", async (req, res) => {
  try {
    const result = await blockchainService.addBlock(req.body)
    return responseHandler(res, result)
  } catch (error) {
    return errorHandler(res, 500, error.message)
  }
})

// Route untuk mendapatkan data berdasarkan NIM
router.get("/get-data/:nim", async (req, res) => {
  try {
    const result = await blockchainService.getData(req.params.nim)
    return responseHandler(res, result)
  } catch (error) {
    return errorHandler(res, 500, error.message)
  }
})

// Route untuk update data (membuat block baru)
router.post("/update-data", async (req, res) => {
  try {
    const result = await blockchainService.updateData(req.body)
    return responseHandler(res, result)
  } catch (error) {
    return errorHandler(res, 500, error.message)
  }
})

router.get("/validate-chain/:nim", async (req, res) => {
  try {
    const result = await blockchainService.getData(req.params.nim)

    if (!result.success) {
      return responseHandler(res, result)
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: result.isChainValid ? "Chain valid" : "Chain telah dimodifikasi",
      isValid: result.isChainValid,
      blocks: result.data,
    })
  } catch (error) {
    return errorHandler(res, 500, error.message)
  }
})


router.get("/history/:nim", async (req, res) => {
  try {
    const result = await blockchainService.getData(req.params.nim)

    if (!result.success) {
      return responseHandler(res, result)
    }

    const history = result.data.map((block) => ({
      index: block.index,
      timestamp: new Date(block.timestamp).toLocaleString(),
      data: block.data,
      hash: block.hash,
      previousHash: block.previousHash,
    }))

    return res.status(200).json({
      success: true,
      status: 200,
      message: "History data ditemukan",
      history,
    })
  } catch (error) {
    return errorHandler(res, 500, error.message)
  }
})

module.exports = router
