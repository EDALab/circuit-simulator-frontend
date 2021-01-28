//Matrix constructor
//The arrays inside the new matrix are all new and will not reference any data in the input array
function Matrix(row, column = row, value = 0) {
    if (row instanceof Array) {
        const temp = Matrix.isMatrix(row);
        if (temp) {
            for (let i = 0; i < row.length; i++) {
                this[i] = Array.clone(row[i]);
            }
            this.row = temp[0];
            this.column = temp[1];
            this.length = this.row;
        } else {
            throw ('Array format error, unable to create matrix');
        }
    } else {
        if ((column === 'I') || (column === 'E') || (value === 'I') || (value === 'E')) {
            for (let i = 0; i < row; i++) {
                this[i] = new Array(row).fill(0);
                this[i][i] = 1;
            }
            column = row;
        } else {
            for (let i = 0; i < row; i++) {
                this[i] = new Array(column).fill(value);
            }
        }
        //The length parameter is reserved for the method of Array
        this.row = row;
        this.column = column;
        this.length = row;
    }
    //After the matrix is created, it cannot be changed
    //If you want to change, you can only create a new matrix on this basis
    //Properties are not enumerable and cannot be changed
    Object.defineProperties(this, {
        row: {
            configurable: false,
            enumerable: false,
            writable: false
        },
        column: {
            configurable: false,
            enumerable: false,
            writable: false
        },
        length: {
            configurable: false,
            enumerable: false,
            writable: false
        }
    });
    //Seal matrix
    Object.sealAll(this);
}
//Instance method
Matrix.prototype = {
    constructor: Matrix,
    //Exchange the row and column of coordinate elements a and b
    exchange(a, b) {
        //Exchange row
        if (a[0] !== b[0]) {
            const temp = this[a[0]];
            this[a[0]] = this[b[0]];
            this[b[0]] = temp;
        }
        //Exchange column
        if (a[1] !== b[1]) {
            for (let i = 0; i < this.length; i++) {
                const temp = this[i][a[1]];
                this[i][a[1]] = this[i][b[1]];
                this[i][b[1]] = temp;
            }
        }
    },
    //this * ma
    mul(ma) {
        //Create matrix with input data
        const a = (ma instanceof Matrix) ? ma : (new Matrix(ma));
        if (this.column !== a.row) {
            throw ('这两个矩阵无法相乘');
        }
        //Rows and columns of the multiplication result
        const row = this.row,
            column = a.column;

        //Multiplication calculation
        const ans = new Matrix(row, column);
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                for (let sub = 0; sub < this.column; sub++) {
                    ans[i][j] += this[i][sub] * a[sub][j];
                }
            }
        }

        return ((row === 1) && (column === 1))
            ? ans[0][0]
            : ans;
    },
    //ma * this
    multo(ma) {
        //Create matrix with input data
        const a = (ma instanceof Matrix) ? ma : (new Matrix(ma));
        //交换相乘双方
        return this.mul.call(a, this);
    },
    //Column principal element LU triangle decomposition, return LUP matrix
    luDecompose() {
        if (this.row !== this.column)
            throw ('This is not a determinant and cannot be triangulated');

        const n = this.row;             //The number of rows of the determinant
        const U = Matrix.clone(this);   //Upper triangular determinant
        const L = new Matrix(n);        //Lower triangular determinant
        const P = new Matrix(n, 'E');   //Transform the determinant, initially the identity matrix

        for (let k = 0; k < n; k++) {
            if (k > 0) {
                for (let i = k; i < n; i++) {
                    L[i][k - 1] = U[i][k - 1] / U[k - 1][k - 1];
                    for (let j = k; j < n; j++)
                        U[i][j] -= L[i][k - 1] * U[k - 1][j];
                    U[i][k - 1] = 0;
                }
            }
            if (k < n - 1) {
                let tempmax = 0, tempsub = 0;       //Take the largest coefficient as the pivot element
                for (let i = k; i < n; i++) {
                    if (Math.abs(U[i][k]) > tempmax) {
                        tempmax = Math.abs(U[i][k]);
                        tempsub = i;
                    }
                }
                L.exchange([k, 0], [tempsub, 0]);   //Pivot element
                U.exchange([k, 0], [tempsub, 0]);
                P.exchange([k, 0], [tempsub, 0]);
            }
        }
        for (let i = 0; i < n; i++)                 //The diagonal of the lower triangular matrix is 1
            L[i][i] = 1;
        return ([L, U, P]);
    },
    //Matrix inversion based on LU decomposition
    inverse() {
        const [L, U, P] = this.luDecompose(), n = this.row;
        for (let i = 0; i < U.row; i++)
            if (!U[i][i]) throw ('逆矩阵不存在');

        //Initialization of the inverse matrix of L and U
        const li = new Matrix(n);
        const ui = new Matrix(n);
        //Inverse matrix of U
        for (let i = 0; i < n; i++) {
            ui[i][i] = 1 / U[i][i];
            for (let j = i - 1; j >= 0; j--) {
                let s = 0;
                for (let k = j + 1; k <= i; k++) {
                    s += U[j][k] * ui[k][i];
                }
                ui[j][i] = -s / U[j][j];
            }
        }
        //Inverse matrix of L
        for (let i = 0; i < n; i++) {
            li[i][i] = 1;
            for (let j = i + 1; j < n; j++) {
                for (let k = i; k <= j - 1; k++) {
                    li[j][i] -= L[j][k] * li[k][i];
                }
            }
        }
        //Multiply the inverse matrix of L and U to get the inverse matrix of the original matrix
        const ans = ui.mul(li).mul(P);
        return (ans);
    },
    //Enumerate matrix elements
    forEach(callback) {
        if (this instanceof Matrix) {
            for (let i = 0; i < this.row; i++)
                for (let j = 0; j < this.column; j++) {
                    callback(this[i][j], [i, j], this);
                }
        } else if (this instanceof Array) {
            const range = Matrix.isMatrix(this);
            if (range) {
                for (let i = 0; i < range[0]; i++)
                    for (let j = 0; j < range[1]; j++) {
                        callback(this[i][j], [i, j], this);
                    }
            } else {
                throw ('Only matrices or matrix-like arrays can call this method');
            }
        } else {
            throw ('Only matrices or matrix-like arrays can call this method');
        }
    },
    //Matrix transpose
    transpose() {
        const ans = new Matrix(this.column, this.row);
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                ans[j][i] = this[i][j];
            }
        }
        return (ans);
    },
    //Concatenate matrices to the right
    //The original matrix remains unchanged
    //And the new matrix is returned
    concatRight(...args) {
        let main = Matrix.clone(this);
        for (let x = 0; x < args.length; x++) {
            const ma = args[x],
                rc = Matrix.isMatrix(ma),
                [row, column] = rc ? rc : [];

            if (!row) {
                throw ('Unable to concatenate matrices');
            }

            const ans = new Matrix(row, main.column + column);
            //Add main matrix elements to ans
            main.forEach((n, [i, j]) => ans[i][j] = n);
            //Add ma matrix elements to main
            Matrix.prototype.forEach.call(ma, ((n, [i, j]) => ans[i][j + main.column] = n));
            main = ans;
        }
        return (main);
    },
    //Concatenate matrices downwards
    //The original matrix remains unchanged
    //And the new matrix is returned
    concatDown(...args) {
        let main = Matrix.clone(this);
        for (let x = 0; x < args.length; x++) {
            const ma = args[x],
                rc = Matrix.isMatrix(ma),
                [row, column] = rc ? rc : [];

            if (!row) {
                throw ('Unable to concatenate matrices');
            }

            const ans = new Matrix(main.row + row, column);
            //Add this. matrix element to ans
            main.forEach((n, [i, j]) => ans[i][j] = n);
            //Add ma matrix elements to ans
            Matrix.prototype.forEach.call(ma, ((n, [i, j]) => ans[i + main.row][j] = n));
            main = ans;
        }
        return (main);
    },
    //Select a part of the matrix and return the new matrix
    slice(a, b) {
        //Input format check
        if ((!(a instanceof Array)) || (a.length !== 2) || (typeof a[0] !== 'number') || (typeof a[1] !== 'number') ||
            (!(b instanceof Array)) && (b.length !== 2) || (typeof b[0] !== 'number') || (typeof b[1] !== 'number') ||
            (a[0] < 0) || (b[0] < 0) || (a[1] < 0) || (b[1] < 0) ||
            (a[0] > this.row) || (b[0] > this.row) || (a[1] > this.column) || (b[1] > this.column)) {
            throw ('Wrong input coordinate');
        }

        const start = [], end = [];
        [start[0], end[0]] = a[0] < b[0] ? [a[0], b[0]] : [b[0], a[0]];
        [start[1], end[1]] = a[1] < b[1] ? [a[1], b[1]] : [b[1], a[1]];

        const ans = new Matrix(end[0] - start[0] + 1, end[1] - start[1] + 1);
        for (let i = start[0]; i <= end[0]; i++) {
            for (let j = start[1]; j <= end[1]; j++) {
                ans[i - start[0]][j - start[1]] = this[i][j];
            }
        }
        return (ans);
    },
    //Output string
    vision() {
        for (let i = 0; i < this.row; i++) {
            console.log(this[i].join(', '));
        }
    }
};
//Static method of matrix class
Matrix.extend({
    //Verify whether the matrix ma is a matrix, if so, then return [#row, #column]，otherwise return false
    //Subscripts must start from 0, subscripts must be continuous, and must not contain non-digital elements
    isMatrix(ma) {
        if (ma instanceof Matrix) {
            return ([ma.row, ma.column]);
        }
        let subx = -1, columnMax = -1;
        //Enumerate matrix row subscripts
        for (const i in ma) if (ma.hasOwnProperty(i)) {
            //The subscripts are continuous and the element under the first subscript is also an array
            if ((parseInt(i) - subx === 1) && (ma[i] instanceof Array)) {
                const row = ma[i];
                let suby = -1;
                //Enumerate the current line
                for (const j in row) if (row.hasOwnProperty(j)) {
                    if ((parseInt(j) - suby === 1) &&            //Subscripts are continuous, and the current element is a number
                        (typeof row[j] === 'number')) {
                        suby++;
                    } else {
                        return (false);
                    }
                }
                if (columnMax === -1) {
                    columnMax = suby;
                } else if (columnMax !== suby) {
                    return (false);
                }
            } else {
                return (false);
            }
            subx++;
        }
        return ([subx + 1, columnMax + 1]);
    },
    //Matrix combination
    combination(ma) {
        if (!(ma && (ma instanceof Array)))
            throw ('Cannot combine matrix');
        for (let i = 0; i < ma.length - 1; i++)
            if (!(ma[i] && (ma[i] instanceof Array) && (ma[i + 1] instanceof Array) && (ma[i].length === ma[i + 1].length)))
                throw ('Cannot combine matrix');
        //Each row in row
        const RowInRow = [];
        for (let i = 0; i < ma.length; i++) {
            let Row = undefined;
            for (let j = 0; j < ma[i].length; j++) {
                if ((typeof ma[i][j] !== 'number') && (typeof ma[i][j] !== 'string')) {
                    let tempRow;
                    if (ma[i][j] instanceof Matrix) {
                        tempRow = ma[i][j].row;
                    } else {
                        tempRow = Object.isMatrix(ma[i][j])[0];
                    }
                    if ((Row !== undefined) && (Row !== tempRow))
                        throw ('Cannot combine matrix');
                    Row = tempRow;
                }
            }
            RowInRow.push(Row);
        }
        //Every column in column
        const ColumnInColumn = [];
        for (let j = 0; j < ma[0].length; j++) {
            let Column = undefined;
            for (let i = 0; i < ma.length; i++) {
                if ((typeof ma[i][j] !== 'number') && (typeof ma[i][j] !== 'string')) {
                    let tempColumn;
                    if (ma[i][j] instanceof Matrix) {
                        tempColumn = ma[i][j].column;
                    } else {
                        tempColumn = Object.isMatrix(ma[i][j])[1];
                    }
                    if ((Column !== undefined) && (Column !== tempColumn))
                        throw ('Cannot combine matrix');
                    Column = tempColumn;
                }
            }
            ColumnInColumn.push(Column);
        }
        //Concatenate all matrices
        let ColumnMatrix;
        for (let i = 0; i < ma.length; i++) {
            let RowMatrix;
            for (let j = 0; j < ma[i].length; j++) {
                let temp;
                if (!((ma[i][j] instanceof Matrix) && (ma[i][j] instanceof Array)))
                    temp= new Matrix(RowInRow[i], ColumnInColumn[j], ma[i][j]);
                else temp = ma[i][j];

                if (RowMatrix) RowMatrix = RowMatrix.concatRight(temp);
                else RowMatrix = temp;
            }
            if (ColumnMatrix) ColumnMatrix = ColumnMatrix.concatDown(RowMatrix);
            else ColumnMatrix = RowMatrix;
        }
        return (ColumnMatrix);
    },
    //Clone the current matrix
    clone(ma) {
        if (!(ma instanceof Matrix)) throw ('Only matrices can call this method');
        const ans = new Matrix(ma.row, ma.column);
        ma.forEach((item, [i, j]) => ans[i][j] = item);
        return (ans);
    }
});
//The Matrix class inherits the method of Array
Object.setPrototypeOf(Matrix.prototype, Array.prototype);

export { Matrix };
