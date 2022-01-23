'use strict';

/*
 * Math utilties and datastructures.
 */


/**
 * Class capturing all elements of a transformation (translation, scale and rotation).
 */
export class Transform {

    constructor({translation = {x : 0, y : 0, z: 0}, scale = {x : 1, y : 1}, rotation = 0} = {}) {
        this.translation = translation;
        this.scale = scale;
        this.rotation = rotation;
    }

    clone() {
    
        return new Transform({
            translation : { 
                x: this.translation.x, 
                y: this.translation.y,
                z: this.translation.z
            },
            scale: {
                x: this.scale.x,
                y: this.scale.y
            },
            rotation: this.rotation
        });
    }

    toCss({translationUnits = {x: "px", y: "px", z: "px"}} = {}) {
        return `translate(${this.translation.x ?? 0}${translationUnits.x}, ${this.translation.y ?? 0}${translationUnits.y})`  
        + ` scale(${this.scale.x ?? 1.0}, ${this.scale.y ?? 1.0})`
        + ` rotate(${this.rotation ?? 0}deg)`
        + ` translateZ(${this.translation.z}em)`; 
    }
}

export class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}


export const mathx = {

    clamp : (value, min, max) => Math.max(Math.min(value, max - 1), min),
  
    transform : ({translation : {x : 0, y :0}})
}