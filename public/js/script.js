
const socket = io('/')
let emotions;
let streamCam;
const myVideo = document.createElement('video')
myVideo.muted = true
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('js/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('js/models')
]).then( ()=>
navigator.mediaDevices.getUserMedia({
  video: true,
})).then(stream => {

  addVideoStream(myVideo, stream)
  streamCam = stream
}).then(()=>
  myVideo.addEventListener('play', () => {

      // const canvas = faceapi.createCanvasFromMedia(myVideo)
      // videoGrid.append(canvas)
      // const displaySize = { width: 300, height:300 }
      // faceapi.matchDimensions(canvas, displaySize)

      const intervalId = setInterval(async () => {
        const detections = await faceapi.detectSingleFace(myVideo, new faceapi.TinyFaceDetectorOptions())/*.withFaceLandmarks()*/.withFaceExpressions()
        if(detections)
        {
        emotions = 
        {'angry':detections.expressions.angry,
        'disgusted':detections.expressions.disgusted,
        'fearful':detections.expressions.fearful,
        'neutral':detections.expressions.neutral,
        'sad':detections.expressions.sad,
        'surprised':detections.expressions.surprised,
        'happy':detections.expressions.happy}
        maxEmotionKey = Object.keys(emotions).reduce(function(a, b){ return emotions[a] > emotions[b] ? a : b });
        var message = {}
        message[maxEmotionKey] = ((emotions[maxEmotionKey]*100) | 0)
        
        sendEmotionMessage(JSON.stringify(message))
        }
        // const resizedDetections = await faceapi.resizeResults(detections, displaySize)
        //console.log(resizedDetections)
        // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        // faceapi.draw.drawDetections(canvas, resizedDetections)
        // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

      }, 5000)

    }))
    
/*
angry
: 
0.0002386151609243825
disgusted
: 
1.0210697354295917e-7
fearful
: 
2.238711882540656e-9
happy
: 
0.00018269190331920981
neutral
: 
0.9969533681869507
sad
: 
0.000017397833289578557
surprised
: 
0.0026079078670591116

*/





function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    
  })
}