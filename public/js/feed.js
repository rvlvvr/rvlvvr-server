$(function () {
  var socket = io();

  var feed = $('.feed');

  socket.on('message', function (data) {
    var li = $('<li><div class="avatars"></div></li>');
    var senderAvatar = $('<div><img src="' + data.senderAvatar + '"></img></div>');
    var senderLabel = $('<span class="label">' + data.sender + '</span>');
    var p = $('<p>' + data.text + '</p>');

    li.find('.avatars').append(senderAvatar.append(senderLabel));


    if (data.sender !== data.receiver) {
      var recipient = $('<div class="recipient"></div>');
      var receiverAvatar = $('<img src="' + data.receiverAvatar + '"></img>');
      var receiverLabel = $('<span class="label">' + data.receiver + '</span>');
      li.find('.avatars').append(recipient.append(receiverAvatar).append(receiverLabel));
    }

    li.append(p);
    feed.prepend(li);
  });
});