import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
}


const particleMeta = {
	fire:{
		type:"fire",
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

			const frame = this.animation[this.frameId]

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
	constructor(player, throwRate, type, size, maxParticles = 100){
		this.maxParticles = maxParticles
		this.player = player
		this.throwRate = throwRate
		this.type = type
		this.size = size

		this.x = 0
		this.y = 0
		this.vx = 0
		this.vy = 0


		this.particleCount = 0
		this.particles = {}

		this.throwing = false
		this.dead = false

		this.throwTimeStamp = Date.now()

	}
	startThrowing(x, y, vx, vy){
		this.x = x
		this.y = y
		this.vx = vx
		this.vy = vy

		this.throwing = true


	}

	draw(ctx){
		if(this.throwing){
			if(Date.now()-this.throwTimeStamp >= this.throwRate){
				this.throwTimeStamp = Date.now()

				this.particles[this.particleCount] = new Particle("fire", this.size)
				this.particles[this.particleCount].throw(this.x, this.y, 0, 0)

				this.particleCount ++
				if(this.particleCount > this.maxParticles){
					this.throwing = false
				}

			}
			this.x+=this.vx
			this.y+=this.vy

		}
		//console.log(this.particles)

		for(let i in this.particles){
			if(this.particles[i].dead){
				delete(this.particles[i])
			}else{

				this.particles[i].draw(ctx, this.player.cx, this.player.cy, this.player.x, this.player.y, this.player.dungeon.tileSize)
			}
		}

		if(this.particles.length < 1){
			this.dead = true
		}





	}

}

class ParticleSystem{
	constructor(player){
		this.player = player

		this.particleCount = 0
		this.particles = {}

		this.emiterCount = 0
		this.emiters = {}

		
	}
	newParticle(x, y, vx, vy, ax=0, ay=0){
		this.particles[this.particleCount] = new Particle('fire', 75)
		this.particles[this.particleCount].throw(x, y, vx, vy, ax, ay)
		this.particleCount ++
	}
	newEmiter(x, y, vx, vy){

		this.emiters[this.emiterCount] = new Emiter(this.player, 2, 'type', 25, 1)
		this.emiters[this.emiterCount].startThrowing(x, y, vx, vy)
		this.emiterCount ++


	}

	drawParticles(ctx){
		for(let i in this.particles){
			if(this.particles[i].dead){
				delete(this.particles[i])
			}else{
				this.particles[i].draw(ctx, this.player.cx, this.player.cy, this.player.x, this.player.y, this.player.dungeon.tileSize)
			}
		}

		for(let i in this.emiters){
			if(this.emiters[i].dead){
				delete(this.emiters[i])
			}else{
				this.emiters[i].draw(ctx)
			}
		}
	}
}

export {ParticleSystem}