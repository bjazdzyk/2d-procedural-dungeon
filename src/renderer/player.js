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



		if((!(URV==1 && ULV==1) && !(DRV==1 && DLV==1)) || (DR[0]==DL[0] && UR[0]==UL[0])){

			this.x += dx

		}else{
			//console.log('x', UL[0], UR[0], DR[0], DL[0])
		}

		if((!(ULH==1 && DLH==1) && !(URH==1 && DRH==1)) || (DR[1]==UR[1] && DL[1]==UL[1])){

			this.y += dy

		}else{
			//console.log('y', UL[1], UR[1], DR[1], DL[1])
		}

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

		var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 500 + s);
		grd.addColorStop(0.5, "rgba(0, 0, 0, 0.0)");
		grd.addColorStop(1, "rgba(0, 0, 0, 1.0)");

		// Fill with gradient
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, _W, _H);
	
	}


}