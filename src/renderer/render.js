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
}
imgMap['corridor'].src = url('/CorridorTile.png')
imgMap['main'].src = url('/MainTile.png')
imgMap['block'].src = url('/Block.png')
imgMap['secretRoom'].src = url('/SecretTile.png')

imgMap['wall'].src = url('/Wall.png')
imgMap['secretWall'].src = url('/Wall.png')


const render = (screenView, ctx)=>{

	const tileSize = screenView.tileSize
	const oX = screenView.offsetX
	const oY = screenView.offsetY
	const soX = window.innerWidth/2 % screenView.tileSize
	const soY = window.innerHeight/2 % screenView.tileSize


	ctx.imageSmoothingEnabled = false;

	for(let i=0; i<=screenView.rangeX+2; i++){
		for(let j=0; j<=screenView.rangeY+2; j++){


			//grid
			ctx.drawImage(imgMap[screenView.grid[strCoords(i, j)]], i*tileSize+oX+soX-tileSize, j*tileSize+oY+soY-tileSize, tileSize, tileSize)


		}
	}
	for(let i=0; i<=screenView.rangeX+2; i++){
		for(let j=0; j<=screenView.rangeY+2; j++){


			//walls
			const w = screenView.walls[strCoords(i, j)]
			if(w){

				let key = {}
				
				
				if(w.h == 'secret'){

					key.h = 'secretWall'

				}else if(w.h == 'wall'){
					key.h = w.h

				}

				if(w.v == 'secret'){
					key.v = 'secretWall'

				}else if(w.v == 'wall'){
					key.v = w.v

				}


				if(key.h){
					ctx.drawImage(imgMap[key.h], i*tileSize -tileSize/2 +oX+soX-tileSize, j*tileSize -tileSize/2 +oY+soY-tileSize, tileSize*2, tileSize)
				}
				if(key.v){
					ctx.translate(i*tileSize+oX+soX-tileSize, j*tileSize+oY+soY-tileSize)
					ctx.rotate(90 * Math.PI / 180);
					ctx.translate(-(i*tileSize+oX+soX-tileSize), -(j*tileSize+oY+soY-tileSize))

					ctx.drawImage(imgMap[key.v], i*tileSize -tileSize/2 +oX+soX-tileSize, j*tileSize -tileSize/2 +oY+soY-tileSize, tileSize*2, tileSize)

					ctx.translate(i*tileSize+oX+soX-tileSize, j*tileSize+oY+soY-tileSize)
					ctx.rotate(-90 * Math.PI / 180);
					ctx.translate(-(i*tileSize+oX+soX-tileSize), -(j*tileSize+oY+soY-tileSize))
				}
			}
		}
	}



}


export {render}