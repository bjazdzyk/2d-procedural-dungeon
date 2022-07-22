import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
}


const particleMeta = {
	fire:{
		type:'fire',
		img: new Image(),
		cellSize: 20,
		animationCount: 1,
		animations:{
			0:[[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]
		},
		msPerFrame: 50

	}
}
particleMeta.fire.img.src = url('/ExploParticle.png')



class Particle{
	constructor(type, size){
		this.meta = particleMeta[type]
		this.size = size

		this.x = 0
		this.y = 0
		this.vx = 0
		this.vy = 0
		this.ax = 0
		this.ay = 0

		this.visible = false

		this.frameId = 0
		this.frameTimeStamp = Date.now()
		this.animationId = 0
		this.animation = []

	}

	throw(x, y, vx, vy, ax=0, ay=0){
		this.frameTimeStamp = Date.now()
		this.frameId = 0

		this.x = x 
		this.y = y 
		this.vx = vx
		this.vy = vy
		this.ax = ax
		this.ay = ay

		this.visible = true

		this.animationId = Math.floor(Math.random()*this.meta.animationCount)
		this.animation = this.meta.animations[this.animationId]

		this.dead = false

	}

	draw(ctx, cx, cy, x, y, tileSize){
		if(this.visible && !this.dead){
			const dx = this.x - x
			const dy = this.y - y

			const X = cx + dx*tileSize - this.size/2
			const Y = cy + dy*tileSize - this.size/2

			const frame =this.animation[this.frameId]

			const cellX = frame[0]*this.meta.cellSize
			const cellY = frame[1]*this.meta.cellSize
			const cellSize = this.meta.cellSize

			ctx.drawImage(this.meta.img, cellX, cellY, cellSize, cellSize, X, Y, this.size, this.size)
			

		}

		if(Date.now()-this.frameTimeStamp >= this.meta.msPerFrame){
			this.frameTimeStamp = Date.now()
			this.frameId ++

			if(this.frameId>=this.animation.length){
				this.dead = true
			}


		}
	}
}

class Emiter{
	constructor(){

	}

}

class ParticleSystem{
	constructor(player){
		this.player = player

		this.particleCount = 0
		this.particles = {}

		
	}
	newParticle(x, y, vx, vy, ax=0, ay=0){
		this.particles[this.particleCount] = new Particle('fire', 75)
		this.particles[this.particleCount].throw(x, y, vx, vy, ax, ay)
		this.particleCount ++
	}

	drawParticles(ctx){
		for(let i in this.particles){
			if(this.particles[i].dead){
				delete(this.particles[i])
			}else{
				this.particles[i].draw(ctx, this.player.cx, this.player.cy, this.player.x, this.player.y, this.player.dungeon.tileSize)
			}
		}
	}
}

export {ParticleSystem}