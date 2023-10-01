// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// configure view handler
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use(function(req, res, next){
  var headers = req.headers
  app.set('headers', headers)
  next()
})

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){

    // const ioSocket = require('socket.io')('', {
    //   // Send auth token on connection, you will need to DI the Auth service above
    //   // 'query': 'token=' + Auth.getToken()
    //   path: '/socket.io',
    //   transports: ['websocket', 'polling'],
    //   // secure: true,
    // }, app.start());

    // app.io = ioSocket

    // app.io.connect(app.start)

    app.io = require('socket.io')(app.start());

    app.io.on('connection', function(socket){
      console.log('a admin connected');

      socket.on('join-room', name => {
        console.log('join-room', name)
        socket.join(name)
      })
      socket.on('leave-room', name => {
        console.log('leave-room', name)
        socket.leave(name)
      })

      socket.on('disconnect', function(){
          console.log('admin disconnected');
      });
    })
    // app.start();
  }
});
