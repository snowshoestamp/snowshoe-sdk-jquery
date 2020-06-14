/*
Snowshoe jQuery (https://github.com/snowshoestamp/snowshoe-sdk-jquery)
jquery.snowshoe.js
Version 3.0.2
See GitHub project page for Documentation and License
*/
(function ($) {
  $.snowshoe = {
    stampScreen: {
      init: function (configs, client) {
        var stampScreenElmId = configs.stampScreenElmId || "snowshoe-stamp-screen";
        var progressAnimationOn = configs.progressBarOn || false;
        var preventScrolling = configs.preventScrolling || false;
        var preventZooming = configs.preventZooming || false;
        var messages = configs.messages || {};
        var helpMessage = messages.insufficientPoints || "";
        var holdMessage = messages.userTraining || "";
        var postUrl = configs.postUrl || "/stampscreen";
        var success = configs.success || {};
        var error = configs.error || {};
        var points = [];
        var stampScreenElm = document.getElementById(stampScreenElmId);
        var stampTouching = false;
        var pointsMin = configs.insufficientPointsMin || 3;
        var holdMsg;
        var apiKey = configs.apiKey;
        complete = function () {
          stampTouching = false;
        }

        if (preventScrolling) {
          stampScreenElm.addEventListener('touchmove', function(event) {
            // Prevent scrolling on this element
            event.preventDefault();
          });
        }

        if (preventZooming) {
          stampScreenElm.addEventListener('gesturechange', function(event) {
            // Disable browser zoom
            event.preventDefault();
          });
        }

        stampScreenElm.addEventListener('touchstart', function (event) {
          $("#snowshoe-messages").empty();
          clearTimeout(holdMsg);
          if (event.touches.length >= pointsMin && progressAnimationOn) {
            $('#snowshoe-progress-bar').addClass("snowshoe-progress-bar");
          };

          if (event.touches.length >= 5) {
            var data = [];
            var touches = event.touches;
            for (var i = 0; i <= event.touches.length; i++) {
              if (touches[i]) {
                data.push([+touches[i].pageX.toFixed(2), +touches[i].pageY.toFixed(2)]);
              }
            }
            send(data, apiKey);
          }

          if (event.touches.length < 5 && event.touches.length >= pointsMin) {
            $('#snowshoe-progress-bar').removeClass("snowshoe-progress-bar");
            // Teach users to stamp and hold for 2 seconds before displaying user-defined message
            if (helpMessage) {
              $("#snowshoe-messages").append(holdMessage);
              holdMsg = setTimeout(function () { displayCustomMessage(helpMessage) }, 2000);
            }
          }
        });

        function displayCustomMessage(helpMsg) {
          $("#snowshoe-messages").children().replaceWith(helpMsg);
        };

        function send(points, apiKey) {
          // return if already one process is working out
          if (stampTouching) return false;
          stampTouching = true;
          if (apiKey===undefined){
              //post without apiKey
            client.post(points, postUrl, success, error, complete);
          }
          else{
            client.postWithApiKey(points, postUrl, success, error, complete, apiKey)
          }
        }
      }
    },

    client: {
      post: function (data, endpoint, cbk, cbkError, cbkComplete) {
        $.ajax({
          'url': endpoint,
          'method' : "POST",
          'headers': {
            "Content-Type" : "application/json"
          }, 
          'data': JSON.stringify({"data": data}),
          success: function (response) {
            cbkComplete(response);
            cbk(response);
          },
          error: function (response){
            cbkComplete(response);
            cbkError(response); 
          }
        })
      },
      postWithApiKey: function(data, endpoint, cbk, cbkError, cbkComplete,apiKey) {
        $.ajax({
          'url': endpoint,
          'method' : "POST",
          'headers': {
            "SnowShoe-Api-Key": apiKey,
            "Content-Type" : "application/json"
          }, 
          'data': JSON.stringify({"data": data}),
          success: function (response) {
            cbkComplete(response);
            cbk(response);
          },
          error: function (response){
            cbkComplete(response);
            cbkError(response); 
          }
        });
      }
    },
  }
})(jQuery);

$.snowshoe.stampScreen.init(stampScreenInitData, $.snowshoe.client);

