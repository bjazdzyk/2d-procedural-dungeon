import path from 'path'

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



		if(!(URV==1 && ULV==1) && 
			!(DRV==1 && DLV==1)){

			this.x += dx

		}

		if(!(ULH==1 && DLH==1) && 
			!(URH==1 && DRH==1)){

			this.y += dy

		}
	}

	draw(ctx){
		const _W = window.innerWidth
		const _H = window.innerHeight

		const x = (_W-this.width)/2
		const y = (_H-this.height)/2

		ctx.drawImage(this.img, x, y, this.width, this.height)
	}


}