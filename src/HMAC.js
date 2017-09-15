const crypto = require('crypto');

class Hmac {
  hash(data, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('hex');
  }
}

export default Hmac;
