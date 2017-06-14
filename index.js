var tag = "dalat";
var http = require('http');
var util = require('util');
var fs = require('fs');
var request = require("request");
var url = "https://www.instagram.com/explore/tags/%s/?__a=1";
var fullUrl = url;
var images = "";
var download = require('image-downloader');
var mkdirp  = require('mkdirp');
var rp = require('request-promise');

mkdirp("./" + tag, function(error){console.log("make folder", error);});
var recursive = function () {
  rp({
    url: util.format(fullUrl, tag),
    json: true
  })
      .then(function (response) {
        console.log(response);

        var nodes = response.tag.media.nodes;
        var nextPage = response.tag.media.page_info.end_cursor;

        for (var i = 0; i < nodes.length; i++) {
          var imageUrl = nodes[i].thumbnail_src;
          download
              .image({
                url:imageUrl,
                dest:"./" + tag
              })
              .then(function (response) {
                console.log('File saved to', response.filename)
              })
              .catch(function (error) {
                console.log('File saved error', error)
              });
          images += "<img style='margin:20px' width=\"200\" src='" + imageUrl + "'/>";
        }

        if (nextPage !== null) {
          fullUrl = url + "&max_id=" + nextPage;
          recursive();
        } else {
          console.log("finished");
        }
      })
      .catch(function (err) {
        // API call failed...
        console.log(err);
      });
};
recursive();
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end("<html><body><div style='float:left'>" + images + "</div></body></html>");
}).listen(9999);

