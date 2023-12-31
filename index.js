console.log(gsap)

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player 
{
    constructor(x, y, radius, color) 
    {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    Draw()
    {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, 
            Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile 
{
    constructor(x, y, radius, color, velocity) 
    {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    Draw()
    {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, 
            Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }

    Update() 
    {
        this.Draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy 
{
    constructor(x, y, radius, color, velocity) 
    {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    Draw()
    {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, 
            Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }

    Update() 
    {
        this.Draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle 
{
    constructor(x, y, radius, color, velocity) 
    {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    Draw()
    {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, 
            Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    Update() 
    {
        this.Draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const CANVAS_MIDDLE_WIDTH = canvas.width / 2
const CANVAS_MIDDLE_HEIGHT = canvas.height / 2
const PLAYER = new Player(CANVAS_MIDDLE_WIDTH, CANVAS_MIDDLE_HEIGHT, 10, 'white')
const projectiles = []
const enemies = []
const particles = []

function SpawnEnemies()
{
    setInterval(() => {
        const radius = Math.random() * 15 + 15

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else
        {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000);
}

let AnimationId

function Animate() {
    animationId = requestAnimationFrame(Animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width, canvas.height)
    PLAYER.Draw()
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0)
        {
            setTimeout(() => {
                particles.splice(particleIndex, 1)
            }, 0)
        }
        else
        {
            particle.Update()
        }
    })
    projectiles.forEach((projectile, projectileIndex)=> {
        projectile.Update()

        // Remove Projectiles From Edges of screen
        if (projectile.x + projectile.radius < 0  ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height)
        {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.Update()

        const dist = Math.hypot(PLAYER.x - enemy.x, PLAYER.y - enemy.y)

        if (dist - enemy.radius - PLAYER.radius < -1) {
            setTimeout(()=> {
                enemies.splice(enemyIndex, 1)
                cancelAnimationFrame(animationId)
            })
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // when projectiles touch enemy
            if (dist - enemy.radius - projectile.radius < -1) {
                // Create particle explosion
                for (let i = 0; i < 8; i++)
                {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, 
                        enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6), 
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }

                if (enemy.radius - 10 > 5) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(()=> {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
                else
                {
                    setTimeout(()=> {
                        enemies.splice(enemyIndex, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

var m = new Boolean(false);

window.addEventListener('click', (event) => 
{
    const angle = Math.atan2(
        event.clientY - CANVAS_MIDDLE_HEIGHT, 
        event.clientX - CANVAS_MIDDLE_WIDTH
        )
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4,
    }
    projectiles.push(new Projectile(CANVAS_MIDDLE_WIDTH, CANVAS_MIDDLE_HEIGHT, 5, 'white', velocity)
    )
})

window.addEventListener('mousedown', (event) => 
{
    m = true
    // while(m)
    // {
    //     setInterval(() => {
    //         setTimeout(() => {console.log("fire")}, 2000)
    //     }, 1000);
    // }
})

window.addEventListener('mouseup', (event) => 
{
    m = false
})

Animate()
SpawnEnemies()