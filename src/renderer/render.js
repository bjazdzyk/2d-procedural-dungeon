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

	'wall':new Image()
}
imgMap['corridor'].src = url('/CorridorTile.png')
imgMap['main'].src = url('/MainTile.png')
imgMap['block'].src = url('/Block.png')
imgMap['secretRoom'].src = url('/SecretTile.png')

imgMap['wall'].src = url('/Wall.png')


const render = (screenView, ctx)=>{

	const tileSize = screenView.tileSize
	const oX = screenView.offsetX
	const oY = screenView.offsetY


	ctx.imageSmoothingEnabled = false;

	for(let i=0; i<=screenView.rangeX+1; i++){
		for(let j=0; j<=screenView.rangeY+1; j++){


			//grid
			ctx.drawImage(imgMap[screenView.grid[strCoords(i, j)]], i*tileSize+oX, j*tileSize+oY, tileSize, tileSize)


		}
	}
	for(let i=0; i<=screenView.rangeX+1; i++){
		for(let j=0; j<=screenView.rangeY+1; j++){


			//walls
			const w = screenView.walls[strCoords(i, j)]
			if(w){
				if(w.h == 'wall'){
					ctx.drawImage(imgMap[w.h], i*tileSize -tileSize/2 +oX, j*tileSize -tileSize/2 +oY, tileSize*2, tileSize)
				}
				if(w.v == 'wall'){
					ctx.translate(i*tileSize+oX, j*tileSize+oY)
					ctx.rotate(90 * Math.PI / 180);
					ctx.translate(-(i*tileSize+oX), -(j*tileSize+oY))

					ctx.drawImage(imgMap[w.v], i*tileSize -tileSize/2 +oX, j*tileSize -tileSize/2 +oY, tileSize*2, tileSize)

					ctx.translate(i*tileSize+oX, j*tileSize+oY)
					ctx.rotate(-90 * Math.PI / 180);
					ctx.translate(-(i*tileSize+oX), -(j*tileSize+oY))
				}
			}
		}
	}



}


export {render}