var tag = "taylor";
var http = require('http');
var path = require('path');
var fs = require('fs');
var request = require("request");
var json = require('json-object').setup(global);
var url = "https://www.instagram.com/explore/tags/" + tag + "/?__a=1";
var fullUrl = url;
var images = "";
var download = require('image-downloader');
var mkdirp  = require('mkdirp');

mkdirp("./" + tag, function(error){console.log("make folder", error);});
var recursive = function (req, res) {
  request({
    url: fullUrl,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {

      var nodes = body.tag.media.nodes;
      for (var i = 0; i < nodes.length; i++) {
        var imageUrl = nodes[i].thumbnail_src;
        download
            .image({
              url:imageUrl,
              dest:"./" + tag
            })
            .then(function (filename, image) {
              console.log('File saved to', filename)
            })
            .catch(function (error) {
              console.log('File saved error', error)
            });
        images += "<img style='margin:20px' width=\"200\" src='" + imageUrl + "'/>";
      }

      var nextPage = body.tag.media.page_info.end_cursor;

      if (nextPage !== null) {
        fullUrl = url + "&max_id=" + nextPage;
        setTimeout(recursive, 10);
      } else {
        console.log("finished");
      }
    }
  })
};
recursive();
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end("<html><body><div style='float:left'>" + images + "</div></body></html>");
}).listen(9999);

