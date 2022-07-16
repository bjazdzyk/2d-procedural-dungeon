import Dungeon from './dungeon.js'
import {screenView} from './screen.js'
import {render} from './render.js'
import {Player} from './player.js'


//const
const tileSize = 50
const playerSize = 25
const playerSpeed = 0.05
///

//global
let dungeon
let _W, _H
let renDistX
let renDistY
let keys = {}

let player



const canvas = document.createElement('canvas')
canvas.setAttribute('id', 'mainCanvas')
document.body.appendChild(canvas)

const ctx = canvas.getContext('2d')


const resize = ()=>{
	_W = window.innerWidth
	_H = window.innerHeight

	renDistX = _W/tileSize
	renDistY = _H/tileSize

	canvas.width = _W
	canvas.height = _H
	
}





const loop = ()=>{
	requestAnimationFrame(loop)

	resize()


	if(keys['KeyW']){
		player.move(0, -playerSpeed)
	}
	if(keys['KeyS']){
		player.move(0, playerSpeed)
	}
	if(keys['KeyA']){
		player.move(-playerSpeed, 0)
	}
	if(keys['KeyD']){
		player.move(playerSpeed, 0)
	}

	const view = screenView(player.x, player.y, renDistX, renDistY, dungeon)
	render(view, ctx)

	player.draw(ctx)
}




window.onload = ()=>{

	console.log("LOADING LEVEL")

	Dungeon().then((res)=>{

		dungeon = res
		dungeon.tileSize = tileSize

		const x = dungeon.startX
		const y = dungeon.startY

		player = new Player('/player.png', x, y, playerSize, playerSize, dungeon)

		loop()
	})
}






window.addEventListener('keydown', (e)=>{
	keys[e.code] = true
})
window.addEventListener('keyup', (e)=>{
	keys[e.code] = null
})