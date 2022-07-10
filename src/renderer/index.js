import "./styles.css"
import Matter from'matter-js'

const canvas = document.createElement('canvas')
canvas.setAttribute("id", 'c')
document.body.appendChild(canvas)

const ctx = canvas.getContext("2d")

let _W = window.innerWidth
let _H = window.innerHeight
canvas.width = _W
canvas.height = _H



const randPointInCircle =(radius)=>{
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
	}
}


const generateRooms = (n)=>{

	const rooms = {}

	for(let i=0; i<n; i++){
		const rect = randRectInCircle(200, 10, 50, 10, 50)
		
		rooms[i] = new Room(...rect, i)

	}
	return rooms
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
				for(let i=0; i<n; i++){
					const UL = boxes[i].vertices[0]//upLeft
					const DR = boxes[i].vertices[2]//downRight

					rooms[i].x = UL.x
					rooms[i].y = DR.y
					rooms[i].width = DR.x-UL.x
					rooms[i].height = UL.y-DR.y
				}
				clearInterval(int)
				resolve(rooms)
			}
		},500)
	})
}


const loop = ()=>{
	requestAnimationFrame(loop)
	// _W = window.innerWidth
	// _H = window.innerHeight
	// canvas.width = _W
	// canvas.height = _H
}



(async ()=>{
	const rooms = await separatedRooms(100)

	for(let i in rooms){
		const r = rooms[i]
		console.log(r.x, r.y, r.width, r.height)
		ctx.strokeRect(r.x+_W/2, r.y+_H/2, r.width, r.height)
	}

})()




