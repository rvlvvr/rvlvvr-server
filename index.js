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
    //services.recent(socket);
    console.log('connected')
    socket.on('join', function (user) {
      console.log(user)
    });

    socket.on('message', function (data) {
      console.log('incoming data ', data)

      var payload = {
        text: data.text,
        public: data.public || false,
        sender: data.sender,
        receiver: data.receiver
      };

      services.addMessage(payload, io, function (err, chat) {
        if (err) {
          console.log('error ', err);
        } else {
          io.emit('message', chat);
        }
      });
    });
  });
});

function home(request, reply) {
  reply.view('index', {
    url: nconf.get('url')
  });
}
