import "./styles.css"
import Matter from 'matter-js'
import triangulate from 'delaunay-triangulate';
import {kruskal} from 'kruskal-mst'


const canvas = document.createElement('canvas')
canvas.setAttribute("id", 'c')
document.body.appendChild(canvas)

const ctx = canvas.getContext("2d")

let _W = window.innerWidth
let _H = window.innerHeight
canvas.width = _W
canvas.height = _H


const dungeonRenderingFactor = 0.45
const tileSize = 15 * dungeonRenderingFactor
const genFactor = 1 * dungeonRenderingFactor
const roomCount = 70



//grid

// const gridSize = 60

// ctx.strokeStyle = "gray"
// for(let i=-gridSize; i<=gridSize; i++){
// 	ctx.beginPath()

// 	ctx.moveTo(_W/2+i*tileSize, _H/2-gridSize*tileSize)
// 	ctx.lineTo(_W/2+i*tileSize, _H/2+gridSize*tileSize)

// 	ctx.moveTo(_W/2-gridSize*tileSize, _H/2+i*tileSize)
// 	ctx.lineTo(_W/2+gridSize*tileSize, _H/2+i*tileSize)

// 	ctx.closePath()
// 	ctx.stroke()
// }
// ctx.strokeStyle = "black"




const mod = (n, m)=>{
	return ((n % m) + m) % m;
}

const floorTo = (n, m)=>{
	return n-mod(n, m);

}


const strCoords = (x, y)=>{
	return `${x}:${y}`
}


const randPointInCircle = (radius)=>{
	const t = 2*Math.PI*Math.random()
	const u = Math.random()*Math.random()
	let r = null

	if(u>1){
		r = 2-u
	}else{
		r = u
	}

	return {x:radius*r*Math.cos(t), y:radius*r*Math.sin(t)}

}

const randRectInCircle = (radius, minW, maxW, minH, maxH)=>{
	const c = randPointInCircle(radius)
	const width = Math.random()*(maxW-minW)+minW
	const height = Math.random()*(maxH-minH)+minH

	const x = c.x-width/2
	const y = c.y-height/2

	return [x, y, width, height]
}


class Room{
	constructor(x, y, width, height, id){
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.id = id

		this.oldW = this.width
		this.oldH = this.height
		this.center = {}
		this.center.x = this.x+this.width/2
		this.center.y = this.y+this.height/2

		this.type = 'ghost'
	}
	updateCenter(){
		this.center.x = this.x+this.width/2
		this.center.y = this.y+this.height/2
	}
}


const generateRooms = (n)=>{
	const rooms = {}

	for(let i=0; i<n; i++){
		const rect = randRectInCircle(500*genFactor, 45*genFactor, 150*genFactor, 45*genFactor, 150*genFactor)
		
		rooms[i] = new Room(...rect, i)

	}
	return rooms
}

const roundToGrid = (rooms, tileSize)=>{
	const r = {}
	for(let i in rooms){
		
		const x2 = floorTo(rooms[i].x+rooms[i].width, tileSize)
		const y2 = floorTo(rooms[i].y+rooms[i].height, tileSize)

		const x = floorTo(rooms[i].x, tileSize)
		const y = floorTo(rooms[i].y, tileSize)


		r[i] = new Room(x, y, x2-x, y2-y, rooms[i].id)
		r[i].oldW = rooms[i].width
		r[i].oldH = rooms[i].height

	}
	return(r)
}

const separatedRooms = (n)=>{

	const rooms = generateRooms(n)

	var Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Bodies = Matter.Bodies,
		Composite = Matter.Composite

	var engine = Engine.create({
		enableSleeping: true
	});

	engine.world.gravity.y = 0
	engine.timing.timeScale = 0.5
	 
	var render = Render.create({
		element: document.body,
		engine: engine,
		options: {
			width: _W,
			height: _H,
			showAngleIndicator: true,
			wireframes: true
		}
	});

	const boxes = {}

	for(let i=0; i<n; i++){
		const r = rooms[i]
		boxes[i] = Bodies.rectangle(r.x, r.y, r.width, r.height)

		World.add(engine.world, [boxes[i]])
	}


	Render.lookAt(render, {min: { x: -_W/2, y: -_H/2 },max: { x: _W/2, y: _H/2 }});



	Matter.Runner.run(engine)
	//Render.run(render);

	return new Promise((resolve,reject)=>{
		let max_count = 10
		const int = window.setInterval(()=>{
			max_count--;
			if(max_count < 0){
				clearInterval(int)
				reject()
			}
			let bodies = Composite.allBodies(engine.world);
			let sleeping = bodies.filter((body) => body.isSleeping);
			let isWorldSleeping = bodies.length === sleeping.length;

			if(isWorldSleeping){
				let WHsum = 0
				for(let i=0; i<n; i++){
					const UL = boxes[i].vertices[3]//upLeft
					const DR = boxes[i].vertices[1]//downRight

					rooms[i].x = UL.x
					rooms[i].y = DR.y
					rooms[i].width = DR.x-UL.x
					rooms[i].height = Math.abs(DR.y-UL.y)
					

					WHsum += rooms[i].width+Math.abs(rooms[i].height)
				}
				clearInterval(int)
				resolve({rooms: roundToGrid(rooms, tileSize), averageWH:WHsum/n})
			}
		},500)
	})
}

const delunayTriangulation = (rooms)=>{

	const points = []
	const ids = []

	let j=0
	for(let i in rooms){
		rooms[i].updateCenter()

		ids.push(rooms[i].id)

		points.push([])
		points[j].push(rooms[i].center.x)
		points[j].push(rooms[i].center.y)
		j++
	}
	const triangles = triangulate(points)


	const graph = {}


	for(let t of triangles){
		for(let i=0; i<3; i++){

			if(!graph[t[i]]){
				graph[t[i]] = {}
			}
			const p1 = rooms[ids[t[i]]].center
			const p2 = rooms[ids[t[(i+1)%3]]].center
			const p3 = rooms[ids[t[(i+2)%3]]].center

			const dx1 = Math.abs(p1.x - p2.x)
			const dy1 = Math.abs(p1.y - p2.y)

			const dx2 = Math.abs(p1.x - p3.x)
			const dy2 = Math.abs(p1.y - p3.y)

			graph[t[i]][t[(i+1)%3]] = Math.sqrt(dx1*dx1 + dy1*dy1)
			graph[t[i]][t[(i+2)%3]] = Math.sqrt(dx2*dx2 + dy2*dy2)

		}
	}


	const idGraph = {}

	for(let i in graph){
		idGraph[ids[i]] = {}
		for(let j in graph[i]){
			idGraph[ids[i]][ids[j]] = graph[i][j]
		}
	}


	return idGraph
}


const kruskalMST = (graph)=>{

	const edges = []

	for(let i in graph){
		for(let j in graph[i]){
			if(j<i){
				const w = graph[i][j]
				edges.push({from:i, to:j, weight:w})
			}
		}
	}

	const mst = kruskal(edges)


	const newGraph = {}

	
	for(let e of edges){
		if(!mst.includes(e)){
			const r = Math.random()
			if(r>0.9){
				mst.push(e)
			}
		}
	}


	for(let e of mst){
		if(!newGraph[e.from]){
			newGraph[e.from] = {}
		}
		if(!newGraph[e.to]){
			newGraph[e.to] = {}
		}

		newGraph[e.from][e.to] = e.weight
		newGraph[e.to][e.from] = e.weight
	}




	return [newGraph, mst]
}



const dungeon = async (debugDraw = 0)=>{
	const d = await separatedRooms(roomCount)

	const rooms = d.rooms
	const av = d.averageWH

	const mainRooms = {}

	for(let i in rooms){
		const r = rooms[i]
		const s = r.oldW+Math.abs(r.oldH)

		if(s>1.2*av){
			rooms[i].type = 'main'
			mainRooms[i] = rooms[i]
			//ctx.fillStyle = "red"
		}//else{
		// 	ctx.fillStyle = "darkcyan"
		// }
		// ctx.strokeRect(r.x+_W/2, r.y+_H/2, r.width, r.height)
		// ctx.fillRect(r.x+_W/2, r.y+_H/2, r.width, r.height)
	}

	
	const dat = kruskalMST(delunayTriangulation(mainRooms))
	const graph = dat[0]
	const edges = dat[1]
	

	
	const dun = {
		minX:100,
		minY:100,
		maxX:-100,
		maxY:-100,
		grid:{},
		graph:graph,
		roomTypes:{},
		walls:{}
	}
	


	for(let r in rooms){
		const room = rooms[r]
		
		for(let i=room.x/tileSize; i<(room.x+room.width)/tileSize; i++){
			for(let j=room.y/tileSize; j<(room.y+room.height)/tileSize; j++){
				i = Math.round(i)
				j = Math.round(j)

				dun.minX = Math.min(dun.minX, i)
				dun.minY = Math.min(dun.minY, j)
				dun.maxX = Math.max(dun.maxX, i)
				dun.maxY = Math.max(dun.maxY, j)



				dun.grid[strCoords(i, j)] = r
				
			}
		}
	}
	
	const corridors = []

	for(let e of edges){

		const x1 = Math.round(rooms[e.from].x/tileSize)
		const w1 = Math.round(rooms[e.from].width/tileSize)
		const x2 = Math.round(rooms[e.to].x/tileSize)
		const w2 = Math.round(rooms[e.to].width/tileSize)

		const y1 = Math.round(rooms[e.from].y/tileSize)
		const h1 = Math.round(rooms[e.from].height/tileSize)
		const y2 = Math.round(rooms[e.to].y/tileSize)
		const h2 = Math.round(rooms[e.to].height/tileSize)

		const cx1 = Math.round(rooms[e.from].center.x/tileSize)
		const cy1 = Math.round(rooms[e.from].center.y/tileSize)
		const cx2 = Math.round(rooms[e.to].center.x/tileSize)
		const cy2 = Math.round(rooms[e.to].center.y/tileSize)

		const dx = Math.abs(cx1-cx2)
		const dy = Math.abs(cy1-cy2)


		if(x1+w1 >= x2+3 && x2+w2 >= x1+3){
			corridors.push([Math.max(x1, x2), Math.min(y1+h1, y2+h2), 3, Math.max(y1, y2)-Math.min(y1+h1, y2+h2)])


			if(!dun.walls[strCoords(Math.max(x1, x2)+1, Math.min(y1+h1, y2+h2))]){
				dun.walls[strCoords(Math.max(x1, x2)+1, Math.min(y1+h1, y2+h2))] = {}
			}if(!dun.walls[strCoords(Math.max(x1, x2)+1, Math.min(y1+h1, y2+h2) + Math.max(y1, y2)-Math.min(y1+h1, y2+h2))]){
				dun.walls[strCoords(Math.max(x1, x2)+1, Math.min(y1+h1, y2+h2) + Math.max(y1, y2)-Math.min(y1+h1, y2+h2))] = {}
			}
			dun.walls[strCoords(Math.max(x1, x2)+1, Math.min(y1+h1, y2+h2))].h = 2
			dun.walls[strCoords(Math.max(x1, x2)+1, Math.min(y1+h1, y2+h2) + Math.max(y1, y2)-Math.min(y1+h1, y2+h2))].h = 2


		}else if(y1+h1 >= y2+3 && y2+h2 >= y1+3){
			corridors.push([Math.min(x1+w1, x2+w2), Math.max(y1, y2), Math.max(x1, x2)-Math.min(x1+w1, x2+w2), 3])


			if(!dun.walls[strCoords(Math.min(x1+w1, x2+w2), Math.max(y1, y2)+1)]){
				dun.walls[strCoords(Math.min(x1+w1, x2+w2), Math.max(y1, y2)+1)] = {}
			}if(!dun.walls[strCoords(Math.min(x1+w1, x2+w2) + Math.max(x1, x2)-Math.min(x1+w1, x2+w2), Math.max(y1, y2)+1)]){
				dun.walls[strCoords(Math.min(x1+w1, x2+w2) + Math.max(x1, x2)-Math.min(x1+w1, x2+w2), Math.max(y1, y2)+1)] = {}
			}
			dun.walls[strCoords(Math.min(x1+w1, x2+w2), Math.max(y1, y2)+1)].v = 2
			dun.walls[strCoords(Math.min(x1+w1, x2+w2) + Math.max(x1, x2)-Math.min(x1+w1, x2+w2), Math.max(y1, y2)+1)].v = 2


		}else{
			corridors.push([Math.min(cx1, cx2)-1, Math.min(cy1, cy2)-2, dx, 3])
			corridors.push([Math.min(cx1, cx2)-1, Math.min(cy1, cy2)-2, 3, dy])
			corridors.push([Math.min(cx1, cx2)-1, Math.max(cy1, cy2)-2, dx+3, 3])
			corridors.push([Math.max(cx1, cx2)-1, Math.min(cy1, cy2)-2, 3, dy])

			let state

			if(cx1<cx2 && cy1<cy2){//1 UL
				if(!dun.walls[strCoords(cx1, y1+h1)]){
					dun.walls[strCoords(cx1, y1+h1)] = {}
				}if(!dun.walls[strCoords(x1+w1, cy1-1)]){
					dun.walls[strCoords(x1+w1, cy1-1)] = {}
				}if(!dun.walls[strCoords(cx2, y2)]){
					dun.walls[strCoords(cx2, y2)] = {}
				}if(!dun.walls[strCoords(x2, cy2-1)]){
					dun.walls[strCoords(x2, cy2-1)] = {}
				}

				dun.walls[strCoords(cx1, y1+h1)].h = 2
				dun.walls[strCoords(x1+w1, cy1-1)].v = 2
				dun.walls[strCoords(cx2, y2)].h = 2
				dun.walls[strCoords(x2, cy2-1)].v = 2

			}else if(cx1>=cx2 && cy1<cy2){//1 UR
				if(!dun.walls[strCoords(cx1, y1+h1)]){
					dun.walls[strCoords(cx1, y1+h1)] = {}
				}if(!dun.walls[strCoords(x2+w2, cy2-1)]){
					dun.walls[strCoords(x2+w2, cy2-1)] = {}
				}if(!dun.walls[strCoords(cx2, y2)]){
					dun.walls[strCoords(cx2, y2)] = {}
				}if(!dun.walls[strCoords(x1, cy1-1)]){
					dun.walls[strCoords(x1, cy1-1)] = {}
				}

				dun.walls[strCoords(cx1, y1+h1)].h = 2
				dun.walls[strCoords(x2+w2, cy2-1)].v = 2
				dun.walls[strCoords(cx2, y2)].h = 2
				dun.walls[strCoords(x1, cy1-1)].v = 2

			}else if(cx1>=cx2 && cy1>=cy1){//1 DR
				if(!dun.walls[strCoords(cx1, y1)]){
					dun.walls[strCoords(cx1, y1)] = {}
				}if(!dun.walls[strCoords(x2+w2, cy2-1)]){
					dun.walls[strCoords(x2+w2, cy2-1)] = {}
				}if(!dun.walls[strCoords(cx2, y2+h2)]){
					dun.walls[strCoords(cx2, y2+h2)] = {}
				}if(!dun.walls[strCoords(x1, cy1-1)]){
					dun.walls[strCoords(x1, cy1-1)] = {}
				}

				dun.walls[strCoords(cx1, y1)].h = 2
				dun.walls[strCoords(x2+w2, cy2-1)].v = 2
				dun.walls[strCoords(cx2, y2+h2)].h = 2
				dun.walls[strCoords(x1, cy1-1)].v = 2

			}else{//1 DL
				if(!dun.walls[strCoords(cx1, y1)]){
					dun.walls[strCoords(cx1, y1)] = {}
				}if(!dun.walls[strCoords(x2, cy2-1)]){
					dun.walls[strCoords(x2, cy2-1)] = {}
				}if(!dun.walls[strCoords(cx2, y2+h2)]){
					dun.walls[strCoords(cx2, y2+h2)] = {}
				}if(!dun.walls[strCoords(x1+w1, cy1-1)]){
					dun.walls[strCoords(x1+w1, cy1-1)] = {}
				}

				dun.walls[strCoords(cx1, y1)].h = 2
				dun.walls[strCoords(x2, cy2-1)].v = 2
				dun.walls[strCoords(cx2, y2+h2)].h = 2
				dun.walls[strCoords(x1+w1, cy1-1)].v = 2

			}



		}
	}

	

	for(let c of corridors){
		for(let i=c[0]; i<c[0]+c[2]; i++){
			for(let j=c[1]; j<c[1]+c[3]; j++){
				if(dun.grid[strCoords(i, j)]){

					if(rooms[dun.grid[strCoords(i, j)]]){
						if(rooms[dun.grid[strCoords(i, j)]].type == 'ghost'){
							rooms[dun.grid[strCoords(i, j)]].type = 'corridor'
						}
					}

				}else{
					dun.grid[strCoords(i, j)] = 'C'
				}
			}
		}
	}

	for(let i in rooms){
		const r = Math.random()
		
		if(rooms[i].type == 'ghost'){
			if(r>0.75){
				rooms[i].type = 'secret'
			}
		}
		dun.roomTypes[i] = rooms[i].type
	}


	for(let i=dun.minX; i<=dun.maxX+1; i++){
		for(let j=dun.minY; j<=dun.maxY+1; j++){
			const cell = dun.grid[strCoords(i, j)]
			const Ucell = dun.grid[strCoords(i, j-1)]
			const Lcell = dun.grid[strCoords(i-1, j)]

			let type
			let Utype
			let Ltype

			if(cell == 'C'){
				type = 'C'
			}else if(!cell){
				type = 'block'
			}else{
				type = rooms[cell].type
			}

			if(Ucell == 'C'){
				Utype = 'C'
			}else if(!Ucell){
				Utype = 'block'
			}else{
				Utype = rooms[Ucell].type
			}

			if(Lcell == 'C'){
				Ltype = 'C'
			}else if(!Lcell){
				Ltype = 'block'
			}else{
				Ltype = rooms[Lcell].type
			}

			if(!dun.walls[strCoords(i, j)]){
				dun.walls[strCoords(i, j)] = {}//vertical, horizontal
			}


			if(cell!=Ucell &&((type=='main'||Utype=='main')||
				(type=='block' || type=='ghost' || type=='secret') && (Utype!='ghost' && Utype!='block')||
				(type!='block' && type!='ghost') && (Utype=='ghost' || Utype=='block' || Utype=='secret'))){
				
				if(!dun.walls[strCoords(i, j)].h){
					dun.walls[strCoords(i, j)].h = 1
				}
			}

			if(cell!=Ucell &&(type=='secret'||Utype=='secret') &&
				((type!='block' && type!='ghost' && type!='secret') || (Utype!='ghost' && Utype!='block' && Utype!='secret'))){
				dun.walls[strCoords(i, j)].h = 3
			}





			if(cell!=Lcell &&(((type=='main'||Ltype=='main'))||
				(type=='block' || type=='ghost' || type=='secret') && (Ltype!='ghost' && Ltype!='block')||
				(type!='block' && type!='ghost') && (Ltype=='ghost' || Ltype=='block' || Ltype=='secret'))){
				if(!dun.walls[strCoords(i, j)].v){
					dun.walls[strCoords(i, j)].v = 1
				}
			}

			if(cell!=Lcell &&(type=='secret'||Ltype=='secret') &&
				((type!='block' && type!='ghost' && type!='secret') || (Ltype!='ghost' && Ltype!='block' && Ltype!='secret'))){
				dun.walls[strCoords(i, j)].v = 3
			}
			

		}
	}

	ctx.strokeStyle = "gray"
	ctx.lineWidth = 3

	//rendering
	if(debugDraw){
		for(let i=dun.minX; i<=dun.maxX+1; i++){
			for(let j=dun.minY; j<=dun.maxY+1; j++){
				if(dun.grid[strCoords(i, j)]){
					if(dun.grid[strCoords(i, j)] == 'C'){
						ctx.fillStyle = "cyan"
						ctx.fillRect(i*tileSize+_W/2, j*tileSize+_H/2, tileSize-1, tileSize-1 )
					}else if(rooms[dun.grid[strCoords(i, j)]].type == 'secret'){
						ctx.fillStyle = "lightgray"
						ctx.fillRect(i*tileSize+_W/2, j*tileSize+_H/2, tileSize-1, tileSize-1 )
					}else if(rooms[dun.grid[strCoords(i, j)]].type == 'main'){
						ctx.fillStyle = "green"
						ctx.fillRect(i*tileSize+_W/2, j*tileSize+_H/2, tileSize-1, tileSize-1 )
					}else if(rooms[dun.grid[strCoords(i, j)]].type == 'corridor'){
						ctx.fillStyle = "cyan"//skyblue
						ctx.fillRect(i*tileSize+_W/2, j*tileSize+_H/2, tileSize-1, tileSize-1 )
					}else if(rooms[dun.grid[strCoords(i, j)]].type == 'ghost'){
						ctx.fillStyle = "white"
					}else{
						ctx.fillStyle = "red"
						ctx.fillRect(i*tileSize+_W/2, j*tileSize+_H/2, tileSize-1, tileSize-1 )
					}

					
				}

				if(dun.walls[strCoords(i, j)]){
					if(dun.walls[strCoords(i, j)].h){
						if(dun.walls[strCoords(i, j)].h==2){
							ctx.strokeStyle = "black"
						}else if(dun.walls[strCoords(i, j)].h==3){
							ctx.strokeStyle = 'gray'
						}else{
							ctx.strokeStyle = "brown"
						}
						ctx.beginPath()
						ctx.moveTo(i*tileSize+_W/2, j*tileSize+_H/2)
						ctx.lineTo((i+1)*tileSize+_W/2, j*tileSize+_H/2)
						ctx.closePath()
						ctx.stroke()
					}
					if(dun.walls[strCoords(i, j)].v){
						if(dun.walls[strCoords(i, j)].v==2){
							ctx.strokeStyle = "black"
						}else if(dun.walls[strCoords(i, j)].v==3){
							ctx.strokeStyle = 'gray'
						}else{
							ctx.strokeStyle = "brown"
						}
						ctx.beginPath()
						ctx.moveTo(i*tileSize+_W/2, j*tileSize+_H/2)
						ctx.lineTo(i*tileSize+_W/2, (j+1)*tileSize+_H/2)
						ctx.closePath()
						ctx.stroke()
					}
				}
			}
		}


		// ctx.strokeStyle = "black"
		// ctx.lineWidth = 1
		
		// for(let i in graph){
		// 	for(let j in graph[i]){

		// 		ctx.beginPath()
		// 		ctx.moveTo(rooms[i].center.x+_W/2, rooms[i].center.y+_H/2)
		// 		ctx.lineTo(rooms[j].center.x+_W/2, rooms[j].center.y+_H/2)
		// 		ctx.closePath()

		// 		ctx.stroke()

		// 	}
		// }//
	}


	return dun

}


export default dungeon