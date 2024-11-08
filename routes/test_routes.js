const express = require("express")
const router = express.Router()
const { uploadData, getData, updateData } = require("../controllers/test")

const errorHandler = (res, status = 400, message = "Terjadi kesalahan") => {
  return res.status(status).json({
    success: false,
    status,
    message,
  })
}

router.post("/upload-data", async (req, res) => {
  try {
    const result = await uploadData(req)

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        status: result.status,
        message: result.message,
      })
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Data berhasil disimpan",
      data: result.data,
    })
  } catch (error) {
    return errorHandler(res)
  }
})

router.get("/get-data", async (req, res) => {
  try {
    const result = await getData(req)

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        status: result.status,
        message: result.message,
      })
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Data ditemukan",
      data: result.data,
    })
  } catch (error) {
    return errorHandler(res)
  }
})

router.post("/update-data", async (req, res) => {
  try {
    const result = await updateData(req)

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        status: result.status,
        message: result.message,
      })
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Data berhasil diupdate",
      data: result.data,
    })
  } catch (error) {
    return errorHandler(res)
  }
})

module.exports = router
