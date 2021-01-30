import { $ } from './jquery';
import { Matrix } from './matrix';
import { partsAll, PartsCollection } from './collection';

// Internal structure of a component
const partInternal = {
    /**
     * For the internal structure of a component, we have the following parameters:
     *   - Iterative function(iterative)
     *     - Base function(equation)
     *     - Function Generator(create)
     *   - Sub-function(apart)
     *     - Base sub-function(parts)
     *     - Sub-component connection list(connect)
     *     - Connection between external nodes and internal nodes(interface)
     */
    'ac_voltage_source': {
        // 'iterative': {
        //     equation(factor, frequency, bias, phase) {
        //         return (function (t) {
        //             return ([factor * Math.sin((frequency * t) * Math.PI * 2 + phase / 180 * Math.PI) + bias]);
        //         });
        //     },
        //     create(part) {
        //         const ans = {
        //             'to': []
        //         };
        //         ans.process = partInternal['ac_voltage_source']['iterative']['equation'](
        //             part.input[0].toVal(),
        //             part.input[1].toVal(),
        //             part.input[2].toVal(),
        //             part.input[3].toVal()
        //         );
        //         // Iterative function description
        //         ans.describe = [
        //             { 'name': 'time' }
        //         ];
        //         return (ans);
        //     }
        // }
    },
    'capacitor': {
        // 'iterative': {
        //     equation(valueCap) {
        //         return (function (value, timeInterval, save) {
        //             //Integral
        //             const current = (value + save.last) / 2 * timeInterval + save.integral;
        //             save.last = value;
        //             save.integral = current;
        //             const voltage = current / valueCap;
        //             return ([voltage]);
        //         });
        //     },
        //     create(part) {
        //         const ans = {
        //             'save': {
        //                 'last': 0,
        //                 'integral': 0
        //             },
        //             'to': []
        //         };
        //         ans.process = partInternal['capacitor']['iterative']['equation'](
        //             part.input[0].toVal()
        //         );
        //         ans.describe = [
        //             { 'name': 'current', 'place': part.id + '-0' },
        //             { 'name': 'timeInterval' },
        //             { 'name': 'save' }
        //         ];
        //         return (ans);
        //     }
        // }
    },
    'diode': {
        // 'iterative': {
        //     equation(turnOnVoltage, turnOnRes, turnOffRes) {
        //         // Piece-wise function
        //         return function (voltage) {
        //             if (voltage >= turnOnVoltage) {
        //                 return ([turnOnRes, turnOnVoltage]);
        //             } else {
        //                 return ([turnOffRes, 0]);
        //             }
        //         };
        //     },
        //     create(part) {
        //         const ans = {
        //             'to': []
        //         };
        //         ans.process = partInternal[part.partType]['iterative']['equation'](
        //             part.input[0].toVal(),
        //             part.input[1].toVal(),
        //             part.input[2].toVal()
        //         );
        //         const external = partInternal['diode']['apart']['interface'];
        //         ans.describe = [
        //             {
        //                 'name': 'voltage',
        //                 'place': [part.id + '-' + external[1][0], part.id + '-' + external[0][0]]
        //             }
        //         ];
        //         return (ans);
        //     }
        // },
        // 'apart': {
        //     'interface': [
        //         ['R1-0'],
        //         ['VD1-0']
        //     ],
        //     'connect': [
        //         ['R1-1', 'VD1-1']
        //     ],
        //     'parts': [
        //         {
        //             'partType': 'resistance',
        //             'id': 'R1',
        //             'input': ['update-0']
        //         },
        //         {
        //             'partType': 'dc_voltage_source',
        //             'id': 'VD1',
        //             'input': ['update-1']
        //         }
        //     ]
        // }
    },
    'transistor_npn': {
        // 'iterative': {
        //     equation(currentZoom, ResB, voltageB, voltageCE) {
        //         return function (vd1, vd2) {
        //             const ans = new Array(4).fill(0);

        //             //ans[0] Base conduction voltage drop
        //             //ans[1] E pole conduction pressure drop
        //             //ans[2] Base resistance
        //             //ans[3] Current magnification
        //             if (vd1 >= voltageB) {
        //                 //Base forward bias
        //                 ans[0] = voltageB;
        //                 ans[2] = ResB;
        //                 if (vd2 >= voltageCE) {
        //                     //Emitter forward bias
        //                     ans[1] = voltageCE;
        //                     ans[3] = - currentZoom;
        //                 } else {
        //                     //Emitter reverse bias
        //                     ans[1] = 0;
        //                     ans[3] = 0;
        //                 }
        //             } else {
        //                 //Base reverse bias
        //                 ans[0] = 0;
        //                 ans[1] = 0;
        //                 ans[2] = 5e9;
        //                 ans[3] = 0;
        //             }
        //             return (ans);
        //         };
        //     },
        //     create(part) {
        //         const ans = {
        //             'to': []
        //         };
        //         ans.process = partInternal[part.partType].iterative.equation(
        //             part.input[0].toVal(),
        //             part.input[1].toVal(),
        //             part.input[2].toVal(),
        //             part.input[3].toVal()
        //         );
        //         const external = partInternal['transistor_npn']['apart']['interface'];
        //         ans.describe = [
        //             {
        //                 'name': 'voltage',
        //                 'place': [part.id + '-' + external[0][0], part.id + '-' + external[2][0]]
        //             },
        //             {
        //                 'name': 'voltage',
        //                 'place': [part.id + '-' + external[1][0], part.id + '-' + external[2][0]]
        //             }
        //         ];
        //         return (ans);
        //     }
        // },
        // 'apart': {
        //     'interface': [
        //         ['V1-0'],
        //         ['V2-0'],
        //         ['R1-1', 'I1-1']
        //     ],
        //     'connect': [
        //         ['R1-0', 'V1-1'],
        //         ['I1-0', 'V2-1']
        //     ],
        //     'parts': [
        //         {
        //             'partType': 'dc_voltage_source',
        //             'id': 'V2',
        //             'input': ['update-0']
        //         },
        //         {
        //             'partType': 'dc_voltage_source',
        //             'id': 'V1',
        //             'input': ['update-1']
        //         },
        //         {
        //             'partType': 'resistance',
        //             'id': 'R1',
        //             'input': ['update-2']
        //         },
        //         {
        //             'partType': 'CCCS',
        //             'id': 'I1',
        //             'input': ['update-3', 'this-R1-0']
        //         }
        //     ]
        // }
    },
    'operational_amplifier': {
        /*
        'iterative': {
            'equation' (voltage) {
                let ans = 0;
                //The current data enters the "input data queue"
                this.input.unshift(voltage);
                this.input.pop();
                for (let i = 0; i < this.input.length; i++) {
                    ans += this.inputFactor[i] * this.input[i];
                }
                for (let i = 0; i < this.output.length; i++) {
                    ans += this.outputFactor[i] * this.output[i];
                }
                //The output data enters "output data queue"
                this.output.unshift(ans);
                this.output.pop();
                return ([ans]);
            },
            'create'(part) {
                const rad = 0.5 / Math.PI;
                //The first pole
                const pole = [];
                let bandWidth = Math.log10(Math.toValue(part.input[1])) * 20;
                let openLoopGain = parseFloat(part.input[0]);
                pole[0] = 1 / Math.pow(10, (bandWidth - openLoopGain) / 20);
                //The second pole
                pole[1] = 1 / Math.round(Math.pow(10, (bandWidth + 4) / 20));
                //Convert open loop gain to normal unit
                openLoopGain = Math.pow(10, openLoopGain / 20);
                //Transfer Function
                const transfer = new Polynomial(
                    [openLoopGain],                                             //Numerator is open loop gain constant
                    Polynomial.conv([1, pole[0] * rad], [1, pole[1] * rad])     //The denominator is a two-pole polynomial multiplication
                );
                //Sampling interval
                const stepSize = Math.signFigures(Math.toValue(document.getElementById('stepsize').value));
                const ans = {
                    'to': []
                };
                //The difference equation is bound to the iteration formula
                ans.process = partInternal[part.partType]['iterative']['equation'].bind(transfer.toDiscrete(stepSize));
                ans.describe = [
                    {'name': 'voltage', 'place': [part.id + '-R1-1', part.id + '-R1-0']}
                ];
                return (ans);
            }
        },
        */
        // 'apart': {
        //     'interface': [
        //         ['R1-1'],
        //         ['R1-0'],
        //         ['R2-0']
        //     ],
        //     'connect': [
        //         ['R2-1', 'VD1-0']
        //     ],
        //     'parts': [
        //         {
        //             'partType': 'resistance',
        //             'id': 'R1',
        //             'input': ['input-1']
        //         },
        //         {
        //             'partType': 'resistance',
        //             'id': 'R2',
        //             'input': ['input-2']
        //         },
        //         {
        //             'partType': 'VCVS',
        //             'id': 'VD1',
        //             'input': ['input-0', 'this-R1-0']
        //         }
        //     ]
        // }
    }
};

// Check if connect to the reference point
function error(nodeHash, branchHash) {
    if (Object.keys(nodeHash).every((n) => nodeHash[n])) {
        // return ('Please make sure all components are directly or indirectly connected to the reference point');
        return ('');
    }

    return (false);
}
// Calculate a matrix from node to sub-circuit
function pinToCurrent(pin, nodeHash, branchHash, branchNumber) {
    // const node = nodeHash[pin], branch = [];

    // // Other nodes connect to the current node
    // for (const i in nodeHash) {
    //     if (nodeHash.hasOwnProperty(i)) {
    //         if ((nodeHash[i] === node) && (i !== pin)) {
    //             branch.push(i);
    //         }
    //     }
    // }
    const ans = new Matrix(1, branchNumber);
    // for (let i = 0; i < branch.length; i++) {
    //     ans[0][branchHash[branch[i]]] = Math.pow(-1, parseInt(branch[i][branch[i].length - 1]) + 1);
    // }
    return (ans);
}
// Calculate a matrix from node to node-voltage
function pinToVoltage(pin, nodeHash, nodeNumber) {
    const ans = new Matrix(1, nodeNumber);
    // for (let i = 0; i < 2; i++) {
    //     if (nodeHash[pin[i]]) {
    //         ans[0][nodeHash[pin[i]] - 1] = Math.pow(-1, i);
    //     }
    // }
    return (ans);
}
// Return the branch number based on component
function partToBranch(part, branchHash) {
    return (branchHash[part + '-0']);
}

// Solver class
function Solver(collection) {
    // Initialtemp variables
    const nodeHash = {},                    // key -> node table
        branchHash = {},                    // key -> branch table
        observeCurrent = [],                // Observe Current
        observeVoltage = [],                // Observe Voltage
        parameterUpdate = [],               // Iterate parameter
        tempLines = new PartsCollection(),  // Parts to be deleted

        parts = [];                 // Collection of sub-parts

    let nodeNumber = 1,             // Node number
        branchNumber = 0,           // Branch number
        errorTip;                   // Error code

    // Scan all wires, create a key -> node table
    /*
    collection.forEach(function (item) {
        // Current component is unaccessed wire
        if ((item.partType === 'line') && (!tempLines.has(item))) {
            // Search for temp wire and stack them
            const node = new PartsCollection(item);
            // Search for the node of current wire
            while (node.length) {
                const line = node.pop();
                tempLines.push(line);
                line.connect.join(' ').split(' ').forEach(function (item) {
                    const temp = partsAll.findPart(item.split('-')[0]);
                    if (temp.partType === 'line') {
                        if (!(node.has(temp) || tempLines.has(temp)))
                            node.push(temp);
                    } else if (item.search('-') !== -1) {
                        nodeHash[item] = nodeNumber;
                    }
                });
            }
            nodeNumber++;
        }
    });
    */
    //Scan all devices, some devices need to be split, add nodeHash list, establish [pin->branch number] list
    collection.forEach(function (item) {
        //The following four are auxiliary devices and will not establish branches
        if (item.partType === 'line' ||
            item.partType === 'current_meter' ||
            item.partType === 'voltage_meter' ||
            item.partType === 'reference_ground') {
            return (true);
        }
        //Device needs to be split
        if (partInternal[item.partType] && partInternal[item.partType]['apart']) {
            const external = partInternal[item.partType]['apart']['interface'];
            const internal = partInternal[item.partType]['apart']['connect'];
            const partsPrototype = partInternal[item.partType]['apart']['parts'];
            //Convert external pin number to internal label
            for (let i = 0; i < external.length; i++) {
                const node = nodeHash[item.id + '-' + i];
                for (let j = 0; j < external[i].length; j++) {
                    nodeHash[item.id + '-' + external[i][j]] = node;
                }
                delete nodeHash[item.id + '-' + i];
            }
            //Add nodeHash according to the internal structure of the device
            for (let i = 0; i < internal.length; i++) {
                for (let j = 0; j < internal[i].length; j++) {
                    nodeHash[item.id + '-' + internal[i][j]] = nodeNumber;
                }
                nodeNumber++;
            }
            //Add branchHash according to the internal structure of the device
            for (let i = 0; i < partsPrototype.length; i++) {
                const part = partsPrototype[i];
                branchHash[item.id + '-' + part.id + '-0'] = branchNumber;
                branchHash[item.id + '-' + part.id + '-1'] = branchNumber;
                branchNumber++;
            }
        } else {
            //Establish [pin->branch number] list
            branchHash[item.id + '-0'] = branchNumber;
            branchHash[item.id + '-1'] = branchNumber;
            branchNumber++;
        }
    });
    //Delete all reference nodes, merge and record the current meter entry
    collection.forEach(function (n) {
        if (n.partType === 'reference_ground') {
            const tempNode = nodeHash[n.id + '-0'];
            for (const item in nodeHash) if (nodeHash.hasOwnProperty(item)) {
                if (nodeHash[item] > tempNode) {
                    nodeHash[item]--;       //If the label is larger than the reference node, decrease by 1
                } else if (nodeHash[item] === tempNode) {
                    nodeHash[item] = 0;     //Reference node is 0
                }
            }
            delete nodeHash[n.id + '-0'];
            tempLines.push(n);
        } else if (n.partType === 'current_meter') {
            const meter = {};
            meter.name = n.id;
            meter.matrix = [];
            meter.data = [];
            //Record all pins connected to the entrance of the ammeter
            const node = nodeHash[n.id + '-0'];     //Ammeter entry node
            for (const i in nodeHash) if (nodeHash.hasOwnProperty(i)) {
                if ((nodeHash[i] === node) && (i.search('GND') === -1)) {
                    const temp = partsAll.findPart(i.split('-')[0]);
                    //At this time, the voltage and current meter has not been deleted, so it must be excluded
                    if ((temp.partType !== 'voltage_meter') && (temp.partType !== 'current_meter'))
                        meter.matrix.push(i);
                }
            }
            //Delete the ammeter and merge the nodes at both ends
            //Delete nodes with large values
            const node0 = Math.min(nodeHash[n.id + '-0'], nodeHash[n.id + '-1']);
            const node1 = Math.max(nodeHash[n.id + '-0'], nodeHash[n.id + '-1']);
            for (const i in nodeHash) if (nodeHash.hasOwnProperty(i)) {
                if (nodeHash[i] === node1) {
                    nodeHash[i] = node0;
                } else if (nodeHash[i] > node1) {
                    nodeHash[i]--;
                }
            }
            observeCurrent.push(meter);
            tempLines.push(n);              //The ammeter enters the device collection to be deleted
            delete nodeHash[n.id + '-0'];   //Delete the hash value of the ammeter
            delete nodeHash[n.id + '-1'];
        }
    });
    //Error checking
    if (errorTip = error(nodeHash, branchHash)) {
        this.error = errorTip;
        return (this);
    }
    //Calculate the number of nodes
    nodeNumber = function (Hash) {
        let temp = -1;
        for (const i in Hash) {
            if (Hash.hasOwnProperty(i)) {
                if (Hash[i] > temp)
                    temp = Hash[i];
            }
        }
        return (temp);
    }(nodeHash);
    //Voltage observation matrix
    collection.forEach(function (n) {
        if (n.partType === 'voltage_meter') {
            const temp = {};
            temp.name = n.id;
            temp.data = [];
            temp.matrix = new Matrix(1, nodeNumber);
            if (nodeHash[n.id + '-0']) { temp.matrix[0][nodeHash[n.id + '-0'] - 1] += 1; }
            if (nodeHash[n.id + '-1']) { temp.matrix[0][nodeHash[n.id + '-1'] - 1] += -1; }
            if (nodeHash.hasOwnProperty(n.id + '-0')) { delete nodeHash[n.id + '-0']; }
            if (nodeHash.hasOwnProperty(n.id + '-1')) { delete nodeHash[n.id + '-1']; }
            observeVoltage.push(temp);
            tempLines.push(n);
        }
    });
    //Delete all auxiliary devices
    collection.deleteParts(tempLines);
    tempLines.deleteAll();
    //Current observation matrix
    for (let i = 0; i < observeCurrent.length; i++) {
        const currentHash = observeCurrent[i].matrix;
        observeCurrent[i].matrix = new Matrix(1, branchNumber);
        const matrix = observeCurrent[i].matrix;
        for (let j = 0; j < currentHash.length; j++) {
            const item = currentHash[j];
            matrix[0][branchHash[item]] = Math.pow(-1, parseInt(item[item.length - 1]) + 1);
        }
    }
    //Circuit matrix initialization
    const A = new Matrix(nodeNumber, branchNumber), //Incidence matrix
        F = new Matrix(branchNumber),               //Conductivity capacitance matrix
        H = new Matrix(branchNumber),               //Resistance inductance matrix
        S = new Matrix(branchNumber, 1);            //Independent voltage and current source column vector

    //Scan all branches and establish an association matrix
    for (const i in branchHash) {
        if (branchHash.hasOwnProperty(i)) {
            const row = nodeHash[i];
            //Not a reference node
            if (row) {
                A[row - 1][branchHash[i]] = Math.pow(-1, parseInt(i[i.length - 1]) + 1);
            }
        }
    }
    // Scan for all components
    collection.forEach(function (item) {
        // iteractive setting parameters
        (function insertFactor(part) {
            // Index here refers to the branch number
            const index = partToBranch(part.id, branchHash);

            // switch (part.partType) {
            //     //Basic device
            //     case 'ac_voltage_source': {
            //         F[index][index] = 1;
            //         S[index][0] = 'update-' + parameterUpdate.length + '-0';
            //         break;
            //     }
            //     case 'dc_voltage_source': {
            //         F[index][index] = 1;
            //         S[index][0] = part.input[0].toVal();
            //         break;
            //     }
            //     case 'dc_current_source': {
            //         H[index][index] = 1;
            //         S[index][0] = part.input[0].toVal();
            //         break;
            //     }
            //     case 'resistance': {
            //         F[index][index] = -1;
            //         H[index][index] = part.input[0].toVal();
            //         break;
            //     }
            //     case 'capacitor': {
            //         F[index][index] = 1;
            //         S[index][0] = 'update-' + parameterUpdate.length + '-0';
            //         break;
            //     }
            //     case 'VCVS': {
            //         F[index][index] = 1;
            //         F[index][branchHash[part.input[1]]] = part.input[0].toVal();
            //         break;
            //     }
            //     case 'CCCS': {
            //         let temp = part.input[0].toVal();
            //         if (typeof temp === 'number') { temp *= -1; }

            //         H[index][index] = 1;
            //         H[index][branchHash[part.input[1]]] = temp;
            //         break;
            //     }
            //     //Combination device
            //     default: {
            //         const apart = partInternal[part.partType].apart;
            //         //Device needs to be split
            //         for (let i = 0; apart && i < apart.parts.length; i++) {
            //             const pieces = Object.clone(apart.parts[i]);

            //             pieces.id = part.id + '-' + pieces.id;
            //             pieces.input = pieces.input.map(function (n) {
            //                 if (n.search(/^input/) !== -1) {
            //                     //The divided device value is equal to a certain input of the complete device
            //                     return (part.input[n.split('-')[1]]);
            //                 } else if (n.search(/this/) !== -1) {
            //                     //Equal to the relationship between the current device and certain device
            //                     return (n.replace(/this/g, part.id));
            //                 } else if (n.search(/^update/) !== -1) {
            //                     //Equal to the output of the iteration function
            //                     return ('update-' + parameterUpdate.length + '-' + n.split('-')[1]);
            //                 } else {
            //                     return (n);
            //                 }
            //             });
            //             //Insert split device
            //             insertFactor(pieces);
            //         }
            //     }
            // }

            switch (part.partType) {
                default: {
                    F[index][index] = -1;
                    H[index][index] = part.input[0].toVal();
                    break;
                }
            }

            //Device has update equation
            if (partInternal[part.partType] && partInternal[part.partType].iterative) {
                const parameter = partInternal[part.partType].iterative.create(part),
                    describe = parameter.describe;
                //Need to establish a corresponding matrix for current and voltage 
                describe.forEach(function (n) {
                    if (n.name === 'voltage') {
                        n.matrix = pinToVoltage(n.place, nodeHash, nodeNumber);
                    } else if (n.name === 'current') {
                        n.matrix = pinToCurrent(n.place, nodeHash, branchHash, branchNumber);
                    }
                });
                parameterUpdate.push(parameter);
            }
        })(item);
    });
    //Combination coefficient matrix
    const factor = Matrix.combination([
        [0, 0, A],
        [A.transpose(), 'E', 0],
        [0, F, H]
    ]);
    //Independent power column vector
    const source = (new Matrix(A.row, 1)).concatDown((new Matrix(A.column, 1)), S);
    //Enumerate power column vectors and record parameters that need to be iterated
    source.forEach(function (item, index) {
        //The string is the previous tag
        if (typeof item === 'string') {
            const sub = item.split('-');
            const update = parameterUpdate[sub[1]];
            update.to[sub[2]] = {
                'type': source,
                'place': Array.clone(index)
            };
        }
    });
    //Enumerate equation coefficients and record the parameters that need to be iterated
    factor.forEach(function (item, index) {
        //The string is the previous tag
        if (typeof item === 'string') {
            const sub = item.split('-');
            const update = parameterUpdate[sub[1]];
            update.to[sub[2]] = {
                'type': factor,
                'place': Array.clone(index)
            };
        }
    });

    //Record instance element
    this.factor = factor;
    this.source = source;
    this.update = parameterUpdate;
    this.nodeNumber = nodeNumber;
    this.branchNumber = branchNumber;
    this.observeCurrent = observeCurrent;
    this.observeVoltage = observeVoltage;
}
Solver.prototype.solve = function* () {
    //Take out the time setting of the setting interface
    const endTime = $('#endtime').prop('value').toVal(),
        stepSize = $('#stepsize').prop('value').toVal(),
        total = Math.round(endTime / stepSize),
        //Take out the data in the solver
        update = this.update,
        factor = this.factor,
        source = this.source,
        nodeNumber = this.nodeNumber,
        branchNumber = this.branchNumber,
        observeCurrent = this.observeCurrent,
        observeVoltage = this.observeVoltage;

    //Initial state of the circuit
    let nodeVoltage = new Matrix(this.nodeNumber, 1),        //Node voltage column vector
        branchCurrent = new Matrix(this.branchNumber, 1),    //Branch current column vector
        factorInverse, factorUpdateFlag;

    //Iterative to solve
    for (let i = 0; i <= total; i++) {
        factorUpdateFlag = false;
        //Update related parameters
        for (let j = 0; j < update.length; j++) {
            const item = update[j];
            const args = [];
            for (let k = 0; k < item.describe.length; k++) {
                const parameter = item.describe[k];
                switch (parameter.name) {
                    case 'time':
                        args.push(i * stepSize);
                        break;
                    case 'timeInterval':
                        args.push(stepSize);
                        break;
                    case 'voltage':
                        args.push(parameter.matrix.mul(nodeVoltage));
                        break;
                    case 'current':
                        args.push(parameter.matrix.mul(branchCurrent));
                        break;
                    case 'save':
                        args.push(update[j].save);
                        break;
                }
            }
            const ans = item.process(...args);
            for (let k = 0; k < item.to.length; k++) {
                const matrix = item.to[k].type;
                const index = item.to[k].place;
                if ((matrix === factor) && (matrix[index[0]][index[1]] !== ans[k])) {
                    factorUpdateFlag = true;
                }
                matrix[index[0]][index[1]] = ans[k];
            }
        }
        //If the coefficient matrix is updated, then the coefficient matrix needs to be inverted again
        if (factorUpdateFlag || !i) factorInverse = factor.inverse();
        //Solve the circuit
        const ans = factorInverse.mul(source);
        nodeVoltage = ans.slice([0, 0], [nodeNumber - 1, 0]);
        branchCurrent = ans.slice([nodeNumber + branchNumber, 0], [ans.length - 1, 0]);

        //The output voltage
        for (let i = 0; i < observeVoltage.length; i++) {
            const matrix = observeVoltage[i].matrix;
            observeVoltage[i].data.push(matrix.mul(nodeVoltage));
        }
        //The output current
        for (let i = 0; i < observeCurrent.length; i++) {
            const matrix = observeCurrent[i].matrix;
            observeCurrent[i].data.push(matrix.mul(branchCurrent));
        }

        //Output the calculation progress
        yield (Math.round(i / Math.round(endTime / stepSize) * 100));
    }
};

export { Solver };
