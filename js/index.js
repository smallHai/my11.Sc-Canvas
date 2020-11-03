window.onload = function(){
    $cavBox = document.getElementById('cavBox')
    const cavBox_W = $cavBox.width
    const cavBox_H = $cavBox.height
    const gd = $cavBox.getContext("2d")

    const coinBox = {x: 105, y: 575}
    let scoreCount = 1000

    loadImg(img_json,function(){

        // 事件
        $cavBox.onmousemove = function(ev){
            // 监测大炮
            let a = ev.offsetX - cannon.x
            let b = ev.offsetY - cannon.y
            let ang = hd2jd(Math.atan2(b,a))+90 // 数学几何及零度在右问题
            cannon.rot = ang
        }

        $cavBox.onmouseup = function(ev){
            btnArray.forEach(function(btn){
                btn.up(ev.offsetX,ev.offsetY)
            })
        }

        $cavBox.onmousedown = function(ev){
            btnArray.forEach(function(btn){
                btn.down(ev.offsetX,ev.offsetY)
            })
            // 监测炮弹
            if(Date.now() - bulletTime >=1000){
                let bullet = new Bullet(cannon.type)
                bullet.x = cannon.x
                bullet.y = cannon.y
                bullet.rot = cannon.rot
                scoreCount-=(cannon.type *5)
                bulletArray.push(bullet)
                bulletTime = Date.now()
                bulletIsOut = true
            }
        }

        // 大炮
        let cannon = new Cannon(1)
        cannon.x = 400+(cannon.w/2)
        cannon.y = cavBox_H-(cannon.h/2)

        // 按钮
        let btnUp = new Button(
            new DrawRect(img_g['bottom'],47,75,36,28),
            new DrawRect(img_g['bottom'],3,75,36,28),
            0,0,0
        )
        btnUp.x = 516
        btnUp.y = 566
        btnUp.onclick = function(){
            if(cannon.type <=1){
                cannon.setType(cannon.type+1)
            }else if(cannon.type >=7){
                cannon.setType(7)
            }else{
                cannon.setType(cannon.type+1)
            }
        }
        let btnDown = new Button(
            new DrawRect(img_g['bottom'],135,75,36,28),
            new DrawRect(img_g['bottom'],91,75,36,28),
            0,0,0
        )
        btnDown.x = 370
        btnDown.y = 566
        btnDown.onclick = function(){
            if(cannon.type <=1){
                cannon.setType(1)
            }else if(cannon.type >=7){
                cannon.setType(cannon.type-1)
            }else{
                cannon.setType(cannon.type-1)
            }
        }
        let btnArray = [btnUp,btnDown]

        // 炮弹
        let bulletArray = []
        let bulletTime = 0
        let bulletIsOut = false

        // 炮台
        let bottom = new Sprite(new DrawRect(img_g['bottom'],0,0,765,70))
        bottom.x = (cavBox_W-765)/2 + (765/2)
        bottom.y = cavBox_H-(70/2)

        // 银币
        let coinArray = []
        let scoreArray = []
        for(let i=0; i<6; i++){
            let score = new Sprite(new DrawRect(img_g['number'],0,9*24,20,24))
            score.x = 45+24*i
            score.y = 585
            scoreArray.push(score)
        }

        // 鱼
        let fishArray = []
        let fishMax = 30

        function animate(){
            window.requestAnimationFrame(animate)
            gd.clearRect(0,0,cavBox_W,cavBox_H)

            // 画底座
            bottom.draw(gd)

            // 画鱼
            if(rnd(1,50) ==1 && fishArray.length <=fishMax){
                let fish = new Fish(rnd(1,5))
                if(rnd(0,2) ==0){
                    fish.x = -100
                    fish.rot = 90
                }else{
                    fish.x = cavBox_W+100
                    fish.rot = -90
                }
                fish.y = rnd(0,cavBox_H-100)
                fishArray.push(fish)
            }

            fishArray = fishArray.filter(function(fish){
                fish.draw(gd)
                fish.toNext()
                fish.move()
                // if(fish.outRect(-100,-100,cavBox_W+200,cavBox_H+200)){
                //     return false
                // }else{
                //     return true
                // }
                return !fish.outRect(-100,-100,cavBox_W+200,cavBox_H+200)
            })

            // 画炮弹
            bulletArray = bulletArray.filter(function(bullet){
                bullet.draw(gd)
                bullet.move()
                // if(bullet.outRect(-100,-100,cavBox_W+200,cavBox_H+200)){
                //     return false
                // }else{
                //     return true
                // }
                return !bullet.outRect(-100,-100,cavBox_W+200,cavBox_H+200)
            })

            // 画金币
            coinArray = coinArray.filter(function(coin){
                coin.move(coinBox.x,coinBox.y)
                coin.toNext()
                coin.draw(gd)
                if(
                    Math.abs(coin.x - coinBox.x) <=10 &&
                    Math.abs(coin.y - coinBox.y) <=10
                ){
                    return false
                }else{
                    return true
                }
            })

            // 画大炮
            if(bulletIsOut){
                let res = cannon.toNext()
                if(res){
                    bulletIsOut = false
                }
            }
            cannon.draw(gd)

            // 画按钮
            btnUp.draw(gd)
            btnDown.draw(gd)

            // 画分数
            let scoreStr = scoreCount+""
            while(scoreStr.length<6){
                scoreStr = "0"+scoreStr
            }
            scoreArray.forEach(function(score,index){
                score.setDrawRect(new DrawRect(img_g['number'],0,(9-parseInt(scoreStr[index]))*24,20,24))
                score.draw(gd)
            })

            // 碰撞与概率检测
            fishArray = fishArray.filter(function(fish){
                let collideRes = false
                bulletArray = bulletArray.filter(function(bullet){
                    if(!collideRes){
                        if(fish.collideText(bullet)){
                            if(Math.random() <(bullet.type*10)/(10+(fish.type-1)*20)){
                                collideRes = true
                            }
                            return false
                        }else{
                            return true
                        }
                    }else{
                        return true
                    }
                })

                if(collideRes){
                    fish.isDeath = true
                    fish.speed = 0
                    setTimeout(function(){
                        let i=0
                        let coinTime = setInterval(function(){
                            let coin = new Coin()
                            coin.x = fish.x
                            coin.y = fish.y
                            coinArray.push(coin)
                            scoreCount += fish.type * 20
                            i++
                            if(i ==fish.type){
                                clearInterval(coinTime)
                            }
                        },50)

                        fishArray = fishArray.filter(function(item){
                            if(item !=fish){
                                return true
                            }else{
                                return false
                            }
                        })
                    },200)
                    return true
                }else{
                    return true
                }
                // return !collideRes
            })
        }

        window.requestAnimationFrame(animate) //请求动画帧，用于取代setInterval动画
        // setInterval(function(){
        //     gd.clearRect(0,0,cavBox_W,cavBox_H)
        //     fish1.x++
        //     fish1.draw(gd)
        //     tick++
        //     if(tick ==10){
        //         tick = 0
        //         fish1.toNext()
        //     }
        // },16.7)
    })
}