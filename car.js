class Car {
    constructor(id, x, y, maxspeed = 2, controller="dummy", model=null, color="blue", width=30, height=50) {
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
        this.model = model;

        this.controller = controller;
        this.controls = new Controls(controller);

        this.polygon = this.#createPolygon();
        this.sensors = []

        if(controller != "dummy") {
            switch(model) {
                case "fsd":
                    this.sensors.push(new Sensor(this, 5, "forward"));
                    this.brain = new Network(
                        [this.sensors[0].rayCount+1, 6, 12, 2]
                    )
                    if(localStorage.getItem("bestBrain")) {
                        this.brain = JSON.parse(localStorage.getItem("bestBrain"));
                    }
                    break;
                case "forward":
                    this.sensors.push(new Sensor(this, 5, "forward"));
                    // todo: calc raycount for all sensors
                    this.brain = new Network(
                        [this.sensors[0].rayCount, 6, 12, 2]
                    )
                    if(localStorage.getItem("forwardBrain")) {
                        this.brain = JSON.parse(localStorage.getItem("forwardBrain"));
                    }
                    break;
            }
            console.log(this.model, this.sensors[0].rayCount, "rays")
        }
    }

    // update car object
    // only process slow down and sensors if damaged
    update(roadBorders, traffic) {
        this.#move();
        if(!this.damaged) {
            this.polygon = this.#createPolygon();

            // check damage
            const damage = this.#checkDamage(roadBorders, traffic);
            if(damage == this.id) {
                this.damaged;
                this.speed = 0;
            } else if(damage) {
                if(this.model != "fsd") {
                    traffic[damage].damaged = true;
                    traffic[damage].controls.forward = false;
                }
                this.damaged = true;
                this.speed = 0;
            }
        }
        if(this.sensors.length > 0) {
            var inputs = [this.speed];
            // update each sensor
            for(let i=0; i<this.sensors.length; i++) {
                this.sensors[i].update(roadBorders, traffic);
                const offsets = this.sensors[i].readings.map(
                    s=>s==null ? 0 : 1 - s.offset
                );
                inputs = inputs.concat(offsets)
            }
            const outputs = Network.forward(inputs, this.brain);

            if(this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.backward = outputs[1];
                //this.controls.left = outputs[1];
                //this.controls.right = outputs[2];
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
            if(traffic[i].id != this.id && traffic[i].model != "fsd") {
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
                this.speed += this.acceleration;
            }
            if(this.controls.backward) {
                this.speed -= this.acceleration * 3 / 2;
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
            if(this.sensors[0] && drawSensors) {
                this.sensors[0].draw(ctx);
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