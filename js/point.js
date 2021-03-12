//Choose the largest or smallest among the alternative values
function selectMax(ref, alts, func) {
    let max = -Infinity, sub;
    for (let i = 0; i < alts.length; i++) {
        if (alts[i]) {
            const res = func(ref, alts[i]);
            if (res > max) {
                max = res;
                sub = i;
            }
        }
    }
    if (sub !== undefined) {
        return ({
            value: alts[sub],
            sub
        });
    } else {
        return (false);
    }
}
function selectMin(ref, alts, func) {
    let min = Infinity, sub;
    for (let i = 0; i < alts.length; i++) {
        if (alts[i]) {
            const res = func(ref, alts[i]);
            if (res < min) {
                min = res;
                sub = i;
            }
        }
    }
    if (sub !== undefined) {
        return ({
            value: alts[sub],
            sub
        });
    } else {
        return (false);
    }
}

function vectorProduct(a, b) {
    return exPoint.prototype.product.call(a, b);
}
function nodeDistance(node, end) {
    return exPoint.prototype.distance.call(node, end);
}

//Point and vector
function exPoint(arr) {
    if (Point.isPoint(arr)) {
        //Input is point
        this[0] = arr[0];
        this[1] = arr[1];
    } else if (Point.isVector(arr)){
        //Input is vector
        this[0] = arr[1][0] - arr[0][0];
        this[1] = arr[1][1] - arr[0][1];
    }
    this.length = 2;
    Object.defineProperty(this, 'length', {
        configurable: false,
        enumerable: false,
        writable: false
    });
}
exPoint.prototype = {
    //For add, if input is array, then add one by one (element-wise)
    add(label = 1, a) {
        const sum = [],
            sign = (a === undefined) ? 1 : label,
            arr = (a === undefined) ? label : a;

        if (typeof arr === 'number') {
            for (let i = 0; i < this.length; i++) {
                sum[i] = this[i] + arr * sign;
            }
        } else if (arr.length) {
            for (let i = 0; i < this.length; i++) {
                if (typeof arr[i] !== 'number') {
                    sum[i] = this[i];
                } else {
                    sum[i] = this[i] + arr[i] * sign;
                }
            }
        } else {
            sum[0] = this[0];
            sum[1] = this[1];
        }
        return (new exPoint(sum));
    },
    //For mul (multiply)，if input is array, then multiply one by one (element-wise)
    mul(label = 1, a) {
        const sum = [],
            sign = (a === undefined) ? 1 : label;
        let arr = (a === undefined) ? label : a;

        if (typeof arr === 'number') {
            arr = (sign === -1) ? 1 / arr : arr;
            for (let i = 0; i < this.length; i++) {
                sum[i] = this[i] * arr;
            }
        } else if (arr.length) {
            for (let i = 0; i < this.length; i++) {
                if (typeof arr[i] !== 'number') {
                    sum[i] = this[i];
                } else {
                    const muled = (sign === -1) ? 1 / arr[i] : arr[i];
                    sum[i] = this[i] * muled;
                }
            }
        } else {
            sum[0] = this[0];
            sum[1] = this[1];
        }
        return (new exPoint(sum));
    },
    //Vector multiplication
    product(a) {
        return (this[0] * a[0] + this[1] * a[1]);
    },
    //Absolute value
    abs() {
        return (new exPoint([
            Math.abs(this[0]),
            Math.abs(this[1])
        ]));
    },
    //Unitization, the sign does not change, the value becomes 1
    toUnit(x) {
        const a = Number(this[0]), b = Number(this[1]);
        if (!a && !b) {
            return (new exPoint([0, 0]));
        }

        const scale = 1 / Math.sqrt(a * a + b * b),
            factor = x ? Number(x) : 1;

        return (new exPoint([a * scale * factor, b * scale * factor]));
    },
    //Whether it is an integer point
    isInteger() {
        if (this.length !== 2 ||
            this[0] !== Math.floor(this[0]) ||
            this[1] !== Math.floor(this[1])) {
            return (false);
        }
        return (true);
    },
    //Whether it is in parallel
    isParallel(vector) {
        return (this[0]*vector[1] === this[1]*vector[0]);
    },
    //Whether it is vertical
    isVertical(vector) {
        return (!(this[0]*vector[0] + this[1]*vector[1]));
    },
    //If direction is the same, 0 vector will output false
    isSameDire(vector) {
        const vc1 = this.toUnit(),
            vc2 = Point.prototype.toUnit.call(vector);
        return (vc1.isEqual(vc2));
    },
    //If direction is opposite, 0 vector will output false
    isOppoDire(vector) {
        const vc1 = this.toUnit().mul(-1),
            vc2 = Point.prototype.toUnit.call(vector);
        return (vc1.isEqual(vc2));
    },
    //Within a certain line segment
    inLine(line, sign) {
        //"sign" is a mandatory comparison condition
        if (sign === 'y' || line[0][0] === line[1][0] && line[0][0] === this[0]) {
            return (
                (this[1] >= line[0][1] && this[1] <= line[1][1]) ||
                (this[1] <= line[0][1] && this[1] >= line[1][1])
            );
        } else if (sign === 'x' || line[0][1] === line[1][1] && line[0][1] === this[1]) {
            return (
                (this[0] >= line[0][0] && this[0] <= line[1][0]) ||
                (this[0] <= line[0][0] && this[0] >= line[1][0])
            );
        }
    },
    //Distance from point to point or line
    distance(end) {
        if (end[0].length) {
            //end is line segment
            //vertical -> 1, parallel -> 0
            const sub = +(end[0][1] !== end[1][1]);
            if (((this[sub] <= end[0][sub]) && (this[sub] >= end[1][sub])) ||
                ((this[sub] >= end[0][sub]) && (this[sub] <= end[1][sub]))) {
                //this. is inside line segment x or y-axis
                return (Math.abs(this[1 - sub] - end[0][1 - sub]));
            } else {
                //Otherwise, take the line segment end that has smaller distance to this.
                return (Math.min(
                    Math.abs(this[0] - end[0][0]) + Math.abs(this[1] - end[0][1]),
                    Math.abs(this[0] - end[1][0]) + Math.abs(this[1] - end[1][1])
                ));
            }
        } else {
            //end is point
            return (Math.abs(this[0] - end[0]) + Math.abs(this[1] - end[1]));
        }
    },
    //Round
    round(n = 20) {
        return (new exPoint([
            Math.round(this[0] / n) * n,
            Math.round(this[1] / n) * n
        ]));
    },
    roundToSmall(n = 20) {
        return (new exPoint([
            Math.round(this[0] / n),
            Math.round(this[1] / n)
        ]));
    },
    //Round down
    floor(n = 20) {
        return (new exPoint([
            Math.floor(this[0] / n) * n,
            Math.floor(this[1] / n) * n
        ]));
    },
    floorToSmall(n = 20) {
        return (new exPoint([
            Math.floor(this[0] / n),
            Math.floor(this[1] / n)
        ]));
    },
    //Take the current point as the upper left corner to generate square coordinates
    toGrid() {
        return ([
            new exPoint(this),
            new exPoint([this[0] + 20, this[1]]),
            new exPoint([this[0], this[1] + 20]),
            new exPoint([this[0] + 20, this[1] + 20])
        ]);
    },
    //Among all vectors, the vector with the smallest angle to this.
    similar(vectors) {
        return selectMax(this, vectors, vectorProduct);
    },
    //Among all points, the point with the shortest distance to this.
    closest(points) {
        return selectMin(this, points, nodeDistance);
    },
    //Among all points, the point with the longest distance to this.
    farest(points) {
        return selectMax(this, points, nodeDistance);
    },
    //Rotate
    rotate(matrix, center) {
        center = center || (new exPoint([0, 0]));

        const vector = this.add(-1, center),
            vectorR = matrix.multo([vector]),
            node = Point(vectorR[0]).add(center);

        return (node);
    }
};
Object.setPrototypeOf(exPoint.prototype, Array.prototype);

//Public constructor
function Point(...args) {
    return (new exPoint(...args));
}
Point.extend({
    isPoint(arr) {
        return (
            arr instanceof Object &&
            arr instanceof exPoint ||
            typeof arr[0] === 'number' &&
            typeof arr[1] === 'number'
        );
    },
    isVector(arr) {
        return (
            Point.isPoint(arr[0]) &&
            Point.isPoint(arr[1])
        );
    }
});
Point.prototype = exPoint.prototype;

export { Point };
