const { getFirestoreInstance } = require("../lib/firebase")
const { doc, getDoc, setDoc } = require("firebase/firestore")

const db = getFirestoreInstance()

const getPreviousKey = async (prevId) => {
  try {
    const prevDocRef = doc(db, "mahasiswa", `mahasiswa_${prevId}`)
    const prevDocSnap = await getDoc(prevDocRef)

    if (prevDocSnap.exists()) {
      return prevDocSnap.data().key
    }
    return null
  } catch (error) {
    console.error("Error getting previous key:", error)
    return null
  }
}

module.exports = {
  getPreviousKey,
}
