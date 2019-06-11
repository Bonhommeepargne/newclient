const fs = require('fs');
const axios = require('axios');

/* ============================================================
  Function: Download Image
============================================================ */

const downloadImage = (url, image_path) => axios({
  url: url,
  responseType: 'stream',
}).then(response => {
  response.data.pipe(fs.createWriteStream(image_path));

  return {
    status: true,
    error: '',
  };
}).catch(error => ({
  status: false,
  error: 'Error: ' + error.message,
}));

module.exports = downloadImage;
