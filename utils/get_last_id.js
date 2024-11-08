const { getFirestoreInstance } = require("../lib/firebase")
const { doc, getDoc, setDoc } = require("firebase/firestore")

const db = getFirestoreInstance()

const getLastId = async () => {
  try {
    const counterRef = doc(db, "counters", "mahasiswa")
    const counterSnap = await getDoc(counterRef)

    if (counterSnap.exists()) {
      return counterSnap.data().lastId
    } else {
      await setDoc(counterRef, { lastId: 0 })
      return 0
    }
  } catch (error) {
    console.error("Error getting last ID:", error)
    return 0
  }
}

module.exports = {
  getLastId,
}
