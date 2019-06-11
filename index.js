// server.js
// load the things we need
var express = require('express');
var bodyParser = require('body-parser');
var { firebase , db } = require('./connect');
var app = express();
var multer  = require('multer')
var storage = multer.memoryStorage()
var upload = multer({ dest: 'uploads/', preservePath: undefined })
var fs = require('fs');
var axios = require('axios');
var formatDate = require('./formatDate');
var downloadImage =require('./downloadImage');

var FormData = require('form-data');
var getFormData = require('./function');

require('dotenv').config();

var isConnected = 0;
var email = '';
var name = ''; 
var firstname = '';
var password = '';
var phone = '';
var independant = '';
var company = '';
var organization = '';
var requester_id = 0;
var userProfile ;
var uid = '';
var supervisor;
var broadcastAvail = [];

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
    res.render('pages/index',{ email: email, isConnected: isConnected, broadcastAvail: broadcastAvail });
});

// manage connection 
app.post('/', function(req, res) {
    email = req.body.username;
    password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password).then(() =>{

        isConnected = 1;

        var user = firebase.auth().currentUser;
        uid = user.uid;

        isConnected = 1;

        firebase.auth().currentUser.getIdToken(true).then(function(idToken) {

            let axiosConfig = {
                headers: {
                    'bearer': idToken
                }
                };
    
            axios.get(process.env.URLCLOUD9 + '/getCampaignBroadcast', axiosConfig)
              .then(function (response) {
                console.log(response.data);

              })
              .catch(function (error) {
                console.log(error);
              });
    
        }).catch(function(error) {
            console.log(error);
        });

        res.render('pages/index',{ email: email, isConnected: isConnected, broadcastAvail: broadcastAvail });
    });

});

app.post('/logout', function(req, res) {

    firebase.auth().signOut().then(function() {
        isConnected = 0;
        email = '';
        res.render('pages/index',{email: email, isConnected: isConnected});
      }, function(error) {
        console.log('Error loging out', error);
      });

});

// Register page
app.get('/register', function(req, res) {
    res.render('pages/register',{email: email, isConnected: isConnected});
});

// Register button
app.post('/register', function(req, res) {
    email = req.body.email;
    name = req.body.name; 
    firstname = req.body.firstname;
    password = req.body.password;
    phone = req.body.phone;
    independant = req.body.independant ? true : false;
    company = req.body.company;
    organization = req.body.organization;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(data => {

        firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
            
            // Connect
            isConnected = 1;
            
            var UserIdentity = {
                email: email,
                name : name, 
                firstname : firstname,
                phone : phone,
                independant : independant,
                company : company,
                organization : organization,
                supervisor: false,
                validated: false,
                codeTS : '',
                admin: false
              };

            let axiosConfig = {
                headers: {
                    'bearer': idToken
                }
                };

            axios.post(process.env.URLCLOUD9 + '/createuser', UserIdentity, axiosConfig)
              .then(function (response) {
                console.log(response.data);

                res.render('pages/register',{email: email, isConnected: isConnected});
              })
              .catch(function (error) {
                console.log(error);
              });
    
        }).catch(function(error) {
            console.log(error);
        });

        }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        console.log(errorMessage);
      });

});

// Create Ticket page
app.get('/createticket', function(req, res) {
  res.render('pages/ticket',{email: email, isConnected: isConnected});
});

// Create Ticket button
app.post('/createticket', upload.array('fileinput', 12), function(req, res) {
    
    var formData = getFormData(req.body);

    var filesuploaded = req.files;
    console.log(req.files);

    if ( filesuploaded.length > 0 ) {
        for (var i = 0; i < filesuploaded.length; i++) {
            formData.append('fileinput', fs.createReadStream(filesuploaded[i].path),filesuploaded[i].originalname);
            // formData.append('fileinput', filesuploaded[i].buffer, { filename : filesuploaded[i].originalname });
          }
    }

    // console.log(formData);

   firebase.auth().currentUser.getIdToken(true).then(function(idToken) {

        let axiosConfig = {
            headers: {
                'bearer': idToken,
                'type': 'Demande Générale',
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
            }
            };

        axios.post(process.env.URLCLOUD9 + '/createticket', formData, axiosConfig)
          .then(function (response) {
            console.log(response.data);

            res.render('pages/ticket',{email: email, isConnected: isConnected});
          })
          .catch(function (error) {
            console.log(error);
          });

    }).catch(function(error) {
        console.log(error);
    });

});

// Trade products
app.get('/reply', function(req, res) {

    allticketuser = [];

    var query = db.collection('tickets')
    .where('requester_id', '==', requester_id)
    .get().then(querySnapshot => {
        querySnapshot.forEach(doc => {      
            var ticketuser = { id: doc.id, data: doc.data() };

            allticketuser.push(ticketuser);
            });

        isConnected = 1;
        res.render('pages/reply',{ email: email, isConnected: isConnected, allticketuser: allticketuser });
        })
    .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

});

app.post('/createreply', upload.array('fileinput', 12), function(req, res) {

    var UserReply = req.body;

    var query = db.collection('agents')
    .where('id', '==', allticketuser[UserReply.idTicket].data.responder_id)
    .get().then(querySnapshot => {
        querySnapshot.forEach(doc => {      
            var emailAgent = doc.data().contact.email;
            
            var formData = new FormData();

            formData.append('body', '<B>[' + userProfile.firstName + ' ' + userProfile.lastName + ']:</B> ' +UserReply.body);
            formData.append('cc_emails', emailAgent);
            formData.append('cc_emails', userProfile.email);        
            formData.append('ticketId', allticketuser[UserReply.idTicket].data.id);

            var filesuploaded = req.files;
        
            if ( filesuploaded.length > 0 ) {
                for (var i = 0; i < filesuploaded.length; i++) {
                    formData.append('fileinput', fs.createReadStream(filesuploaded[i].path),filesuploaded[i].originalname);
                    // formData.append('fileinput', filesuploaded[i].buffer, { filename : filesuploaded[i].originalname });
                  }
            }

            firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        
                let axiosConfig = {
                    headers: {
                        'bearer': idToken,
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
                    }
                    };
        
                axios.post(process.env.URLCLOUD9 + '/createreply', formData, axiosConfig)
                  .then(function (response) {
                    console.log(response.data);
        
                    res.render('pages/reply',{ email: email, isConnected: isConnected, allticketuser: allticketuser });
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
        
            }).catch(function(error) {
                console.log(error);
            });

        })

    })
    .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

});

// Trade products
app.get('/trade', function(req, res) {

    res.render('pages/trade',{email: email, isConnected: isConnected});
});

// Trade other products
app.post('/sendorder', function(req, res) {
console.log(req.body);
    var productcharac = req.body;
    var type = req.body.type;

    delete productcharac.type;
    console.log(productcharac);
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {       

        let axiosConfig = {
            headers: {
                'bearer': idToken,
                'type' : type
            }
            };

        console.log(axiosConfig);
        axios.post(process.env.URLCLOUD9 + '/createticket', productcharac, axiosConfig)
            .then(function (response) {
              console.log(response.data);
  
              res.render('pages/ordersent',{email: email, isConnected: isConnected, message: 'Order Created'});
            })
            .catch(function (error) {
              console.log(error);
            });
  
      }).catch(function(error) {
          console.log(error);
      });

});

// Create Note page
app.get('/note', function(req, res) {
    res.render('pages/note',{email: email, isConnected: isConnected});
  });

// Create Broadcast page
app.get('/broadcast', function(req, res) {

    broadcastTicket = [];

    var query = db.collection('tickets')
    .where('custom_fields.cf_cpg_enddate', '>=', formatDate(Date.now()))
    .where('custom_fields.cf_cpg_choice', '==', "Appel public à l'épargne")
    .where('custom_fields.cf_cpg_exclusive', '==', false)
    .get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            
            var dataDoc = doc.data();
            var ticketuser = { id: doc.id, data: dataDoc };

            broadcastTicket.push(ticketuser);
            });
        
        isConnected = 1;
        res.render('pages/broadcast',{ email: email, isConnected: isConnected, supervisor: supervisor, broadcastTicket: broadcastTicket });
        })
    .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

  });

// Create Ticket button
app.post('/broadcast', upload.array('fileinput', 12), function(req, res) {

    console.log(req.body);

    var formData = getFormData(req.body);

    console.log(formData);

    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {

        let axiosConfig = {
            headers: {
                'bearer': idToken,
                'type': 'Broadcasting',
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
            }
            };

        axios.post(process.env.URLCLOUD9 + '/createticket', formData, axiosConfig)
          .then(function (response) {
            console.log(response.data);

            res.render('pages/broadcast',{ email: email, isConnected: isConnected, supervisor: supervisor, broadcastTicket: broadcastTicket });
          })
          .catch(function (error) {
            console.log(error);
          });

    }).catch(function(error) {
        console.log(error);
    });

});

// Create Subscription page
app.get('/subscription', function(req, res) {
    res.render('pages/subscription',{email: email, isConnected: isConnected});
  });

app.listen(8080);
console.log('8080 is the clientfl port');