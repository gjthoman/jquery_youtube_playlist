;(function ( $, window, document, undefined ) {
  var pluginName = "youtubePlaylist",
    defaults = {
    playlistid: ""
  };

  function Plugin ( element, options ) {
    this.element = element;
    this.settings = $.extend( {}, defaults, $(element).data() );
    this._defaults = defaults;
    this._name = pluginName;
    this.playlist = [];
    this.player;
    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      this.createPlayerWrappers();
      this.getPlaylist(this.settings.playlistid);
      this.setEvents();
    },
    getPlaylist: function (id) {
      _this = this;
      $.get( "http://gdata.youtube.com/feeds/api/playlists/" + id + "?v=2&alt=json" , function (data) {
        _this.createPlaylistElement(_this.parseResponse(data, _this));
        _this.createIframeVideo(0);
      });
    },
    parseResponse: function (data, scope) {
      $.each(data.feed.entry, function(){
        scope.playlist.push({
          videoId: this.media$group.yt$videoid.$t,
          title: this.title.$t,
          duration: this.media$group.yt$duration.seconds,
          thumbnail: this.media$group.media$thumbnail[1].url
        });
      });
      return scope.playlist;
    },
    setEvents: function () {
      _this = this;
      $('.videoInnerWrapper').on('click','li', function(){
        _this.playVideo($(this).index());
      });
    },
    createPlayerWrappers: function() {
      var videoInnerWrapper = "<div class='videoInnerWrapper'></div>";
      $( this.element ).html($(videoInnerWrapper));
      
    },
    playVideo: function (index) {
      $('#youtube-video').attr('src', 'http://www.youtube.com/embed/' + this.playlist[index].videoId + '?enablejsapi=1&showinfo=0&autohide=1&autoplay=1');
    },
    createIframeVideo: function (id){
      var videoFrame = $('<iframe />', {
        src: 'http://www.youtube.com/embed/'+ _this.playlist[id].videoId +'?enablejsapi=1&showinfo=0&autohide=1',
        id:   'youtube-video'
      });
      $( this.element ).find('.videoInnerWrapper').prepend( videoFrame );
    },
    createPlaylistElement: function (playlist) {
      _this = this;
      var playlistFrame = $("<div class='playlist-wrapper'/>").html($('<ul />'));
      $(this.element).find('.videoInnerWrapper').append(playlistFrame);
      
      $.each(playlist, function () {
        var video = "<li><span class='title'>" + this.title + "</span><span class='duration'>" + this.duration + "</span><div class='image-wrapper'><img src='" + this.thumbnail + "'/></div></li>";
        $(".playlist-wrapper ul").append(video);
      });
    }
  });

  $.fn[ pluginName ] = function ( options ) {
    this.each(function() {
      if ( !$.data( this, "plugin_" + pluginName ) ) {
        $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
      }
    });

    return this;
  };

})( jQuery, window, document );