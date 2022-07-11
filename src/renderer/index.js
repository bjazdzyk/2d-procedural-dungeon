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



const dungeonRenderingFactor = 0.5
const tileSize = 15 * dungeonRenderingFactor
const genFactor = 1 * dungeonRenderingFactor
const roomCount = 70



const mod = (n, m)=>{
	return ((n % m) + m) % m;
}

const floorTo = (n, m)=>{
	return n-mod(n, m);

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

		this.type = 'nope'
	}
	updateCenter(){
		this.center.x = this.x+this.width/2
		this.center.y = this.y+this.height/2
	}
}


const generateRooms = (n)=>{
	const rooms = {}

	for(let i=0; i<n; i++){
		const rect = randRectInCircle(500*genFactor, 15*genFactor, 100*genFactor, 15*genFactor, 100*genFactor)
		
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



	Engine.run(engine);	
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
					const UL = boxes[i].vertices[0]//upLeft
					const DR = boxes[i].vertices[2]//downRight

					rooms[i].x = UL.x
					rooms[i].y = DR.y
					rooms[i].width = DR.x-UL.x
					rooms[i].height = UL.y-DR.y

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


	return newGraph
}





const dungeon = async ()=>{
	const d = await separatedRooms(roomCount)

	const rooms = d.rooms
	const av = d.averageWH

	const mainRooms = {}

	for(let i in rooms){
		const r = rooms[i]
		const s = r.oldW+Math.abs(r.oldH)

		if(s>=1.25*av){
			rooms[i].type = 'main'
			mainRooms[i] = rooms[i]
			ctx.fillStyle = "red"
		}else{
			ctx.fillStyle = "darkcyan"
		}
		ctx.strokeRect(r.x+_W/2, r.y+_H/2, r.width, r.height)
		ctx.fillRect(r.x+_W/2, r.y+_H/2, r.width, r.height)
	}

	

	const graph = kruskalMST(delunayTriangulation(mainRooms))

	ctx.strokeStyle = "black"
	ctx.lineWidth = 1

	for(let i in graph){
		for(let j in graph[i]){

			ctx.beginPath()
			ctx.moveTo(rooms[i].center.x+_W/2, rooms[i].center.y+_H/2)
			ctx.lineTo(rooms[j].center.x+_W/2, rooms[j].center.y+_H/2)
			ctx.closePath()

			ctx.stroke()

		}
	}

}

dungeon()




