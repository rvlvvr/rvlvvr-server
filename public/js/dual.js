$(function () {
  var socket = io();

  var feed = $('.feed');

  socket.emit('join', feed.data('key'));
  socket.emit('dual', feed.data('key'));

  socket.on('message', function (data) {
    if (!data.sender) {
      data = data.value.message;
    }

    var isPublic = data.public ? 'public' : 'private';
    var li = $('<li class="' + isPublic + '"><div class="avatars"></div></li>');
    var senderAvatar = $('<div><img src="' + data.senderAvatar + '"></img></div>');
    var senderLabel = $('<span class="label">' + data.sender + '</span>');
    var div = $('<div class="para"></div>');
    div.html(data.text);

    li.find('.avatars').append(senderAvatar.append(senderLabel));

    if (data.created) {
      var timeEl = $('<time></time>');
      timeEl.text(moment.unix(data.created).fromNow());
      li.append(timeEl);
    }

    if (data.sender !== data.receiver) {
      var recipient = $('<div class="recipient"></div>');
      var receiverAvatar = $('<img src="' + data.receiverAvatar + '"></img>');
      var receiverLabel = $('<span class="label">' + data.receiver + '</span>');
      li.find('.avatars').append(recipient.append(receiverAvatar).append(receiverLabel));
    }

    li.append(div);
    feed.prepend(li);
  });
});