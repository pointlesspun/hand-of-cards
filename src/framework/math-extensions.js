'use strict';

/*
 * Math extension methods
 */

Math.clamp = (value, min, max) => Math.max(Math.min(value, max - 1), min);
