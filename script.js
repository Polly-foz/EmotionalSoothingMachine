const video = document.getElementById('video');

Promise.all([
    //检测面部
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    //识别表情
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        {
            video: {}
        },
        stream => {
            video.srcObject = stream;
        },
        err => {
            console.log(err);
        }
    );
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    const videoContainer = document.getElementById('videoContainer')
    videoContainer.append(canvas)
    const displaySize = {
        width: video.width,
        height: video.height
    }
    faceapi.matchDimensions(canvas,displaySize)
    console.log('loaded')
    setInterval(
        async () => {
            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions();

            const resizedDetections = faceapi.resizeResults(detections,displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
            faceapi.draw.drawDetections(canvas,resizedDetections)
            // faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas,resizedDetections)
            try{
                expressions = resizedDetections[0].expressions
                expression = getTopExpression(expressions)
                document.getElementById('text').innerText = expression

            }catch(err){
                // console.log('No face detected\n' + err)
            }
        },
        100
    );
});

function getTopExpression(expressions){
    expressionsMap = objToStrMap(expressions)

    console.log(expressionsMap)
    const arrayObj=Array.from(expressionsMap);
    //按可能性从大到小排序
    arrayObj.sort(function(a,b){return b[1]-a[1]})
    console.log(arrayObj)
    return arrayObj[0][0]
}

function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}
