// 图片处理，因为合成图中，不同图片要有定位和宽高
class DrawRect{
    constructor(img,sx,sy,sw,sh){
        if(!img || !sw || !sh){
            throw new Error("img or width or height is error")
        }
        this.img = img
        this.sx = sx
        this.sy = sy
        this.sw = sw
        this.sh = sh
    }
}

// 基础类
class Sprite{
    constructor(drawRect,x=0,y=0,rot=0){
        if(!(drawRect instanceof DrawRect)){
            throw new Error("img must be a DrawRect")
        }

        this.setDrawRect(drawRect)
        this.x = x // 图片中心点
        this.y = y // 图片中心点
        this.rot = rot
        this.speed = 0

        this.cur_next = 0
        this.max_next = 0 // 图有几个小图要切换

        this.scaleX = 1 // 解决影子问题
        this.scaleY = 1 // 解决影子问题

        this.tick = 0
        this.tickNow = 0

        this.radii = 0 // 半径
    }

    draw(gd){
        gd.save()
        gd.translate(this.x,this.y)
        gd.rotate(jd2hd(this.rot))
        gd.scale(this.scaleX,this.scaleY)
        // -w/2,-h/2让图片中心在画布原点
        gd.drawImage(
            this.drawRect.img,
            this.sx,this.sy,this.w,this.h, // 原图裁剪
            -this.w/2,-this.h/2,this.w,this.h // 画在画布
        )
        gd.restore()
    }

    setDrawRect(drawRect){
        this.drawRect = drawRect
        this.w = drawRect.sw
        this.h = drawRect.sh
        this.sx = drawRect.sx // 换图坐标
        this.sy = drawRect.sy // 换图坐标
    }

    inRect(x,y){
        if(
            this.x-this.w/2<=x && x<=this.x+this.w/2 &&
            this.y-this.h/2<=y && y<=this.y+this.h/2
        ){
            return true
        }else{
            return false
        }
    }

    outRect(out_X,out_Y,cavBox_W,cavBox_H){
        if(
            this.x<out_X || this.x>cavBox_W+out_X ||
            this.y<out_Y || this.y>cavBox_H+out_Y
        ){
            return true
        }else{
            return false
        }
    }

    move(x,y){
        if(arguments.length ==0){
            this.x += Math.sin(jd2hd(this.rot)) * this.speed
            this.y -= Math.cos(jd2hd(this.rot)) * this.speed
        }else{
            this.x += (x-this.x)/this.speed
            this.y += (y-this.y)/this.speed
        }
    }

    toNext(){
        if(this.tick >0){
            this.tickNow ++
            if(this.tickNow ==this.tick){
                this.tickNow = 0
                this.cur_next++
                if(this.cur_next >=this.max_next){
                    this.cur_next = 0
                    return true
                }
                this.sy = this.h * this.cur_next
                return false
            }
        }else{
            this.cur_next++
            if(this.cur_next >=this.max_next){
                this.cur_next = 0
                return true
            }
            this.sy = this.h * this.cur_next
            return false
        }
    }

    collideText(other){
        // 两圆心之间的距离
        // Math.sqrt(Math.pow(,2)+Math.pow(,2))
        return Math.sqrt(Math.pow(this.x-other.x,2)+Math.pow(this.y-other.y,2)) <(this.radii+other.radii)
    }
}

// 鱼类
class Fish extends Sprite{
    constructor(type,x=0,y=0,rot=0){
        if(type >5 || type<1){
            throw new Error("the type of fish is error")
        }else{
            const SIZE = [
                null,
                {w: 55,h: 37,r: 12},
                {w: 78,h: 64,r: 18},
                {w: 72,h: 56,r: 15},
                {w: 77,h: 59,r: 15},
                {w: 107,h: 122,r: 23}
            ]
            super(new DrawRect(img_g[`fish${type}`],0,0,SIZE[type].w,SIZE[type].h),x,y,rot)
            this.type = type
            this.max_next = 4
            this.speed = type
            this.tick = 10
            this.radii = SIZE[type].r
            this.isDeath = false
        }
    }

    draw(gd){
        if(this.rot ==-90){
            this.scaleY = -1
        }
        this.rot -= 90
        if(this.isDeath){
            this.sy+=4*this.h
        }
        super.draw(gd)
        if(this.isDeath){
            this.sy-=4*this.h
        }
        this.rot += 90
        if(this.rot ==-90){
            this.scaleY = 1
        }
    }
}

// 大炮类
class Cannon extends Sprite{
    constructor(type,x=0,y=0,rot=0){
        if(type >7 || type<1){
            throw new Error("the type of cannon is error")
        }else{
            const SIZE = [
                null,
                {w: 74,h: 74},
                {w: 74,h: 76},
                {w: 74,h: 76},
                {w: 74,h: 83},
                {w: 74,h: 85},
                {w: 74,h: 90},
                {w: 74,h: 94}
            ]

            super(new DrawRect(img_g[`cannon${type}`],0,0,SIZE[type].w,SIZE[type].h),x,y,rot)
            this.type = type
            this.SIZE = SIZE
            // this.setType(this.type)
            // this.cur_next = 1
            this.max_next = 5
        }
    }

    setType(type){
        this.type = type
        this.setDrawRect(new DrawRect(img_g[`cannon${type}`],0,0,this.SIZE[type].w,this.SIZE[type].h))
    }
}

// 炮弹类
class Bullet extends Sprite{
    constructor(type,x=0,y=0,rot=0){
        if(type >7 || type<1){
            throw new Error("the type of bullet is error")
        }else{
            const SIZE = [
                null,
                new DrawRect(img_g["bullet"],86,0,24,26),
                new DrawRect(img_g["bullet"],61,0,26,30),
                new DrawRect(img_g["bullet"],32,36,30,30),
                new DrawRect(img_g["bullet"],30,82,30,34),
                new DrawRect(img_g["bullet"],0,82,30,34),
                new DrawRect(img_g["bullet"],30,0,32,36),
                new DrawRect(img_g["bullet"],0,44,32,38)
            ]
            super(SIZE[type],x=0,y=0,rot=0)
            this.type = type
            this.speed = type * 2
            this.radii = 14
        }
    }
}

// 按钮类
class Button extends Sprite{
    constructor(drawRect_none,drawRect_active,x=0,y=0,rot=0){
        super(drawRect_none,x=0,y=0,rot=0)
        this.drawRect_none = drawRect_none
        this.drawRect_active = drawRect_active
        this.isAtMe = false
    }

    up(x,y){
        this.setDrawRect(this.drawRect_none)
        if(this.inRect(x,y) && this.isAtMe){
            // 触发点击
            this.onclick && this.onclick();
        }
    }

    down(x,y){
        if(this.inRect(x,y)){
            this.setDrawRect(this.drawRect_active)
            this.isAtMe = true
        }else{
            this.isAtMe = false
        }
    }
}

// 银币类
class Coin extends Sprite{
    constructor(x=0,y=0,rot=0){
        super(new DrawRect(img_g["coin"],0,0,60,60),x=0,y=0,rot=0)
        this.max_next = 10
        this.speed = 20
    }
}