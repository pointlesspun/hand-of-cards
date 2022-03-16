"use strict";

import { Vector3 } from "./vector3.js";

/*
 * Math utilties and datastructures.
 */

/**
 * Class capturing all elements of a transformation (translation, scale and rotation).
 */
export class Transform {

    static IDENTITY = Object.freeze(new Transform());

    constructor(translation = new Vector3(), scale = new Vector3(1, 1, 1), rotation = new Vector3()) {
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

    translate = (x, y, z) => new Transform(this.translation.add(x, y, z), this.scale, this.rotation);
        
    clone() {
        return new Transform(this.translation.clone(), this.scale.clone(), this.rotation.clone());
    }

    toCss({ translationUnits = { x: "px", y: "px", z: "px" } } = {}) {
        return `translate3d(${this.translation.x}${translationUnits.x}, ${this.translation.y}${translationUnits.y}, ${this.translation.z}${translationUnits.z})` +
            ` scale3d(${this.scale.x}, ${this.scale.y}, ${this.scale.z})` +
            ` rotateX(${this.rotation.x}deg)` +
            ` rotateY(${this.rotation.y}deg)` +
            ` rotateZ(${this.rotation.z}deg)`;
    }
}

