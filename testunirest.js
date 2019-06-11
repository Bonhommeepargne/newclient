var fs = require("fs");
var request = require("request");

var options = { method: 'POST',
  url: 'http://99.80.186.219:8080/createticket',
  headers: 
   { 'cache-control': 'no-cache',
     Connection: 'keep-alive',
     'content-length': '4857',
     'accept-encoding': 'gzip, deflate',
     Host: '99.80.186.219:8080',
     'Postman-Token': '853f6b1a-3641-46d8-8047-1f25716d9394,f19d84a6-5986-4c4a-bc9b-4c2cbda7506e',
     'Cache-Control': 'no-cache',
     Accept: '*/*',
     'User-Agent': 'PostmanRuntime/7.11.0',
     'Content-Type': 'multipart/form-data',
     'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
  formData: 
   { toto: 'ddddddddddddd',
     liloi: 'dfdf',
     fileinput: 
      { value: fs.createReadStream("C:\\Users\\Pierre\\Documents\\ajout.txt"),
        options: 
         { filename: 'C:\\Users\\Pierre\\Documents\\ajout.txt',
           contentType: null } },
     lolo: 'jdhjhdfjh' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
