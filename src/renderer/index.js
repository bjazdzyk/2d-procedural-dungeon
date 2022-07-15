import Dungeon from './dungeon.js'
import {screenView} from './screen.js'
import {render} from './render.js'


//const
const tileSize = 56//


//global
let dungeon
let _W, _H
let renDistX
let renDistY

let x, y



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

	const view = screenView(x, y, renDistX, renDistY, tileSize, dungeon)

	render(view, ctx)
}


window.onload = ()=>{

	Dungeon().then((res)=>{

		dungeon = res
		x = dungeon.startX
		y = dungeon.startY
		console.log(x, y)

		loop()
	})
}