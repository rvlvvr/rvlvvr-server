'use strict';

var Hapi = require('hapi');
var nconf = require('nconf');
var SocketIO = require('socket.io');

var services = require('./lib/services');

nconf.argv().env().file({ file: 'local.json' });

var options = {
  views: {
    engines: {
      jade: require('jade')
    },
    isCached: process.env.node === 'production',
    path: __dirname + '/views',
    compileOptions: {
      pretty: true
    }
  },
  cors: true
};

var server = Hapi.createServer(nconf.get('domain'), nconf.get('port'), options);

var routes = [
  {
    method: 'GET',
    path: '/',
    config: {
      handler: home
    }
  },
  {
    method: 'GET',
    path: '/feed',
    config: {
      handler: services.recent
    }
  }
];

server.route(routes);

server.route({
  path: '/{path*}',
  method: "GET",
  config: {
    handler: {
      directory: {
        path: './public',
        listing: false,
        index: false
      }
    }
  }
});

server.start(function () {
  var io = SocketIO.listen(server.listener);

  io.on('connection', function (socket) {
    console.log('connected')
    socket.on('join', function (user) {
      console.log('joined room ', user)
    });

    socket.on('message', function (data) {
      console.log('incoming data ', data)

      services.addMessage(data, function (err, message) {
        if (err) {
          console.log('error ', err);
        } else {
          console.log(message.receiver + '!' + message.sender)
          io.sockets.in(message.receiver + '!' + message.sender).emit('message', message);

          if (data.public) {
            io.emit('message', message);
          }
        }
      });
    });
  });
});

function home(request, reply) {
  reply.view('index', {
    url: nconf.get('url'),
    pageType: 'home'
  });
}
