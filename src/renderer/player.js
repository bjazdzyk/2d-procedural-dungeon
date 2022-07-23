import path from 'path'
import SimplexNoise from 'simplex-noise'

const simplex = new SimplexNoise()

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
}

const strCoords = (x, y)=>{
	return `${x}:${y}`
}


const hitWall = (w)=>{
	return w == 1 || w == 2 || w == 3

}

let animation

export class Player{
	constructor(src, x, y, width, height, dungeon){
		this.dungeon = dungeon
		
		this.x = x
		this.y = y

		this.cx = window.innerWidth/2
		this.cy = window.innerHeight/2

		this.width = width
		this.height = height

		this.prevX = x
		this.prevy = y

		this.img = new Image()
		this.img.src = url(src)

		this.previousAnimation = null
		this.currentAnimation = 'Idle'
		this.frameId = 0

		this.animations = {
			Idle:{
				cells:[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
				msPerFrame: 300,
			},
			Walk:{
				cells:[[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2]],
				msPerFrame: 100
			}
		}
		this.animationTimeStamp = Date.now()
		this.frame = [0, 0, 20, 20]
		this.frameSize = 20
	}

	move(dx, dy){

		const hs = this.width/2
		const tileSize = this.dungeon.tileSize

		const UL = [Math.floor(this.x+dx-hs/tileSize), Math.floor(this.y+dy-hs/tileSize)]
		const UR = [Math.floor(this.x+dx+hs/tileSize), Math.floor(this.y+dy-hs/tileSize)]
		const DR = [Math.floor(this.x+dx+hs/tileSize),  Math.floor(this.y+dy+hs/tileSize)]
		const DL = [Math.floor(this.x+dx-hs/tileSize), Math.floor(this.y+dy+hs/tileSize)]
		
		const walls = this.dungeon.walls

		let ULH, ULV, URH, URV, DRH, DRV, DLH, DLV

		if(walls[strCoords(UL[0], UL[1]+1)]){
				ULH = walls[strCoords(UL[0], UL[1]+1)].h
		}if(walls[strCoords(UL[0]+1, UL[1])]){
				ULV = walls[strCoords(UL[0]+1, UL[1])].v
		}


		if(walls[strCoords(UR[0], UR[1]+1)]){
			if(walls[strCoords(UR[0], UR[1]+1)].h){
				URH = walls[strCoords(UR[0], UR[1]+1)].h
			}
		}if(walls[strCoords(...UR)]){
			URV = walls[strCoords(...UR)].v
		}


		if(walls[strCoords(DL[0]+1, DL[1])]){
			if(walls[strCoords(DL[0]+1, DL[1])].v){
				DLV = walls[strCoords(DL[0]+1, DL[1])].v
			}
		}if(walls[strCoords(...DL)]){
			DLH = walls[strCoords(...DL)].h
		}


		if(walls[strCoords(...DR)]){
			DRH = walls[strCoords(...DR)].h
			DRV = walls[strCoords(...DR)].v
		}

		if((!(hitWall(URV) && hitWall(ULV)) && !(hitWall(DRV) && hitWall(DLV))) || (DR[0]==DL[0] && UR[0]==UL[0])){
			//suwak glitch
			if((!(hitWall(URH) && hitWall(DRH)) && !(hitWall(ULH) && hitWall(DLH))) || (UR[1]==DR[1] && UL[1]==DL[1])){
				this.x += dx
			}
		}

		if((!(hitWall(ULH) && hitWall(DLH)) && !(hitWall(URH) && hitWall(DRH))) || (DR[1]==UR[1] && DL[1]==UL[1])){

			if((!(hitWall(ULV) && hitWall(URV)) && !(hitWall(DLV) && hitWall(DRV))) || (DR[0]==DL[0] && UR[0]==UL[0])){
				this.y += dy
			}
		}

	}
	action(){

		const walls = this.dungeon.walls

		const C = [Math.floor(this.x), Math.floor(this.y)]

		let L, U, R, D

		if(walls[strCoords(...C)]){
			U = walls[strCoords(...C)].h
			L = walls[strCoords(...C)].v

			if(U == 2 || L == 2){
				let v = walls[strCoords(...C)].v
				let h = walls[strCoords(...C)].h
				this.dungeon.walls[strCoords(...C)].h = v
				this.dungeon.walls[strCoords(...C)].v = h
				
			}

		}

		if(walls[strCoords(C[0]+1, C[1])]){
			R = walls[strCoords(C[0]+1, C[1])].v

			if(R == 2){
				let v = walls[strCoords(C[0]+1, C[1])].v
				let h = walls[strCoords(C[0]+1, C[1])].h
				this.dungeon.walls[strCoords(C[0]+1, C[1])].h = v
				this.dungeon.walls[strCoords(C[0]+1, C[1])].v = h
			}
		}

		if(walls[strCoords(C[0], C[1]+1)]){
			D = walls[strCoords(C[0], C[1]+1)].h

			if(D == 2){
				let v = walls[strCoords(C[0], C[1]+1)].v
				let h = walls[strCoords(C[0], C[1]+1)].h
				this.dungeon.walls[strCoords(C[0], C[1]+1)].h = v
				this.dungeon.walls[strCoords(C[0], C[1]+1)].v = h
			}
		}


		//console.log(L, U, R, D)
	}

	draw(ctx, offX, offY){
		
		const _W = window.innerWidth
		const _H = window.innerHeight

		const drw = this.width*1.5
		const drh = this.width*1.5

		this.cx = _W/2 + offX*this.dungeon.tileSize
		this.cy = _H/2 + offY*this.dungeon.tileSize

		const x = this.cx - drw/2
		const y = this.cy - drh/2


		const flip = this.weapon.mx<this.cx


		if(this.prevX != this.x || this.prevY != this.y){
			this.prevX = this.x
			this.prevY = this.y
			this.currentAnimation = 'Walk'
		}else{
			this.currentAnimation = 'Idle'
		}
		if(this.currentAnimation != this.previousAnimation){

			this.previousAnimation = this.currentAnimation
			this.frameId = 0

			const fx = this.animations[this.currentAnimation].cells[this.frameId][0]*this.frameSize
			const fy = this.animations[this.currentAnimation].cells[this.frameId][1]*this.frameSize

			this.frame = [fx, fy, this.frameSize, this.frameSize]
		}

		if(Date.now()-this.animationTimeStamp >= this.animations[this.currentAnimation].msPerFrame){

			this.animationTimeStamp = Date.now()
			this.frameId = (this.frameId + 1)%this.animations[this.currentAnimation].cells.length

			const x = this.animations[this.currentAnimation].cells[this.frameId][0]*this.frameSize
			const y = this.animations[this.currentAnimation].cells[this.frameId][1]*this.frameSize

			this.frame = [x, y, this.frameSize, this.frameSize]
		}


		if(flip){
			ctx.translate(_W, 0)
			ctx.scale(-1, 1)
			ctx.translate(_W-this.cx, this.cy)
		}else{
			ctx.translate(this.cx, this.cy)
		}
		
		ctx.drawImage(this.img, ...this.frame, -drw/2, -drh/2, drw, drh)
		ctx.resetTransform()


		for(let i in this.weapon.bullets){
			const bx = this.cx + (this.weapon.bullets[i].x - this.x)*this.dungeon.tileSize
			const by = this.cy + (this.weapon.bullets[i].y - this.y)*this.dungeon.tileSize
			this.weapon.bullets[i].draw(ctx, bx, by)
		}


		this.weapon.draw(ctx, this.cx, this.cy+drh*0.05, drw*2)


		//circular gradient
		const s = simplex.noise2D(0, Date.now()/5000)*50 + simplex.noise2D(70, Date.now()/1000)*50

		var grd = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, 400 + s);
		grd.addColorStop(0.5, "rgba(0, 0, 0, 0.0)");
		grd.addColorStop(1, "rgba(0, 0, 0, 1.0)");

		// Fill with gradient
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, _W, _H);
	
	}

	attack(){
		

		this.weapon.shoot(this.x, this.y, this.cx, this.cy)
	}


}