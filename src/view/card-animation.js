"use strict";

import { contract } from "../framework/contract.js";
import { Transform } from "../framework/transform.js";
import { Vector3 } from "../framework/vector3.js";

/**
 * Class implementing the details around an animation of a card.
 */
export class CardAnimation {
    /**
     * @type  {string}
     */
    name = "";

    /**
     * A function which returns a css style describing the animation
     * @type
     */
    createAnimationStyle = null;

    /**
     * Starting transform of the animation (key 0)
     * @type {Transform}
     */
    startTransform = null;

    /**
     * Last transform of the animation (key length  -1)
     * @type {Transform}
     */
    endTransform = null;

    /**
     * Flag indicating if the target object (ie a card) should be deleted at the end 
     * of the animation
     * @type {boolean}
     */
    deleteOnEnd = false;

    constructor({
        name = "",
        createAnimationStyle = null,
        startTransform = null,
        endTransform = null,
        deleteOnEnd = false,
    } = {}) {
        this.name = name;
        this.createAnimationStyle = createAnimationStyle;
        this.startTransform = startTransform;
        this.endTransform = endTransform;
        this.deleteOnEnd = deleteOnEnd;
    }

    /**
     * Update the "draw card animation" initial transform to match the current
     * position of the draw pile counter.
     * @param {PlatformConfiguration} config the current configuration
     * @param {DOMRect} rect the start rectangle
     */
    mapStartTransformToRect(config, rect) {
        contract.isDefined(config, "Animations requires a valid config (was null or undefined).");
        contract.isDefined(config.settings, "Animations requires a valid settings (was null or undefined).");
        contract.isDefined(rect, "Animations requires a valid rect (was null or undefined).");

        const newTransform = this.startTransform.clone();
        const cardSize = config.settings.layoutCollection.getCardSize();

        newTransform.translation.x = rect.x + rect.width / 2 - cardSize.width / 2;
        newTransform.translation.y = rect.y + rect.height - cardSize.height;
        newTransform.scale.x = rect.width / cardSize.width;
        newTransform.scale.y = rect.height / cardSize.height;
        newTransform.scale.z = 1;
        newTransform.rotation = new Vector3(0, 180, 0);

        this.startTransform = newTransform;
    }

    /**
     * Update the "play card animation" final transform to match the current
     * position of the given rect.
     * @param {PlatformConfiguration} config the current configuration
     * @param {DOMRect} rect the start rectangle
     */
    mapEndTransformToRect(config, rect) {
        contract.isDefined(config, "Animations requires a valid config (was null or undefined).");
        contract.isDefined(config.settings, "Animations requires a valid settings (was null or undefined).");
        contract.isDefined(rect, "Animations requires a valid rect (was null or undefined).");

        const newTransform = this.endTransform.clone();
        const cardSize = config.settings.layoutCollection.getCardSize();

        newTransform.translation.x = rect.x + rect.width / 2 - cardSize.width / 2;
        newTransform.translation.y = rect.y + rect.height - cardSize.height;
        newTransform.scale.x = rect.width / cardSize.width;
        newTransform.scale.y = rect.height / cardSize.height;
        newTransform.scale.z = 1;
        newTransform.rotation.z = -15;
        newTransform.rotation.y = 180;

        this.endTransform = newTransform;
    }
}
