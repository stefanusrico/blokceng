const { createHash } = require("node:crypto")
const { createReadStream } = require("node:fs")
const { stdout } = require("node:process")
const { generateRandomString } = require("./generate_random_string")

const generateHashKey = (data = generateRandomString()) => {
  return hash = createHash("sha256").update(data).digest("hex")
}

module.exports = {
  generateHashKey,
}