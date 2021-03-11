'use strict';

import { $ } from './jquery';
import { iniData, SVG_NS } from './init';
import { schMap } from './maphash';
import { Point } from './point';
import { LineClass } from './lines';
import { Solver } from './solver';
import { Graph } from './graph';
import { styleRule } from './styleRule';
import { PartClass } from './parts';
import { labelSet } from './parts';
import { partsAll, partsNow } from './collection';
import { nodeId } from './nodeID';
import filter from './filter';
import './test';

//Global variable definition
const doc = document,
    u = undefined;
//Drawing grid module
const grid = (function SchematicsGrid() {
    //Module object
    const self = {};
    //Persistent status flag
    let flag = 0;
    const continuous = [
        'newMark',      //New device flag
        'moveParts',    //moveable device flag
        'pasteParts',   //Paste the device
        'moveMap',      //Move the drawing mark
        'selectBox',    //Draw check box flag
        'deformLine',   //Wire deformation flag
        'moveText',     //Move the txt flag
        'drawLine',     //Draw wire flag
        'graphSelecte'  //Waveform selection box flag
    ];
    //Flag part
    for (let i = 0; i < continuous.length; i++) {
        //This is a block-level scope, so there is no need to save the value of i internally
        Object.defineProperty(self, continuous[i], {
            enumerable: true,
            configurable: true,

            get() {
                return (!!(flag & (1 << i)));
            }
        });
        const setValue = 'set' + continuous[i].substring(0, 1).toUpperCase() + continuous[i].substring(1);
        //The operation of the flag bit must pass this function
        self[setValue] = function (value) {
            value = Number(!!value);
            if (value) {
                flag |= 1 << i;
            } else {
                flag &= 0xFFFF ^ (1 << i);
            }
        };
    }
    //total mark
    Object.defineProperty(self, 'totalMarks', {
        enumerable: true,
        configurable: true,

        get() {
            return (!!flag);
        },
        //Prohibit direct manipulation of attributes
        //set() {}
    });

    let size = 20,      //Background grid size
        rate = 1,       //The magnification ratio compared to the previous grid
        zoom = 1,       //The magnification ratio relative to the original size
        placeX = 0,     //Grid coordinates
        placeY = 0,
        SVGX = 0,       //Offset of drawing area
        SVGY = 0,

        mouseLastX = 0, //Temporary mouse offset
        mouseLastY = 0;

    const copyStack = [],   //Copy device stack
        revocation = [],    //Undo the stack, keep up to 10 operations
        textTip = $('<div>', { id: 'error-tip', class: 'disappear' });

    $('#editor-container').append(textTip);

    //Current mouse position
    function mouse(event) {
        return (Point([
            (event.pageX - SVGX) / zoom,
            (event.pageY - SVGY) / zoom
        ]));
    }
    //Mouse offset position
    function mouseBias(event) {
        const ans = Point([
            (event.pageX - mouseLastX) / zoom,
            (event.pageY - mouseLastY) / zoom
        ]);
        mouseLastX = event.pageX;
        mouseLastY = event.pageY;
        return (ans);
    }
    //Save device properties
    function save(arr) {
        const ans = [];

        for (let i = 0; i < arr.length; i++) {
            ans.push(arr[i].toSimpleData());
        }

        return (ans);
    }

    self.size = function (num) {
        if (num === u) {
            return (size);
        } else {
            size = num;
        }
    };
    self.rate = function (num) {
        if (num === u) {
            return (rate);
        } else {
            rate = num;
        }
    };
    self.zoom = function (num) {
        if (num === u) {
            return (zoom);
        } else {
            zoom = num;
        }
    };
    self.bias = function (x, y) {
        if (x === u && y === u) {
            return ([placeX, placeY]);
        } else if (x !== u && y !== u) {
            placeX = x;
            placeY = y;
        } else if (x instanceof Array && u === u) {
            placeX = x[0];
            placeY = x[1];
        }
    };
    self.SVG = function (x, y) {
        if (x === u && y === u) {
            return ([SVGX, SVGY]);
        } else if (x !== u && y !== u) {
            SVGX = x;
            SVGY = y;
        } else if (x instanceof Array && u === u) {
            SVGX = x[0];
            SVGY = x[1];
        }
    };
    self.mouse = function (event) {
        return (mouse(event));
    };
    self.createData = function (event) {
        //Offset initialization
        mouseBias(event);

        //Initial data
        const ans = {
            zoom: self.zoom(),
            SVG: self.SVG(),
            mouse,
            mouseBias,
            gridL: []
        };
        if (event.pageX && event.pageY) {
            ans.pageL = mouse(event);
            ans.gridS = Point([event.pageX, event.pageY]).floor();
        }
        return (ans);
    };

    //copy
    self.copy = function (arr) {
        const data = arr ? arr : partsNow;

        let move = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].current.status === 'move') {
                move.push(data[i]);
            }
        }
        move = save(move);

        copyStack.length = 0;
        for (let i = 0; i < move.length; i++) {
            copyStack.push(move[i]);
        }
    };
    //cut
    self.cut = function () {
        let half = [];
        const move = [];
        //Save deformed wire
        for (let i = 0; i < partsNow.length; i++) {
            if (partsNow[i].current.status === 'move') {
                move.push(partsNow[i]);
            } else {
                half.push(partsNow[i]);
            }
        }
        //copy
        self.copy(partsNow);
        //save the data
        half = save(half);
        //delete
        move.forEach((n) => n.deleteSelf());
        //paste part of the wire
        self.paste(half);
        partsNow.forEach((n) => {
            n.elementDOM.removeAttr('opacity');
            n.nodeToConnect(0);
            n.nodeToConnect(1);
            n.markSign();
        });
    };
    //paste
    self.paste = function (arr) {
        const now = arr ? arr : copyStack, name = [];

        partsNow.deleteAll();
        for (let i = 0; i < now.length; i++) {
            const data = now[i];
            if (data.partType === 'config') {
                for (const j in data) {
                    if (data.hasOwnProperty(j)) {
                        $('#' + j).prop('value', data[j]);
                    }
                }
                continue;
            } else if (data.partType !== 'line') {
                partsNow.push(new PartClass(data));
            } else {
                partsNow.push(new LineClass(data));
            }

            const part = partsNow.get(-1), id = {};
            //Record old and new id
            if (data.id && data.id !== part.id) {
                id.old = data.id;
                id.new = partsNow.get(-1).id;
                name.push(id);
            }

            part.current = {};
            part.current.status = 'move';
            part.elementDOM.attr('opacity', 0.4);
        }

        //Replace the old id with new id
        for (let i = 0; i < name.length; i++) {
            for (let j = 0; j < partsNow.length; j++) {
                for (let k = 0; k < partsNow[j].connect.length; k++) {
                    const part = partsNow[j],
                        con = part.connect[k],
                        old = name[i].old,
                        id = name[i].new;

                    part.connect[k] = con.replace(old, id);
                }
            }
        }
        //Delete non-existent device connection
        for (let i = 0; i < partsNow.length; i++) {
            const part = partsNow[i],
                con = part.connect;
            for (let j = 0; j < con.length; j++) {
                con[j] = con[j].split(' ')
                    .filter((n) => partsNow.has(n))
                    .join(' ');
            }
        }
        //Combine some wires
        for (let i = 0; i < partsNow.length; i++) {
            const line = partsNow[i],
                con = line.connect;
            if (!line.isExist() || line.partType !== 'line') {
                continue;
            }

            for (let j = 0; j < 2; j++) {
                if (line.connectStatus(j) === 'line' &&
                    con[j].split(' ').length === 1) {
                    line.mergeLine(con[j]);
                }
            }
        }
        //Clean up the device collection
        partsNow.deleteParts((n) => n.isExist());
    };
    //Record the current state of all devices
    self.now = function () {
        const ans = [];
        for (let i = 0; i < partsAll.length; i++) {
            ans.push(partsAll[i].toSimpleData());
        }
        if (!ans.isEqual(revocation.get(-1))) {
            revocation.push(ans);
        }
        if (revocation.length > 10) {
            revocation.splice(0, 1);
        }
    };
    //revoke
    self.revocate = function (arr) {
        //obtain the last operation
        const last = arr ? arr : revocation.pop();
        if (!last) { return (false); }

        //delete device
        partsNow.deleteAll();
        partsAll.forEach((n) => partsNow.push(n));
        partsNow.forEach((n) => n.deleteSelf());
        partsNow.deleteAll();
        partsAll.deleteAll();

        //Load specified data
        grid.paste(last);
        partsNow.deleteAll();
        //place the device
        for (let i = 0; i < partsAll.length; i++) {
            partsAll[i].elementDOM.removeAttr('opacity');
            partsAll[i].render && partsAll[i].render();
            partsAll[i].markSign();
        }
        //Determine the connection relationship
        for (let i = 0; i < partsAll.length; i++) {
            if (partsAll[i].partType === 'line') {
                partsAll[i].nodeToConnect(0);
                partsAll[i].nodeToConnect(1);
            }
        }
    };
    //Whether there is data in the copy stack
    self.isPaste = function () {
        return (!!copyStack.length);
    };
    //Record whether there is data in the stack
    self.isRevocate = function () {
        return (!!revocation.length);
    };
    //error notation
    self.error = function (text) {
        textTip.text(text);
        textTip.attr('style', '');
        textTip.removeClass('disappear');

        //disappear in 5 seconds
        setTimeout(() => textTip.addClass('disappear'), 5000);
        //Leave the document stream after 6 seconds
        setTimeout(() => textTip.css('z-index', '-10'), 6000);
    };

    //Reserved global temporary variables
    self.current = [];
    //Closed module
    Object.seal(self);

    //Return module object
    return (self);
})();
//Global jquary element definition
const sidebar = $('#sidebar-menu'),
    action = $('#action-container'),
    mainPage = $('#container-grid'),
    parameter = $('#parameter-menu'),
    graphPage = $('#graph-page'),
    context = $('#right-button-menu'),
    qmNode1Content = $('#qmNode1'),
    qmNode2Content = $('#qmNode2'),
    qmRunButton = $('#fab-qmrun');



//Entry function for mouse movement
function mousemoveEvent(event) {
    if (!grid.totalMarks) { return (false); }

    switch (true) {
        //Device movement
        case grid.newMark:
        case grid.pasteParts:
        case grid.moveParts: {
            partsNow.moveParts(event);
            break;
        }
        //canvas move
        case grid.moveMap: {
            //No need to zoom the mouse distance when moving the drawing
            const bias = grid.current.mouseBias(event)
                .mul(grid.current.zoom);

            if (bias.isEqual([0, 0])) {
                return (false);
            }

            //The mouse will be deformed only if it does move
            mainPage.attr('class', 'mouse-movemap');

            let SVGPos = grid.SVG();
            grid.SVG(SVGPos[0] + bias[0], SVGPos[1] + bias[1]);

            SVGPos = grid.SVG();
            grid.bias(
                SVGPos[0] % grid.size(),
                SVGPos[1] % grid.size()
            );
            mainPage.css('background-position', grid.bias().join('px ') + 'px');
            $('#area-of-parts').attr('transform',
                'translate(' + SVGPos.join(', ') + ') scale(' + grid.zoom() + ')');

            break;
        }
        //Draw a checkbox
        case grid.selectBox: {
            const node = grid.mouse(event),
                start = grid.current.selectionBoxStart,
                maxLen = Math.max(
                    Math.abs(node[0] - start[0]),
                    Math.abs(node[1] - start[1])
                );

            $('#select-box').attr('points',
                start.join(', ') + ' ' +
                node[0] + ', ' + start[1] + ' ' +
                node.join(', ') + ' ' +
                start[0] + ', ' + node[1]
            );
            (maxLen > 3) && mainPage.attr('class', 'mouse-selectBox');
            break;
        }
        //Wire deformation
        case grid.deformLine: {
            partsNow[0].setPath(event, 'deformation');
            break;
        }
        //Mobile device description text
        case grid.moveText: {
            partsNow[0].move(event, 'text');
            break;
        }
        //Draw wire
        case grid.drawLine: {
            partsNow.get(-1).setPath(event, 'draw');
            break;
        }
        //Draw waveform interface selection box
        case grid.graphSelecte: {
            grid.current.graph.drawSelect(event, grid.current);
            break;
        }
        //other
        default: {
            break;
        }
    }

    return (false);
}
//Clear all current status
function clearStatus() {
    contextSet();
    for (let i = 0; i < partsNow.length; i++) {
        partsNow[i].toNormal();
    }
    partsNow.deleteAll();
    partsNow.current = {};
}
//Right click menu
function contextSet(event, status) {
    const contextMenu = $('#right-button-menu'),
        rotateId = [
            '#clockwise-direction',
            '#anticlockwise-direction',
            '#X-Mirror',
            '#Y-Mirror'
        ];

    //Close right-click menu
    if (status === 'close' || status === u) {
        contextMenu.attr('class', '');
        $('.right-button-option', contextMenu).each((n) => $(n).removeClass('disable'));
        return (false);
    }

    contextMenu.attr('class', 'right-' + status);
    //Place it in the upper left corner first, with 0 transparency
    contextMenu.css({
        'left': 0,
        'top': 0,
        'opacity': 0
    });
    //Force refresh the menu and get the size of the menu
    const win = $(window),
        Height = win.height(),
        Width = sidebar.hasClass('open-add-parts')
            ? win.width() - sidebar.width()
            : win.width(),
        menuWidth = contextMenu.width(),
        menuHeight = contextMenu.height(),
        left = (Width - event.pageX < menuWidth)
            ? event.pageX - menuWidth
            : event.pageX,
        top = (Height - event.pageY < menuHeight)
            ? event.pageY - menuHeight
            : event.pageY;

    contextMenu.css({
        'left': left + 'px',
        'top': top + 'px',
        'opacity': 1
    });

    if (status.indexOf('part') !== -1) {
        //Device part, feasibility of rotating function
        const rotate = partsNow.isRotate();
        for (let i = 0; i < 4; i++) {
            const elem = $(rotateId[i]);
            rotate[i]
                ? elem.removeClass('disable')
                : elem.addClass('disable');
        }
    } else if (status === 'map') {
        //Drawing part, whether the undo and paste functions are available
        let elem = $('#right-undo');
        grid.isRevocate()
            ? elem.removeClass('disable')
            : elem.addClass('disable');

        elem = $('#parts-paste');
        grid.isPaste()
            ? elem.removeClass('disable')
            : elem.addClass('disable');
    }

}
//Display waveform
function createGraph(data) {
    const ratio = 1.6,                                  //Page aspect ratio
        otherHeight = 61,                               //Top reserved height
        totalHeight = $(window).height(),               //Window height
        totalWidth = $(window).width(),                 //Window width
        maxForm = !!(data.voltage.length) +             //How many waveform interfaces are needed
            !!(data.current.length),
        graphHeight = totalHeight - otherHeight,        //Waveform page height
        boxHeight = graphHeight / maxForm,              //Height of each panel
        graphMain = $('#graph-main'),
        graphWidth = (totalHeight * ratio < totalWidth) ? totalHeight * ratio : totalWidth,
        graphForm = graphMain.childSelect('div.graph-individual', maxForm);

    //Delete all elements in the DOM
    for (let i = 0; i < graphForm.length; i++) {
        const form = graphForm.get(i);
        form.childrens().remove();
        form.css('height', boxHeight + 'px');
    }

    //Set the waveform page width
    graphPage.attr('style', 'width: ' + graphWidth + 'px');
    //Create waveform
    for (let i = 0; i < 2; i++) {
        const label = ['voltage', 'current'][i];
        if (data[label].length) {
            const sub = (graphForm.length === 2) ? i : 0;
            graphForm.get(sub).attr('id', 'graphForm-' + i);
            graphForm.get(sub).prop('_data', new Graph(data[label], graphForm[sub], label));
        }
    }
    //Data preparation is complete, ready for page change
    const height = graphPage.height(),
        width = graphPage.width(),
        actionRight = 66,
        actionBottom = 63.6,
        R = Math.sqrt((actionRight - width) * (actionRight - width) + (actionBottom - height) * (actionBottom - height)),
        clipPath = [
            [R - width + actionRight, R - height],
            [R - width + actionRight, R + actionBottom + 10],
            [R + actionRight + 10, R + actionBottom + 10],
            [R + actionRight + 10, R - height]
        ].map((n) => n.join('px ')).join('px,') + 'px';

    graphPage.attr('class', 'run');

    const circle = graphPage.append($('<div>', {
        'id': 'background-circle',
        'style': 'position: absolute; background-color: #66CCCC; border-radius: 50%;' +
            '-webkit-clip-path: polygon(' + clipPath + ');' +
            'margin : 0; right: ' + actionRight + 'px; bottom: ' + actionBottom + 'px; ' +
            'width: ' + (2 * R) + 'px; height: ' + (2 * R) + 'px; transform: translate(50%,50%)'
    }));
    const anime = new styleRule('graph-vision');
    anime.setRule('0%', {
        'width': '0px',
        'height': '0px',
        '-webkit-clip-path': 'circle(0)'
    });
    anime.setRule('100%', {
        'width': 2 * R + 'px',
        'height': 2 * R + 'px',
        '-webkit-clip-path': 'circle(200vh)'
    });

    setTimeout(function () {
        graphPage.attr('class', 'visionAll');
        circle.remove();
    }, 600);
}

//Web page element related events
//Add all events of the device in the device menu
sidebar.on({
    mousemove(event) {
        $('#float-tool-tip').css({
            bottom: (window.innerHeight - event.pageY) + 'px',
            right: (window.innerWidth - event.pageX) + 'px'
        });
    },
    mouseenter(event) {
        const text = $(event.currentTarget).prop('introduction');
        $('#float-tool-tip').css({
            display: 'block',
            width: (text.length * 16) + 'px'
        }).text(text);
    },
    mouseleave() {
        $('#float-tool-tip').css({
            display: 'none'
        }, true);
    },
    click(event) {
        if (event.which === 1 && !grid.totalMarks) {
            clearStatus();
            grid.now();
            grid.setNewMark(true);

            (new PartClass(event.currentTarget.id)).toFocus();

            partsNow.checkLine();
            partsNow.current = grid.createData(event);
            partsNow.current.pageL = partsNow.center();
            partsNow.moveParts({ pageX: -50000, pageY: -50000 });
            mainPage.on('mousemove', mousemoveEvent);
        }
    }
}, '.parts-list');
//Click the close button in the add device menu bar
sidebar.on('click', '#menu-add-parts-close', function (event) {
    if (event.which === 1) {
        $('#menu-add-parts-close').addClass('disappear');
        $(document.body).removeClass('open-sidebar open-gray');
        sidebar.removeClass('open-menu-config open-add-parts');
    }
});
//Open the static output sidebar
action.on('click', '#fab-staticOutput', function (event) {
    if (event.which === 1) {
        $(document.body).addClass('open-sidebar open-gray');
        sidebar.addClass('open-menu-staticOutput');
    }
});
//Open the quick measurement sidebar
action.on('click', '#fab-quickMeasure', function (event) {
    if (event.which === 1) {
        $(document.body).addClass('open-sidebar open-gray');
        sidebar.addClass('open-menu-quickMeasure');
    }
});
//Open the settings sidebar
action.on('click', '#fab-config', function (event) {
    if (event.which === 1) {
        $(document.body).addClass('open-sidebar open-gray');
        sidebar.addClass('open-menu-config');
    }
});
//Open the side bar
action.on('click', '#fab-adds', function (event) {
    if (event.which === 1) {
        $(document.body).addClass('open-sidebar');
        sidebar.addClass('open-add-parts');
        $('#menu-add-parts-close').removeClass('disappear');
    }
});

// Start the simulation
action.on('click', '#fab-run', function (event) {
    var feedback;
    var temp_var = partsAll.connectGraph();
    if (temp_var.length == 0) {
        grid.error('Circuit diagram need to contain at least one component!');
        return (false);
    }
    else if (temp_var.length > 1) {
        grid.error('Cannot simulate more than one separate circuits at the same time!');
        return (false);
    } else {
        temp_var = temp_var[0];
    }
    // console.log("original circuit");
    // console.log(temp_var);
    var filteredCircuit = JSON.stringify(temp_var);
    filteredCircuit = filter(filteredCircuit);
    // console.log("filtered circuit");
    // console.log(JSON.stringify(filteredCircuit));
    var output = nodeId(filteredCircuit);
    console.log("stringified output obj after nodeid");
    console.log(JSON.stringify(output));
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:5000/static_simulator/Test';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/JSON');
    // Create a state change callback 
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 201) {
            // Print received data from server 
            // xhr.innerHTML = xhr.responseText;
            feedback = xhr.responseText;
            staticOutputUpdate(eval("(" + feedback + ")"));
        } else if (xhr.readyState === 4 && xhr.status === 400) {
            alert(xhr.responseText);
        }
    };
    // Converting JSON data to string 
    var data = JSON.stringify(output);
    // Sending data with the request 
    xhr.send(data);
    $(document.body).addClass('open-sidebar open-gray');
    sidebar.addClass('open-menu-staticOutput');
    return;
});

function staticOutputRefresh() {
    var staticOutput = $('#menu-staticOutput');
    staticOutput.childrens().each((n) => n.remove());
    var stMenuTitle = staticOutput.append($('<div>', { class: 'st-menu-title' }));
    stMenuTitle.append($('<h1>')).text('Static Output');
    stMenuTitle.append($('<h2>')).text('For DC Analysis Only');
    return staticOutput;
}

//Update the static output panel
function staticOutputUpdate(feedback) {
    var staticOutput = staticOutputRefresh();

    var inputTitle;
    var inputGroup;
    var result;
    var resultList;
    var numVM = feedback.VM ? feedback.VM.length : 0;
    var numAM = feedback.AM ? feedback.AM.length : 0;
    // console.log("numVM: " + numVM);
    // console.log("numAM: " + numAM);
    if (numVM > 0) {
        inputTitle = staticOutput.append($('<div>', { class: 'st-menu-input-title' }));
        inputTitle.append($('<span>')).text('V');
        inputTitle.append($('<span>')).text('Voltmeters');
        for (var i = 0; i < numVM; i++) {
            result = JSON.stringify(feedback.VM[i]);
            result = result.substring(1, result.length - 1);
            resultList = result.split(':');
            resultList[0] = resultList[0].substring(1, resultList[0].length - 1);
            inputGroup = staticOutput.append($('<div>', { class: 'st-menu-input-group' }));
            inputGroup.append($('<span>', { class: 'st-menu-name' })).text(resultList[0]);
            inputGroup.append($('<span>', { class: 'st-menu-value' })).text(resultList[1]);
            inputGroup.append($('<span>', { class: 'st-menu-unit' })).text('Volt');
            inputGroup.append($('<span>', { class: 'st-menu-input-bar' }));
        }
    }
    if (numAM > 0) {
        inputTitle = staticOutput.append($('<div>', { class: 'st-menu-input-title' }));
        inputTitle.append($('<span>')).text('A');
        inputTitle.append($('<span>')).text('Ammeters');
        for (var i = 0; i < numAM; i++) {
            result = JSON.stringify(feedback.AM[i]);
            result = result.substring(1, result.length - 1);
            resultList = result.split(':');
            resultList[0] = resultList[0].substring(1, resultList[0].length - 1);
            resultList[1] = resultList[1].substring(0, 8);
            inputGroup = staticOutput.append($('<div>', { class: 'st-menu-input-group' }));
            inputGroup.append($('<span>', { class: 'st-menu-name' })).text(resultList[0]);
            inputGroup.append($('<span>', { class: 'st-menu-value' })).text(resultList[1]);
            inputGroup.append($('<span>', { class: 'st-menu-unit' })).text('Amp');
            inputGroup.append($('<span>', { class: 'st-menu-input-bar' }));
        }
    }
};

//Finish setting the nodes 1
qmNode1Content.on('focusout', function (event) {
    var qmNode1inner = document.getElementById("qmNode1");
    var node1Text = qmNode1inner.value;
    if (node1Text != "" && labelSet && !labelSet.has(node1Text)) {
        alert("Cannot access this node.");
        qmNode1inner.focus();
    }
})
//Finish setting the nodes 2
qmNode2Content.on('focusout', function (event) {
    var qmNode2inner = document.getElementById("qmNode2");
    var node2Text = qmNode2inner.value;
    if (node2Text != "" && labelSet && !labelSet.has(node2Text)) {
        alert("Cannot access this node.");
        qmNode2inner.focus();
    }
})
//Quick Measurement Start
qmRunButton.on('click', function (event) {
    var qmNode1inner = document.getElementById("qmNode1");
    var node1Text = qmNode1inner.value;
    var qmNode2inner = document.getElementById("qmNode2");
    var node2Text = qmNode2inner.value;
    if (node1Text == "" || node2Text == "") {
        alert("Please specify the nodes you want to measure");
        return (false);
    }
    var feedback;
    var temp_var = partsAll.connectGraph();
    if (temp_var.length == 0) {
        alert('Circuit diagram need to contain at least one component!');
        return (false);
    }
    else if (temp_var.length > 1) {
        alert('Cannot simulate more than one separate circuits at the same time!');
        return (false);
    } else {
        temp_var = temp_var[0];
    }
    var filteredCircuit = JSON.stringify(temp_var);
    filteredCircuit = filter(filteredCircuit, true);
    var output = nodeId(filteredCircuit);
    console.log(JSON.stringify(output));
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:5000/static_simulator/Test';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/JSON');
    // Create a state change callback 
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 201) {
            // Print received data from server 
            // xhr.innerHTML = xhr.responseText;
            feedback = xhr.responseText;
            alert(feedback);
        } else if (xhr.readyState === 4 && xhr.status === 400) {
            alert(xhr.responseText);
        }
    };
    // Converting JSON data to string 
    var data = JSON.stringify(output);
    // Sending data with the request 
    xhr.send(data);
    return;
})

//Cancel button of device property menu
parameter.on('click', '#parameter-bottom-cancel', function () {
    $(doc.body).removeClass('open-gray');
    parameter.css('z-index', '20');
    parameter.attr('class', 'parameter-close');

    setTimeout(function () {
        parameter.css('z-index', '');
    }, 350);
});
//OK button of device property menu
parameter.on('click', '#parameter-bottom-accept', function () {
    //Record data
    grid.now();
    //Check the format of the input data
    if (partsNow[0].inputVision()) {
        $(doc.body).removeClass('open-gray');
        parameter.css('z-index', '20');
        parameter.attr('class', 'parameter-close');
        setTimeout(function () {
            parameter.css('z-index', '');
        }, 350);
    }
});
//Mouse wheel event
mainPage.on('mousewheel', function (event) {
    if (!$(doc.body).hasClass('open-gray')) {
        const mousePosition = [event.pageX, event.pageY];

        const sizeL = grid.size();
        if (event.deltaY > 0) {
            grid.size(sizeL - 5);
        } else if (event.deltaY < 0) {
            grid.size(sizeL + 5);
        }

        if (grid.size() < 20) {
            grid.size(20);
            return (true);
        }
        if (grid.size() > 80) {
            grid.size(80);
            return (true);
        }

        const size = grid.size();
        grid.rate(size / sizeL);
        grid.zoom(size / 20.0);

        let SVGPos = grid.SVG();
        grid.SVG(
            Math.round(mousePosition[0] - grid.rate() * (mousePosition[0] - SVGPos[0])),
            Math.round(mousePosition[1] - grid.rate() * (mousePosition[1] - SVGPos[1]))
        );

        SVGPos = grid.SVG();
        grid.bias(
            SVGPos[0] % size,
            SVGPos[1] % size
        );
        mainPage.css({
            'background-size': size + 'px',
            'background-position': grid.bias().join('px ') + 'px'
        });
        $('#area-of-parts').attr('transform', 'translate(' + SVGPos.join(', ') + ') scale(' + grid.zoom() + ')');
    }
});
//Mouse click shady
$('#shade-gray').on('click', function () {
    if ((sidebar.hasClass('open-menu-quickMeasure')
        || sidebar.hasClass('open-menu-staticOutput'))
        || sidebar.hasClass('open-menu-config')
        && !parameter.hasClass('parameter-open')) {
        $(doc.body).removeClass('open-gray open-sidebar');
        sidebar.removeClass('open-menu-quickMeasure open-menu-staticOutput open-menu-config open-add-parts');
    }
});

//Device related events
//Device mousedown event
mainPage.on('mousedown', 'g.editor-parts .focus-part, g.editor-parts path, g.editor-parts .features-text', function (event) {
    if (grid.totalMarks) {
        return false;
    }
    //Find the object of the current device
    const clickpart = partsAll.findPart(event.currentTarget.parentNode.id);
    if (event.which === 1) {
        if (event.currentTarget.tagName === 'text') {
            //Click the device description text
            clearStatus();
            const text = $(this);
            clickpart.toFocus();
            clickpart.current = grid.createData(event)
                .extend({
                    text,
                    position: Point([
                        parseInt(text.attr('x')),
                        parseInt(text.attr('y'))
                    ])
                });
            grid.setMoveText(true);
        } else {
            //Click ontology
            if (!partsNow.has(clickpart.id)) {
                //Single device
                clearStatus();
                clickpart.toFocus();
            } else {
                //Multiple devices
                contextSet();
            }
            partsNow.checkLine();
            partsNow.moveStart();
            partsNow.current = grid.createData(event);
            grid.now();
            grid.setMoveParts(true);
        }
        //Bind global mobile events
        mainPage.on('mousemove', mousemoveEvent);
    } else if (event.which === 3) {
        const parts = partsNow.filter((n) => n.partType !== 'line');

        if (parts.has(clickpart.id) && (parts.length > 1)) {
            //Right click of multiple devices
            partsNow.checkLine();
            contextSet(event, 'parts');
        } else {
            //Right button of a single device
            clearStatus();
            clickpart.toFocus();
            partsNow.checkLine();
            //When you right click on the reference ground, hide the "Edit parameters" option
            (clickpart.partType === 'reference_ground')
                ? contextSet(event, 'parts')
                : contextSet(event, 'part');
        }
    }
    //Stop event bubbling
    return (false);
});
//Device double-click event
mainPage.on('dblclick', 'g.editor-parts .focus-part, g.editor-parts path, g.editor-parts .features-text', function (event) {
    const clickpart = partsAll.findPart(event.currentTarget.parentNode.id);
    if (event.which === 1 && !grid.totalMarks &&
        clickpart.partType !== 'reference_ground') {
        clickpart.viewParameter(grid.zoom(), grid.SVG());
    }
});
//Mouse over device and wire
mainPage.on({
    mouseenter(event) {
        const tagName = event.currentTarget.tagName.toLowerCase(),
            elem = $(event.currentTarget);

        if (!grid.totalMarks) {
            if (tagName === 'rect' || tagName === 'text') {
                //Through wires and devices
                mainPage.attr('class', 'mouse-movepart');
            } else if (tagName === 'g' && elem.hasClass('point-close')) {
                //pass a closed pin
                mainPage.attr('class', 'mouse-closepoint');
            } else if (tagName === 'g' && elem.hasClass('point-open')) {
                //pass a opened pin
                mainPage.attr('class', 'mouse-line');
            }
        } else if (grid.drawLine) {
            if (tagName !== 'text' && !elem.hasClass('line-rect')) {
                //The mouse passes over the device when drawing wires
                const line = partsNow.get(-1);
                line.current.enforceAlign.extend({
                    flag: true,
                    onPart: true,
                    part: partsAll.findPart(event.currentTarget.parentNode.id)
                });
            }
        }
    },
    mouseleave() {
        if (!grid.totalMarks) {
            //No state, the mouse returns to the default
            mainPage.attr('class', '');
        } else if (grid.drawLine) {
            const line = partsNow.get(-1);
            if (line.current.enforceAlign.label) {
                line.current.enforceAlign.extend({
                    flag: true,
                    part: false,
                    onPart: false
                });
            }
        }
    },
}, 'g.editor-parts rect.focus-part, g.editor-parts g.part-point, g.editor-parts text, g.line rect.line-rect');
//wire mousedown task
mainPage.on('mousedown', 'g.line rect.line-rect', function (event) {
    if (grid.totalMarks) { return false; }

    clearStatus();
    grid.now();
    const line = partsAll.findPart(this.parentNode.id);
    line.toFocus();
    if (event.which === 1) {
        line.current = grid.createData(event);
        line.startPath(event, 'deformation');
        grid.setDeformLine(true);
        mainPage.on('mousemove', mousemoveEvent);
    } else if (event.which === 3) {
        contextSet(event, 'line');
    }

    //Stop event bubbling
    return (false);
});

//Left click the device pin mousedown, start drawing wires
mainPage.on('mousedown', 'g.editor-parts g.part-point', function (event) {
    if (event.which === 1 && !grid.totalMarks) {
        clearStatus();
        grid.now();
        grid.setDrawLine(true);

        const part = partsAll.findPart(event.currentTarget.parentNode.id),
            mark = parseInt(event.currentTarget.id.split('-')[1]),
            point = part.position.add(part.pointRotate()[mark].position),
            connect = part.connect[mark],
            line = connect
                ? partsAll.findPart(connect)
                : new LineClass([point]);

        line.toFocus();
        line.current = grid.createData(event);

        if (!connect) {
            part.toFocus();
            part.setConnect(mark, line.id);
            line.setConnect(0, part.id + '-' + mark);
            line.startPath(event, 'draw', 'new');
        } else {
            line.startPath(event, 'draw');
        }

        mainPage.attr('class', 'mouse-line');
        mainPage.on('mousemove', mousemoveEvent);
    }
    return (false);
});
//Mousedown operation of temporary wire node
mainPage.on('mousedown', 'g.line g.draw-open', function (event) {
    if (event.which === 1 && !grid.totalMarks) {
        const line = partsAll.findPart(event.currentTarget.parentNode.id);

        clearStatus();
        grid.now();
        grid.setDrawLine(true);
        line.toFocus();
        line.current = grid.createData(event);
        line.startPath(event, 'draw', 'new');
        mainPage.attr('class', 'mouse-line');
        mainPage.on('mousemove', mousemoveEvent);
    }
    return (false);
});
//Staggered node event
mainPage.on({
    mousemove(event) {
        if (!grid.totalMarks) {
            const mouse = grid.mouse(event),
                mouseRound = mouse.roundToSmall(),
                bias = mouse.add(-1, mouseRound.mul(20));

            let tempdi = '', tempVector = [];
            if (Math.abs(bias[0]) > Math.abs(bias[1])) {
                if (bias[0] > 0) {
                    tempdi = 'right';
                    tempVector = mouseRound.add([1, 0]);
                } else {
                    tempdi = 'left';
                    tempVector = mouseRound.add([-1, 0]);
                }
            } else {
                if (bias[1] > 0) {
                    tempdi = 'down';
                    tempVector = mouseRound.add([0, 1]);
                } else {
                    tempdi = 'up';
                    tempVector = mouseRound.add([0, -1]);
                }
            }
            const mouseConnect = schMap.getValueBySmalle(mouseRound).connect;
            if (mouseConnect.some((n, i) => (tempVector.isEqual(mouseConnect[i])))) {
                mainPage.attr('class', 'mouse-cross' + tempdi);
            } else {
                mainPage.attr('class', '');
            }
        }
        return (false);
    },
    mouseleave() {
        if (!grid.totalMarks) {
            mainPage.attr('class', '');
        }
        return (false);
    },
    mousedown(event) {
        if (event.which === 1 && !grid.totalMarks) {
            grid.now();
            grid.setDrawLine(true);

            const mouseRound = grid.mouse(event).roundToSmall(),
                style = (mainPage.attr('class') || '').match(/right|left|up|down/),
                dire = {
                    'right': [1, 0],
                    'left': [-1, 0],
                    'up': [0, -1],
                    'down': [0, 1]
                }[style],
                point = mouseRound.add(dire),
                id = schMap.getValueBySmalle(point).id,
                line = partsAll.findPart(id),
                lines = schMap.getValueBySmalle(mouseRound).id.split(' '),
                del = lines.length === 4 ? false : 'new';

            if (!style) { return false; }

            partsNow.deleteAll();

            line.toFocus();
            line.current = grid.createData(event);
            line.startPath(event, 'draw', del);

            mainPage.attr('class', 'mouse-line');
            mainPage.on('mousemove', mousemoveEvent);
        }
    }
}, 'g.line g.cross-point');
//Mousedown operation of drawings
mainPage.on('mousedown', function (event) {
    //There are continuous events, then return directly
    if (grid.totalMarks) { return (false); }

    clearStatus();
    if (event.which === 1) {
        //left click
        $('#area-of-parts').append($('<polygon>', SVG_NS, { id: 'select-box' }));
        grid.current.selectionBoxStart = grid.mouse(event);
        grid.setSelectBox(true);
    } else if (event.which === 3) {
        //right click
        grid.current = grid.createData(event);
        grid.setMoveMap(true);
    }
    mainPage.on('mousemove', mousemoveEvent);
});
//Global mouseup operation of drawings
mainPage.on('mouseup', function (event) {
    //Whether to cancel the mousemove event mark
    let offEvent = true, offMouse = true;
    if (event.which === 1) {
        //left click
        switch (true) {
            //new devide
            case grid.newMark: {
                grid.setNewMark(false);
                partsNow.putDownParts('new');
                offMouse = false;
                break;
            }
            //copy device
            case grid.pasteParts: {
                if (partsNow.putDownParts('paste')) {
                    grid.setPasteParts(false);
                } else {
                    offEvent = false;
                    offMouse = false;
                }
                break;
            }
            //move device
            case grid.moveParts: {
                grid.setMoveParts(false);
                partsNow.putDownParts();
                break;
            }
            //Draw a checkbox
            case grid.selectBox: {
                const node = grid.mouse(event),
                    top = Math.min(grid.current.selectionBoxStart[1], node[1]),
                    bottom = Math.max(grid.current.selectionBoxStart[1], node[1]),
                    left = Math.min(grid.current.selectionBoxStart[0], node[0]),
                    right = Math.max(grid.current.selectionBoxStart[0], node[0]);

                clearStatus();
                for (let i = 0; i < partsAll.length; i++) {
                    const position = partsAll[i].position;
                    if (partsAll[i].partType !== 'line' &&
                        position[0] >= left && position[0] <= right &&
                        position[1] >= top && position[1] <= bottom) {
                        partsAll[i].toFocus();
                    }
                }
                $('#select-box').remove();
                partsNow.checkLine();
                grid.setSelectBox(false);
                break;
            }
            //Wire deformation
            case grid.deformLine: {
                grid.setDeformLine(false);
                partsNow[0].putDown(event, 'deformation');
                break;
            }
            //Mobile device attribute description text
            case grid.moveText: {
                grid.setMoveText(false);
                partsNow[0].textVisition(partsNow[0].current.text.attr(['x', 'y']));
                break;
            }
            //Wire drawing
            case grid.drawLine: {
                grid.setDrawLine(false);
                partsNow.get(-1).putDown(event, 'draw');
                break;
            }
            //other
            default: {
                clearStatus();
            }
        }
    } else if ((event.which === 3) && (grid.moveMap)) {
        //Right-click and release, stop moving the map
        grid.setMoveMap(false);
        grid.current = [];
        //If there is no such label, it means that the mouse has not moved, 
        // then the right-click menu will pop up
        if (!mainPage.hasClass('mouse-movemap')) {
            clearStatus();
            contextSet(event, 'map');
        }
    }
    //Dismiss mobile event globally
    offEvent && mainPage.off('mousemove', mousemoveEvent);
    //The mouse is restored
    offMouse && mainPage.attr('class', '');
});

//Curve panel event
//Cancel zoom
graphPage.on('click', '#waveRecover', function () {
    $('#graph-main .graph-individual').each((n) => {
        const graph = n._data,
            time = [0, graph.time],
            value = [
                Math.minOfArray(graph.output.map((n) => Math.minOfArray(n.data))),
                Math.maxOfArray(graph.output.map((n) => Math.maxOfArray(n.data)))
            ];

        graph.clearActionCanvas();
        graph.drawBackground(time, value, true);
        graph.drawCurve();
    });
});
//Convert to picture
graphPage.on('click', '#waveToImage', function () {
    const graphImg = $(window.open('about:blank').document.body);
    graphImg.css({
        'margin': '0px',
        'padding': '0px'
    });
    graphImg.append($('<img>', {
        'src': Graph.toImage()
    }));
});
//Output Data
graphPage.on('click', '#waveToData', function () {
    const data = [],
        dataPage = window.open('about:blank'),
        graphData = $('#graph-main .graph-individual').map((n) => n._data),
        stepTime = graphData[0].stepTime;

    let ans = '<p>time,';

    for (let i = 0; i < graphData.length; i++) {
        for (let j = 0; j < graphData[i].output.length; j++) {
            data.push(graphData[i].output[j]);
        }
    }
    for (let i = 0; i < data.length; i++) {
        ans += data[i].name + ', ';
    }
    ans += '</p>';
    for (let i = 0; i < data[0].data.length; i++) {
        ans += '<p>' + (i * stepTime).toSFixed() + ', ';
        for (let j = 0; j < data.length; j++) {
            ans += data[j].data[i] + ', ';
        }
        ans += '</p>';
    }
    dataPage.document.body.innerHTML = ans;
});
//Close panel
graphPage.on('click', '#waveClose', function () {
    graphPage.attr('class', 'disappear');
    setTimeout(function () {
        graphPage.attr({
            'class': 'silence',
            'style': 'display:none;'
        });
    }, 500);
});
//Click on the legend of the panel
graphPage.on('click', 'tr.graph-table-row', function (event) {
    const id = event.currentTarget.id.split('-').pop(),
        graph = $('#graph-' + id),
        display = [/display *: *none/, /display *: *block/];

    //Waveform display
    const attribute = graph.attr('style');
    if (attribute.search(display[0]) !== -1) {
        graph.attr('style', attribute.replace(display[0], 'display:block'));
    } else if (attribute.search(display[1]) !== -1) {
        graph.attr('style', attribute.replace(display[1], 'display:none'));
    }
    //Label strikethrough
    const text = event.currentTarget.querySelector('.graph-table-legend-label');
    if (text.innerHTML.search('strike') !== -1) {
        text.innerHTML = text.innerHTML.replace(/<\/?strike>/g, '');
    } else {
        text.innerHTML = text.innerHTML.strike();
    }
    //Waveform display flag
    const data = event.currentTarget.parentNode.parentNode.parentNode._data;
    for (let i = 0; i < data.output.length; i++) {
        if (data.output[i].name === id) {
            data.output[i].status = !data.output[i].status;
        }
    }
});
//Mouse over the panel
graphPage.on('mousemove', '.graph-action', function (event) {
    if (!grid.totalMarks) {
        const graphTarget = event.currentTarget.parentNode._data,
            graphs = $('#graph-main .graph-individual').map((n) => n._data),
            vision = graphTarget.drawMove(event.offsetX, event.offsetY);

        for (let i = 0; i < graphs.length; i++) {
            if (graphs[i] !== graphTarget) {
                graphs[i].drawMove(event.offsetX, vision);
            }
        }
        //No bubbling after running here
        return (false);
    }
});
//Mouse moves out of the panel
graphPage.on('mouseleave', '.graph-action', function () {
    if (!grid.totalMarks) {
        $('#graph-main .graph-individual').each((n) => n._data.clearActionCanvas());
        return (false);
    }
});
//Click the mouse on the waveform interface
graphPage.on('mousedown', '.graph-action', function (event) {
    if (event.which !== 1) { return (false); }

    if (!grid.totalMarks) {
        //Clear all panel canvases
        $('#graph-main .graph-individual').each((n) => n._data.clearActionCanvas());

        grid.current = {
            graph: event.currentTarget.parentNode._data,
            start: [event.offsetX, event.offsetY],
            canvas: event.currentTarget.querySelector('.graph-action-canvas')
        };
        grid.setGraphSelecte(true);
        //Bind mouse movement events
        graphPage.on('mousemove', mousemoveEvent);
        graphPage.addClass('mouse-select');
    }
});
//Mouse movement of the waveform interface
graphPage.on('mouseup', function () {
    if (grid.totalMarks && grid.graphSelecte) {
        //Cancel mobile event binding
        graphPage.off('mousemove', mousemoveEvent);
        graphPage.removeClass('mouse-select');
        //Low sign
        grid.setGraphSelecte(false);

        //Redraw the current panel
        const graph = grid.current.graph,
            [time, value] = graph.pixel2Value(grid.current.select);

        graph.clearActionCanvas();
        graph.drawBackground(time, value);
        graph.drawCurve();

        //The remaining panels need to be scaled according to the timeline
        $('#graph-main .graph-individual').each(function (n) {
            if (n._data !== graph) {
                const range = n._data.backgroundStartToEnd();
                n._data.clearActionCanvas();
                n._data.drawBackground(time,
                    [range[2], range[3]]
                );
                n._data.drawCurve();
            }
        });

        //Temporary variable empty
        grid.current = [];
    }
});

// Helper function to validate if subcircuit is correct 
function validateSubcircuit(partsArray) {

  // if array has only 1 or 2 parts in it, definitely breaking the port rule, otherwise it could be
  // 1 loner port or 2 ports connected to each other which has no meaning
  if(partsArray.length === 1 || partsArray.length === 2) {
    return false;
  }

  for(let i = 0; i < partsArray.length; i++) {

    let isInvalid = partsArray[i].partType === "dc_voltage_source" 
      || partsArray[i].partType === "ac_voltage_source" 
      || partsArray[i].partType === "dc_current_source" 
      || ((partsArray[i].connect[0] === "" || partsArray[i].connect[1] === "") && partsArray[i].partType !== "Port");

    if(isInvalid) {
      return false;
    }
  }

  return true;
};

//Right click menu
//Create subcircuit
context.on('click', "#create-subcircuit", function (event) {
  console.log("It's working");
  console.log("partsNow");
  console.log(partsNow);
  var temp = partsNow.connectGraph();
  temp = temp[0];
  console.log("temp");
  console.log(temp);

  // validation checks to ensure: 
  // 1. no independent power sources
  // 2. no empty connections "" for parts that aren't of type port 
  if(!validateSubcircuit(temp)) {
    alert("Invalid subcircuit! Remove all independent power sources and make sure open nodes are connected to ports");
    return;
  }
  // then extract id (figure out how id is automatically given to current parts when they are chosen and dragged from right side menu), name of subcircuit (asked from user as input), blackbox boolean,
  let subcircuitName = window.prompt("Name of your subcircuit:");

  // and list of ports and use them in 
  // subcircuit frontend constructor 

  // ie: IDEA: send the subcircuit id, name, blackbox attr, and list of parts it is made of (raw data) to backend to store long-term
  // then, in frontend, simplify the representation by picking out only the ports parts, making a list of them, and in frontend 
  // u store subcircuit component as: id, name, list of PORTS only (simplified representation)

  // check comments in filter.js method, because idea outline above might not work for the following reason: when people build and play around with circuits 
  // in the grid, the circuits might not be saved... so if user just wants to simulate an unsaved circuit for now, or if he/she updated the subcircuit in frontend and hasn't saved
  // the changes yet, then we cannot just query the backend for the subcircuit because the db subcircuit is outdated

});
//Edit parameters
context.on('click', '#edit-parameters', function (event) {
    const clickpart = partsNow.get(0);
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        contextSet();
        clickpart.viewParameter(grid.zoom(), grid.SVG());
    }
    return (false);
});
//clockwise rotation
context.on('click', '#clockwise-direction', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        if (partsNow.checkConn()) {
            grid.error('Please disconnect the component before rotate!');
            return (false);
        }
        contextSet();
        if (partsNow.isRotate(0)) {
            partsNow.rotate(0);
        }
    }
    return (false);
});
//Anticlockwise rotation
context.on('click', '#anticlockwise-direction', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        if (partsNow.checkConn()) {
            grid.error('Please disconnect the component before rotate!');
            return (false);
        }
        contextSet();
        if (partsNow.isRotate(1)) {
            partsNow.rotate(1);
        }
    }
    return (false);
});
//Mirror along the X axis
context.on('click', '#X-Mirror', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        if (partsNow.checkConn()) {
            grid.error('Please disconnect the component before rotate!');
            return (false);
        }
        contextSet();
        if (partsNow.isRotate(2)) {
            partsNow.rotate(2);
        }
    }
    return (false);
});
//Mirror along the Y axis
context.on('click', '#Y-Mirror', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        if (partsNow.checkConn()) {
            grid.error('Please disconnect the component before rotate!');
            return (false);
        }
        contextSet();
        if (partsNow.isRotate(3)) {
            partsNow.rotate(3);
        }
    }
    return (false);
});
//copy
context.on('click', '#parts-copy', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        contextSet();
        grid.copy(partsNow);
    }
    return (false);
});
//cut
context.on('click', '#parts-cut', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        contextSet();
        grid.cut();
    }
    return (false);
});
//paste
context.on('click', '#parts-paste', function (event) {
    if (event.which === 1 && !grid.totalMarks && grid.isPaste()) {
        contextSet();
        grid.paste();
        grid.setPasteParts(true);

        partsNow.checkLine();
        partsNow.current = grid.createData(event);
        partsNow.current.pageL = partsNow.center();
        partsNow.moveParts({ pageX: -50000, pageY: -50000 });
        mainPage.on('mousemove', mousemoveEvent);
    }
    return (false);
});
//select all
context.on('click', '#parts-all', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        contextSet();
        partsAll.forEach((n) => n.toFocus());
        partsNow.checkLine();
    }
    return (false);
});
//delete
context.on('click', '#parts-delete', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        contextSet();
        partsNow.forEach((n) => n.deleteSelf());
        partsNow.deleteAll();
    }
    return (false);
});
//revoke
context.on('click', '#right-undo', function (event) {
    if (event.which === 1 && !grid.totalMarks && !$(this).hasClass('disable')) {
        contextSet();
        if (grid.isRevocate()) {
            grid.revocate();
        }
    }
    return (false);
});

//keyboard event
$('body').on('keydown', function (event) {
    if (grid.totalMarks) { return (false); }

    //trigger right click event function
    function trigger(selector) {
        $(selector).trigger({
            type: 'click',
            which: 1,
            currentTarget: $(selector)[0]
        });
    }

    switch (true) {
        //ctrl + D, rotate CW
        case (event.ctrlKey && (event.keyCode === 68)): {
            trigger('#clockwise-direction');
            break;
        }
        //ctrl + alt + D, rotate CCW
        case (event.ctrlKey && event.altKey && (event.keyCode === 68)): {
            trigger('#anticlockwise-direction');
            break;
        }
        //alt + X, Mirror along the X axis
        case (event.altKey && (event.keyCode === 88)): {
            trigger('#X-Mirror');
            break;
        }
        //alt + C, Mirror along the Y axis
        case (event.altKey && (event.keyCode === 67)): {
            trigger('#Y-Mirror');
            break;
        }
        //ctrl + A, SELECT ALL
        case (event.ctrlKey && (event.keyCode === 65)): {
            trigger('#parts-all');
            break;
        }
        //ctrl + V, paste
        case (event.ctrlKey && (event.keyCode === 86)): {
            trigger('#parts-paste');
            break;
        }
        //ctrl + C copy
        case (event.ctrlKey && (event.keyCode === 67)): {
            trigger('#parts-copy');
            break;
        }
        //ctrl + X cut
        case (event.ctrlKey && (event.keyCode === 88)): {
            trigger('#parts-cut');
            break;
        }
        //ctrl + Z revoke
        case (event.ctrlKey && (event.keyCode === 90)): {
            trigger('#right-undo');
            break;
        }
        //Delete delete
        case (event.keyCode === 46): {
            trigger('#parts-delete');
            break;
        }
        //Esc cancel
        case (event.keyCode === 27): {
            if ($('#parameter-menu').hasClass('parameter-open')) {
                trigger('#parameter-bottom-cancel');
            }
            break;
        }
        //Enter 
        case (event.keyCode === 13): {
            if ($('#parameter-menu').hasClass('parameter-open')) {
                trigger('#parameter-bottom-accept');
            } else if ((sidebar.hasClass('open-menu-staticOutput') || sidebar.hasClass('open-menu-config'))) {
                trigger('#shade-gray');
            }
            break;
        }
    }
});

//Run initialization after the page is loaded
doc.body.onload = function () {
    //Read address information
    const cover = $('#load-cover'),
        src = window.location.href.split('?')[1],
        parameters = {};

    //Decompose input parameters
    if (src && src.length) {
        const data = src.split('&');
        for (let i = 0; i < data.length; i++) {
            const obj = data[i].replace(/#/g, '').split('=');
            parameters[obj[0]] = obj[1];
        }
    }

    //load parameter
    if (parameters.init) {
        grid.revocate(iniData[parameters.init]);
    }

    //Remove the gray screen
    cover.css('opacity', 0);
    const timer = setInterval(function () {
        if (cover.css('display') === 'none') {
            clearInterval(timer);
        } else {
            cover.css('display', 'none');
        }
    }, 300);
};
