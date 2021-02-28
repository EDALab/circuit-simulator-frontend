'use strict';

import { $ } from './jquery';
import { Point } from './point';
import { SVG_NS } from './init';
import { schMap } from './maphash';
import { labelSet } from './parts';
import { partsAll, partsNow } from './collection';

//constants
const actionArea = $('#area-of-parts'),
    tempLine = $('<g>', SVG_NS, {
        id: 'temp-line',
        class: 'line focus'
    }),
    rotate = [
        [[1, 0], [0, 1]],   //same orentation
        [[0, 1], [-1, 0]],  //CW
        [[0, -1], [1, 0]],  //CCW
        [[-1, 0], [0, -1]]  //different orentation
    ];

//Parse the object and create the DOM
function creatDOM(obj) {
    const dom = $(obj.tag, SVG_NS, obj.attribute);
    if (obj.child) {
        for (let i = 0; i < obj.child.length; i++) {
            dom.append(creatDOM(obj.child[i]));
        }
    }
    return (dom);
}
//Wire rect block attributes
function lineRectAttr(a1, a2) {
    const lefttop = [],
        rightlow = [],
        wide = 14,      //Default width 14
        temp = { 'class': 'line-rect' };

    lefttop[0] = Math.min(a1[0], a2[0]);
    lefttop[1] = Math.min(a1[1], a2[1]);
    rightlow[0] = Math.max(a1[0], a2[0]);
    rightlow[1] = Math.max(a1[1], a2[1]);
    if (lefttop[0] === rightlow[0]) {
        temp.x = lefttop[0] - wide / 2;
        temp.y = lefttop[1] - wide / 2;
        temp.height = rightlow[1] - lefttop[1] + wide;
        temp.width = wide;
    } else {
        temp.x = lefttop[0] - wide / 2;
        temp.y = lefttop[1] - wide / 2;
        temp.height = wide;
        temp.width = rightlow[0] - lefttop[0] + wide;
    }
    return (temp);
}

//New node
function newNode(node, rotate) {
    const ans = {};
    ans.vector = [
        node.vector[0] * rotate[0][0] + node.vector[1] * rotate[1][0],
        node.vector[0] * rotate[0][1] + node.vector[1] * rotate[1][1]
    ];
    ans.point = [
        node.point[0] + ans.vector[0],
        node.point[1] + ans.vector[1]
    ];
    return (ans);
}
//Temporary drawing module for search
function SearchMap() {
    const self = {}, map = {};

    self.setValue = function (node, value) {
        if (!map[node[0]]) {
            map[node[0]] = [];
        }
        map[node[0]][node[1]] = value;
    };
    self.getValue = function (node) {
        if (!map[node[0]] || !map[node[0]][node[1]]) {
            return (false);
        }
        return (map[node[0]][node[1]]);
    };

    return (self);
}
//Rule collection module for search
function SearchRules(nodestart, nodeend, mode) {
    const self = {},
        small = 'small',
        start = nodestart.mul(0.05);

    let endLine = [],       //End point equivalent line segment
        excludeParts = '',  //Devices to be excluded
        excludeLines = [],  //Wires to be excluded
        end = Array.clone(nodeend, 0.05);

    //The shortest distance from point to point or line
    function nodeDistance(node, end) {
        return Point.prototype.distance.call(node, end);
    }
    //Whether the line segment of the node is perpendicular to the direction of the current node
    function nodeVerticalLine(node) {
        const status = schMap.getValueBySmalle(node.point);
        if (status && status.form === 'line' || status.form === 'cross-point') {
            for (let i = 0; i < status.connect.length; i++) {
                if ((Point([node.point, status.connect[i]])).isParallel(node.vector)) {
                    return (false);
                }
            }
        }
        return (true);
    }
    //Return the device where the node is located
    function excludePart(node) {
        const status = schMap.getValueBySmalle(node);
        if (status.form === 'part') {
            return status.id;
        } else if (status.form === 'part-point') {
            return status.id.split('-')[0];
        } else {
            return '';
        }
    }
    //Return the line segment where node is located
    function excludeLine(node) {
        if (schMap.isLine(node, 'small')) {
            const ans = [];
            for (let i = 0; i < 2; i++) {
                const temp = [[1, 0], [-1, 0], [0, -1], [0, 1]],
                    limit = [
                        schMap.alongTheLineBySmall(node, false, temp[i * 2]),
                        schMap.alongTheLineBySmall(node, false, temp[i * 2 + 1]),
                    ];
                if (!limit[0].isEqual(limit[1])) {
                    ans.push(limit);
                }
            }
            return (ans);
        } else {
            return [];
        }
    }
    //Extended line segment
    function expandLine(line) {
        const ans = [];
        for (let i = 0; i < line.length - 1; i++) {
            const seg = line.slice(i, i + 2);

            ans[i] = [];
            ans[i][0] = schMap.alongTheLineBySmall(seg[1], false, Point([seg[0], seg[1]]));
            ans[i][1] = schMap.alongTheLineBySmall(seg[0], false, Point([seg[1], seg[0]]));
        }
        return (ans);
    }
    //whether the node is within a certain line segment
    function nodeInLine(node, line) {
        return Point.prototype.inLine.call(node, line);
    }

    //Value estimate
    //node Distance to end (line) + number of turns
    function calValue01(node) {
        return (
            nodeDistance(node.point, end) +
            node.junction
        );
    }
    //node Distance to final line + number of turns
    function calValue02(node) {
        let dis = 0;
        for (let i = 0; i < end.length; i++) {
            dis += nodeDistance(node.point, end[i]);
        }
        return (dis + node.junction);
    }
    //The distance from the node to the end line*3 + 
    // the number of turns*3 + 
    // the distance from the node to the starting point
    function calValue03(node) {
        return (
            calValue02(node) * 3 +
            nodeDistance(node.point, start)
        );
    }

    //Search end rule
    //Is it in the lines collection
    function checkEndEqLine(node, lines) {
        for (let i = 0; i < lines.length; i++) {
            if (nodeInLine(node, lines[i])) {
                return (lines[i]);
            }
        }
        return (false);
    }
    //Equal to the end
    function checkEndNode(node) {
        return node.point.isEqual(end);
    }
    //Within the final line
    function checkEndLine(node) {
        for (let i = 0; i < end.length; i++) {
            if (nodeInLine(node.point, end[i])) {
                return (true);
            }
        }
        return (false);
    }
    //When drawing, point to point (in the wire)
    function checkEndNodeInLine1(node) {
        //Is it equal to the end
        if (node.point.isEqual(end)) {
            return (true);
        }
        //Is it in the end point equivalent line segment
        const exLine = checkEndEqLine(node.point, endLine);
        //Not in the equivalent final line
        if (!exLine) {
            return false;
        }
        //Current path is straight
        if (!node.junction) {
            return true;
        }
        //The relationship between the direction of the equivalent line segment and the current node
        if ((Point(exLine)).isParallel(node.vector)) {
            //The equivalent line segment is parallel to the current node direction
            return true;
        } else {
            //The equivalent line segment is perpendicular to the current node
            const junction = node.junctionParent.vector,
                node2End = Point([node.point, end]);
            return (node2End.isOppoDire(junction));
        }
    }
    //When moving the device, point to point (in the wire)
    function checkEndNodeInLine2(node) {
        return (
            node.point.isEqual(end) ||
            checkEndEqLine(node.point, endLine)
        );
    }

    //Node expansion rules
    //Point to empty
    function checkPointNode2Space(node) {
        const status = schMap.getValueBySmalle(node.point);
        if (!status) {
            //Empty node
            return true;
        } else if (status.form === 'part') {
            //Device node
            return false;
        } else if (status.form === 'part-point') {
            //When the current node is at the pin, it is feasible where the distance is 1 around the end point
            return (nodeDistance(node.point, end) < 2);
        } else if (status.form === 'line' || status.form === 'cross-point') {
            //The current node direction must be perpendicular to the wire direction
            return (nodeVerticalLine(node));
        } else {
            return (true);
        }
    }
    //Direct alignment
    function checkPointNodeAlign(node) {
        const status = schMap.getValueBySmalle(node.point);
        if (!status) {
            return true;
        } else if (status.form === 'part') {
            return false;
        } else if (status.form === 'part-point') {
            //When directly aligned, the device pin can only be equal to the end point
            return (node.point.isEqual(end));
        } else if (status.form === 'line' || status.form === 'cross-point') {
            return (nodeVerticalLine(node));
        } else {
            return (true);
        }
    }
    //Exclude device
    function checkPointExcludePart(node) {
        const status = schMap.getValueBySmalle(node.point);
        if (!status) {
            return (true);
        } else if (status.form === 'part') {
            return (status.id === excludeParts);
        } else if (status.form === 'part-point') {
            return (
                status.id.split('-')[0] === excludeParts ||
                nodeDistance(node.point, end) < 2
            );
        } else if (status.form === 'line' || status.form === 'cross-point') {
            return (nodeVerticalLine(node));
        } else {
            return (true);
        }
    }
    //Exclude wire
    function checkPointExcludeLine(node) {
        const status = schMap.getValueBySmalle(node.point);
        if (!status) {
            return (true);
        } else if (status.form === 'part' ||
            status.form === 'part-point') {
            return (false);
        } else if (status.form === 'line' || status.form === 'cross-point') {
            return (
                checkEndEqLine(node.point, excludeLines) ||
                nodeVerticalLine(node)
            );
        } else {
            return (true);
        }
    }
    //Exclude device/wire
    function checkPointExcludeAlign(node) {
        const status = schMap.getValueBySmalle(node.point);
        if (!status) {
            return (true);
        } else if (status.form === 'part') {
            return (status.id === excludeParts);
        } else if (status.form === 'part-point') {
            return (
                status.id.split('-')[0] === excludeParts ||
                node.point.isEqual(end)
            );
        } else if (status.form === 'line' || status.form === 'cross-point') {
            return (
                checkEndEqLine(node.point, excludeLines) ||
                nodeVerticalLine(node)
            );
        } else {
            return (true);
        }
    }

    //Set the check function according to the input mode
    switch (mode.process) {
        case 'draw': {
            //In the case of drawing, the end can only be a point, 
            // which is classified according to the attributes of the end point
            const status = schMap.getValueBySmalle(end);

            switch (status.form) {
                case 'line': {
                    //wire
                    endLine = excludeLine(end);
                    self.checkPoint = checkPointNodeAlign;
                    self.checkEnd = checkEndNodeInLine1;
                    break;
                }
                case 'cross-point': {
                    //Staggered node
                    endLine = excludeLine(end);
                    self.checkPoint = checkPointNodeAlign;
                    self.checkEnd = checkEndNodeInLine1;
                    break;
                }
                case 'part-point':
                case 'line-point': {
                    //Device pin, wire temporary node
                    self.checkPoint = checkPointNodeAlign;
                    self.checkEnd = checkEndNode;
                    break;
                }
                case 'part': {
                    //Device body
                    excludeParts = excludePart(end);
                    self.checkPoint = checkPointExcludePart;
                    self.checkEnd = checkEndNode;
                    break;
                }
                default: {
                    self.checkPoint = checkPointNode2Space;
                    self.checkEnd = checkEndNode;
                }
            }
            //In drawing mode, node estimation
            self.calValue = calValue01;
            break;
        }
        case 'movePart': {
            /*
             * mode.status There are three situations:
             *  - part2any      Moving parts -> stationary parts
             *  - line2part     Active wire -> stationary device
             *  - line2line     Active wire -> stationary wire
             */

            excludeParts = excludePart(start);
            excludeLines = excludeLine(start);
            if (Point.isPoint(end)) {
                //end is a point
                endLine = excludeLine(end);
                self.calValue = calValue01;
                self.checkEnd = checkEndNodeInLine2;
                self.checkPoint = checkPointExcludeAlign;
            } else {
                //end is a line
                end = expandLine(end);
                self.calValue = calValue02;
                self.checkEnd = checkEndLine;
                self.checkPoint = checkPointExcludeAlign;
            }
            break;
        }
        case 'deformation': {
            end = [end];
            excludeLines = excludeLine(start);
            self.calValue = calValue03;
            self.checkEnd = checkEndLine;
            self.checkPoint = checkPointExcludeLine;
            break;
        }
        case 'modified': {
            if (mode.status !== 'end') {
                excludeParts = excludePart(end);
                excludeLines = excludeLine(start);
            }

            self.checkPoint = checkPointExcludeAlign;
            self.checkEnd = checkEndNode;
            self.calValue = calValue01;
            break;
        }
        default: {

        }
    }

    //Current point expansion points
    self.expandNumber = function (node) {
        //If the current extension point is on a wire and the point is not an excluded point, 
        // then only straight travel is allowed
        if (schMap.isLine(node)) {
            if (this.nodeInLine(node, excludeLines)) {
                return (3);
            } else {
                return (1);
            }
        } else {
            return (3);
        }
    };
    //Whether the starting point matches the ending point
    if (self.checkEnd({ point: start })) {
        return (new LineWay([nodestart]));
    }
    //Return module
    return (self);
}
//Stack module for search
function SearchStack(nodestart, vector, map) {
    const self = {}, stack = [], start = nodestart.mul(0.05);

    stack[0] = [];
    stack[0][0] = {
        point: start,
        vector,
        junction: 0,
        value: 0,
        parent: false,
        straight: true
    };
    //The junctionParent attribute of the starting point is equal to itself
    stack[0][0].junctionParent = stack[0][0];
    map.setValue(start, stack[0][0]);

    self.openSize = 1;
    self.closeSize = 0;
    self.pop = function () {
        for (const i in stack) {
            if (stack.hasOwnProperty(i)) {
                const temp = stack[i].pop();
                if (!stack[i].length) {
                    delete stack[i];
                }
                self.openSize--;
                self.closeSize++;
                return (temp);
            }
        }
    };
    self.push = function (node) {
        let expandFlag = true;
        const status = map.getValue(node.point);

        if (status) {
            //If the current expanded node has been searched, it needs to be compared, and keep the smaller value
            if (node.value > status.value) {
                expandFlag = false;
            } else if (stack[status.value]) {
                for (let j = 0; j < stack[status.value].length; j++) {
                    if (status === stack[status.value][j]) {
                        stack[status.value].splice(j, 1);
                        if (!stack[status.value].length) {
                            delete stack[status.value];
                        }
                        break;
                    }
                }
            }
        }
        if (expandFlag) {
            //According to the estimated size, insert the newly expanded point into the open stack
            if (!stack[node.value]) {
                stack[node.value] = [];
            }
            stack[node.value].push(node);
            map.setValue(node.point, node);
            self.openSize++;
        }
    };
    self.get = function (i, j) {
        if (!stack[i] || !stack[i][j]) {
            return (false);
        } else {
            return (stack[i][j]);
        }
    };

    return (self);
}
//A*Path search
function AStartSearch(start, end, vector, opt) {
    //initialization
    const map = SearchMap(),
        check = SearchRules(start, end, opt),
        stackopen = SearchStack(start, vector, map);

    //Check if checkNode has an end tag
    if (check instanceof LineWay) {
        return (check);
    }

    //End tag
    let endFlag = false, endStatus;
    //A*Search, less than 1000 nodes
    while ((!endFlag) && (stackopen.closeSize < 1000)) {
        //The top element of the open stack pops up as the current node
        const nodenow = stackopen.pop(),
            expandCount = check.expandNumber(nodenow.point);

        (typeof mapTest !== 'undefined' && mapTest.point(nodenow.point, '#2196F3', 20));

        for (let i = 0; i < expandCount; i++) {
            const nodexpand = newNode(nodenow, rotate[i]);

            (typeof mapTest !== 'undefined' && mapTest.point(nodexpand.point, '#000000', 20));

            //Node properties calculation
            nodexpand.junction = nodenow.junction + ((!i || i === 3) ? 0 : 1);
            nodexpand.parent = nodenow;
            nodexpand.straight = true;
            nodexpand.junctionParent = i ? nodenow : nodenow.junctionParent;
            nodexpand.value = check.calValue(nodexpand);

            //Whether the current extension point is the end point
            if (check.checkEnd(nodexpand)) {
                endStatus = nodexpand;
                endFlag = true;
                break;
            }

            //Whether the current expansion point meets the expansion requirements
            if (check.checkPoint(nodexpand)) {
                //Node joins the search stack
                stackopen.push(nodexpand);
            } else {
                //Encountered obstacles when going straight
                nodenow.straight = (!i) ? false : nodenow.straight;
            }
        }
        if (!stackopen.openSize && !endFlag) {
            return (new LineWay([Point(start)]));
        }
    }

    (typeof mapTest !== 'undefined' && mapTest.clear());

    const tempway = new LineWay();
    //The junctionParent of the starting point is equal to itself,
    // so the parent attribute of the node is checked here
    while (endStatus.parent) {
        tempway.push(Point([endStatus.point[0] * 20, endStatus.point[1] * 20]));
        endStatus = endStatus.junctionParent;
    }
    tempway.push(Point(start));
    tempway.reverse();
    return (tempway);
}
//Path search function
const Search = {
    //Draw wire
    draw: {
        start(event, opt) {
            const cur = this.current,
                mouseRound = cur.mouse(event).round();

            //The current point is the starting point of the wire, the wire needs to be reversed
            if (this.findConnect(mouseRound) === 0) {
                this.reverse();
            }
            //Temporary variables
            this.current.extend({
                startNode: Point(this.way[0]),
                mouseGrid: new WayMap(),
                enforceAlign: {},
                backup: {
                    node: Point(mouseRound),
                    way: new LineWay(this.way)
                }
            });

            this.toFocus();
            this.enlargeCircle(1);
            this.deleteSign();
            this.freedConnect(1);
            this.toGoing();

            this.current.initTrend = this.initTrend(0);

            if (opt === 'new') {
                delete this.current.backup;
            }
        },
        callback(event) {
            //Pretreatment
            const cur = this.current,
                gridL = cur.gridL,
                enforceAlign = cur.enforceAlign,
                mouseBias = cur.mouseBias(event),
                mousePosition = cur.mouse(event),
                mouseRound = mousePosition.round(),
                mouseFloor = mousePosition.floor(),
                pointStatus = schMap.getValueByOrigin(mouseRound),
                option = { process: 'draw' };

            let lastConnect = false;

            //Current state of the mouse
            if (pointStatus.form === 'line-point' ||
                pointStatus.form === 'cross-point' &&
                pointStatus.connect.length === 3) {
                option.status = 'point';
            } else if (pointStatus.form === 'line' ||
                pointStatus.form === 'cross-point' &&
                pointStatus.connect.length === 4) {
                option.status = 'line';
            } else if (enforceAlign.label && enforceAlign.onPart) {
                option.status = 'align';
            } else {
                option.status = 'space';
            }

            //Update the search path when the mouse moves one grid or the forced update flag is high
            if (enforceAlign.flag || !mouseFloor.isEqual(gridL)) {
                //Last connection point
                lastConnect = enforceAlign.label;
                //Force alignment flag reset
                enforceAlign.label = false;
                enforceAlign.flag = false;
                //Prepare grid data
                const partObj = enforceAlign.part,
                    nodeStart = cur.startNode,
                    initTrend = cur.initTrend,
                    mouseGridL = cur.mouseGrid || new WayMap(),
                    mouseGrid = cur.mouseGrid = new WayMap();
                let endGrid = mouseFloor.toGrid();

                //On the device, it needs to be aligned with the device pins
                if (enforceAlign.onPart) {
                    const mouseVector = mousePosition.add(mouseBias).add(-1, partObj.position),
                        pointVector = partObj.pointRotate()
                            .map((item, index) => (partObj.connect[index]) ? false : item.position),
                        pointEnd = mouseVector.similar(pointVector);
                    //Allow direct alignment
                    if (pointEnd) {
                        const nodeEnd = partObj.position.add(pointEnd.value);
                        option.status = 'align';
                        endGrid = [nodeEnd];
                        enforceAlign.label = { part: partObj, sub: pointEnd.sub, node: nodeEnd };
                    }
                }

                //Update path
                mouseGridL.forSameNode(endGrid, mouseGrid);
                for (let i = 0; i < endGrid.length; i++) {
                    const end = endGrid[i];
                    if (!mouseGrid.has(end)) {
                        mouseGrid.set(end,
                            AStartSearch(nodeStart, end, initTrend, option)
                                .checkWayExcess(initTrend)
                        );
                    }
                }

                //Record the anchor point of the current search box
                gridL[0] = Math.floor(mousePosition[0] / 20) * 20;
                gridL[1] = Math.floor(mousePosition[1] / 20) * 20;
            }

            //Post-processing
            const mouseGrid = cur.mouseGrid,
                backup = cur.backup;
            if (lastConnect) {
                lastConnect.part.shrinkCircle(lastConnect.sub);
            }
            switch (option.status) {
                case 'line': {
                    //Mouse on a wire
                    //The intersection of the set of coordinates connected
                    // to the point rounded by the mouse and the set of square coordinates
                    const roundSet = pointStatus.connect
                        .map((item) => [item[0] * 20, item[1] * 20])
                        .filter((item) => mouseGrid.has(item) &&
                            schMap.getValueByOrigin(item).form !== 'part-point');

                    if (roundSet.length) {
                        //Intersection is not empty
                        //The point closest to the mouse in the intersection
                        const closest = mousePosition.closest(roundSet).value,
                            mouseRoundWay = mouseGrid.get(mouseRound);
                        //The last two nodes of the wire are different
                        if (mouseRoundWay.isSimilar(mouseGrid.get(closest))) {
                            this.shrinkCircle(1);
                            this.way.clone(mouseRoundWay);
                            this.way.endToLine([mouseRound, closest], mousePosition);
                            break;
                        }
                    }
                }
                case 'point': {
                    //Align with point mode
                    this.way.clone(mouseGrid.get(mouseRound));
                    this.shrinkCircle(1);
                    break;
                }
                case 'align': {
                    //Direct alignment mode
                    this.shrinkCircle(1);
                    this.way.clone(mouseGrid.get(enforceAlign.label.node));
                    enforceAlign.label.part.enlargeCircle(enforceAlign.label.sub);
                    break;
                }
                default: {
                    //The mouse is currently empty
                    this.way.clone(mouseGrid.nodeMax());
                    this.way.endToMouse(mousePosition);
                    this.enlargeCircle(1);
                }
            }
            if (backup && backup.node.isEqual(this.way.get(-1))) {
                this.way.clone(backup.way);
            }
            this.wayDrawing();
        },
        end() {
            const start = this.way[0],
                initTrend = this.current.initTrend,
                mouse = this.way.get(-1),
                mouseRound = mouse.round(),
                status = schMap.getValueByOrigin(mouseRound);

            //Find a feasible point with mouseRound as the center, and search the path again
            function newLineWay() {
                const end = Point(schMap.nodeRound(mouseRound, mouse,
                    schMap.getValueByOrigin.bind(schMap)
                ));
                return (
                    AStartSearch(start, end, initTrend, { process: 'modified' })
                        .checkWayExcess(initTrend, 'end')
                );
            }

            //If the start and end points are equal or there is only one point, 
            // the current traverse will be deleted
            if (this.way.length < 2 || mouseRound.isEqual(this.way[0])) {
                this.deleteSelf();
                return (false);
            }

            //Determine the outcome of the lead according to the end point classification
            switch (status.form) {
                case 'part-point': {
                    //Device pin
                    const part = partsAll.findPart(status.id),
                        mark = status.id.split('-')[1];

                    if (!part.connect[mark]) {
                        this.nodeToConnect(1);
                        part.toFocus();
                    } else {
                        //This point is already occupied
                        this.way.clone(newLineWay());
                    }
                    break;
                }
                case 'line-point':
                case 'line':
                case 'cross-point': {
                    this.nodeToConnect(1);
                    //The wire is deleted, exit directly
                    if (!this.isExist()) {
                        return (false);
                    }
                    break;
                }
                default: {
                    if (!this.connect[0]) {
                        this.deleteSelf();
                        return (false);
                    }
                    this.way.clone(newLineWay());
                }
            }

            this.render();
            this.markSign();
        }
    },
    //Wire deformation caused by moving devices
    movePart: {
        start() {
            //Device with two connection points
            const con0 = partsAll.findPart(this.connect[0]),
                con1 = partsAll.findPart(this.connect[1]),
                cur = this.current;

            if (partsNow.has(con0) || partsNow.has(con1)) {
                //Active device -> stationary wire/device
                //Moving device side as a starting point
                if (this.connectStatus(1) === 'part' &&
                    partsNow.has(con1)) {
                    this.reverse();
                }
                cur.status = 'part2any';
            } else if (!con0 && !con1) {
                //Active wire -> stationary wire
                //Among the wires connected to terminal 1 are in the partNow stack
                //At this time, the wire needs to be reversed, 
                // and the default active wire end is the starting point
                if (this.connect[1].split(' ')
                    .some((n) => partsNow.has(n))) {
                    this.reverse();
                }

                cur.status = 'line2line';
            } else if (!con0 || !con1) {
                //Active wire -> stationary device
                // con0 exists, which means that endpoint 0 is a static device
                // At this time, the wire needs to be reversed, and the active wire end is the default点
                if (con0) {
                    this.reverse();
                }

                cur.status = 'line2part';
                //Outgoing direction of stationary components as spare
                cur.backTrend = this.initTrend(1);
            }
            //Temporary attributes
            cur.wayBackup = new LineWay(this.way);
            cur.initTrend = this.initTrend(0);
            cur.startPoint = Point(this.way[0]);
        },
        callback(point) {
            const cur = this.current,
                gridL = cur.gridL,
                initTrend = cur.initTrend,
                mouseFloor = point.floor(),
                option = { process: 'movePart', status: cur.status };

            //Update path
            if (!mouseFloor.isEqual(gridL)) {
                const wayBackup = cur.wayBackup,
                    gridPoints = mouseFloor.toGrid(),
                    end = wayBackup.gridToEnd(gridPoints),
                    searchGridL = cur.searchGrid || new WayMap(),
                    searchGrid = cur.searchGrid = new WayMap(),
                    mouseGrid = cur.mouseGrid = new WayMap();

                //End is marked
                searchGrid.sign = end;
                //Update path
                searchGridL.forSameNode(gridPoints, searchGrid);
                for (let i = 0; i < gridPoints.length; i++) {
                    const start = gridPoints[i];
                    if (searchGrid.has(start)) {
                        continue;
                    }

                    searchGrid.set(start,
                        AStartSearch(start, end.seg, initTrend, option)
                            .checkWayExcess(initTrend)
                    );
                }

                //New and old paths merge
                searchGrid.forEach((node, way) => {
                    const temp = new LineWay(wayBackup);
                    temp.splice(0, end.sub, ...way);
                    temp.checkWayRepeat();

                    mouseGrid.set(node, temp);
                });
                //Record the anchor point of the current search box
                cur.gridL = mouseFloor;
            }

            //Post-processing
            const mouseGrid = this.current.mouseGrid;
            this.way.clone(mouseGrid.nodeMax());
            this.way.endToMouse(-1, point);
            this.wayDrawing();
        },
        end() {
            const cur = this.current;
            if (cur.status !== 'move') {
                //Seeking a new start/end
                const backup = cur.wayBackup,
                    trend = cur.initTrend,
                    start = this.connectNode(0),
                    option = { process: 'movePart', status: cur.status },
                    end = backup.gridToEnd(start.floor().toGrid()),
                    temp = AStartSearch(start, end.seg, trend, option)
                        .checkWayExcess(trend, 'end');

                //Merge path
                this.way.clone(backup);
                this.way.splice(0, end.sub, ...temp);
                this.way.checkWayLine();

                //Reset endpoint connection
                this.resetConnect(backup);
            }
            this.render();
            this.markSign();
        }
    },
    //Wire deformation
    deformation: {
        start(event) {
            const self = this,
                cur = self.current,
                mouse = cur.mouse(event),
                seg = self.way.nodeInWay(mouse);

            cur.startMouse = mouse;
            cur.movePoint = Point(seg.value[0]);
            cur.backup = new LineWay(this.way);
            cur.backup.sub = seg.sub;
            cur.moveVector = Point(seg.value).toUnit().abs().reverse();

            self.toGoing();
            self.deleteSign();

            cur.Limit = {};
            if (schMap.isLine(this.way[0])) {
                cur.Limit.start = [
                    schMap.alongTheLineByOrigin(this.way[0], false, cur.moveVector),
                    schMap.alongTheLineByOrigin(this.way[0], false, cur.moveVector.mul(-1)),
                ];
            }
            if (schMap.isLine(this.way.get(-1))) {
                cur.Limit.end = [
                    schMap.alongTheLineByOrigin(this.way.get(-1), false, cur.moveVector),
                    schMap.alongTheLineByOrigin(this.way.get(-1), false, cur.moveVector.mul(-1)),
                ];
            }
        },
        callback(event) {
            //Pretreatment
            const cur = this.current,
                gridL = cur.gridL,
                moveV = cur.moveVector,
                bias = cur.mouse(event).add(-1, cur.startMouse),
                point = cur.movePoint.add(bias.mul(moveV)),
                pointFloor = point.floor(),
                option = { process: 'deformation' };

            if (!pointFloor.isEqual(gridL)) {
                const points = [Point(pointFloor), pointFloor.add(moveV.mul(20))],
                    mouseGridL = cur.mouseGrid || new WayMap(),
                    mouseGrid = cur.mouseGrid = new WayMap();

                mouseGridL.forSameNode(points, mouseGrid);
                for (let i = 0; i < 2; i++) {
                    if (mouseGrid.get(points[i])) {
                        continue;
                    }
                    mouseGrid.set(points[i],
                        Search.deformation.splice(
                            points[i],
                            cur.backup,
                            option,
                            mouseGrid.get(points[1 - i])
                        )
                    );
                }

                cur.gridL = pointFloor;
            }

            //Post-processing
            const way = cur.mouseGrid.nodeMax((v, r) => (v.sub === -1) ? v : r);
            this.way.clone(way);
            this.way.segToPoint(way.sub, point, cur.Limit);
            this.wayDrawing();
        },
        end(event) {
            const cur = this.current,
                moveV = cur.moveVector,
                bias = cur.mouse(event).add(-1, cur.startMouse),
                point = cur.movePoint.add(bias.mul(moveV)).round();

            //New path
            this.way.clone(
                Search.deformation.splice(
                    point,
                    cur.backup,
                    { process: 'deformation' },
                    false,
                    true
                )
            );

            //Reset endpoint connection
            this.resetConnect(cur.backup);

            this.render();
            this.markSign();
        },
        splice(point, way, option, last, sign) {
            const subL = way.sub,
                moveH = way.vector(subL).abs().toUnit(),
                moveV = Point(moveH).reverse(),
                segment = [way[subL], way[subL + 1]],
                maxBias = Math.abs(point.add(-1, way[subL]).product(moveV.mul(-1, 20)));

            for (let k = 0; k < maxBias; k++) {
                for (let i = -k; i <= k; i += 2 * k) {
                    const seg = segment.map((v) =>
                        v.mul(moveH).add(point.mul(moveV).add(moveV.mul(i * 20)))),
                        tempWay = way.moveSegment(subL, seg),
                        sub = tempWay.overlapp(seg),
                        end = tempWay.segmentSplit(sub, !!sign);

                    if (end) {
                        //Split wire
                        let startWay, endWay, trend;
                        const startSeg = tempWay.slice(0, sub),
                            endSeg = tempWay.slice(sub + 2);
                        //Search front and back paths separately
                        if (startSeg.length) {
                            trend = Point([startSeg.get(-1), end[0]]).mul(moveV).toUnit();
                            startWay = AStartSearch(startSeg.get(-1), end, trend, option)
                                .checkWayExcess(trend);
                        } else {
                            startWay = [tempWay[0]];
                        }
                        if (endSeg.length) {
                            trend = Point([endSeg[0], end[1]]).mul(moveV).toUnit();
                            endWay = AStartSearch(endSeg[0], end, trend, option)
                                .checkWayExcess(trend).reverse();
                        } else {
                            endWay = [tempWay[sub + 1]];
                        }
                        //Splicing path
                        const way = new LineWay(startSeg.concat(startWay, end, endWay, endSeg))
                            .checkWayLine(moveV);

                        //Current operation line segment subscript
                        way.sub = way.overlapp(seg);

                        return (way);
                    } else if (last) {
                        return (last);
                    }

                    if (!k) {
                        break;
                    }
                }
            }
            return (way);
        }
    }
};

//Wire path class
function LineWay(way) {
    this.length = 0;
    if (way instanceof Array) {
        for (let i = 0; i < way.length; i++) {
            this.push(Point(way[i]));
        }
    }
}
LineWay.prototype = {
    constructor: LineWay,
    push(node) {
        this[this.length++] = Point(node);
        return (this.length);
    },
    unshift(...args) {
        const len = args.length;
        for (let i = this.length - 1; i >= 0; i--) {
            this[i + len] = this[i];
        }
        for (let i = 0; i < len; i++) {
            this[i] = Point(args[i]);
        }
        this.length = this.length + len;
        return (this.length);
    },
    //Path standardization
    standardize(bias) {
        for (let i = 0; i < this.length; i++) {
            this[i] = bias
                ? this[i].add(bias).round()
                : this[i].round();
        }
        return (this);
    },
    //Remove node redundancy
    checkWayRepeat() {
        for (let i = 0; i < this.length - 2; i++) {
            if (((this[i][0] === this[i + 1][0]) && (this[i + 1][0] === this[i + 2][0])) ||
                ((this[i][1] === this[i + 1][1]) && (this[i + 1][1] === this[i + 2][1])) ||
                ((this[i][0] === this[i + 1][0]) && (this[i][1] == this[i + 1][1]))) {
                this.splice(i + 1, 1);
                i -= 2;
                if (i < -1) i = -1;
            }
        }
        return (this);
    },
    //Remove path redundancy
    checkWayExcess(trend, status) {
        const opt = status
            ? { process: 'modified', status }
            : { process: 'modified' };

        if (this.length <= 3) {
            return (this);
        }
        //If the direction of the first line is the same as the direction of the second line segment, 
        // it means that it needs to be corrected here
        if (trend.isSameDire(Point([this[1], this[2]]))) {
            this.splice(0, 3, ...AStartSearch(this[0], this[2], trend, opt));
            this.checkWayRepeat();
        }

        for (let i = 0; i < this.length - 3; i++) {
            const vector = [
                (Point([this[i], this[i + 1]])).toUnit(),
                (Point([this[i + 2], this[i + 3]])).toUnit()
            ];
            let tempWay, tempVector;
            if (vector[0].isEqual(vector[1])) {
                //Co-modification
                tempWay = AStartSearch(this[i + 1], this[i + 3], vector[0], opt);
                tempVector = Point([tempWay[0], tempWay[1]]);
                if (tempWay.length < 4 && tempVector.isSameDire(vector[0])) {
                    this.splice(i + 1, 3, ...tempWay);
                    this.checkWayRepeat();
                    i--;
                }
            } else if (this.length > 4) {
                //The wire must be greater than 4 nodes to be reverse modified
                tempWay = AStartSearch(this[i], this[i + 3], vector[0], opt);
                if (tempWay.length < 4) {
                    this.splice(i, 4, ...tempWay);
                    this.checkWayRepeat();
                    i--;
                }
            }
        }
        this.checkWayRepeat();
        return (this);
    },
    //Remove the overlap between the ends of the wire and the known wire
    checkWayLine(vector) {
        this.checkWayRepeat();

        const startTrend = Point([this[0], this[1]]),
            ebdTrend = Point([this.get(-1), this.get(-2)]),
            startPoint = Point(schMap.alongTheLineByOrigin(this[0], this[1])),
            endPoint = Point(schMap.alongTheLineByOrigin(this.get(-1), this.get(-2)));

        //The entire line segment coincides with the existing wire, 
        // and the direction is parallel to the input direction
        if (startPoint.isEqual(this[1]) &&
            (!vector || (vector && startTrend.isParallel(vector)))) {
            this.splice(0, 1);
        } else {
            this[0] = startPoint;
        }
        if (endPoint.isEqual(this.get(-2)) &&
            (!vector || (vector && ebdTrend.isParallel(vector)))) {
            this.pop();
        } else {
            this[this.length - 1] = endPoint;
        }

        this.checkWayRepeat();
        return (this);
    },
    //Copying a path will discard all references to the original path data, 
    // and will not reference the copied data
    clone(tempway) {
        for (let i = 0; i < tempway.length; i++) {
            this[i] = Point(tempway[i]);
        }
        this.splice(tempway.length);
        this.length = tempway.length;
    },
    //Reverse
    reverse() {
        Array.prototype.reverse.call(this);
        return (this);
    },
    //Output direction of sub line segment
    vector(sub) {
        if (sub >= 0) {
            return (Point([this[sub], this[sub + 1]]));
        } else {
            return (Point([this.get(sub), this.get(sub - 1)]));
        }
    },
    //check if tempWay and this are same
    isSame(tempway) {
        for (let i = 0; i < this.length; i++) {
            if (!(this[i].isEqual(tempway[i]))) {
                return (false);
            }
        }
        return (true);
    },
    //Path has and only has two different points, return true. Completely same will return false.
    isSimilar(tempway) {
        if (this.length !== tempway.length) {
            return (false);
        }
        for (let i = 0; i < this.length - 2; i++) {
            if (!(this[i].isEqual(tempway[i]))) {
                return (false);
            }
        }
        return (
            (!this.get(-1).isEqual(tempway.get(-1))) &&
            (!this.get(-2).isEqual(tempway.get(-2)))
        );
    },
    //Return all nodes of the wire
    nodeCollection() {
        const ans = [];

        for (let i = 0; i < this.length - 1; i++) {
            const vector = Point([this[i], this[i + 1]]).toUnit().mul(20);
            let node = Point(this[i]);
            while (Point([node, this[i + 1]]).isSameDire(vector)) {
                ans.push(node);
                node = node.add(vector);
            }
        }
        //Last point
        ans.push(Point(this.get(-1)));

        return (ans);
    },
    /*
    //Wire end extension
    endExpand(points, endPoint, initTrend) {
        if (schMap.isLine(endPoint)) return ([]);

        const ans = [];
        if (this.length > 1) {
            //Current path end direction
            const tempvector = Math.vectorInit(this[this.length - 2], this[this.length - 1], 20);
            const turn = (initTrend.isEqual(Math.vectorInit(this[0], this[1]))) ? (this.length - 2) : (this.length - 1);
            for (let i = 0; i < 4; i ++) {
                //The original path is not a straight line, so turning again is not allowed
                //The subscripts 1, 2 refer to the clockwise and counterclockwise rotating matrices 
                // in the top and top rotate, and they are skipped here.
                if (turn && (i === 1 || i === 2)) continue;
                //New end point coordinates
                const tempEnd = [
                    this[this.length - 1][0] + tempvector[0] * rotate[i][0][0] + tempvector[1] * rotate[i][1][0],
                    this[this.length - 1][1] + tempvector[0] * rotate[i][0][1] + tempvector[1] * rotate[i][1][1]
                ];
                if (schMap.isLine(tempEnd)) continue;
                //The new end point is within the square
                if (points.some((n) => n.isEqual(tempEnd))) {
                    let newWay = new LineWay(this);
                    newWay.push(tempEnd);
                    newWay.checkWayRepeat();
                    ans.push([tempEnd, newWay]);
                }
            }
        }
        return (ans);
    },
    //Wire start extension
    startExpand(points, startPoint, initTrend) {
        const tempWay = new LineWay(Array.clone(this).reverse()),
            trend = initTrend.mul(-1),
            ans = tempWay.endExpand(points, startPoint, trend);
        for (let i = 0; i < ans.length; i++) {
            ans[i][1].reverse();
        }
        return (ans);
    },
    */
    //end point / start point target at the designated coordinate
    endToMouse(dir, node) {
        node = (arguments.length === 1) ? dir : node;
        dir = (arguments.length === 1) ? 1 : dir;

        const end = (dir === 1) ? this.length - 1 : 0,
            last = (dir === 1) ? this.length - 2 : 1;

        if (this.length > 1) {
            if (this[end][0] === this[last][0]) {
                this[last][0] = node[0];
            } else {
                this[last][1] = node[1];
            }
        }
        this[end] = node;
    },
    //The end point points to the specified line segment
    endToLine(line, position) {
        if (line[0][0] === line[1][0]) {
            //vertical
            this[this.length - 1][1] = position[1];
            this[this.length - 2][1] = position[1];
            this[this.length - 1][0] = line[0][0];
        } else {
            //horizontal
            this[this.length - 1][1] = line[0][1];
            this[this.length - 1][0] = position[0];
            this[this.length - 2][0] = position[0];
        }
    },
    //The line segment points to a certain point
    segToPoint(sub, point, limit) {
        let i = sub;

        //invalid Subscript
        if (i < 0) {
            return (this);
        }

        const sign = (this[i][0] === this[i + 1][0]) ? 'x' : 'y';

        //Operation subscript is 0 && 
        // (The starting point is the lead pin or the starting point is outside the excluded line)
        if (!i && ((limit && limit.start && !point.inLine(limit.start, sign)) ||
            schMap.isPartPoint(this[0]))) {
            i++;
            this.splice(0, 0, Point(this[0]));
        }
        if (i === this.length - 2 &&
            ((limit && limit.end && !point.inLine(limit.end, sign)) ||
                schMap.isPartPoint(this.get(-1)))) {
            this.push(Point(this.get(-1)));
        }

        if (this[i][0] === this[i + 1][0]) {
            //vertical
            this[i][0] = point[0];
            this[i + 1][0] = point[0];
        } else {
            //horizontal
            this[i][1] = point[1];
            this[i + 1][1] = point[1];
        }
        return (this);
    },
    //New wire generated by line segment movement
    moveSegment(sub, seg) {
        const self = this,
            newLine = new LineWay(self),
            segVec = Point(seg).reverse(),
            sign = segVec[0] ? 'x' : 'y';

        //The start and end points are at infinity
        //0 * Inf = NaN，so represented using 1e6
        //newLine[0] = self[0].add(-1, self.vector(0).mul([1e6, 1e6]));
        //newLine[newLine.length - 1] = self.get(-1).add(-1, self.vector(-1).mul([1e6, 1e6]));

        //Search for intersection of new line segment and traverse
        let start = sub, end = sub + 1;
        for (let i = sub; i > 0; i--) {
            const segment = [newLine[i - 1], newLine[i]];
            if (Point(segment).isParallel(segVec) &&
                seg[0].inLine(segment, sign)) {
                start = i;
                break;
            }
        }
        for (let i = sub + 1; i < this.length - 1; i++) {
            const segment = [newLine[i], newLine[i + 1]];
            if (Point(segment).isParallel(segVec) &&
                seg[0].inLine(segment, sign)) {
                end = i;
                break;
            }
        }

        //The start and end of the new wire are restored
        //newLine[0] = Point(this[0]);
        //newLine[newLine.length - 1] = Point(this.get(-1));
        //Wire merging
        newLine.splice(start, end - start + 1, ...seg);
        //Insert the start and end points again
        newLine.splice(0, 0, Point(this[0]));
        newLine.push(Point(this.get(-1)));
        newLine.checkWayRepeat();
        return (newLine);
    },
    //Trace back the traverse subscript from the square grid, starting from the starting point
    gridToEnd(grid) {
        const ans = [],
            farest = Point(this[0].farest(grid).value);

        //The current wire has only 1 segment, return to the end point
        if (this.length === 2) {
            return ({
                sub: this.length,
                seg: Point(this.get(-1))
            });
        }

        //0 is a horizontal line segment, 1 is a vertical line segment
        for (let sub = 0; sub < 2; sub++) {
            const segs = [],
                line = this.map((n) => [(1 - sub) * n[0], sub * n[1]]),
                points = grid.map((n) => [(1 - sub) * n[0], sub * n[1]]),
                last = this[0][1 - sub] === this[1][1 - sub]
                    ? Point([this[0], this[1]])
                    : Point([this[1], this[2]]),
                toGrid = Point([
                    line[0],
                    [(1 - sub) * farest[0], sub * farest[1]]
                ]);

            //The direction of the final line segment is opposite to the direction of the current square
            if (last.isOppoDire(toGrid)) {
                ans[sub] = 0;
                continue;
            }
            //Traceback wire
            for (let i = 0; i < line.length - 1; i++) {
                if (this[i][sub] === this[i + 1][sub]) {
                    continue;
                }
                if (points.every((n) => Point.prototype.inLine.call(n, [line[i], line[i + 1]]))) {
                    segs.push(i);
                }
            }
            //Is it within the wire range
            if (!segs.length) {
                ans[sub] = this.length + 1;
            } else {
                ans[sub] = farest.closest(segs.map((n) => [this[n], this[n + 1]])).sub;
            }
        }

        const diff = Math.abs(ans[0] - ans[1]),
            max = Math.maxOfArray(ans);
        if (max === 0) {
            return ({
                sub: 1,
                seg: [this[1], this[2]]
            });
        } else if (max === this.length + 1) {
            return ({
                sub: this.length,
                seg: Point(this.get(-1))
            });
        } else if (diff === 1) {
            return ({
                sub: max,
                seg: [this[max - 1], this[max], this[max + 1]]
            });
        }
    },
    // Nearest line segment to the node.
    nodeInWay(node) {
        const segs = [];
        for (let i = 0; i < this.length - 1; i++) {
            segs.push(this.slice(i, i + 2));
        }
        return (node.closest(segs));
    },
    //subscription of the part where seg and wire cross
    overlapp(seg) {
        const map = {},
            vector = Point(seg).toUnit(20);
        //Mark line segment
        for (let node = seg[0]; !node.isEqual(seg[1]); node = node.add(vector)) {
            map[node.join(', ')] = true;
        }
        //Mark end point
        map[seg[1].join(', ')] = true;

        //search wire
        for (let i = 0; i < this.length - 1; i++) {
            const nodeway = this.slice(i, i + 2),
                wayVec = Point(nodeway).toUnit(20);
            //if the line segment is perpendicular to the input, skip
            if (vector.isVertical(wayVec)) {
                continue;
            }

            for (let j = nodeway[0]; !j.isEqual(nodeway[1]); j = j.add(wayVec)) {
                if (map[j.join(', ')]) {
                    return (i);
                }
            }
        }
        return (-1);
    },
    //segmentation of a certain line segment
    segmentSplit(sub, sign) {
        function strict(node) {
            return (!schMap.getValueByOrigin(node));
        }
        function standard(node) {
            const status = schMap.getValueByOrigin(node);
            if (status.form === 'part' ||
                status.form === 'part-point' ||
                status.form === 'line-point') {
                return (false);
            } else if (status.form === 'line' ||
                status.form === 'cross-point') {
                const connect = status.connect;
                for (let j = 0; j < connect.length; j++) {
                    const con = connect[j],
                        vecn = Point([node.floorToSmall(), con]);

                    if (vector.isVertical(vecn)) {
                        return (false);
                    }
                }
            }
            return (true);
        }

        //invalid subscript
        if (sub === -1) {
            return (false);
        }

        const segs = [],
            segment = [this[sub], this[sub + 1]],
            nodes = LineWay.prototype.nodeCollection.call(segment),
            vector = Point(segment),
            check = sign ? strict : standard;

        //Segment
        let seg = null;
        for (let i = 0; i < nodes.length; i++) {
            const flag = check(nodes[i]);

            if (flag && !seg) {
                if (i === nodes.length - 1) {
                    segs.push([nodes[i], nodes[i]]);
                } else {
                    seg = nodes[i];
                }
            } else if (!flag && seg) {
                segs.push([seg, nodes[i - 1]]);
                seg = null;
            } else if (flag && seg && i === nodes.length - 1) {
                segs.push([seg, nodes[i]]);
            }
        }
        //Take the longest
        let max = -1, ans = false;
        for (let i = 0; i < segs.length; i++) {
            if (segs[i].length > max) {
                max = Point.prototype.distance.call(segs[i][0], segs[i][1]);
                ans = segs[i];
            }
        }

        return (ans);
    },
    //Same as Array's map method
    map(callback) {
        const way = new LineWay();

        for (let i = 0; i < this.length; i++) {
            way.push(callback(this[i], i));
        }

        return (way);
    }
};
Object.setPrototypeOf(LineWay.prototype, Array.prototype);
LineWay.prototype[Symbol.isConcatSpreadable] = true;

//[Point->Path] key-value pair class, the whole design is similar to Map data structure
//Only accept Point instance as key, and the key value of LineWay instance
function WayMap(pair) {
    if (pair instanceof Array) {
        this.size = pair.length;
        for (let i = 0; i < pair.length; i++) {
            const [key, value] = pair[i][0];
            this.set(key, value);
        }
    } else {
        this.size = 0;
    }

    this.sign = false;
    Object.defineProperties(this, {
        'size': {
            enumerable: false,
            configurable: false
        },
        'sign': {
            enumerable: false,
            configurable: false
        }
    });
}
WayMap.extend({
    checkKeyError(key) {
        if (!Point.isPoint(key) ||
            !key.isEqual(Point.prototype.floor.call(key))) {
            throw ('The key is malformed');
        }
    },
    //Check the format of the key-value pair
    checkValueError(value) {
        if (!(value instanceof LineWay)) {
            throw ('The key-value pair must be an instance of LineWay');
        }
    },
    //Convert the key to the key of the internal hash
    keyToHash(key) {
        return (key[0] * 5 + key[1] * 0.05);
    },
    //Convert internal hash value to key
    hashToKey(hash) {
        const ans = [], temp = hash % 100;
        ans[1] = temp * 20;
        ans[0] = (hash - temp) * 0.2;
        return (Point(ans));
    }
});
WayMap.prototype = {
    constructor: WayMap,
    //Return the value associated with the key, or undefined if the key does not exist
    get(key) {
        WayMap.checkKeyError(key);
        return (this[WayMap.keyToHash(key)]);
    },
    //Set the key & value in myMap to 'value'
    //mode indicates setting mode, originally set to default, it means it can be overritten .
    //if it is set to 'small', the number of reserved nodes that existed before and the current
    //input will be small
    set(key, value, mode = 'default') {
        WayMap.checkKeyError(key);
        WayMap.checkValueError(value);
        const tempHash = WayMap.keyToHash(key);
        if (this[tempHash]) {
            if (mode === 'default') {
                this[tempHash] = value;
            } else if (mode === 'small') {
                if (this[tempHash].length > value.length) {
                    this[tempHash] = value;
                }
            }
        } else {
            this[tempHash] = value;
            this.size += 1;
        }
    },
    //Returns a Boolean value indicating whether the key exists in the Map
    has(key) {
        return (!!this.get(key));
    },
    //Return all keys
    keys() {
        const keys = [];
        for (const i in this) {
            if (this.hasOwnProperty(i)) {
                keys.push(WayMap.hashToKey(i));
            }
        }
        return (keys);
    },
    //return all paths
    ways() {
        const ways = [], keys = this.keys();
        for (let i = 0; i < keys.length; i++) {
            ways.push(this.get(keys[i]));
        }
        return (ways);
    },
    //forEach traversal function, similar to Array's forEach function
    forEach(callback) {
        for (const i in this) {
            if (this.hasOwnProperty(i)) {
                callback(WayMap.hashToKey(i), this[i], this);
            }
        }
    },
    //Return the path with the most nodes
    nodeMax(func) {
        let max = -Infinity, ans = false;
        this.forEach(function (key, way) {
            if (way.length > max) {
                ans = way;
                max = ans.length;
            } else if (func && way.length === max) {
                ans = func(ans, way);
                max = ans.length;
            }
        });
        return (ans);
    },
    //If there is the same key, then assign the value of this to the new map
    forSameNode(points, map) {
        if (this.sign && map.sign && this.sign.isEqual(map.sign)) {
            this.forEach((node, way) => {
                for (let i = 0; i < points.length; i++) {
                    if (node.isEqual(points[i])) {
                        map.set(node, way);
                    }
                }
            });
        }
    }
};

//Wire type
function LineClass(way) {
    this.id = 'line_';
    this.way = new LineWay();
    this.circle = [false, false];
    this.connect = ['', ''];
    this.partType = 'line';
    this.current = {};

    //Wire attributes
    const line = {
        tag: '<g>',
        attribute: {
            'class': 'line',
            'transform': 'translate(0,0)'
        },
        child: [
            {
                tag: '<path>',
            }
        ]
    };
    //End attribute of wire
    const circle = {
        tag: '<g>',
        attribute: {
            'class': 'line-point draw-open',
            'transform': 'translate(0,0)'
        },
        child: [
            {
                tag: '<circle>'
            }, {
                tag: '<rect>',
                attribute: {
                    'class': 'rect-line-point'
                }
            }
        ]
    };

    if (way instanceof Array) {
        this.way = new LineWay(way);
    } else {
        this.extend(way);
        this.way = new LineWay(this.way);
    }

    //new ID
    this.id = partsAll.newId(this.id);
    //create wire DOM
    this.elementDOM = creatDOM(line);
    this.elementDOM.attr('id', this.id);
    actionArea.preappend(this.elementDOM);
    for (let i = 0; i < 2; i++) {
        this.circle[i] = creatDOM(circle);
        this.circle[i].attr('id', this.id + '-' + i);
        this.circle[i].attr('transform', 'translate(' + this.way.get(-1 * i).join(', ') + ')');
        this.elementDOM.append(this.circle[i]);
        this.setConnect(i);
    }

    this.wayDrawing();
    //Freeze the general properties of the wire, current is a temporary variable and can be changed at will
    Object.defineProperties(this, {
        'way': {
            configurable: false,
            writable: false
        },
        'circle': {
            configurable: false,
            writable: false
        },
        'connect': {
            configurable: false,
            writable: false
        },
        'partType': {
            configurable: false,
            writable: false
        }
    });
    Object.seal(this);
    partsAll.push(this);
}
LineClass.prototype = {
    constructor: LineClass,

    //Drawing related
    //Shrink the circle
    shrinkCircle(Num) {
        $('circle', this.circle[Num]).attr('style', 'r:4');
    },
    //enlarge the circle
    enlargeCircle(Num) {
        $('circle', this.circle[Num]).attr('style', 'r:8');
    },
    //reset the circle
    resetCircle(num) {
        this.elementDOM.append(this.circle[num]);
        this.moveCircle(num, this.way.get(-1 * num));
        $('circle', this.circle[num]).removeAttr('style');
    },
    //Move wire end
    moveCircle(Num, position) {
        this.circle[Num].attr('transform', 'translate(' + position.join(', ') + ')');
    },
    //Wire to dynamic
    toGoing() {
        //delete all rect
        $('rect.line-rect', this.elementDOM).remove();
        //Wire is placed at the bottom
        actionArea.preappend(this.elementDOM);

        //Interleaved node operation
        for (let i = 0; i < 2; i++) {
            this.setConnect(i);
            if (this.connectStatus(i) === 'line') {
                const node = this.way.get(-1 * i),
                    lines = this.connect[i].split(' ');

                //When there are only two wires, they need to hide their interleaved nodes
                if (lines.length === 2) {
                    for (let j = 0; j < 2; j++) {
                        const line = partsAll.findPart(lines[j]),
                            sub = line && line.findConnect(node);

                        line && line.circle[sub].addClass('dispear');
                    }
                }

                tempLine.append(this.circle[i]);
                actionArea.preappend(
                    tempLine,
                    document.querySelector('#area-of-parts .editor-parts')
                );
            }
        }
    },
    //draw wire
    wayDrawing() {
        if (this.way.length < 1) {
            return (false);
        }

        let temp = 'M' + this.way[0][0] + ', ' + this.way[0][1];
        for (let i = 1; i < this.way.length; i++) {
            temp += 'L' + this.way[i][0] + ', ' + this.way[i][1];
        }

        $('path', this.elementDOM).attr('d', temp);
        this.moveCircle(0, this.way[0]);
        this.moveCircle(1, this.way.get(-1));
    },
    //static wire render
    render() {
        const templine = this.elementDOM,
            linerect = $('rect.line-rect', templine),
            tempway = this.way;

        tempway.checkWayRepeat();
        tempway.standardize();

        //remove temp wire
        tempLine.remove();
        //Place the current wire on top of the wire
        actionArea.preappend(
            this.elementDOM,
            document.querySelector('#area-of-parts .editor-parts')
        );

        while (linerect.length > this.way.length - 1) {
            linerect.remove(-1);
        }
        //Draw wire rect block
        for (let i = 0; i < tempway.length - 1; i++) {
            if (!linerect[i]) {
                templine.append($('<rect>', SVG_NS, lineRectAttr(tempway[i], tempway[i + 1])));
            } else {
                linerect.get(i).attr(lineRectAttr(tempway[i], tempway[i + 1]));
            }
        }
        this.wayDrawing();
        this.elementDOM.removeAttr('transform');
        this.resetCircle(0);
        this.resetCircle(1);
    },
    //Wire rotation
    rotateSelf(matrix, center) {
        for (let i = 0; i < this.way.length; i++) {
            this.way[i] = this.way[i].rotate(matrix, center);
        }
        this.wayDrawing();
        return (this);
    },
    //Overall movement
    move(bais) {
        const position = (this.current.bias || Point([0, 0])).add(bais);

        this.elementDOM.attr('transform',
            'translate(' + position.join(', ') + ')');

        return (this);
    },

    //Connection related
    //Returns the type of device connected to the connection point
    connectStatus(Num) {
        const tempConnect = this.connect[Num];
        if (!tempConnect) {
            return (false);
        }
        if (tempConnect.search('line_') !== -1) {
            return ('line');
        } else if (tempConnect.search('-') !== -1) {
            return ('part');
        } else {
            return (false);
        }
    },
    //Delete a device from the connection table
    deleteConnect(id) {
        this.connect.forEach(function (item, index, arr) {
            if (item.search(id) !== -1) {
                arr[index] = item.split(' ').filter((n) => n !== id).join(' ');
            }
        });
    },
    //Replace oldID with newID from the connected devices in the connection table
    replaceConnect(sub, newId) {
        const self = this, con = self.connect[sub];

        if (self.connectStatus(sub) === 'part') {
            const part = partsAll.findPart(con),
                mark = con.split('-')[1];

            part.setConnect(mark, newId);
        } else if (self.connectStatus(sub) === 'line') {
            con.split(' ').map((n) => partsAll.findPart(n))
                .forEach((n) => {
                    n.connect[0] = n.connect[0].replace(self.id, newId);
                    n.connect[1] = n.connect[1].replace(self.id, newId);
                });

            const crossNode = self.way.get(-1 * sub),
                crossStatus = schMap.getValueByOrigin(crossNode);

            crossStatus.id = crossStatus.id.replace(self.id, newId);
        }
    },
    //Setting the wire connection directly will affect the shape of the end point
    setConnect(mark, id) {
        if (arguments.length === 2) {
            //When there is no input connecting wire, the connection table remains unchanged
            this.connect[mark] = id;
        }

        if (this.connect[mark]) {
            if (this.connect[mark].search(' ') === -1) {
                //Endpoints are device pins
                this.circle[mark].attr('class', 'line-point draw-close');
            } else {
                //Staggered node
                this.circle[mark].attr('class', 'line-point cross-point');
            }
        } else {
            //End unattachment
            this.connect[mark] = '';
            this.circle[mark].attr('class', 'line-point draw-open');
        }
    },
    //Release wire connection
    freedConnect(sub) {
        const self = this,
            con = self.connect[sub];

        if (self.connectStatus(sub) === 'part') {
            const part = partsAll.findPart(con),
                mark = con.split('-')[1];

            part.setConnect(mark, false);
        } else if (self.connectStatus(sub) === 'line') {
            const lines = con.split(' ').map((n) => partsAll.findPart(n));

            if (lines.length === 2 &&
                lines.every((n) => n.hasConnect(self.id))) {
                lines[0].mergeLine(lines[1]);
                lines[0].render();
                lines[0].markSign();
            } else if (lines.length === 3) {
                lines.forEach((n) => n.deleteConnect(self.id));
            }
        }

        self.setConnect(sub, false);
    },
    //Set connection by endpoint coordinates
    nodeToConnect(sub) {
        const self = this,
            node = self.way.get(-1 * sub).round(),
            status = schMap.getValueByOrigin(node);

        if (!status) {
            self.setConnect(sub, false);
        } else if (status.form === 'part-point') {
            const part = partsAll.findPart(status.id),
                mark = status.id.split('-')[1];

            part.setConnect(mark, this.id);
            self.setConnect(sub, part.id + '-' + mark);
        } else if (status.form === 'line-point') {
            self.mergeLine(status.id);
        } else if (status.form === 'line') {
            //The end point and the start point are on the same traverse, delete the current traverse
            if (self.hasConnect(status.id)) {
                self.deleteSelf();
            } else {
                self.splitLine(status.id, sub);
            }
        } else if (status.form === 'cross-point') {
            const temp = self.way.get(-1 * sub),
                lines = status.id.split(' ')
                    .filter((n) => n !== self.id);

            if (lines.length === 1) {
                self.mergeLine(lines[0]);
            } else {
                //Current wire
                self.setConnect(sub, lines.join(' '));
                //Remaining wires
                for (let i = 0; i < lines.length; i++) {
                    const line = partsAll.findPart(lines[i]),
                        con = line.findConnect(temp);

                    line.setConnect(con,
                        lines.filter((n) => n !== line.id)
                            .join(' ') + ' ' + self.id
                    );
                }
            }
        }
    },
    //Reset the end connection after the wire is deformed
    resetConnect(backup) {
        for (let i = 0; i < 2; i++) {
            if (this.connectStatus(i) === 'line' &&
                !backup.get(-1 * i).isEqual(this.way.get(-1 * i))) {
                this.freedConnect(i);
                this.nodeToConnect(i);
            }
        }
    },

    //Query related
    //check if position is equal to the start point is 0, the end point is 1, 
    // if not, it returns -1
    findConnect(position) {
        if (position.isEqual(this.way.get(-1))) {
            return (1);
        } else if (position.isEqual(this.way[0])) {
            return (0);
        } else return (-1);
    },
    //check if the wire is covered
    isCover(bias) {
        const way = bias
            ? this.way.map((n) => n.add(bias).round())
            : this.way.map((n) => n.round()),
            nodes = way.nodeCollection();

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i],
                status = schMap.getValueByOrigin(node);

            if (node.isEqual(way[0]) || node.isEqual(way.get(-1))) {
                //The end point can be equal to its own cross-point
                if (status && status.form === 'cross-point') {
                    if (!status.id.indexOf(this.id)) {
                        return (true);
                    }
                } else if (status) {
                    return (true);
                }
            } else if (status) {
                //if not a endpoint, it cannot be connecting to anything
                return (true);
            }
        }
        return (false);
    },
    //convert to simple data
    toSimpleData() {
        return ({
            id: this.id,
            partType: 'line',
            way: new LineWay(this.way),
            connect: Array.clone(this.connect)
        });
    },
    //calculate the initial direction of the wire
    initTrend(sub) {
        const point = this.way.get(-1 * sub),
            status = schMap.getValueByOrigin(point);

        if (status && status.form === 'part-point') {
            //The wire outlet direction is the pin direction of the starting device
            const mark = status.id.split('-')[1],
                part = partsAll.findPart(status.id),
                pointInfor = part.pointRotate()[mark];

            return (Point(pointInfor.direction));
        } else {
            //It is not a device, then the initial direction will be the direction of the 
            // first or the last line segment
            if (sub) {
                return ((Point([this.way.get(-1), this.way.get(-2)])).toUnit());
            } else {
                return ((Point(this.way.slice(0, 2))).toUnit());
            }
        }
    },
    //Find the endpoint coordinates from the connection relationship
    connectNode(sub) {
        if (!this.connect[sub]) {
            return (false);
        }

        if (this.connectStatus(sub) === 'line') {
            //wire
            const connect = this.connect[sub],
                lines = connect.split(' ').map((n) => partsAll.findPart(n).way);

            //Wire node intersection
            let point = lines[0];
            for (let i = 1; i < lines.length; i++) {
                point = point.filter((v) => lines[i].some((p) => p.isEqual(v)));
            }
            return (Point(point[0]));
        } else if (this.connectStatus(sub) === 'part') {
            //device
            const connect = this.connect[sub],
                mark = connect.split('-')[1],
                part = partsAll.findPart(connect),
                pointInfor = part.pointRotate()[mark];

            return (part.position.add(pointInfor.position));
        }
    },
    //check if the current wire is still exist
    isExist() {
        return (
            actionArea.contains(this.elementDOM) &&
            partsAll.has(this)
        );
    },
    //check if there is a conenction
    hasConnect(id) {
        return (
            this.connect[0].indexOf(id) !== -1 ||
            this.connect[1].indexOf(id) !== -1
        );
    },

    //mark
    markSign() {
        const nodes = this.way.nodeCollection();

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i],
                last = nodes[i - 1],
                status = schMap.getValueByOrigin(node);

            if (i && i !== nodes.length - 1) {
                //Non-end node
                if (status && status.form === 'line' &&
                    !schMap.nodeInConnectByOrigin(node, last)) {
                    status.form = 'cover-point';
                    status.id += ' ' + this.id;
                } else if (status && status.form === 'cover-point') {
                    const ver = node.add(Point([last, node]).reverse()),
                        verSta = schMap.getValueByOrigin(ver);
                    let part, line;
                    if (verSta.form === 'line') {
                        status.id = verSta.id + ' ' + this.id;
                    } else if (verSta.form === 'part-point') {
                        part = partsAll.findPart(verSta.id);
                        line = part.connect[verSta.id.split('-')[1]];
                        status.id = line + ' ' + this.id;
                    }
                } else {
                    schMap.setValueByOrigin(node, {
                        form: 'line',
                        id: this.id,
                        connect: []
                    });
                }
            } else {
                //wire end-point
                if (!status) {
                    schMap.setValueByOrigin(node, {
                        form: 'line-point',
                        id: this.id,
                        connect: []
                    });
                } else if (status.form === 'cross-point' &&
                    status.id.search(this.id) === -1) {
                    if (!status.id) {
                        //The current ID is empty, then assign directly
                        status.id = this.id;
                    } else {
                        //The current ID is not empty, then append the current ID to the original ID
                        status.id += ' ' + this.id;
                    }
                } else if (status.form === 'line-point') {
                    const id = status.id;
                    schMap.setValueByOrigin(node, {
                        form: 'cross-point',
                        id: this.id + ' ' + id
                    });
                }
            }
            if (last) {
                schMap.pushConnectByOrigin(node, last);
                schMap.pushConnectByOrigin(last, node);
            }
        }
    },
    deleteSign() {
        const nodes = this.way.nodeCollection();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i],
                status = schMap.getValueByOrigin(node);
            if (i && i !== nodes.length - 1) {
                //Non-end node
                if (status.form === 'cover-point') {
                    status.id = status.id.split(' ')
                        .filter((n) => n !== this.id)[0];
                    status.form = 'line';

                    schMap.deleteConnectByOrigin(node, nodes[i - 1]);
                    schMap.deleteConnectByOrigin(nodes[i - 1], node);
                } else if (status.form === 'line') {
                    schMap.deleteValueByOrigin(node);
                }
            } else {
                //Wire end
                if (!status) { continue; }

                if (status.form === 'line-point') {
                    schMap.deleteValueByOrigin(node);
                } else if (status.form === 'cross-point') {
                    status.id = status.id.split(' ')
                        .filter((n) => n !== this.id)
                        .join(' ');

                    //The current interleaved node is empty, then delete this point
                    if (!status.id) {
                        schMap.deleteValueByOrigin(node);
                    }
                }
            }
        }
    },

    //Operation related
    //Wire reversal
    reverse() {
        this.way.reverse();
        this.connect.reverse();
        this.circle.reverse();
        for (let i = 0; i < 2; i++) {
            this.circle[i].attr('id', this.id + '-' + i);
        }
    },
    //highlight the component
    toFocus() {
        this.elementDOM.addClass('focus');
        partsNow.push(this);
        console.log("partsNow after toFocus method");
        console.log(partsNow);
    },
    //Device cancel highlight
    toNormal() {
        this.elementDOM.removeClass('focus');
        this.current = {};
    },
    //split the wire
    splitLine(splited, sub) {
        splited = splited instanceof LineClass
            ? splited : partsAll.findPart(splited);

        const NodeCross = Point(this.way.get(-1 * sub)),
            devices = new LineClass([NodeCross]);

        //Change wire connection table
        //Replace the ID of the connected device
        splited.replaceConnect(1, devices.id);
        //The starting point of the original wire remains unchanged, 
        //and the end of the new wire is equal to the end of the original wire
        devices.setConnect(1, splited.connect[1]);
        //The starting point of the new wire is composed of the old wire ID 
        //and the wire ID group that divides the old wire
        devices.setConnect(0, splited.id + ' ' + this.id);
        //The wire end point of the divided old wire is composed of the new and old wire ID
        this.setConnect(sub, splited.id + ' ' + devices.id);
        //The end of the old wire consists of the new wire ID and the wire ID group that splits the old wire
        splited.setConnect(1, devices.id + ' ' + this.id);

        //Split path
        let crossSub = 0;
        for (let i = 0; i < splited.way.length - 1; i++) {
            //Find the line segment where the intersection point
            if ((NodeCross[0] === splited.way[i][0]) && (NodeCross[0] === splited.way[i + 1][0])) {
                if (((NodeCross[1] <= splited.way[i][1]) && (NodeCross[1] >= splited.way[i + 1][1])) ||
                    ((NodeCross[1] >= splited.way[i][1]) && (NodeCross[1] <= splited.way[i + 1][1]))) {
                    crossSub = i;
                    break;
                }
            } else if ((NodeCross[1] === splited.way[i][1]) && (NodeCross[1] === splited.way[i + 1][1])) {
                if (((NodeCross[0] <= splited.way[i][0]) && (NodeCross[0] >= splited.way[i + 1][0])) ||
                    ((NodeCross[0] >= splited.way[i][0]) && (NodeCross[0] <= splited.way[i + 1][0]))) {
                    crossSub = i;
                    break;
                }
            }
        }
        devices.way.clone(splited.way.slice(crossSub + 1));
        devices.way.unshift(NodeCross);
        splited.way.splice(crossSub + 1, splited.way.length - crossSub - 1);
        splited.way.push(NodeCross);

        //Add the new wire to the drawing
        this.elementDOM.preappendTo(actionArea);
        splited.render();
        splited.markSign();
        devices.render();
        devices.markSign();

        //Interleaved node settings
        schMap.setValueByOrigin(NodeCross, {
            form: 'cross-point',
            id: this.id + ' ' + splited.id + ' ' + devices.id
        });
    },
    //delete wire
    deleteSelf() {
        if (!this.isExist()) {
            return (false);
        }

        for (let i = 0; i < this.connect.length; i++) {
            if (this.connectStatus(i) === 'line') {
                const lines = this.connect[i].split(' ').map((n) => partsAll.findPart(n));

                lines.forEach((n) => n && n.deleteConnect(this.id));

                if (lines.length === 2 && lines[0]) {
                    lines[0].mergeLine(lines[1]);
                    lines[0].render();
                    lines[0].markSign();
                }
            } else if (this.connectStatus(i) === 'part') {
                const temp = this.connect[i].split('-'),
                    part = partsAll.findPart(temp[0]);

                //such component may already be deleted
                if (part) {
                    part.setConnect(temp[1], false);
                }
            }
        }

        this.deleteSign();
        this.circle.forEach((n) => n.remove());
        this.elementDOM.remove();
        partsAll.deletePart(this);
    },
    //merge the wire, keep this. delete fragment
    mergeLine(Fragment) {
        Fragment = Fragment instanceof LineClass
            ? Fragment : partsAll.findPart(Fragment);

        if (!Fragment || Fragment.partType !== 'line') {
            return (false);
        }
        if (this.way[0].isEqual(Fragment.way[0])) {
            this.reverse();
        } else if (this.way[0].isEqual(Fragment.way.get(-1))) {
            this.reverse();
            Fragment.reverse();
        } else if (this.way.get(-1).isEqual(Fragment.way.get(-1))) {
            Fragment.reverse();
        }
        this.way.clone(this.way.concat(Fragment.way));
        this.way.checkWayRepeat();
        this.setConnect(1, Fragment.connect[1]);
        Fragment.replaceConnect(1, this.id);
        Fragment.elementDOM.remove();
        partsAll.deletePart(Fragment);

        this.wayDrawing();
    },
    //Start of wire path
    startPath(event, opt, ...args) {
        Search[opt].start.call(this, event, ...args);
    },
    //Set wire path
    setPath(event, opt) {
        Search[opt].callback.call(this, event);
    },
    //end of the path
    putDown(event, opt) {
        Search[opt].end.call(this, event);
    }
};

export { LineClass };
