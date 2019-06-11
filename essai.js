var fs = require('fs');
var streamBuffers = require('stream-buffers');

var u = fs.createReadStream('C:\\Users\\Pierre\\clientfl\\MS_EMU_MS_SX_MKT.csv');

// console.log(typeof u);

// Initialize stream
var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
    frequency: 10,      // in milliseconds.
    chunkSize: 2048     // in bytes.
  }); 
  
  test = { fieldname: 'fileinput',
  originalname: 'MS_EMU_MS_SX_MKT.csv',
  encoding: '7bit',
  mimetype: 'text/csv',
  buffer: Buffer.from([1,2,3]),
  size: 45021 }

  // With a buffer
  myReadableStreamBuffer.put(test);

  console.log(myReadableStreamBuffer);