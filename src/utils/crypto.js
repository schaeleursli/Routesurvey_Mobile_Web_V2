import CryptoJS from "crypto-js";

/**
 * Decrypts a cipher text using AES-256-CBC with PBKDF2 key derivation
 * Equivalent to the C# Decrypt extension method
 *
 * @param {string} cipherText - Base64 encoded encrypted text
 * @param {string} password - Password used for decryption
 * @returns {string|null} - Decrypted text or null if decryption fails
 *
 * @example
 * // Decrypt a string encrypted by the C# equivalent
 * const decrypted = decrypt(encryptedText, "myPassword");
 * if (decrypted) {
 *   console.log("Decrypted:", decrypted);
 * } else {
 *   console.log("Decryption failed");
 * }
 */
export function decrypt(cipherText, password) {
  if (!cipherText || cipherText.trim() === "") {
    return cipherText;
  }

  try {
    // Convert base64 to bytes
    const cipherBytes = CryptoJS.enc.Base64.parse(cipherText);

    // Extract salt from the beginning of the cipher text (first 16 bytes)
    const salt = CryptoJS.lib.WordArray.create(cipherBytes.words.slice(0, 4)); // 16 bytes = 4 words

    // Extract the actual cipher text (everything after the salt)
    const actualCipherBytes = CryptoJS.lib.WordArray.create(
      cipherBytes.words.slice(4)
    );

    // Derive key and IV from password and salt using PBKDF2
    // Equivalent to Rfc2898DeriveBytes with 10000 iterations and SHA256
    const keyAndIV = CryptoJS.PBKDF2(password, salt, {
      keySize: 48 / 4, // 48 bytes total (32 for key + 16 for IV) / 4 words per byte
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256,
    });

    // Extract key (first 32 bytes) and IV (next 16 bytes)
    const key = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(0, 8)); // 32 bytes = 8 words
    const iv = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(8, 12)); // 16 bytes = 4 words

    // Decrypt using AES-256-CBC
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: actualCipherBytes },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert to string
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Encrypts plain text using AES-256-CBC with PBKDF2 key derivation
 * This is the complementary function to decrypt and is compatible with C# encryption
 *
 * @param {string} plainText - Text to encrypt
 * @param {string} password - Password used for encryption
 * @returns {string} - Base64 encoded encrypted text
 *
 * @example
 * // Encrypt a string that can be decrypted by the C# equivalent
 * const encrypted = encrypt("Hello World", "myPassword");
 * console.log("Encrypted:", encrypted);
 */
export function encrypt(plainText, password) {
  if (!plainText || plainText.trim() === "") {
    return plainText;
  }

  try {
    // Generate random salt
    const salt = CryptoJS.lib.WordArray.random(16); // 16 bytes

    // Derive key and IV from password and salt using PBKDF2
    const keyAndIV = CryptoJS.PBKDF2(password, salt, {
      keySize: 48 / 4, // 48 bytes total (32 for key + 16 for IV) / 4 words per byte
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256,
    });

    // Extract key (first 32 bytes) and IV (next 16 bytes)
    const key = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(0, 8)); // 32 bytes = 8 words
    const iv = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(8, 12)); // 16 bytes = 4 words

    // Encrypt using AES-256-CBC
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Combine salt and encrypted data
    const combined = salt.concat(encrypted.ciphertext);

    // Convert to base64
    return CryptoJS.enc.Base64.stringify(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

/**
 * Utility function to check if a string is encrypted
 *
 * @param {string} text - Text to check
 * @returns {boolean} - True if the text appears to be encrypted
 *
 * @example
 * if (isEncrypted(someText)) {
 *   const decrypted = decrypt(someText, password);
 * } else {
 *   // Text is not encrypted, use as-is
 * }
 */
export function isEncrypted(text) {
  if (!text || typeof text !== "string") {
    return false;
  }

  try {
    // Try to decode as base64
    const decoded = CryptoJS.enc.Base64.parse(text);

    // Check if it's long enough to contain salt + some encrypted data
    return decoded.words.length >= 5; // At least 20 bytes (16 for salt + 4 for minimum encrypted data)
  } catch {
    return false;
  }
}

/**
 * Utility function to safely decrypt with fallback
 *
 * @param {string} text - Text to decrypt
 * @param {string} password - Password for decryption
 * @returns {string} - Decrypted text or original text if decryption fails
 *
 * @example
 * // Safe decryption that won't break if text is not encrypted
 * const result = safeDecrypt(someText, password);
 * console.log(result); // Either decrypted text or original text
 */
export function safeDecrypt(text, password) {
  if (!isEncrypted(text)) {
    return text;
  }

  const decrypted = decrypt(text, password);
  return decrypted !== null ? decrypted : text;
}

/**
 * Test function to verify encryption/decryption compatibility
 * Useful for testing if the JavaScript implementation works with C# encrypted data
 *
 * @param {string} testPassword - Password to test with
 * @returns {boolean} - True if encryption/decryption cycle works correctly
 */
export function testEncryption(testPassword = "testPassword123") {
  try {
    const originalText = "Hello World! This is a test message.";

    // Encrypt
    const encrypted = encrypt(originalText, testPassword);
    console.log("Encrypted:", encrypted);

    // Decrypt
    const decrypted = decrypt(encrypted, testPassword);
    console.log("Decrypted:", decrypted);

    // Verify
    const success = originalText === decrypted;
    console.log("Test result:", success ? "PASSED" : "FAILED");

    return success;
  } catch (error) {
    console.error("Encryption test failed:", error);
    return false;
  }
}
