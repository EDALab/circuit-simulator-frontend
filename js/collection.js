//Maximum number of single devices
const maxNumber = 50;

//Device stack class
function PartsCollection(parts) {
    if (parts instanceof PartsCollection) {
        return (parts);
    } else if (typeof parts === 'number') {
        return (new PartsCollection());
    }
    this.hash = {};
    this.current = {};
    this.length = 0;
    //Input cannot be empty
    if (parts !== undefined) {
        if (!(parts instanceof Array)) {
            this.push(parts);
        }
        for (let i = 0; i < parts.length; i++) {
            this.push(parts[i]);
        }
    }

    Object.defineProperties(this, {
        hash: {
            configurable: false,
            writable: false,
            enumerable: false
        },
        length: {
            configurable: false,
            enumerable: false
        },
        current: {
            configurable: false,
            enumerable: false
        }
    });
}
PartsCollection.prototype = {
    constructor: PartsCollection,
    //Device push
    push(part) {
        if (!part.elementDOM) {
            return (false);
        }
        if (this.has(part)) {
            const insert = this.hash[part.id],
                insertElem = part,
                top = this.length - 1,
                topElem = this[top];
            this[top] = insertElem;
            this[insert] = topElem;
            this.hash[insertElem] = top;
            this.hash[topElem] = insert;
        } else {
            this[this.length++] = part;
            this.hash[part.id] = this.length - 1;
        }
        return (this);
    },
    //Top device pop
    pop() {
        const temp = Array.prototype.pop.call(this);
        if (temp) {
            delete this.hash[temp.id];
            return (temp);
        }
    },
    //Return device object based on device ID
    findPart(tempid) {
        if (!tempid) {
            return (false);
        }

        let id;
        const isSubcircuit = tempid.includes("X_"); // TODO: restrict users from using custom names for their subcircuits that contain the delimiter character we use: "_" - do it in main in validateSubcircuit
        if(isSubcircuit) { // had to do this because we have subcircuitHTMLId that we set to be customname_X_[number], which is different than the id format for other types of parts already implemented in this codebase (handled by the else case below),
            // due to us needing to have name and X_[number] to uniquely identify a subcircuit part 
            const substringsOfId = tempid.split('_');
            id = substringsOfId[1] + "_" + substringsOfId[2];
        } else {
            id = tempid.split('-')[0];
        }
        if (!this.has(id)) {
            return (false);
        }
        return (this[this.hash[id]]);
    },
    //Delete device
    deletePart(part) {
        let tempid = void 0;
        if (typeof part === 'string') {
            tempid = part;
        } else if ((part.elementDOM && part.input) || (part.id.indexOf('line') !== -1)) {
            tempid = part.id;
        } else {
            throw ('The input parameter must be a string or device object');
        }

        if (this.hash[tempid] === undefined) {
            return (false);
        }
        //Device index to be deleted
        const sub = this.hash[tempid];
        this.splice(sub, 1);

        //All the records in the hash table of all devices after the deleted device are reduced by 1
        for (let i = sub; i < this.length; i++) {
            this.hash[this[i].id]--;
        }
        //Delete records in the hash table
        delete this.hash[tempid];
    },
    //Delete device collection
    deleteParts(input) {
        let func = void 0,
            temp = void 0,
            set = void 0;
        if (typeof input === 'function') {
            func = input;
        } else {
            temp = new PartsCollection(input);
            func = function (n) {
                return (!temp.has(n));
            };
        }

        set = this.filter(func);
        this.deleteAll();
        set.forEach((n) => this.push(n));
    },
    //Does the collection contain the device
    has(part) {
        let tempid = '';
        if (typeof part === 'string') {
            tempid = part.split('-')[0];
        } else {
            tempid = part.id;
        }
        return (this.hash[tempid] !== undefined);
    },
    //Calculate new ID from existing devices
    newId(input) {
        const temp = input.match(/^[^_]+(_[^_]+)?/),
            id = temp && temp[0];

        if (!temp) {
            throw ('Device ID format error');
        }

        let tempid = '', ans = void 0;
        //The input string is not underlined
        if (id.indexOf('_') === -1) {
            tempid = id + '_';
        } else if (!this.has(input)) {
            return (input);
        } else {
            tempid = id.split('_')[0] + '_';
        }

        for (let i = 1; i <= maxNumber; i++) {
            ans = tempid + i;
            if (!this.has(ans)) {
                return (ans);
            }
        }
        throw ('The number of devices exceeds the maximum limit');
    },
    //Device stack empty
    deleteAll() {
        for (let i = 0; i < this.length; i++) {
            this[i].toNormal();
            delete this.hash[this[i].id];
            delete this[i];
        }
        this.length = 0;
        this.current = {};
    },
    //Split connected graph and return connected graph array
    connectGraph() {
        const partsArea = [],   //Circuit connection area
            partsHash = {};     //Hash lookup table for all components of the circuit

        //Connection table initialization
        this.forEach((n) => partsHash[n.id] = true);
        //Scan all devices and divide the circuit connection map area
        this.forEach(function (n) {
            if (partsHash[n.id]) {
                //Initialization of current connected region
                const parts = new PartsCollection(n),
                    ans = new PartsCollection();
                //Search the current connected area by the initial device
                while (parts.length) {
                    const item = parts.pop();       //Top element pop
                    partsHash[item.id] = false;     //Current device access flag
                    ans.push(item);                 //Current area device push into the stack
                    item.connect.join(' ').split(' ').forEach(function (n) {
                        const tempPart = partsAll.findPart(n);
                        //attention:
                        if (tempPart.partType === 'Network label') {

                        } else {
                            if (partsHash[tempPart.id] && !parts.has(tempPart))
                                parts.push(tempPart);
                        }
                    });
                }
                partsArea.push(ans);
            }
        });
        return (partsArea);
    },
    //Geometric center point of all devices
    center() {
        //Node collection of all devices
        let nodes = [];
        for (let i = 0; i < this.length; i++) {
            //The wire is a collection of all nodes, and the device is its own geometric center
            const node = this[i].way
                ? this[i].way.nodeCollection()
                : this[i].position.round();

            nodes = nodes.concat(node);
        }

        const nodeX = nodes.map((n) => n[0]),
            nodeY = nodes.map((n) => n[1]);

        return ([
            (Math.minOfArray(nodeX) + Math.maxOfArray(nodeX)) / 2,
            (Math.minOfArray(nodeY) + Math.maxOfArray(nodeY)) / 2
        ]);
    },
    //Same as forEach of Array
    forEach(callback) {
        for (let i = 0; i < this.length; i++) {
            callback(this[i], i, this);
        }
    },
    //Same as Array of every
    every(callback) {
        for (let i = 0; i < this.length; i++) {
            if (!callback(this[i], i, this)) {
                return (false);
            }
        }
        return (true);
    },
    //Same as Array filter
    filter(callback) {
        const ans = new PartsCollection();
        for (let i = 0; i < this.length; i++) {
            if (callback(this[i], i, this)) {
                ans.push(this[i]);
            }
        }
        return (ans);
    }
};
Object.setPrototypeOf(PartsCollection.prototype, Array.prototype);

//Global device collection
const partsAll = new PartsCollection(),
    partsNow = new PartsCollection();

export { partsAll, partsNow, PartsCollection };
