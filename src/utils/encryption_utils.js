class EncryptionUtils {
  encrypt(data) {
    return btoa(data);
  }

  decrypt(data) {
    return atob(data);
  }
}

export default new EncryptionUtils();
