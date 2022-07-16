const strCoords = (x, y)=>{
	return `${x}:${y}`
}

const mod = (n, m)=>{
	return ((n % m) + m) % m;
}

const screenView = (x, y, rangeX, rangeY, dungeon)=>{

	const tileSize = dungeon.tileSize

	const cellX = Math.floor(x)
	const cellY = Math.floor(y)

	


	const oX = (mod((x*tileSize), tileSize))*-1
	const oY = (mod((y*tileSize), tileSize))*-1


	const S = {
		grid:{},
		walls:{},
		offsetX:oX,
		offsetY:oY,
		rangeX:rangeX,
		rangeY:rangeY,
		tileSize:tileSize
	}

	rangeX = Math.ceil(rangeX/2)
	rangeY = Math.ceil(rangeY/2)

	let rx = 0
	let ry = 0

	const wallDict = {
		undefined:'empty',
		1:'wall',
		2:'door',
		3:'secret'
	}


	for(let i=cellX-rangeX; i<=cellX+rangeX+1; i++){
		ry = 0
		for(let j=cellY-rangeY; j<=cellY+rangeY+1; j++){
			//grid
			const c = dungeon.grid[strCoords(i, j)]

			let value

			if(c=='C'){
				value = 'corridor'
			}else if(c){
				const type = dungeon.roomTypes[c]

				if(type=='ghost'){
					value = 'block'
				}else if(type=='secret'){
					value = 'secretRoom'
				}else{
					value = type
				}

			}else{
				value = 'block'
			}

			S.grid[strCoords(rx, ry)] = value

			//walls
			const w = dungeon.walls[strCoords(i, j)]


			if(w){
				S.walls[strCoords(rx, ry)] = {
					h:wallDict[w.h],
					v:wallDict[w.v]
				}
			}



			ry++
		}
		rx++
	}


	return S
}

export {screenView}