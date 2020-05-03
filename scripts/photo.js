function loadImageFromUpload(){
    $('#loading2').css('display','block');
    var file = document.getElementById('queryImgUploadInput');
    var ua = navigator.userAgent.toLowerCase();
    var url = '';
    if(/msie/.test(ua)) {
        url = file.value;
    } else {
        url = window.URL.createObjectURL(file.files[0]);
    }
    $('#loading2').css('display','none');
    document.getElementById('inputImg').src = url;

    detect()
}

Promise.all([
    //检测面部
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    //识别五官
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    // 识别性别
    faceapi.nets.ageGenderNet.loadFromUri('./models'),
    //识别表情
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(start)

function start(){
    $('#loading1').remove()
    $('#imgUploadContainer').css('display','block')
    $('#globalMain').css('display','block')
}

async function detect(){
    $('#loading3').css('display','block');
    // console.log('detect:')
    const input = document.getElementById('inputImg')
    // console.log('input',input)
    const result = await faceapi.detectSingleFace(
        input,
        new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
    // resize the overlay canvas to the input dimensions
    const canvas = document.getElementById('overlay')
    faceapi.matchDimensions(canvas, input)
    // console.log('result',result)
    $('#loading3').css('display','none');
    if(result){
        const resizedResult = faceapi.resizeResults(result,input)
        faceapi.draw.drawDetections(canvas,resizedResult)
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
    }else{
        $('#text').text('No face detected!\n')
    }
}
