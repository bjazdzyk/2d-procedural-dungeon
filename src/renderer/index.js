import Dungeon from './dungeon.js'
import {screenView} from './screen.js'
import {render} from './render.js'
import {Player} from './player.js'


//const
const tileSize = 56
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


	if(keys['ArrowUp']){
		player.move(0, -playerSpeed)
	}
	if(keys['ArrowDown']){
		player.move(0, playerSpeed)
	}
	if(keys['ArrowLeft']){
		player.move(-playerSpeed, 0)
	}
	if(keys['ArrowRight']){
		player.move(playerSpeed, 0)
	}

	const view = screenView(player.x, player.y, renDistX, renDistY, tileSize, dungeon)
	render(view, ctx)
}



//
window.onload = ()=>{

	Dungeon().then((res)=>{

		dungeon = res
		const x = dungeon.startX
		const y = dungeon.startY

		player = new Player(dungeon, x, y)

		loop()
	})
}






window.addEventListener('keydown', (e)=>{
	keys[e.code] = true
})
window.addEventListener('keyup', (e)=>{
	keys[e.code] = null
})