class Car {
    constructor(id, x, y, maxspeed = 2, controller="dummy", color="blue", width=30, height=50) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.angle = 0;

        this.speed = 0;
        this.maxSpeed = maxspeed;
        this.acceleration = 0.2;
        this.friction = 0.05;

        this.damaged = false;

        this.useBrain = controller=="network";

        this.controller = controller;
        this.controls = new Controls(controller);

        this.polygon = this.#createPolygon();

        if(controller != "dummy") {
            this.sensor = new Sensor(this);
            this.brain = new Network(
                [this.sensor.rayCount, 6, 12, 4]
            )
            if(localStorage.getItem("bestBrain")) {
                this.brain = JSON.parse(
                    localStorage.getItem("bestBrain"));
            }
        }
    }

    update(roadBorders, traffic) {
        this.#move();
        if(!this.damaged) {
            this.polygon = this.#createPolygon();
            const damage = this.#checkDamage(roadBorders, traffic);
            if(damage == this.id) {
                this.damaged;
                this.speed = 0;
            } else if(damage) {
                if(!this.useBrain) {
                    traffic[damage].damaged = true;
                    traffic[damage].controls.forward = false;
                }
                this.damaged = true;
                this.speed = 0;
            }
        }
        if(this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s=>s==null ? 0 : 1 - s.offset
            );
            const outputs = Network.forward(offsets, this.brain);

            if(this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.backward = outputs[3];
            }
        }
    }

    #checkDamage(roadBorders, traffic) {
        for(let i=0; i < roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) {
                return this.id;
            }
        }
        for(let i=0; i < traffic.length; i++) {
            if(traffic[i].id != this.id && !traffic[i].useBrain) {
                if(polysIntersect(this.polygon, traffic[i].polygon)) {
                    return traffic[i].id;
                }
            }
        }
        return null;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
        });
        
        return points;
    }

    #move() {
        if(!this.damaged) {
            // accelerate
            if(this.controls.forward) {
                this.speed += this.acceleration
            }
            if(this.controls.backward) {
                this.speed -= this.acceleration
            }

            // check direction
            if(this.speed != 0) {
                const flip=this.speed>0?1:-1;

                if(this.controls.left) {
                    this.angle += 0.04 * flip;
                }
                if(this.controls.right) {
                    this.angle -= 0.04 * flip;
                }
            } 

            // limit speed
            if(this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            } else if(this.speed < -this.maxSpeed * 2 / 3) {
                this.speed = -this.maxSpeed * 2 / 3;
            }
        }

        // add friction
        if(this.speed > 0) {
            this.speed -= this.friction;
        } else if(this.speed < 0) {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;        
    }

    draw(ctx, drawSensors) {
        if(this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = this.color;
            if(this.sensor && drawSensors) {
                this.sensor.draw(ctx);
            }
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();
    }
}