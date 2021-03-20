var example_input = {
    "0": {
        "id": "GND_1",
        "type": "REF",
        "value": [],
        "connect": ["line_2"]
    },
    "1": {
        "id": "line_2",
        "type": "W",
        "value": [],
        "connect": ["GND_1-0", "line_1 line_3"]
    },
    "2": {
        "id": "line_3",
        "type": "W",
        "value": [],
        "connect": ["line_1 line_2", "V_1-1"]
    },
    "3": {
        "id": "V_1",
        "type": "V",
        "value": [12],
        "connect": ["line_4", "line_3"]
    },
    "4": {
        "id": "line_4",
        "type": "W",
        "value": [],
        "connect": ["VM_1-0", "V_1-0"]
    },
    "5": {
        "id": "VM_1",
        "type": "VM",
        "value": [],
        "connect": ["line_4", "line_1"]
    },
    "6": {
        "id": "line_1",
        "type": "W",
        "value": [],
        "connect": ["VM_1-1", "line_3 line_2"]
    }
}

var example_output = {
    "V": [{
        "name": "V_1",
        "value": 12,
        "node1": "line_4",
        "node2": "gnd",
    }],
    "VM": [{
        "name": "VM_1",
        "value": [],
        "node1": "",
        "node2": "",
    }]
}

let nodeList = [[]]; // List of lists. each list item in the nodeList is a node entity. A node entity is made up of all the pin names 
// connected at a juncture. Examples of pins are: V_4-0, V_4-1, R_1-0, C_5-0, etc...
let gndList = []; // List of ground pins/pin names
let firstNode = true; // boolean indicating that the nodeList is a list of an empty list. Hasn't been filled with anything yet. 

function findLastPin(pin) {
    /**
     * findPin method takes a pin and return which node it last shows up.
     * 
     * @param   {String}    pin, indicates the pin we use to search for the node.
     * @return  {int}       This method will return a integer value indicating 
     *                      the index of the last node containing that pin,
     *                      it will return 0 if no such pin is found.
     * 
     */
    for (var nodeIndex = nodeList.length - 1; nodeIndex >= 0; nodeIndex--) {
        if (nodeList[nodeIndex].includes(pin)) {
            return nodeIndex;
        }
    }
    return -1;
}

function findPin(pin) {
    /**
     * findPin method takes a pin and return which node it first shows up.
     * 
     * @param   {String}    pin, indicates the pin we use to search for the node.
     * @return  {int}       This method will return a integer value indicating 
     *                      the index of the first node containing that pin,
     *                      it will return -1 if no such pin is found.
     * 
     */
    for (var nodeIndex = 0; nodeIndex < nodeList.length; nodeIndex++) {
        // console.log("type of nodelist[nodeIndex] is " + typeof (nodeList[nodeIndex]) + " nodeIndex is " + nodeIndex);
        if (nodeList[nodeIndex].includes(pin)) {
            return nodeIndex;
        }
    }
    return -1;
}

function appendNode(pin) {
    /**
     * appendNode method will create a new Node, if a pin is passed, that pin will
     * become the first pin in this new Node.
     * 
     * @param   {String}    pin, indicates the first pin included in the new node.
     *                      Pin is of the format: componentID-0 or componentID-1 or componentID-[insert number of its point of connection]
     *                      It is the naming of the node of a component. Example: V_1-0 (1st node of voltage source), V_1-1 (2nd node of voltage source)
     * @return  {int}       It returns the index of the node that has just been created.
     * 
     */
    var newNode = [pin];
    console.log("newNode");
    console.log(newNode);
    if (firstNode) {
        // If the node List is originally empty, change the first node to the newNode.
        nodeList[0] = newNode;
        firstNode = false;
    } else {
        nodeList.push(newNode);
    }
    return nodeList.length - 1;
}

/**
 * 
 * @param {String} pin      The name of the pin we want to add to the node. 
 *                          A pin is an identifier of the connection side of a component. 
 *                          Examples include: R_1-0, R_1-1, GND_1-0, V_4-0, etc...
 * @param {int} nodeIndex   Index of the node we are currently building which is in the nodeList 
 * @returns 
 */
function joinNode(pin, nodeIndex) {
    if (!(nodeList[nodeIndex].includes(pin))) { // if the node does not include this pin name, we add the pin 
        // to the node to complete the picture.
        nodeList[nodeIndex].push(pin);
        return nodeIndex;
    }
    return -1;
}

/**
 * Move over the pins in the oldNode to the newNode because they have a pin in common, so we need to merge
 * them since all these pins are connected to each other; they are part of one node. 
 * 
 * @param {int} oldNodeIndex index of the old node in the nodelist
 * @param {int} newNodeIndex index of the new node in the nodelist 
 */
function migrateNode(oldNodeIndex, newNodeIndex) {
    var migratedPin = [];
    for (var pin in nodeList[oldNodeIndex]) {
        if (pin.includes("isEqual")) {
            break;
        }
        if (!(nodeList[newNodeIndex].includes(nodeList[oldNodeIndex][pin]))) {
            // If a pin exists in oldNode but not in newNode, migrate
            joinNode(nodeList[oldNodeIndex][pin], newNodeIndex);
            migratedPin.push(nodeList[oldNodeIndex][pin]);
        }
        // If newNode has that pin, nothing needs to be done.
    }
    nodeList[oldNodeIndex] = [];
    // After the migration, clear the oldNode to avoid confusion.

    for (var pin in migratedPin) {
        // Every time a new node merge with an old node, some more node may need to merge as well
        // For example, node 1 has pin 1, 2; node 2 has pin 3, 4; node 3 has 2, 3.
        // After merging node 3 to node 1, we also need to check if the migrated pin
        // should result other nodes to merge.
        while (findLastPin(migratedPin[pin]) > findPin(migratedPin[pin])) {
            // keep merging all the node in the back until each pin exist only once.
            migrateNode(findLastPin(migratedPin[pin]), findPin(migratedPin[pin]));
        }
    }
}

function nodeListToString() {
    var retVal = "";
    for (var i = 0; i < nodeList.length; i++) {
        retVal = retVal.concat("For node " + i + ": ");
        for (var j = 0; j < nodeList[i].length; j++) {
            retVal = retVal.concat(nodeList[i][j] + " ");
        }
        retVal = retVal.concat("\n");
    }
    // console.log("retVal: \n" + retVal);
    return retVal;
}

/**
 * Compares pin_cmp, the pin name we input to it, to all the pins in the node which is accessed by nodeIndex
 * from the node list 
 * 
 * @param {*} pin_cmp   pin name to which to compare all the pins in the node indexed by nodeIndex 
 * @param {*} nodeIndex index of node in node list
 * @returns 
 */
function pinCmp(pin_cmp, nodeIndex) {
    for (var pinIndex in nodeList[nodeIndex]) {
        if (nodeList[nodeIndex][pinIndex] == pin_cmp) {
            return true;
        }
    }
    return false;
}

function nodeId(input) {
    console.log("input to nodeid");
    console.log(input);
    // Empty the nodeList
    nodeList = [[]];
    var output = {};
    // Iterate through each device
    for (var device in input) {
        var component = input[device];
        if (component.type == "REF") { // Reference Point
            // Check if there is a node containing the pin name for ground
            var pinName = component.id + "-0";
            // console.log("findPin second time, result: " + findPin(pinName))
            var pinNode = findPin(pinName); // findPin returns the index of the first node (IN NODELIST) containing that pin name
            if (pinNode == -1) {
                pinNode = appendNode(pinName);
            }
            // Add all the connected lines to the pin node
            // we split based on space " " because ground can be connected to "line_2 line_3" since it is connected to a juncture
            var connLines = component["connect"][0].split(" ");
            var minNode = pinNode;
            for (var connLineIndex = 0; connLineIndex < connLines.length; connLineIndex++) {
                joinNode(connLines[connLineIndex], pinNode); // pinNode is index of the first node in nodelist containing the ground pin name
                var lowestIndex = findPin(connLines[connLineIndex]);
                if (lowestIndex != -1) {
                    minNode = Math.min(minNode, lowestIndex);
                }
            }
            // If this pin connects to a previously defined node.
            // Migrate everything here to that node.
            if (minNode < pinNode) {
                migrateNode(pinNode, minNode);
            }
            gndList.push(component.id + "-0");

        } else if (component.type == "W") { // same procedure as above with ground pin
            // Wire
            var pinName = component.id;
            var pinNode = findPin(pinName);
            if (pinNode == -1) {
                pinNode = appendNode(pinName);
            }
            var connLines = component["connect"][0].split(" ");
            connLines = connLines.concat(component["connect"][1].split(" "));
            var minNode = pinNode;
            for (var connLineIndex = 0; connLineIndex < connLines.length; connLineIndex++) {
                joinNode(connLines[connLineIndex], pinNode);
                var lowestIndex = findPin(connLines[connLineIndex]);
                if (lowestIndex != -1) {
                    minNode = Math.min(minNode, lowestIndex);
                }
            }
            if (minNode < pinNode) {
                migrateNode(pinNode, minNode);
            }
        } else if (
            // This branch is for two node components
            component.type == "V" ||
            // DC Voltage Source
            component.type == "I" ||
            // DC Current Source
            component.type == "R" ||
            // Resistor
            component.type == "L" ||
            // Inductor
            component.type == "C" ||
            // Capacitor
            component.type == "VA" ||
            // AC Voltage Source
            component.type == "IA" ||
            // AC Current Source
            component.type == "TR" ||
            // Transistor
            component.type == "VM" ||
            // Voltmeter
            component.type == "AM" ||
            // Ampmeter
            component.type == "OS" ||
            // Oscilloscope
            component.type == "D" ||
            //Diode
            component.type == "nBJT" ||
            //Transistor
            component.type == "VCV" ||
            // Voltage Controlled Voltage Source
            component.type == "CCV" ||
            // Current Controlled Voltage Source
            component.type == "VCC" ||
            // Voltage Controlled Current Source
            component.type == "CCC" ||
            // Current Controlled Current Source
            component.type == "P"
            // Port Component
        ) {
            console.log("component type in node id is port");
            console.log(component.type == "P");
            var pinName0 = component.id + "-0";
            var pinName1 = component.id + "-1";
            var pinNode0 = findPin(pinName0);
            var pinNode1 = findPin(pinName1);
            if (pinNode0 == -1) {
                pinNode0 = appendNode(pinName0);
            }
            if (pinNode1 == -1) {
                pinNode1 = appendNode(pinName1);
            }
            var connLines0 = component["connect"][0].split(" ");
            var connLines1 = component["connect"][1].split(" ");

            var minNode0 = pinNode0;
            var minNode1 = pinNode1;

            for (var connLineIndex = 0; connLineIndex < connLines0.length; connLineIndex++) {
                joinNode(connLines0[connLineIndex], pinNode0);
                var lowestIndex = findPin(connLines0[connLineIndex]);
                if (lowestIndex != -1) {
                    minNode0 = Math.min(minNode0, lowestIndex);
                }
            }
            for (var connLineIndex = 0; connLineIndex < connLines1.length; connLineIndex++) {
                joinNode(connLines1[connLineIndex], pinNode1);
                var lowestIndex = findPin(connLines1[connLineIndex]);
                if (lowestIndex != -1) {
                    minNode1 = Math.min(minNode1, lowestIndex);
                }
            }
            if (minNode0 < pinNode0) {
                migrateNode(pinNode0, minNode0);
            }
            if (minNode1 < pinNode1) {
                migrateNode(pinNode1, minNode1);
            }

            var value = 0;
            if (component.value[0]) {
                value = parseInt(component.value[0]);
                if (component.value[0].includes("p")) {
                    value /= 1000000000000;
                } else if (component.value[0].includes("n")) {
                    value /= 1000000000
                } else if (component.value[0].includes("μ")) {
                    value /= 1000000
                } else if (component.value[0].includes("m")) {
                    value /= 1000
                } else if (component.value[0].includes("k")) {
                    value *= 1000
                } else if (component.value[0].includes("M")) {
                    value *= 1000000
                } else if (component.value[0].includes("G")) {
                    value *= 1000000000
                }
            }

            // Output as json
            var compJson = {
                id: component.id,
                name: component.name,
                // id: component.name,
                value: value,
                node1: component.connect[0],
                node2: component.connect[1],
            }
            if (component.type === 'nBJT') {
                compJson = {
                   id: component.id,
                   name: component.name,
                   // id: component.name,
                   value: value,
                   node1: component.connect[0],
                   node2: component.connect[1],
                   node3: component.connect[2]
                }
           }
           if (component.type === 'D' || component.type === 'nBJT') {//delete value if element contains modelType
                compJson.modelType = component.value[0]
                delete compJson.value
            } else {
                delete compJson.modelType
            } 

            // forming the hashmap of components where the keys are the types of components, and
            // the values are the lists of all the instances of components of that type
            if (output[component.type]) {
                output[component.type].push(compJson)
            } else {
                output[component.type] = [compJson]
            }
        }
    }



    // components is the componentType which is the key in the hashmap
    // component is the index going through the list of components indexed by the type 
    for (var components in output) {
        // for each element of the same component type, 
        for (var component = 0; component < output[components].length; component++) {
            var nodeInd1 = findPin(output[components][component]["node1"]);
            var nodeInd2 = findPin(output[components][component]["node2"]);
            var nodeInd3 = findPin(output[components][component]["node3"]);
            for (var gndIndex = 0; gndIndex < gndList.length; gndIndex++) {
                if (pinCmp(gndList[gndIndex], nodeInd1)) {
                    nodeInd1 = "gnd";
                }
                if (pinCmp(gndList[gndIndex], nodeInd2)) {
                    nodeInd2 = "gnd";
                }
                if (components === 'nBJT') {
                    if (pinCmp(gndList[gndIndex], nodeInd3)) {
                      nodeInd3 = 'gnd'
                    }
                }
            }
            if (typeof (nodeInd1) == "number") {
                nodeInd1 = nodeInd1.toString();
            }
            if (typeof (nodeInd2) == "number") {
                nodeInd2 = nodeInd2.toString();
            }
            output[components][component]['node1'] = nodeInd1
            output[components][component]['node2'] = nodeInd2
      
      if (components === 'nBJT') {
        output[components][component]['node1'] = nodeInd2
        output[components][component]['node2'] = nodeInd1
        output[components][component]['node3'] = nodeInd3
      }      
      }
    }
    console.log("output of nodeID");
    console.log(output);
    return output
}

// Interface to the external 
export { nodeId };