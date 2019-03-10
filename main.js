var brightness = 0
var contrast = 0
var invert = 0
var vertical = 0
var horizontal = 0

function brightnessChange(event) {
    brightness = parseInt(event.target.value)
    document.getElementById("brightness-value").innerHTML = (brightness/255).toFixed(2)
    processor.computeFrame()
}

function contrastChange(event) {
  contrast = (parseInt(event.target.value)/255).toFixed(2)
  document.getElementById("contrast-value").innerHTML = contrast
  processor.computeFrame()
}

function invertChange() {
  invert += 1 - 2 * invert  
  processor.computeFrame()
}

function verticalChange() {
  vertical += 1 - 2 * vertical  
  processor.computeFrame()
}

function horizontalChange(event) {
  horizontal += 1 - 2 * horizontal  
  processor.computeFrame()
}

var processor = {  
    timerCallback: function(pass) {  
      if ((this.video.paused || this.video.ended) && !pass) {  
        return;  
      }  
      this.computeFrame();  
      var self = this;  
      setTimeout(function () {  
        self.timerCallback();  
      }, 16); // roughly 60 frames per second  
    },
  
    doLoad: function() {
      this.video = document.getElementById("my-video");
      this.c1 = document.getElementById("my-canvas");
      this.ctx1 = this.c1.getContext("2d");
      var self = this;  
  
      this.video.addEventListener("play", function() {
        self.width = self.video.width;  
        self.height = self.video.height;  
        self.timerCallback();
      }, false);
      this.video.addEventListener("timeupdate", function() {
        self.width = self.video.width;  
        self.height = self.video.height;  
        self.timerCallback(true);
      }, false);
    },  
  
    computeFrame: function() {
      this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
      var frame = this.ctx1.getImageData(0, 0, this.width, this.height);
      var l = frame.data.length / 4;
      var buffer = new Uint8ClampedArray(frame.data.length)      
      var avg = 0
      for (var i = 0; i < l; i++) {
        avg += (frame.data[i * 4 + 0] + frame.data[i * 4 + 1] + frame.data[i * 4 + 2])/3
      }
      avg /= l
      for (var i = 0; i < l; i++) {
        var r = (avg - Math.abs(frame.data[i * 4 + 0] - 255 * invert)) * contrast + Math.abs(frame.data[i * 4 + 0] - 255 * invert) + brightness
        var g = (avg - Math.abs(frame.data[i * 4 + 1] - 255 * invert)) * contrast + Math.abs(frame.data[i * 4 + 1] - 255 * invert) + brightness
        var b = (avg - Math.abs(frame.data[i * 4 + 2] - 255 * invert)) * contrast + Math.abs(frame.data[i * 4 + 2] - 255 * invert) + brightness
        var position = i
        if(vertical)
          position = (l + (position % frame.width) - frame.width*(Math.floor(position / frame.width) + 1))
        if(horizontal)
          position = position + (frame.width - 1) - 2 * (position % frame.width)

        buffer[position * 4 + 0] = r;
        buffer[position * 4 + 1] = g;
        buffer[position * 4 + 2] = b;
        buffer[position * 4 + 3] = 255;
      }      
      frame = new ImageData(buffer, frame.width, frame.height)      
      this.ctx1.putImageData(frame, 0, 0);
  
      return;
    }
  };

  processor.doLoad()