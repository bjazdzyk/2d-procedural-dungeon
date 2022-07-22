import Dungeon from './dungeon.js'
import {screenView} from './screen.js'
import {Camera} from './render.js'
import {Player} from './player.js'
import {Gun, Bullet} from './guns.js'
import {ParticleSystem} from './particles.js'


//const
const tileSize = 70
const playerSize = 30
const playerSpeed = 0.06
///

//global
let dungeon
let _W, _H
let renDistX
let renDistY
let keys = {}
let lockKey = {}

let player
let camera

let mouseKeys = [false, false, false]




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

	if(mouseKeys[0]){
		player.attack()
		player.weapon.firstClick = false
	}else{
		player.weapon.firstClick = true
	}



	const view = screenView(camera.x, camera.y, renDistX, renDistY, player)
	camera.render(view, player)
}




window.onload = ()=>{

	console.log("---------------LOADING LEVEL---------------")


	Dungeon().then((res)=>{

		dungeon = res
		dungeon.tileSize = tileSize

		const x = dungeon.startX
		const y = dungeon.startY


		player = new Player('/player.png', x, y, playerSize, playerSize, dungeon)
		player.weapon = new Gun('colt', player)

		player.particleSystem = new ParticleSystem(player)
		player.particleSystem.newParticle()



		camera = new Camera(ctx)






		window.addEventListener('keydown', (e)=>{
			keys[e.code] = true



			if(e.code == 'KeyF' && !lockKey['KeyF']){
				
				player.action()

				lockKey['KeyF'] = true
			}
		})
		window.addEventListener('keyup', (e)=>{
			delete(keys[e.code])
			lockKey[e.code] = false
		})



		window.addEventListener('mousedown', (e)=>{
			mouseKeys[e.button] = true
		})
		window.addEventListener('mouseup', (e)=>{
			mouseKeys[e.button] = false
		})

		window.addEventListener('mousemove', (e)=>{
			player.weapon.mx = e.x
			player.weapon.my = e.y
		})





		loop()
	})
}