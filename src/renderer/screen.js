const strCoords = (x, y)=>{
	return `${x}:${y}`
}


const rendered = (x, y, rangeX, rangeY, tileSize, dungeon)=>{

	const cellX = Math.floor(x)
	const cellY = Math.floor(y)


	const oX = (x%tileSize)*-1
	const oY = (y%tileSize)*-1


	const S = {
		grid:{},
		walls:{},
		offsetX:oX,
		offsetY:oY,
	}

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
				}else if(type=='main'){
					value = 'main'
				}else{
					value = 'corridor'
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

export {rendered}