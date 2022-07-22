import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
}

const strCoords = (x, y)=>{
	return `${x}:${y}`
}

const mod = (n, m)=>{
	return ((n % m) + m) % m;
}
const intersects = (a,b,c,d,p,q,r,s)=>{
	var det, gamma, lambda
	det = (c - a) * (s - q) - (r - p) * (d - b)
	if (det === 0) {
		return false
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
	}
}

class Bullet{
	constructor(type, size, speed, uniqueArgs){
		this.type = type
		this.size = size
		this.speed = speed
		this.uniqueArgs = uniqueArgs

		this.x = 0
		this.y = 0
		this.vx = 0
		this.vy = 0
	}

	throw(x, y, mx, my){
		const dx = mx - x
		const dy = my - y

		this.vx = dx/Math.sqrt(dx*dx + dy*dy) * this.speed
		this.vy = dy/Math.sqrt(dx*dx + dy*dy) * this.speed

	}
	update(){
		this.x += this.vx
		this.y += this.vy
	}
	draw(ctx, x, y){
		if(this.type == 'round'){
			ctx.beginPath()
			ctx.arc(x, y, this.size, 0, Math.PI*2)
			ctx.closePath()

			ctx.fillStyle = 'black'
			ctx.fill()
		}
	}


}


const metaDataMap = {
	colt:{
		fireRate: 400,
		type: 'auto',
		accuracy: Math.PI/4,
		bulletsPerShot: 1,
		bulletInfo: ['round', 5, 0.3, {}],
		imgSrc: url('/Colt.png')
	}
}


class Gun{
	constructor(name, player){
		this.player = player
		this.setWeapon(name)

		this.mx = 0
		this.my = 0

		this.shotTimeStamp = 0

		this.bulletsThrown = 0
		this.bullets = {}

		this.firstClick = true


	}

	setWeapon(name){
		this.name = name
		this.metaData = metaDataMap[this.name]

		this.img = new Image()
		this.img.src = this.metaData.imgSrc
	}

	draw(ctx, x, y, size){
		const dx = this.mx - x
		const dy = this.my - y

		let a = Math.atan(dy/dx)*180/Math.PI
		
		
		
		const hs = size/2 *0.7
		const _W = window.innerWidth
		const _H = window.innerHeight


		if(dx<0){
			ctx.translate(_W, 0)
			ctx.scale(-1, 1)
			ctx.translate(_W-x, y)
			ctx.rotate(-1 * a * Math.PI / 180);
		}else{
			ctx.translate(x, y)
			ctx.rotate(a * Math.PI / 180);
		}
		
		

		ctx.drawImage(this.img, -hs, -hs, hs*2, hs*2)

		ctx.resetTransform()


		const walls = this.player.dungeon.walls

		for(let i in this.bullets){
			this.bullets[i].update()

			const cellX = Math.floor(this.bullets[i].x)
			const cellY = Math.floor(this.bullets[i].y)

			const W = [walls[strCoords(cellX, cellY)] ? walls[strCoords(cellX, cellY)].v : null,
				walls[strCoords(cellX, cellY)] ? walls[strCoords(cellX, cellY)].h : null,
				walls[strCoords(cellX+1, cellY)] ? walls[strCoords(cellX+1, cellY)].v: null,
				walls[strCoords(cellX, cellY+1)] ? walls[strCoords(cellX, cellY+1)].h : null]

			const P = [[cellX, cellY, cellX, cellY+1],
				[cellX, cellY, cellX+1, cellY],
				[cellX+1, cellY, cellX+1, cellY+1],
				[cellX, cellY+1, cellX+1, cellY+1]]

			const b = this.bullets[i]

			for(let j in W){
				if(W[j]){
					if(intersects(...P[j], b.x, b.y, b.x+b.vx, b.y+b.vy)){
						delete(this.bullets[i])
					}
				}
			}
			
		}


	}
	shoot(x, y, cx, cy){

		if(this.metaData.type == 'semi-auto'){

			if(this.firstClick){
				
					this.bulletsThrown += 1

					this.bullets[this.bulletsThrown] = new Bullet(...this.metaData.bulletInfo)
					this.bullets[this.bulletsThrown].x = x
					this.bullets[this.bulletsThrown].y = y
					this.bullets[this.bulletsThrown].throw(cx, cy, this.mx, this.my)


			}
		}
		if(this.metaData.type == 'auto'){
			if(Date.now()-this.shotTimeStamp >= this.metaData.fireRate){
				this.shotTimeStamp = Date.now()

				this.bulletsThrown += 1

				this.bullets[this.bulletsThrown] = new Bullet(...this.metaData.bulletInfo)
				this.bullets[this.bulletsThrown].x = x
				this.bullets[this.bulletsThrown].y = y
				this.bullets[this.bulletsThrown].throw(cx, cy, this.mx, this.my)
			}
		}
		

	}
}


export {Gun, Bullet}