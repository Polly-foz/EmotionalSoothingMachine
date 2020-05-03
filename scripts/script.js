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
                    expression = getTopExpression(expressions)
                    document.getElementById('text').innerText = texts[expression]
                    document.getElementById('image').setAttribute('src',images[expression][genderIndex])
                }catch(err){
                    // console.log('No face detected\n' + err)
                }
            }
        },
        100
    );
});


