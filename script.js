const video = document.getElementById('video');



Promise.all([
    //检测面部
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    //识别五官
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    // 识别性别
    faceapi.nets.ageGenderNet.loadFromUri('./models'),
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
    // console.log('loaded')
    setInterval(
        async () => {
            const result = await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions().withAgeAndGender();//.withFaceLandmarks()
            if(result){
                // const gender = detections[0].gender
                // console.log('gender',gender)
                const resizedResult = faceapi.resizeResults(result,displaySize)
                // console.dir(result)
                // console.dir(resizedResults)
                canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
                faceapi.draw.drawDetections(canvas,resizedResult)
                // faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
                faceapi.draw.drawFaceExpressions(canvas,resizedResult)

                const { age, gender, genderProbability,expressions } = resizedResult
                const genderIndex = gender==='female'?0:1;
                new faceapi.draw.DrawTextField(
                    [
                        // `${faceapi.utils.round(interpolatedAge, 0)} years`,
                        `${gender} (${faceapi.utils.round(genderProbability)})`
                    ],
                    result.detection.box.topRight
                ).draw(canvas)

                try{
                    // expressions = resizedResult[0].expressions
                    expression = getTopExpression(expressions)
                    document.getElementById('text').innerText = texts[expression]
                    // console.log('expression',expression)
                    // console.log('image',images[expression])
                    // console.log('genderIndex',genderIndex)
                    // console.log('expression',expression)
                    // console.log('images[expression]',images[expression])
                    // console.log(images[expression][genderIndex])
                    document.getElementById('image').setAttribute('src',images[expression][genderIndex])
                    // showImage(expression)
                }catch(err){
                    // console.log('No face detected\n' + err)
                }
            }
        },
        100
    );
});

function getTopExpression(expressions){
    expressionsMap = objToStrMap(expressions)

    // console.log(expressionsMap)
    const arrayObj=Array.from(expressionsMap);
    //按可能性从大到小排序
    arrayObj.sort(function(a,b){return b[1]-a[1]})
    // console.log(arrayObj)
    return arrayObj[0][0]
}

function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}

function showImage(expression){
    if(expression === 'neutral'){

    }
}
