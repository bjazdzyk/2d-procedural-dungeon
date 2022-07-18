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


export class Player{
	constructor(src, x, y, width, height, dungeon){
		this.dungeon = dungeon
		
		this.x = x
		this.y = y
		this.width = width
		this.height = height

		this.img = new Image()
		this.img.src = url(src)
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

			this.x += dx
		}else{
			//console.log('x', UL[0], UR[0], DR[0], DL[0])
		}

		if((!(hitWall(ULH) && hitWall(DLH)) && !(hitWall(URH) && hitWall(DRH))) || (DR[1]==UR[1] && DL[1]==UL[1])){

			this.y += dy
		}else{
			//console.log('y', UL[1], UR[1], DR[1], DL[1])
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

		const cx = _W/2 + offX*this.dungeon.tileSize
		const cy = _H/2 + offY*this.dungeon.tileSize

		const x = cx - this.width/2
		const y = cy - this.height/2

		ctx.drawImage(this.img, x, y, this.width, this.height)


		//circular gradient
		const s = simplex.noise2D(0, Date.now()/5000)*50 + simplex.noise2D(70, Date.now()/1000)*50

		var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400 + s);
		grd.addColorStop(0.5, "rgba(10, 10, 20, 0.0)");
		grd.addColorStop(1, "rgba(10, 10, 20, 1.0)");

		// Fill with gradient
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, _W, _H);
	
	}


}