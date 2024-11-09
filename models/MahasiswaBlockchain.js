const Block = require("../models/block")
const { getFirestoreInstance } = require("../lib/firebase")
const {
  doc,
  setDoc,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
} = require("firebase/firestore")

class MahasiswaBlockchain {
  constructor() {
    this.db = getFirestoreInstance()
    this.collectionName = "mahasiswa"
    this.counterDocName = "mahasiswa_counter"
  }

  async initializeCounter() {
    try {
      const counterRef = doc(this.db, "counters", this.counterDocName)
      const counterDoc = await getDoc(counterRef)

      if (!counterDoc.exists()) {
        await setDoc(counterRef, { lastIndex: -1 })
      }
    } catch (error) {
      console.error("Error initializing counter:", error)
    }
  }

  async incrementCounter() {
    const counterRef = doc(this.db, "counters", this.counterDocName)
    const counterDoc = await getDoc(counterRef)

    if (!counterDoc.exists()) {
      await this.initializeCounter()
      return 0
    }

    const currentIndex = counterDoc.data().lastIndex
    const newIndex = currentIndex + 1

    await updateDoc(counterRef, {
      lastIndex: newIndex,
    })

    return newIndex
  }

  async getLastBlock() {
    try {
      const counterRef = doc(this.db, "counters", this.counterDocName)
      const counterDoc = await getDoc(counterRef)

      if (!counterDoc.exists()) {
        return null
      }

      const lastIndex = counterDoc.data().lastIndex

      if (lastIndex === -1) {
        return null
      }

      const blockRef = doc(this.db, this.collectionName, `block_${lastIndex}`)
      const blockDoc = await getDoc(blockRef)

      if (!blockDoc.exists()) {
        return null
      }

      const blockData = blockDoc.data()
      return {
        index: blockData.index,
        hash: blockData.hash,
        previousHash: blockData.previousHash,
        data: blockData.data,
        timestamp: blockData.timestamp,
      }
    } catch (error) {
      console.error("Error getting last block:", error)
      return null
    }
  }

  async checkDuplicateData(data, isUpdate = false) {
    try {
      if (isUpdate) {
        return null
      }

      const mahasiswaRef = collection(this.db, this.collectionName)

      const nimQuery = query(mahasiswaRef, where("data.nim", "==", data.nim))
      const nimSnapshot = await getDocs(nimQuery)
      if (!nimSnapshot.empty) {
        return "NIM sudah terdaftar"
      }

      // Check for duplicate No Ijazah
      const ijazahQuery = query(
        mahasiswaRef,
        where("data.no_ijazah", "==", data.no_ijazah)
      )
      const ijazahSnapshot = await getDocs(ijazahQuery)
      if (!ijazahSnapshot.empty) {
        return "Nomor Ijazah sudah terdaftar"
      }

      // const namaAlamatQuery = query(
      //   mahasiswaRef,
      //   where("data.nama", "==", data.nama),
      //   where("data.alamat", "==", data.alamat)
      // )
      // const namaAlamatSnapshot = await getDocs(namaAlamatQuery)
      // if (!namaAlamatSnapshot.empty) {
      //   return "Kombinasi Nama dan Alamat sudah terdaftar"
      // }

      return null
    } catch (error) {
      console.error("Error checking duplicates:", error)
      throw new Error("Gagal memeriksa data duplikat")
    }
  }

  async addBlock(data, isUpdate = false) {
    try {
      if (!data.nama || !data.nim || !data.alamat || !data.no_ijazah) {
        throw new Error("Data tidak lengkap")
      }

      const duplicateError = await this.checkDuplicateData(data, isUpdate)
      if (duplicateError) {
        return {
          success: false,
          status: 400,
          message: duplicateError,
        }
      }

      const lastBlock = await this.getLastBlock()
      const newIndex = await this.incrementCounter()
      const previousHash = lastBlock ? lastBlock.hash : "0"

      const newBlock = new Block(newIndex, previousHash, {
        nama: data.nama,
        nim: data.nim,
        alamat: data.alamat,
        no_ijazah: data.no_ijazah,
      })

      const documentRef = doc(this.db, this.collectionName, `block_${newIndex}`)
      await setDoc(documentRef, {
        index: newBlock.index,
        previousHash: newBlock.previousHash,
        timestamp: newBlock.timestamp,
        data: newBlock.data,
        hash: newBlock.hash,
      })

      return {
        success: true,
        status: 201,
        message: "Block baru berhasil ditambahkan",
        data: newBlock,
      }
    } catch (error) {
      console.error("Error adding block:", error)
      return {
        success: false,
        status: 500,
        message: error.message || "Gagal menambahkan block",
      }
    }
  }

  async getData(nim) {
    try {
      if (!nim) {
        throw new Error("NIM wajib diisi")
      }

      const mahasiswaRef = collection(this.db, this.collectionName)
      const q = query(mahasiswaRef, where("data.nim", "==", nim))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return {
          success: false,
          status: 404,
          message: "Data mahasiswa tidak ditemukan",
        }
      }

      const blocks = querySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          console.log("Block data from database:", data)
          return new Block(
            data.index,
            data.previousHash,
            data.data,
            data.timestamp,
            data.hash
          )
        })
        .sort((a, b) => b.index - a.index)

      let isChainValid = this.validateChain(blocks)
      console.log(isChainValid)

      return {
        success: true,
        status: 200,
        message: "Data mahasiswa ditemukan",
        isChainValid,
        data: blocks,
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      return {
        success: false,
        status: 500,
        message: error.message || "Gagal mengambil data mahasiswa",
      }
    }
  }

  validateChain(blocks) {
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i]
      const previousBlock = blocks[i - 1]

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }

  async updateData(data) {
    try {
      if (!data.nim) {
        throw new Error("NIM wajib diisi")
      }

      // Cek apakah data exists
      const existingData = await this.getData(data.nim)
      if (!existingData.success) {
        return {
          success: false,
          status: 404,
          message: "Data mahasiswa tidak ditemukan",
        }
      }
      return await this.addBlock(data, true)
    } catch (error) {
      console.error("Error updating data:", error)
      return {
        success: false,
        status: 500,
        message: error.message || "Gagal memperbarui data mahasiswa",
      }
    }
  }
}

module.exports = MahasiswaBlockchain
