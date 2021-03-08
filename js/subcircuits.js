'use strict'
// Import external packages
import { $ } from './jquery'
import { Point } from './point'
import { Matrix } from './matrix'
import { SVG_NS } from './init'
import { schMap } from './maphash'
import { styleRule } from './styleRule'
import { partsAll, partsNow } from './collection'

// Define Constants
const u = undefined,
    actionArea = $('#area-of-parts'),
    rotateMatrix = [
        new Matrix([
            [0, 1],
            [-1, 0],
        ]), //CW
        new Matrix([
            [0, -1],
            [1, 0],
        ]), //CCW
        new Matrix([
            [1, 0],
            [0, -1],
        ]), //X-Mirror
        new Matrix([
            [-1, 0],
            [0, 1],
        ]), //Y-Mirror
    ]
 
function Subcircuit(data) {

    // boolean, string, list of ports
    {isBlackBox, subName, portComponents} = data;

    this.isBlackBox = isBlackBox;
    this.name = subName;
    this.ports = portComponents;

    // generate unique id; check newId method from collection.js cuz i put some comments there 
}

export { Subcircuit }