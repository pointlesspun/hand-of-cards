'use strict';

export class Vector3 {    

    static ZERO = Object.freeze(new Vector3());
    static ONE = Object.freeze(new Vector3(1,1,1));

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() { 
        return this.x*this.x + this.y*this.y + this.z * this.z;
    }

    multiply = (scalar) => new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
}