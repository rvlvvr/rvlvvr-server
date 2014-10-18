var $ = require('jquery');
var moment = require('moment');

var feed = $('#feed');

exports.render = function (data) {
  if (feed.find('li[data-created="' + data.created + '"]').length === 0) {
    if (!data.sender) {
      data = data.value.message;
    }

    var isPublic = data.public ? 'public' : 'private';
    var li = $('<li data-created="' + data.created + '" class="' + isPublic + '"><div class="avatars"></div></li>');
    var senderAvatar = $('<div><img src="' + data.senderAvatar + '"></img></div>');
    var senderLabel = $('<span class="label">' + data.sender + '</span>');

    var div = $('<div class="para"></div>');

    if (!data.public) {
      var pre = $('<pre></pre>');
      pre.text(data.text);
      div.append(pre);
    } else {
      div.html(data.text);
    }

    li.find('.avatars').append(senderAvatar.append(senderLabel));

    var timeEl = $('<time></time>');
    timeEl.text(moment.unix(data.created).fromNow());
    li.append(timeEl);

    if (data.sender !== data.receiver) {
      var recipient = $('<div class="recipient"></div>');
      var receiverAvatar = $('<img src="' + data.receiverAvatar + '"></img>');
      var receiverLabel = $('<span class="label">' + data.receiver + '</span>');
      li.find('.avatars').append(recipient.append(receiverAvatar).append(receiverLabel));
    }

    li.append(div);
    feed.prepend(li);
  }
};