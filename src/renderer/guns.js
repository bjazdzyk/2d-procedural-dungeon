import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const url = (src)=>{
	const reto = isDevelopment ? path.resolve(__static,`${src}`) : path.join(__static, `${src}`)
	return reto
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
		fireRate: 300,
		type: 'auto',
		accuracy: Math.PI/4,
		bulletsPerShot: 1,
		bulletInfo: ['round', 6, 0.35, {}],
		imgSrc: url('/Colt.png')
	}
}


class Gun{
	constructor(name){
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
		//
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


		for(let i in this.bullets){
			this.bullets[i].update()
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