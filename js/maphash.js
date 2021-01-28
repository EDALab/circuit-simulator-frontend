//Drawing record object
const map = {},
    schMap = {};

schMap.extend({
    //Get node attributes with small coordinates
    getValueBySmalle(node) {
        if (!map[node[0]] || !map[node[0]][node[1]]) {
            return (false);
        }
        return (map[node[0]][node[1]]);
    },
    //Get node attributes with original coordinates
    getValueByOrigin(node) {
        return (schMap.getValueBySmalle([node[0] / 20, node[1] / 20]));
    },
    //Forced setting of node attributes with small coordinates, the default is overwrite mode
    setValueBySmalle(node, attribute, flag = false) {
        const i = node[0], j = node[1];

        if (!map[i]) {
            map[i] = [];
        }
        if (flag) {
            //Delete the original attribute
            map[i][j] = {};
        } else if (!map[i][j]) {
            //Delete the original attribute
            map[i][j] = {};
        }

        map[i][j].extend(attribute);
    },
    //Forcibly set the node attributes with the original coordinates, 
    // the existing nodes are overwritten by the new ones, and the old ones are not deleted
    setValueByOrigin(node, attribute, flag = false) {
        schMap.setValueBySmalle([node[0] / 20, node[1] / 20], attribute, flag);
    },
    //Delete node with small coordinates
    deleteValueBySmalle(node) {
        const status = schMap.getValueBySmalle(node);
        if (status && status.connect) {
            //Delete the connection information of the point connected to the current point
            for (let i = 0; i < status.connect.length; i++) {
                schMap.deleteConnectBySmalle(status.connect[i], node);
            }
        }
        if (status) {
            delete map[node[0]][node[1]];
        }
        if (Object.isEmpty(map[node[0]])) {
            delete map[node[0]];
        }
    },
    //Delete node with original coordinates
    deleteValueByOrigin(node) {
        return (schMap.deleteValueBySmalle([node[0] / 20, node[1] / 20]));
    },
    //Add connection relationship, if repeated then ignore
    pushConnectBySmalle(node, connect) {
        let status = schMap.getValueBySmalle(node);

        if (!status) {
            return (false);
        }
        if (!status.connect) {
            status.connect = [];
        }
        status = status.connect;
        for (let i = 0; i < status.length; i++) {
            if (status[i].isEqual(connect)) {
                return (false);
            }
        }
        status.push(connect);
        return (true);
    },
    pushConnectByOrigin(a, b) {
        const node = [a[0] / 20, a[1] / 20],
            connect = [b[0] / 20, b[1] / 20];

        return schMap.pushConnectBySmalle(node, connect);
    },
    //Delete the connection relationship, if not exist then ignore
    deleteConnectBySmalle(node, connect) {
        const status = schMap.getValueBySmalle(node);

        if (!status || !status.connect) {
            return (false);
        }

        for (let i = 0; i < status.connect.length; i++) {
            if (status.connect[i].isEqual(connect)) {
                status.connect.splice(i, 1);
                break;
            }
        }
        return (true);
    },
    deleteConnectByOrigin(a, b) {
        const node = [a[0] / 20, a[1] / 20],
            connect = [b[0] / 20, b[1] / 20];

        return schMap.deleteConnectBySmalle(node, connect);
    },
    //check if node and connect exist on the same wire
    nodeInConnectBySmall(node, connect) {
        const status = schMap.getValueBySmalle(node);
        if (status && (status.form === 'line' || status.form === 'cross-point')) {
            for (let i = 0; i < status.connect.length; i++) {
                if (status.connect[i].isEqual(connect)) {
                    return (true);
                }
            }
        }
        return (false);
    },
    nodeInConnectByOrigin(a, b) {
        const node = [a[0] / 20, a[1] / 20],
            connect = [b[0] / 20, b[1] / 20];

        return schMap.nodeInConnectBySmall(node, connect);
    },
    //check if the node is a wire
    isLine(node, flag) {
        const tempStatus = (flag === 'small')
            ? schMap.getValueBySmalle(node)
            : schMap.getValueByOrigin(node);

        return (
            tempStatus &&
            tempStatus.form === 'line' ||
            tempStatus.form === 'cross-point' ||
            tempStatus.form === 'cover-point'
        );
    },
    //check if the node is the pin of a device
    isPartPoint(node, flag) {
        const tempStatus = (flag === 'small')
            ? schMap.getValueBySmalle(node)
            : schMap.getValueByOrigin(node);

        return (
            tempStatus &&
            tempStatus.form === 'part-point'
        );
    },
    //Go straight along the vector in the range of [start, end], find the coordinates of the last point
    alongTheLineBySmall(start, end, vector) {
        //Invalid coordinates are infinite
        end = end ? end : [3000, 3000];
        //If there is no direction, the direction is from start to end
        vector = vector
            ? vector
            : [end[0] - start[0], end[1] - start[1]];

        //unit vector
        vector[0] = vector[0].toUnit();
        vector[1] = vector[1].toUnit();

        // if the starting point is not a wire or the starting point is equal to the ending point, 
        // return directly
        if (!schMap.isLine(start, 'small') || start.isEqual(end)) {
            return (start);
        }

        let node = [start[0], start[1]],
            next = [node[0] + vector[0], node[1] + vector[1]];
        //If the current point has not reached the end point, 
        // and it is still inside the line where the wire is located, then go forward
        while (schMap.isLine(next, 'small') && !node.isEqual(end)) {
            if (schMap.nodeInConnectBySmall(node, next)) {
                node = next;
                next = [node[0] + vector[0], node[1] + vector[1]];
            } else {
                break;
            }
        }

        return node;
    },
    alongTheLineByOrigin(a, b, c) {
        const start = [a[0] / 20, a[1] / 20],
            end = [b[0] / 20, b[1] / 20],
            ans = schMap.alongTheLineBySmall(start, end, c);

        return ([ans[0] * 20, ans[1] * 20]);
    },
    //search the nearest feasible point around the node,
    //callback is a judging function, it has an external input
    nodeRound(node, mouse, callback) {
        const ans = [];
        let m = 0;
        while (!ans.length) {
            for (let k = 0; k <= m; k++) {
                for (let i = node[0] - m * 20; i <= node[0] + m * 20; i += 20) {
                    for (let j = node[1] - m * 20; j <= node[1] + m * 20; j += 20) {
                        if (Math.abs(i - node[0]) + Math.abs(j - node[1]) === (k + m) * 20) {
                            if (!callback([i, j])) {
                                ans.push([i, j]);
                            }
                        }
                    }
                    if (ans.length) break;
                }
            }
            m++;
        }

        const vectors = ans.map((item) => [item[0] - node[0], item[1] - node[1]]);
        return (ans[node.add(-1, mouse).similar(vectors).sub]);
    },
    //return all the nodes
    toSmallNodes() {
        const ans = [];
        for (const i in map) {
            if (map.hasOwnProperty(i)) {
                for (const j in map[i]) {
                    if (map[i].hasOwnProperty(j)) {
                        ans.push([i, j]);
                    }
                }
            }
        }
        return (ans);
    },
    //Returns the direction of the staggered node to the specified wire
    cross2line(node, line) {
        const status = schMap.getValueByOrigin(node);
        if (!status || status.form !== 'cross-point') {
            return (false);
        }
        for (let i = 0; i < status.connect.length; i++) {
            const con = status.connect[i],
                temp = schMap.getValueBySmalle(con);

            if (temp.id.indexOf(line) !== -1) {
                return ([
                    node[0] - con[0] * 20,
                    node[1] - con[1] * 20
                ]);
            }
        }
        return (false);
    }
});

export { schMap };
