'use strict';
import { $ } from './jquery';
import { schMap } from './maphash';
import { SVG_NS } from './init';
import { partsAll, partsNow } from './collection';
import { PartClass } from './parts';
import { LineClass } from './lines';

//Use data to draw on canvas
function loadData(data) {
    //The first pass, load the device and settings
    for (let i = 0; i < data.length; i++) {
        if ((data[i].partType !== 'line') && (data[i].partType !== 'config')) {
            const device = new PartClass(data[i]);
            device.elementDOM.attr('opacity', 1);
            device.markSign();
        } else if (data[i].partType === 'config'){
            for (const j in data[i]) if (data[i].hasOwnProperty(j)) {
                if (j === 'partType') continue;
                $('#' + j).prop('value', data[i][j]);
            }
        }
    }
    //The second time, load the wire
    for (let i = 0; i < data.length; i++) {
        if (data[i].partType === 'line') {
            const devices = new LineClass(data[i].way[0]);
            for (let j = 1; j < data[i].way.length; j++) {
                devices.way.push(data[i].way[j]);
            }
            devices.current = [0, [], [], [], [], [], false, false, []];
            devices.toGoing();
            partsNow.push(devices);
            for (let j = 0; j < 2; j++) {
                const node = devices.way[j * (devices.way.length - 1)];
                const nodeStatus = schMap.getValueByOrigin(node);
                if (nodeStatus.form === 'part-point') {
                    //Device pin
                    const connectpart = partsAll.findPart(nodeStatus.id.slice(0, nodeStatus.id.search('-')));
                    connectpart.setConnect(nodeStatus.id.slice(nodeStatus.id.search('-') + 1), devices.id);
                    devices.setConnect(j, nodeStatus.id);
                } else if (nodeStatus.form === 'line-point') {
                    //Temporary wire node
                    //If a point is intersected at a temporary node, the it must be a "cross-point"
                    nodeStatus.form = 'cross-point';
                    nodeStatus.id += ' ' + devices.id;
                } else if (nodeStatus.form === 'cross-point') {
                    //"cross-point"
                    nodeStatus.id += ' ' + devices.id;
                }
            }
            devices.render();
            devices.markSign();
        }
    }
    //The third pass, scan the "cross-point" nodes of the drawing
    for (const i in schMap) if (schMap.hasOwnProperty(i)) {
        for (const j in schMap[i]) if (schMap[i].hasOwnProperty(j)){
            const nodeStatus = schMap[i][j];
            if (nodeStatus.form === 'cross-point') {
                //Query all connected wires
                const node = [parseInt(i) * 20, parseInt(j) * 20],
                    lines = nodeStatus.id.split(' ').map(function(item){
                        const line = partsAll.findPart(item),
                            sub = line.findConnect(node);
                        return ([line, sub]);
                    });
                for (let k = 0; k < lines.length; k++) {
                    const lineconnect = (nodeStatus.id.search(lines[k][0].id + ' ') !== -1)
                        ? nodeStatus.id.replace(lines[k][0].id + ' ', '')
                        : nodeStatus.id.replace(' ' + lines[k][0].id, '');
                    lines[k][0].setConnect(lines[k][1], lineconnect);
                }
            }
        }
    }
}

const schematic = $('#area-of-parts');

//Map test
function MapTest() {
    this.test = $('#container-grid > svg > #area-of-parts').append($('<g>', SVG_NS, {
        'id': 'maptest'
    }));
}
MapTest.prototype = {
    point([x, y], color = '#00ff00', Mul = 1, r = 3) {
        this.test.append($('<circle>', SVG_NS, {
            'stroke-width': '3',
            'fill': 'transparent',
            'stroke': color,
            'transform': 'translate(' + (x * Mul) + ', ' + (y * Mul) + ')',
            'cx': '0',
            'cy': '0',
            r,
            'class': 'testPoint'
        }));
    },
    path(way, color = '#ff0000') {
        let wayData = 'M' + way[0].join(', ');
        for (let i = 1; i < way.length; i++) {
            wayData += 'L' + way[i].join(', ');
        }
        this.test.append($('<path>', SVG_NS, {
            'stroke-width': '2',
            'fill': 'transparent',
            'stroke': color,
            'd': wayData,
            'class': 'testPath'
        }));
    },
    text([x, y], text) {
        this.test.append($('<text>', SVG_NS, {
            x,
            y,
            fill: '#3B4449',
            'stroke-width': '0',
            'font-size': '14'
        })).text(text);
    },
    clear(className) {
        switch (className) {
            case 'Point' :
                this.test.childrens('.testPoint').remove();
                return true;
            case 'Path' :
                this.test.childrens('.testPath').remove();
                return true;
            case undefined :
                this.test.childrens().remove();
                return true;
            default :
                return (false);
        }
    },
    whole() {
        let countx = 0;
        for (let i = 0; i < partsAll.length; i++) {
            if (partsAll[i].partType === 'line') {
                this.text(
                    [1000, countx * 25 + 50],
                    partsAll[i].connect[0] + '　--->　' + partsAll[i].id + '　--->　' + partsAll[i].connect[1]
                );
                countx ++;
            }
        }
        countx ++;
        const mapNodes = schMap.toSmallNodes();
        for (let k = 0; k < mapNodes.length; k++) {
            const i = mapNodes[k][0],
                j = mapNodes[k][1],
                tempstatus = schMap.getValueBySmalle(mapNodes[k]);

            if (tempstatus.form === 'part-point') {
                //red
                this.point([i, j], '#ff0000', 20, 4);
            } else if (tempstatus.form === 'part') {
                //black
                this.point([i, j], '#000000', 20, 4);
            }

            if (tempstatus.connect) {
                for (let k = 0; k < tempstatus.connect.length; k++) {
                    const connect = tempstatus.connect,
                        tempx = connect[k][0] - i,
                        tempy = connect[k][1] - j;
                    if (tempx < 0) {
                        this.path([[i * 20, j * 20 - 3], [connect[k][0] * 20, connect[k][1] * 20 - 3]], '#000000');
                    } else if (tempx > 0) {
                        this.path([[i * 20, j * 20 + 3], [connect[k][0] * 20, connect[k][1] * 20 + 3]], '#000000');
                    } else if (tempy < 0) {
                        this.path([[i * 20 - 3, j * 20], [connect[k][0] * 20 - 3, connect[k][1] * 20]], '#000000');
                    } else if (tempy > 0) {
                        this.path([[i * 20 + 3, j * 20], [connect[k][0] * 20 + 3, connect[k][1] * 20]], '#000000');
                    }
                }
                if (tempstatus.form === 'line') {
                    //blue
                    this.point([i, j], '#0000ff', 20, 4);
                } else if (tempstatus.form === 'cross-point') {
                    //yellow
                    this.point([i, j], '#dcfc02', 20, 4);
                } else if (tempstatus.form === 'line-point') {
                    //green
                    this.point([i, j], '#02fc31', 20, 4);
                } else if (tempstatus.form === 'cover-point') {
                    //green
                    this.point([i, j], '#E9967A', 20, 4);
                }
            }
            if (tempstatus.form === 'line') {
                this.text([i * 20 + 5, j * 20 + 15], tempstatus.id.split('_')[1]);
            } else if (tempstatus.form === 'part-point') {
                this.text([i * 20 + 5, j * 20 + 15], tempstatus.id.split('-')[1]);
            } else if (tempstatus.form === 'cross-point') {
                this.path([[i * 20, j * 20], [1000, countx * 25 + 50]], '#222222');
                this.text([1000, countx * 25 + 50], tempstatus.id);
                countx++;
            } else if (tempstatus.form === 'cover-point') {
                this.path([[i * 20, j * 20], [1000, countx * 25 + 50]], '#222222');
                this.text([1000, countx * 25 + 50], tempstatus.id);
                countx++;
            }
        }
    },
};

//Wire path finding test
const lineTestData = {
    //Draw wires from the pins
    pin2draw: {
        initMap: [
            { partType: 'resistance', id: 'R_1', input: ['10k'], position: [420, 240], rotate:[[1, 0], [0, 1]] },
            { partType: 'resistance', id: 'R_2', input: ['10k'], position: [700, 220], rotate:[[1, 0], [0, 1]] }
        ],
        action:[
            //Click the pin of R_1-1
            {
                event: {type:'mousedown', which: 1, currentTarget: 'g#R_1-1', pageX: 460, pageY: 240},
                describe: 'Click at pin 1 of R_1',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240]]
                    }
                ]
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 690, pageY: 250},
                describe: 'Move mouse to [690, 250]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [690, 240], [690, 250]]
                    }
                ]
            },
            //Move to R_2
            {
                event: {
                    type:'mouseenter',
                    currentTarget: 'div#container-grid',
                    relatedTarget: 'g#line_1-1 > circle',
                    target: 'g#R_2 > rect.focus-part'
                },
                describe: 'Mouse is inside R_2 area',
                data: []
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 690, pageY: 234},
                describe: 'Move mouse to [690, 234]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [660, 240], [660, 220]]
                    }
                ]
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 710, pageY: 230},
                describe: 'Move mouse to [710, 234]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [740, 240], [740, 220]]
                    }
                ]
            },
            //Move away from R_2 area
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 690, pageY: 234},
                describe: 'Move mouse to [690, 234]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [660, 240], [660, 220]]
                    }
                ]
            },
            {
                event: {
                    type:'mouseleave',
                    currentTarget: 'div#container-grid',
                    relatedTarget: 'div#container-grid > svg',
                    target: 'g#R_2 > rect.focus-part'
                },
                describe: 'Mouse is away from R_2 area',
                data: []
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 430, pageY: 260},
                describe: 'Move mouse to [420, 260]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [460, 260], [430, 260]]
                    }
                ]
            },
            //Move to R_1
            {
                event: {
                    type:'mouseenter',
                    currentTarget: 'div#container-grid',
                    relatedTarget: 'g#line_1-1 > circle',
                    target: 'g#R_1 > rect.focus-part'
                },
                describe: 'Mouse is inside R_1 area',
                data: []
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 430, pageY: 254},
                describe: 'Move mouse to [420, 254]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [460, 260], [380, 260], [380, 240]]
                    }
                ]
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 410, pageY: 230},
                describe: 'Move mouse to [410, 230]',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [460, 260], [380, 260], [380, 240]]
                    }
                ]
            },
            //mouseup
            {
                event: {type:'mouseup', which: 1, currentTarget: 'div#container-grid', pageX: 410, pageY: 230},
                describe: 'Mouse up at R_1',
                data: [
                    {
                        id: 'line_1',
                        way: [[460, 240], [460, 260], [380, 260], [380, 240]]
                    }
                ]
            },
            //Click the pin of R_2-1
            {
                event: {type:'mousedown', which: 1, currentTarget: 'g#R_2-0', pageX: 660, pageY: 220},
                describe: 'Click at pin 0 of R_2',
                data: [
                    {
                        id: 'line_2',
                        way: [[660, 220]]
                    }
                ]
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 410, pageY: 220},
                describe: 'Move mouse to [410, 220]',
                data: [
                    {
                        id: 'line_2',
                        way: [[660, 220], [410, 220], [410, 220]]
                    }
                ]
            },
            //Move to R1
            {
                event: {
                    type:'mouseenter',
                    currentTarget: 'div#container-grid',
                    relatedTarget: 'g#line_1-1 > circle',
                    target: 'g#R_1 > rect.focus-part'
                },
                describe: 'Mouse is inside R_1 area',
                data: []
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 410, pageY: 230},
                describe: 'Move mouse to [410, 230]',
                data: [
                    {
                        id: 'line_2',
                        way: [[660, 220], [410, 220], [410, 230]]
                    }
                ]
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 410, pageY: 245},
                describe: 'Move mouse to [410, 245]',
                data: [
                    {
                        id: 'line_2',
                        way: [[660, 220], [410, 220], [410, 245]]
                    }
                ]
            },
            {
                event: {type:'mousemove', currentTarget: 'div#container-grid', pageX: 430, pageY: 245},
                describe: 'Move mouse to [430, 245]',
                data: [
                    {
                        id: 'line_2',
                        way: [[660, 220], [430, 220], [430, 245]]
                    }
                ]
            },

            //mouseup

        ]
    },
    //Move single device
    part2move: {

    },
    //Move multiple device
    parts2move: {

    },
    //Shape change of wire
    linetrans: {

    }
};
const lineTest = {
    //Trigger action
    action(data) {
        const event = Object.clone(data.event),
            target = ['currentTarget', 'relatedTarget', 'target'];

        for (let i = 0; i < target.length; i++) {
            event[target[i]] = (event[target[i]])
                ? $(event[target[i]])[0]
                : undefined;
        }

        $(event.currentTarget).trigger(event);
    },
    //Data validation
    dataCheck(data) {
        for (let i = 0; i < data.length; i++) {
            const line = partsAll.findPart(data[i].id);
            if (!line.way.isSame(data[i].way)) {
                return (false);
            }
        }
        return (true);
    },
    //Initialization
    init(map) {
        //Clear drawings and device collections
        schematic.childrens().remove();
        partsAll.deleteAll();
        partsNow.deleteAll();
        loadData(map);
    }
};
function LineTest(type) {
    const test = lineTestData[type];
    lineTest.init(test.initMap);

    //Initialization
    let promise = new Promise(function(res, rej) {
        lineTest.action(test.action[0]);
        if (lineTest.dataCheck(test.action[0].data)) {
            res();
        } else {
            rej(0);
        }
    });
    //Trigger asynchronous
    for (let i = 1; i < test.action.length; i++) {
        promise = promise.then(function(){
            return new Promise(function(res, rej) {
                setTimeout(function() {
                    if (i === 100) {
                        console.log('stop');
                    }
                    lineTest.action(test.action[i]);
                    if (lineTest.dataCheck(test.action[i].data)) {
                        res();
                    } else {
                        rej(i);
                    }
                }, 100);
            });
        });
    }

    //Normal end, and error capture
    promise.then(function(){
        console.log('Verification is complete, error not found');
    }).catch(function(e) {
        console.log('Error：The' + e + 'step');
        console.log('Operation: ' + test.action[e].describe);
    });
}

//Some variables need to be used globally during testing
window.mapTest = new MapTest();
window.lineTest = LineTest;
window.partsAll = partsAll;
window.partsNow = partsNow;
window.schMap = schMap;
window.$ = $;
