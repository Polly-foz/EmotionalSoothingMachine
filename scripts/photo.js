function loadImageFromUpload(){
    const preview = document.querySelector('#inputImg');
    const file    = document.querySelector('input[type=file]').files[0];
    const reader  = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        console.log('src',preview.src)
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }

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
    $('#loading').remove()
    $('#imgUploadContainer').css('display','block')
    $('#globalMain').css('display','block')
}

async function detect(){
    console.log('detect:')
    const input = document.getElementById('inputImg')
    console.log('input',input)
    const result = await faceapi.detectSingleFace(
        input,
        new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
    // resize the overlay canvas to the input dimensions
    const canvas = document.getElementById('overlay')
    faceapi.matchDimensions(canvas, input)
    console.log('result',result)
    if(result){
        const resizedResult = faceapi.resizeResults(result,input)
        faceapi.draw.drawDetections(canvas,resizedResult)
        faceapi.draw.drawFaceExpressions(canvas,resizedResult)
        // const { age, gender, genderProbability,expressions } = resizedResult
        // const genderIndex = gender==='female'?0:1;
        // new faceapi.draw.DrawTextField(
        //     [
        //         `${gender} (${faceapi.utils.round(genderProbability)})`
        //     ],
        //     result.detection.box.topRight
        // ).draw(canvas)
    }
}
