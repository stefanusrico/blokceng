const { getFirestoreInstance } = require("../lib/firebase")
const {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDoc,
  query,
  where,
  limit,
  getDocs,
} = require("firebase/firestore")
const { generateHashKey } = require("../utils/hash")
const { getLastId } = require("../utils/get_last_id")
const { getPreviousKey } = require("../utils/get_previous_key")

const db = getFirestoreInstance()

const uploadData = async (req) => {
  try {
    const requiredFields = ["nama", "nim", "alamat", "no_ijazah"]
    const missingFields = requiredFields.filter((field) => !req.body[field])

    if (missingFields.length > 0) {
      return {
        success: false,
        status: 400,
        message: `Data tidak lengkap. Tidak dapat menyimpan data. Field yang hilang: ${missingFields.join(
          ", "
        )}`,
      }
    }

    const lastId = await getLastId()
    const newId = lastId + 1

    // Update counter
    const counterRef = doc(db, "counters", "mahasiswa")
    await setDoc(counterRef, { lastId: newId })

    // Get previous key
    const prevKey = await getPreviousKey(lastId)

    const data = {
      id: newId,
      key: generateHashKey(),
      prevKey: prevKey,
      userData: {
        nama: req.body.nama,
        nim: req.body.nim,
        alamat: req.body.alamat,
        no_ijazah: req.body.no_ijazah,
      },
      timestamp: new Date().toISOString(),
    }

    const documentRef = doc(db, "mahasiswa", `mahasiswa_${newId}`)
    await setDoc(documentRef, data)

    console.log("Data uploaded successfully with ID:", newId)

    return {
      success: true,
      status: 201,
      message: "Data mahasiswa berhasil disimpan",
      data: {
        id: newId,
        ...data,
      },
    }
  } catch (error) {
    console.error("Error uploading data:", error)
    return {
      success: false,
      status: 500,
      message: "Gagal menyimpan data mahasiswa",
      error: error.message,
    }
  }
}

const getData = async (req) => {
  try {
    const { nim } = req.body

    if (!nim) {
      return {
        success: false,
        status: 400,
        message: "NIM wajib diisi",
      }
    }

    if (typeof nim !== "string") {
      return {
        success: false,
        status: 400,
        message: "Format NIM tidak valid. NIM harus berupa string",
      }
    }

    const mahasiswaRef = collection(db, "mahasiswa")
    const q = query(mahasiswaRef, where("userData.nim", "==", nim))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        status: 404,
        message: "Data mahasiswa tidak ditemukan",
      }
    }

    const data = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => a.id - b.id)

    // Hapus key dan prevKey
    data.forEach((item) => {
      delete item.key
      delete item.prevKey
    })

    return {
      success: true,
      status: 200,
      message: "Data mahasiswa ditemukan",
      data,
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    return {
      success: false,
      status: 500,
      message: "Gagal mengambil data mahasiswa",
      error: error.message,
    }
  }
}

const updateData = async (req) => {
  try {
    // const requiredFields = ["nama", "nim", "alamat", "no_ijazah"]
    // const missingFields = requiredFields.filter((field) => !req.body[field])

    // if (missingFields.length > 0) {
    //   return {
    //     success: false,
    //     status: 400,
    //     message: `Data tidak lengkap. Tidak dapat menyimpan data. Field yang hilang: ${missingFields.join(
    //       ", "
    //     )}`,
    //   }
    // }

    const { nim, nama, alamat, no_ijazah } = req.body

    const mahasiswaRef = collection(db, "mahasiswa")
    const q = query(mahasiswaRef, where("userData.nim", "==", nim), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        status: 404,
        message: "Data mahasiswa tidak ditemukan",
      }
    } else {
      const lastId = await getLastId()
      const newId = lastId + 1

      // Update counter
      const counterRef = doc(db, "counters", "mahasiswa")
      await setDoc(counterRef, { lastId: newId })

      // Get previous key
      const prevKey = await getPreviousKey(lastId)

      const data = {
        id: newId,
        key: generateHashKey(),
        prevKey: prevKey,
        userData: {
          nama: req.body.nama,
          nim: req.body.nim,
          alamat: req.body.alamat,
          no_ijazah: req.body.no_ijazah,
        },
        timestamp: new Date().toISOString(),
      }

      const documentRef = doc(db, "mahasiswa", `mahasiswa_${newId}`)
      await setDoc(documentRef, data)

      console.log("Data uploaded successfully with ID:", newId)

      return {
        success: true,
        status: 201,
        message: "Data mahasiswa berhasil disimpan di block baru",
        data: {
          id: newId,
          ...data,
        },
      }
    }
  } catch (error) {
    console.error("Error uploading data:", error)
    return {
      success: false,
      status: 500,
      message: "Gagal menyimpan data mahasiswa",
      error: error.message,
    }
  }
}

module.exports = {
  uploadData,
  getData,
  updateData,
}
