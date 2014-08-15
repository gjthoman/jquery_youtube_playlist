(function(a){if(typeof define==='function'&&define.amd){define(['jquery'],a)}else{a(jQuery)}}(function($){if($.support.cors||!$.ajaxTransport||!window.XDomainRequest){return}var n=/^https?:\/\//i;var o=/^get|post$/i;var p=new RegExp('^'+location.protocol,'i');$.ajaxTransport('* text html xml json',function(j,k,l){if(!j.crossDomain||!j.async||!o.test(j.type)||!n.test(j.url)||!p.test(j.url)){return}var m=null;return{send:function(f,g){var h='';var i=(k.dataType||'').toLowerCase();m=new XDomainRequest();if(/^\d+$/.test(k.timeout)){m.timeout=k.timeout}m.ontimeout=function(){g(500,'timeout')};m.onload=function(){var a='Content-Length: '+m.responseText.length+'\r\nContent-Type: '+m.contentType;var b={code:200,message:'success'};var c={text:m.responseText};try{if(i==='html'||/text\/html/i.test(m.contentType)){c.html=m.responseText}else if(i==='json'||(i!=='text'&&/\/json/i.test(m.contentType))){try{c.json=$.parseJSON(m.responseText)}catch(e){b.code=500;b.message='parseerror'}}else if(i==='xml'||(i!=='text'&&/\/xml/i.test(m.contentType))){var d=new ActiveXObject('Microsoft.XMLDOM');d.async=false;try{d.loadXML(m.responseText)}catch(e){d=undefined}if(!d||!d.documentElement||d.getElementsByTagName('parsererror').length){b.code=500;b.message='parseerror';throw'Invalid XML: '+m.responseText;}c.xml=d}}catch(parseMessage){throw parseMessage;}finally{g(b.code,b.message,c,a)}};m.onprogress=function(){};m.onerror=function(){g(500,'error',{text:m.responseText})};if(k.data){h=($.type(k.data)==='string')?k.data:$.param(k.data)}m.open(j.type,j.url);m.send(h)},abort:function(){if(m){m.abort()}}}})}));
;(function( $, window, document, undefined ){
  var pluginName = "youtubePlaylist",
    defaults = {
    playlistid: ""
  };
  function Plugin( element, options ){
    this.element = element;
    this.settings = $.extend( {}, defaults, $(element).data());
    this._defaults = defaults;
    this._name = pluginName;
    this.playlist = [];
    this.player;
    this.init();
  }
  $.extend(Plugin.prototype, {
    init: function(){
      this.createPlayerWrappers();
      this.getPlaylist(this.settings.playlistid);
      this.setEvents();
    },
    getPlaylist: function(id){
      _this = this;
      $.getJSON("http://gdata.youtube.com/feeds/api/playlists/" + id + "?v=2&alt=json").done(function(data){
        _this.createPlaylistElement(_this.parseResponse(data, _this));
        _this.createIframeVideo(0);
      });
    },
    parseResponse: function(data, scope){
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
    setEvents: function(){
      _this = this;
      $('.videoInnerWrapper').on('click','li', function(){
        _this.playVideo($(this).index());
      });
    },
    createPlayerWrappers: function(){
      var videoInnerWrapper = "<div class='videoInnerWrapper'></div>";
      $( this.element ).html($(videoInnerWrapper));
    },
    playVideo: function(index){
      $('#youtube-video').attr('src', 'http://www.youtube.com/embed/' + this.playlist[index].videoId + '?enablejsapi=1&showinfo=0&autohide=1&autoplay=1');
    },
    createIframeVideo: function(id){
      var videoFrame = $('<iframe />', {
        src: 'http://www.youtube.com/embed/'+ _this.playlist[id].videoId +'?enablejsapi=1&showinfo=0&autohide=1',
        id:   'youtube-video'
      });
      $( this.element ).find('.videoInnerWrapper').prepend( videoFrame );
    },
    createPlaylistElement: function(playlist){
      _this = this;
      var playlistFrame = $("<div class='playlist-wrapper'/>").html($('<ul />'));
      $(this.element).find('.videoInnerWrapper').append(playlistFrame);
      
      $.each(playlist, function(){
        var video = "<li><span class='title'>" + this.title + "</span><span class='duration'>" + this.duration + "</span><div class='image-wrapper'><img src='" + this.thumbnail + "'/></div></li>";
        $(".playlist-wrapper ul").append(video);
      });
    }
  });
  $.fn[ pluginName ] = function( options ){
    this.each(function(){
      if( !$.data( this, "plugin_" + pluginName )){
        $.data( this, "plugin_" + pluginName, new Plugin( this, options ));
      }
    });

    return this;
  };
})( jQuery, window, document );