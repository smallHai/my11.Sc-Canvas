let img_g = null
let img_json = {
    bottom: "img/bottom.png",
    bullet: "img/bullet.png",
    cannon1: "img/cannon1.png",
    cannon2: "img/cannon2.png",
    cannon3: "img/cannon3.png",
    cannon4: "img/cannon4.png",
    cannon5: "img/cannon5.png",
    cannon6: "img/cannon6.png",
    cannon7: "img/cannon7.png",
    coin: "img/coin.png",
    fish1: "img/fish1.png",
    fish2: "img/fish2.png",
    fish3: "img/fish3.png",
    fish4: "img/fish4.png",
    fish5: "img/fish5.png",
    number: "img/number.png"
}

// 角度to弧度
function jd2hd(jd){
    return jd*Math.PI/180
}

// 弧度to角度
function hd2jd(hd){
    return hd*180/Math.PI
}

// 生成随机数
function rnd(n,m){
    return Math.floor(Math.random()*(m-n)+n)
}

// 加载图片
function loadImg(json,fn){
    let res = {}
    let total = 0
    let compete = 0

    for(let name in json){
        total++
        let oImg = new Image()
        res[name] = oImg

        oImg.src = json[name]
        oImg.onload = function(){ //因为这里是异步的，比循环速度慢
            compete++
            if(compete ==total){
                img_g = res
                fn()
            }
        }
        oImg.onerror = function(){
            alert("图片加载失败")
        }
    }
}