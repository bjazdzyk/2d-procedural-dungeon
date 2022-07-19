import path from 'path'


const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto

}

const strCoords = (x, y)=>{
	return `${x}:${y}`
}



const urlMap = {
	'corridor':url('/CorridorTile.png'),
	'main':url('/MainTile.png'),
	'block':url('/Block.png')
}

const imgMap = {
	'corridor':new Image(),
	'main':new Image(),
	'block':new Image(),
	'secretRoom':new Image(),

	'wall':new Image(),
	'secretWall':new Image(),
	'door':new Image()
}
imgMap['corridor'].src = url('/CorridorTile.png')
imgMap['main'].src = url('/MainTile.png')
imgMap['block'].src = url('/Block.png')
imgMap['secretRoom'].src = url('/SecretTile.png')

imgMap['wall'].src = url('/Wall.png')
imgMap['secretWall'].src = url('/Wall.png')
imgMap['door'].src = url('/Door.png')//

export class Camera{
	constructor(ctx){
		this.ctx = ctx

		this.x
		this.y

		this.cameraOffX = 0
		this.cameraOffY = 0

	}
	render(screenView, player){

		const ctx = this.ctx


		if(!this.x){
			this.x = player.x
			this.cameraOffX = 0
		}else{
			this.cameraOffX = player.x-this.x

			this.x+=this.cameraOffX*0.05
		}


		if(!this.y){
			this.y = player.y
			this.cameraOffY = 0
		}else{
			this.cameraOffY = player.y-this.y

			this.y+=this.cameraOffY*0.05
		}


		const tileSize = screenView.tileSize
		const oX = screenView.offsetX
		const oY = screenView.offsetY
		const soX = window.innerWidth/2 % screenView.tileSize
		const soY = window.innerHeight/2 % screenView.tileSize

		const _W = window.innerWidth
		const _H = window.innerHeight

		const offsetX = oX+soX-tileSize
		const offsetY = oY+soY-tileSize

		ctx.imageSmoothingEnabled = false;


		//grid
		for(let i=0; i<=screenView.rangeX+2; i++){
			for(let j=0; j<=screenView.rangeY+2; j++){

				if(screenView.grid[strCoords(i, j)]){
					ctx.drawImage(imgMap[screenView.grid[strCoords(i, j)]], i*tileSize+offsetX, j*tileSize+offsetY, tileSize, tileSize)
				}


			}
		}

		//walls
		for(let i=0; i<=screenView.rangeX+2; i++){
			for(let j=0; j<=screenView.rangeY+2; j++){


				const w = screenView.walls[strCoords(i, j)]
				if(w){

					let key = {}
					
					
					if(w.h == 'secret'){

						key.h = 'secretWall'

					}else if(w.h == 'wall' || w.h == 'door'){
						key.h = w.h

					}

					if(w.v == 'secret'){
						key.v = 'secretWall'

					}else if(w.v == 'wall' || w.v == 'door'){
						key.v = w.v

					}



					if(key.h){
						ctx.drawImage(imgMap[key.h], i*tileSize -tileSize/2 +offsetX, j*tileSize -tileSize/2 +offsetY, tileSize*2, tileSize)
					}
					if(key.v){
						ctx.translate(i*tileSize+offsetX, j*tileSize+offsetY)
						ctx.rotate(90 * Math.PI / 180);
						ctx.translate(-(i*tileSize+offsetX), -(j*tileSize+offsetY))

						ctx.drawImage(imgMap[key.v], i*tileSize -tileSize/2 +offsetX, j*tileSize -tileSize/2 +offsetY, tileSize*2, tileSize)

						ctx.translate(i*tileSize+offsetX, j*tileSize+offsetY)
						ctx.rotate(-90 * Math.PI / 180);
						ctx.translate(-(i*tileSize+offsetX), -(j*tileSize+offsetY))
					}
				}
			}
		}

		const cx = _W/2 + this.cameraOffX*tileSize
		const cy = _H/2 + this.cameraOffY*tileSize

		const shadowColor = "rgba(10, 10, 20, 1.0)"

		//shadows
		for(let i=0; i<=screenView.rangeX+2; i++){
			for(let j=0; j<=screenView.rangeY+2; j++){


				const w = screenView.walls[strCoords(i, j)]
				if(w){

					if(w.h == 'wall' || w.h == 'door' ||w.h == 'secret'){
						ctx.fillStyle = shadowColor
						ctx.strokeStyle = shadowColor
						ctx.lineWidth = 1

						const dx1 = cx - (i*tileSize+offsetX)
						const dx2 = cx - ((i+1)*tileSize+offsetX)
						const dy  = cy - (j*tileSize+offsetY)

						ctx.beginPath()
						ctx.moveTo(cx-dx1*1000, cy-dy*1000)
						ctx.lineTo(cx-dx1, cy-dy)
						ctx.lineTo(cx-dx2, cy-dy)
						ctx.lineTo(cx-dx2*1000, cy-dy*1000)
						ctx.closePath()

						ctx.stroke()
						ctx.fill()

					}
					if(w.v == 'wall' || w.v == 'door' ||w.v == 'secret'){
						ctx.fillStyle = shadowColor
						ctx.strokeStyle = shadowColor
						ctx.lineWidth = 1

						const dx  = cx - (i*tileSize+offsetX)
						const dy1 = cy - (j*tileSize+offsetY)
						const dy2 = cy - ((j+1)*tileSize+offsetY)

						ctx.beginPath()
						ctx.moveTo(cx-dx*1000, cy-dy1*1000)
						ctx.lineTo(cx-dx, cy-dy1)
						ctx.lineTo(cx-dx, cy-dy2)
						ctx.lineTo(cx-dx*1000, cy-dy2*1000)
						ctx.closePath()

						ctx.stroke()
						ctx.fill()

					}
				}
			}
		}


		player.draw(ctx, this.cameraOffX, this.cameraOffY)





	}
}

