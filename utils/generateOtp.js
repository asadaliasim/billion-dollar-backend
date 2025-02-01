const crypto = require('crypto')

// Function to generate a secure 6-digit OTP
function generateSecureOTP() {
  // Generate a buffer of 3 random bytes
  const buffer = crypto.randomBytes(3)
  // Convert the buffer to a hexadecimal string and slice it to get a 6-digit number
  const otp = parseInt(buffer.toString('hex'), 16) % 1000000
  // Ensure the OTP is exactly 6 digits by padding with zeros if necessary
  return otp.toString().padStart(6, '0')
}

// Export the function
module.exports = generateSecureOTP
