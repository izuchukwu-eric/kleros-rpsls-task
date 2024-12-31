function generateSalt(length: number) {
    const charset = '0123456789';
    const charsetLength = charset.length;
  
    if (typeof length !== 'number' || length <= 0) {
      throw new Error('Invalid length for salt');
    }
  
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
  
    let salt = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = randomValues[i] % charsetLength;
      salt += charset.charAt(randomIndex);
    }
  
    return salt;
}
  
export default generateSalt;