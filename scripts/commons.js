
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

