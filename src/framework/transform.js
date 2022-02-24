'use strict';

import { Vector3 } from "./vector3.js";

/*
 * Math utilties and datastructures.
 */


/**
 * Class capturing all elements of a transformation (translation, scale and rotation).
 */
export class Transform {

    constructor(translation = new Vector3(), scale = new Vector3(1,1,1), rotation = 0) {
        /**
         * @type {Vector3}
         */
        this.translation = translation.clone();

        /**
         * @type {Vector3}
         */
        this.scale = scale.clone();

        /**
         * @type {number}
         */
        this.rotation = rotation;
    }

    clone() {
    
        return new Transform(
            this.translation.clone(), 
            this.scale.clone(),
            this.rotation
        );
    }

    toCss({translationUnits = {x: "px", y: "px", z: "px"}} = {}) {
        return `translate(${this.translation.x ?? 0}${translationUnits.x}, ${this.translation.y ?? 0}${translationUnits.y})`  
        + ` scale(${this.scale.x ?? 1.0}, ${this.scale.y ?? 1.0})`
        + ` rotate(${this.rotation ?? 0}deg)`
        + ` translateZ(${this.translation.z}em)`; 
    }
}
