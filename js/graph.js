import { $ } from './jquery';

const color = ['#50B4C8', '#F0A050', '#50C850'],
    background = '#66CCCC',
    page = $('#graph-page'),
    u = undefined;

//Roughly split according to pixels
function axisSplit(long) {
    return (Math.floor(long / 50));
}
//Extended coordinates
function extendPoint(x) {
    if (!x) { return (1); }

    const sign = x / Math.abs(x),
        rank = x.rank(),
        number = Math.abs(x).toSFixed(2),      //Keep three significant figures
        int = Math.floor(number / rank),            //Integer part
        mod = (x * sign / rank - int).toSFixed();   //decimal part

    let ans = null;
    if (int < 3) {
        if (mod < 0.2) {
            ans = 0.2;
        } else if (mod < 0.5) {
            ans = 0.5;
        } else {
            ans = 1;
        }
    } else if ((int > 2) && (int < 5)) {
        if (mod < 0.5) {
            ans = 0.5;
        } else {
            ans = 1;
        }
    } else {
        ans = 1;
    }
    return ((rank * (int + ans) * sign).toSFixed());
}
// split line
function lineSplit(maxExpand, minExpand, num) {
    const rank = maxExpand.rank(),
        max = (maxExpand / rank).toSFixed(),
        min = (Math.abs(minExpand / rank)).toSFixed(),
        ans = [];

    //Strictly segmented
    for (let i = 1; i < 2 * num; i++) {
        const maxNum = (max / i).toSFixed(8),
            minNum = (min / maxNum).toSFixed(8);

        //Less than five decimal places are considered as divisible
        if ((maxNum === parseFloat(maxNum.toFixed(5))) &&
            (minNum === Math.floor(minNum))) {
            ans.push(i + minNum);
        }
    }

    //Normal segmentation
    if (!ans.length) {
        const tol = (max + min).toSFixed();
        for (let i = 1; i < 2 * num; i++) {
            const tolNum = (tol / i).toSFixed(8);
            if (tolNum === parseFloat(tolNum.toFixed(5))) {
                ans.push(i);
            }
        }
    }

    return ans.length
        ? ans.reduce((pre, next) => ((Math.abs(pre - num) < Math.abs(next - num))
            ? pre : next))
        : num;
}
//Extension line
function extendLine(line, long) {
    //The minimum and maximum axis, length, and number of segments
    let axisMin = null,
        axisMax = null;
    //Initial segmentation of line segments
    const num = axisSplit(long);

    if (line[0] === line[1]) {
        //Start and end are equal
        const number = Math.abs(line[0]),
            rank = number.rank(),
            numberFloor = Math.floor(number / rank),
            minExpand = (numberFloor === (number / rank).toSFixed()) ?
                numberFloor - 1 : numberFloor,
            maxExpand = minExpand + 2;

        if (line[0] > 0) {
            axisMin = (minExpand * rank).toSFixed();
            axisMax = (maxExpand * rank).toSFixed();
        } else {
            axisMin = -(maxExpand * rank).toSFixed();
            axisMax = -(minExpand * rank).toSFixed();
        }
        return ([axisMin, axisMax, lineSplit((axisMax - axisMin), 0, num)]);
    } else if (line[0] * line[1] <= 0) {
        //Two different signs, 0 is included
        const max = Math.max(Math.abs(line[0]), Math.abs(line[1])),
            min = Math.min(Math.abs(line[0]), Math.abs(line[1])),
            //The maximum value is fixed first
            maxExpand = extendPoint(max),
            minExpand = (extendPoint((maxExpand + min) / 2) * 2 - maxExpand).toSFixed();

        if (Math.abs(line[0]) < Math.abs(line[1])) {
            axisMin = -minExpand;
            axisMax = maxExpand;
        } else {
            axisMin = -maxExpand;
            axisMax = minExpand;
        }
        return ([axisMin, axisMax, lineSplit(axisMax, axisMin, num)]);
    } else {
        //Two points have the same sign, 0 points are not included, and both ends are floating
        const min = Math.min(Math.abs(line[0]), Math.abs(line[1])),
            maxExpand = extendPoint(Math.abs(line[0] - line[1]) / 2) * 2,
            count = lineSplit(maxExpand, 0, num),
            minFloor = Math.floor(min / (maxExpand / count)) * (maxExpand / count);

        if (line[0] < 0) {
            axisMin = -(maxExpand + minFloor);
            axisMax = -minFloor;
        } else {
            axisMin = minFloor;
            axisMax = maxExpand + minFloor;
        }
        return ([axisMin, axisMax, count]);
    }
}
//Shrink coordinates
function reduceList(list, line) {
    const max = Math.maxOfArray(line),
        min = Math.minOfArray(line);

    while (list[1] < min) {
        list.splice(0, 1);
    }
    list[0] = min;

    while (list[list.length - 2] > max) {
        list.pop();
    }
    list[list.length - 1] = max;
}

//Canvas drawing class
function Graphics(canvas) {
    if (!(canvas && canvas.attributes && canvas.nodeName)) {
        throw ('The input must be a canvas element');
    }
    this.elementDOM = canvas;
    this.ctx = canvas.getContext('2d');
    this.length = {
        'width': parseInt(canvas.getAttribute('width')),
        'height': parseInt(canvas.getAttribute('Height'))
    };
    this.clear();       //Clean up the canvas when creating
}
Graphics.prototype = {
    // Back up the current input attribute in the original attribute value
    attributesBackUp(attributes) {
        const temp = {};
        for (const i in attributes) if (attributes.hasOwnProperty(i)) {
            temp[i] = this.ctx[i];
            this.ctx[i] = attributes[i];
        }
        return (temp);
    },
    //Assign all input attributes to this.
    attributesAssignment(attributes) {
        for (const i in attributes) if (attributes.hasOwnProperty(i)) {
            this.ctx[i] = attributes[i];
        }
    },
    //Restore default properties
    attributesDefault() {
        //Default attributes
        const Default = {
            'fillStyle': '#000000',
            'font': '10px sans-serif',
            'globalAlpha': 1,
            'globalCompositeOperation': 'source-over',
            'imageSmoothingEnabled': true,
            'lineCap': 'butt',
            'lineDashOffset': 0,
            'lineJoin': 'miter',
            'lineWidth': 1,
            'miterLimit': 10,
            'shadowBlur': 0,
            'shadowColor': 'rgba(0, 0, 0, 0)',
            'shadowOffsetX': 0,
            'shadowOffsetY': 0,
            'strokeStyle': '#000000',
            'textAlign': 'start',
            'textBaseline': 'alphabetic'
        };
        //Default attribute assignment
        for (const i in Default) if (Default.hasOwnProperty(i)) {
            this.ctx[i] = Default[i];
        }
    },
    //Draw a straight line
    line(way, attributes, save = true) {
        let temp = null;
        if (save) {
            temp = this.attributesBackUp(attributes);
        }
        this.ctx.beginPath();
        this.ctx.moveTo(way[0][0], way[0][1]);
        for (let i = 1; i < way.length; i++) {
            this.ctx.lineTo(way[i][0], way[i][1]);
        }
        this.ctx.stroke();
        if (save) {
            this.attributesAssignment(temp);
        }
    },
    //Solid square
    fillRect(start, long, attributes) {
        //When only attributes are entered, all areas are covered by default
        if (typeof start === 'object' && long === u && attributes === u) {
            attributes = start;
            start = [0, 0];
            long = [this.length.width, this.length.height];
        }
        const temp = this.attributesBackUp(attributes);
        this.ctx.fillRect(start[0], start[1], long[0], long[1]);
        this.attributesAssignment(temp);
    },
    //Hollow box
    strokeRect(start, long, attributes) {
        const temp = this.attributesBackUp(attributes);
        this.ctx.strokeRect(start[0], start[1], long[0], long[1]);
        this.attributesAssignment(temp);
    },
    //Draw a circle
    circle(x, y, r, attributes, save = true) {
        let temp = null;
        if (save) {
            temp = this.attributesBackUp(attributes);
        }
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2, true);
        this.ctx.fill();
        if (save) {
            this.attributesAssignment(temp);
        }
    },
    //Clean up the canvas
    clear(a, b) {
        //a is the coordinates of the upper left corner, b is the length of the x and y axes
        if (a === u || b === u) {
            this.ctx.clearRect(0, 0, this.length.width, this.length.height);
        } else {
            this.ctx.clearRect(a[0], a[1], b[0], b[1]);
        }
    },
    //toDataURL
    toDataURL(...args) {
        return (this.elementDOM.toDataURL(...args));
    },
    //Draw text
    toText(text, position, attributes, save = true) {
        let temp = null;
        if (save) temp = this.attributesBackUp(attributes);
        this.ctx.fillText(text, position[0], position[1]);
        if (save) this.attributesAssignment(temp);
    },
    //The other canvas graphics will draw itself
    drawImage(...args) {
        this.ctx.drawImage(...args);
    }
};
//Waveform drawing window class
function Graph(Data, DOM, type) {
    //Instance initialization
    this.elementDOM = $(DOM);
    this.type = type;
    this.output = Data;
    this.long = {};
    this.time = $('#endtime').prop('value').toVal(),
        this.stepTime = $('#stepsize').prop('value').toVal();

    //Calculate various coordinates
    const left = 80,            //Left sidebar width
        top = 10,             //Top layer interval width
        bottomHeight = 70,    //Bottom bar height
        //The width and height of the entire background canvas
        Width = this.elementDOM.width(),
        Height = this.elementDOM.height();

    this.long.waveWidth = Width - left - 10;
    this.long.waveHeight = Height - bottomHeight - top;
    this.long.waveRound = [
        [left, top],
        [left, top + this.long.waveHeight],
        [left + this.long.waveWidth, top + this.long.waveHeight],
        [left + this.long.waveWidth, top]
    ];
    //The maximum and minimum values ​​of the entire output sequence (the maximum and minimum values ​​of the Y axis)
    const valueStart = [
        Math.minOfArray(Data.map((n) => Math.minOfArray(n.data))),
        Math.maxOfArray(Data.map((n) => Math.maxOfArray(n.data)))
    ];
    //Draw background
    this.drawBackground([0, this.time], valueStart, true);
    //Create a curved canvas
    for (let i = 0; i < Data.length; i++) {
        this.elementDOM.append($('<canvas>', {
            'class': 'graph-canvas',
            'width': this.long.waveWidth - 2,
            'Height': this.long.waveHeight - 2,
            'id': 'graph-' + this.output[i].name,
            'style': 'position: absolute; left: 81px; top: 11px; display: block'
        }));
    }
    //Draw a curve
    this.drawCurve();
    //The current curve status is all displayed
    for (let i = 0; i < this.output.length; i++) {
        this.output[i].status = true;
    }
    //Add dynamic operation collection DIV
    const actionDiv = this.elementDOM.append($('<div>', {
        'class': 'graph-action',
        'style': 'position: absolute; left: 80px; top: 10px;' +
            'width: ' + this.long.waveWidth + 'px; Height: ' + this.long.waveHeight + 'px;'
    }));
    //Create grid canvas
    actionDiv.append($('<canvas>', {
        'class': 'graph-action-canvas',
        'width': this.long.waveWidth,
        'Height': this.long.waveHeight,
        'style': 'position: absolute; left: 0px; top: 0px;'
    }));
    //Create curve description DIV
    for (let i = 0; i < this.output.length + 1; i++) {
        actionDiv.append($('<div>', {
            'class': 'graph-action-tip',
            'style': 'position: absolute; display: none;'
        }));
    }
    //The last layer of div covers the entire curve window to prevent misoperation
    actionDiv.append($('<div>', {
        'class': 'graph-action-cover',
        'style': 'position: absolute; left: 0px; top: 0px;' +
            'width: ' + this.long.waveWidth + 'px; Height: ' + this.long.waveHeight + 'px;'
    }));
    //Add a legend in the upper right corner
    this.createTable();
}
Graph.prototype = {
    //Draw background
    drawBackground(time, value, expend = false) {
        //Fetch data
        const waveWidth = this.long.waveWidth,
            waveHeight = this.long.waveHeight,
            waveRound = this.long.waveRound,
            //Find or create a background canvas
            background = this.elementDOM.childSelect('canvas.graph-background', 1, {
                'width': this.elementDOM.width() + 'px',
                'height': this.elementDOM.height() + 'px',
                'style': 'position: absolute; left: 0px; top: 0px;'
            });

        //Current axis sequence
        this.axisList = [];

        //Create a brush
        const drawer = new Graphics(background[0]);
        //Panel background
        drawer.fillRect(waveRound[0], [waveWidth, waveHeight], {
            'fillStyle': '#fffdf6'
        });
        //Edge shadow
        drawer.line(waveRound.slice(1, 4), {
            'shadowOffsetX': 2,
            'shadowOffsetY': 2,
            'shadowBlur': 3,
            'shadowColor': 'rgba(0, 0, 0, 0.7)',
            'strokeStyle': '#999999'
        });
        drawer.line(waveRound.slice(0, 2), {
            'shadowOffsetX': -2,
            'shadowOffsetY': 2,
            'shadowBlur': 3,
            'shadowColor': 'rgba(0, 0, 0, 0.7)',
            'strokeStyle': '#999999'
        });
        //Set brush properties
        drawer.attributesAssignment({
            'strokeStyle': '#cccccc',
            'lineWidth': 1
        });
        //Draw axis
        for (let i = 0; i < 2; i++) {
            const item = [time, value][i],
                pixel = [this.long.waveWidth, this.long.waveHeight][i],
                [axisMin, axisMax, count] = extendLine(item, pixel),
                axisLong = (axisMax - axisMin).toSFixed(),
                splitLong = (axisLong / count).toSFixed(),
                axisList = [axisMin];
            //Axis division value
            while (axisList[axisList.length - 1] < axisMax) {
                axisList.push((axisList[axisList.length - 1] + splitLong).toSFixed());
            }
            //Shrink the current list when not expanding coordinates
            if (!expend) { reduceList(axisList, item); }
            //Draw coordinate grid in sequence
            this.drawGrid(i, axisList, drawer);
            //Save the current axis sequence
            this.axisList[i] = axisList;
        }
        //Restore the default brush attributes
        drawer.attributesDefault();
        //Draw border
        drawer.strokeRect(waveRound[0], [waveWidth, waveHeight], {
            'strokeStyle': '#999999',
            'lineWidth': 2
        });
    },
    //Coordinate grid
    drawGrid(label, axis, drawer) {
        const waveRound = this.long.waveRound,
            attr = [{
                //x-axis
                name: 'graph-bottomList',
                way(x) {
                    return ([
                        [waveRound[0][0] + Math.round(x) + 0.5, waveRound[0][1]],
                        [waveRound[0][0] + Math.round(x) + 0.5, waveRound[1][1] + 5]
                    ]);
                },
                tagStyle(x) {
                    return ('top: 8px; transform: rotate(35deg); left: ' + (waveRound[0][0] + x - 10) + 'px');
                },
                signStyle: (waveRound[2][0] + 10) + 'px'
            }, {
                //y-axis
                name: 'graph-leftList',
                way(x) {
                    return ([
                        [waveRound[2][0], waveRound[1][1] - Math.round(x) - 0.5],
                        [waveRound[1][0] - 4, waveRound[1][1] - Math.round(x) - 0.5]
                    ]);
                },
                tagStyle(x) {
                    return ('right: 0px; top: ' + (waveRound[1][1] - x - 9) + 'px');
                },
                signStyle: '75px'
            }],
            sidebar = this.elementDOM.childSelect('div.' + attr[label].name, 1),
            lists = sidebar.childSelect('div.axis-number', axis.length),
            unit = sidebar.childSelect('div.axis-unit', 1),
            eachPixel = [this.long.waveWidth, this.long.waveHeight][label] / (axis[axis.length - 1] - axis[0]),

            maxSxis = Math.maxOfArray(axis).toShort(),
            rank = maxSxis.rank,
            power = maxSxis.number.powRank(),

            type = label
                ? ((this.type === 'voltage') ? 'V' : 'A')
                : 's';

        //Add unit
        unit.text(maxSxis.unit + type);
        unit.attr('style', 'left:' + attr[label].signStyle);

        //Draw axis
        for (let i = 0; i < axis.length; i++) {
            const axisLast = (axis[i - 1])
                ? (Math.round((axis[i - 1] - axis[0]) * eachPixel) - 0.5)
                : (-30),
                axisNow = Math.round((axis[i] - axis[0]) * eachPixel) - 0.5;

            drawer.line(attr[label].way(axisNow));

            if (axisNow - axisLast > 20) {
                lists.get(i).attr('style', attr[label].tagStyle(axisNow))
                    .text((axis[i] * rank).toSFixed().toFixed(4 - power));
            } else {
                lists.get(i).remove();
            }
        }
    },
    //Draw a curve
    drawCurve() {
        const [timeStart, timeEnd, valueMin, valueMax] = this.backgroundStartToEnd(),
            pixelSplitX = this.long.waveWidth / (timeEnd - timeStart).toSFixed(),
            pixelSplitY = this.long.waveHeight / (valueMax - valueMin).toSFixed(),
            //Accurately solve the length of the output time interval
            outputTimeSplit = this.time / (this.output[0].data.length - 1);

        for (let i = 0; i < this.output.length; i++) {
            const name = this.output[i].name,
                data = this.output[i].data,
                darwLine = [];

            for (let j = 0; j < data.length; j++) {
                darwLine.push([
                    pixelSplitX * (j * outputTimeSplit - timeStart),
                    //The origin of each point is the upper left corner, now we need to put the point to the midpoint
                    this.long.waveHeight - pixelSplitY * (data[j] - valueMin) - 1.25
                ]);
            }
            const drawer = new Graphics(document.getElementById('graph-' + name));
            drawer.clear();
            drawer.line(darwLine, {
                'strokeStyle': color[i],
                'lineWidth': 2.5
            });
        }
    },
    //Create a legend
    createTable() {
        //Add table body
        const table = this.elementDOM.append($('<table>', {
            'class': 'graph-table-legend'
        })).append($('<tbody>'));

        //Add as many lines as there are waveforms
        for (let i = 0; i < this.output.length; i++) {
            //Row element
            const row = table.append($('<tr>', {
                'class': 'graph-table-row',
                'id': 'table-legend-' + this.output[i].name
            }));
            //Legend color box
            row.append($('<td>', {
                'class': 'graph-table-swatch-column'
            })).append($('<div>', {
                'class': 'table-legend-swatch-outline'
            })).append($('<div>', {
                'class': 'table-legend-swatch',
                'style': 'border-color:' + color[i] + ';background-color: ' + color[i] + ';'
            }));
            //Text description
            const textTd = row.append($('<td>', {
                'class': 'graph-table-legend graph-table-legend-label'
            }));
            const text = this.output[i].name.split('_');
            if (text[1]) {
                textTd.text(text[0] + '(' + text[1] + ')');
            } else {
                textTd.inner(text[0]);
            }
        }
    },
    //Draw x axis
    drawMove(x, y) {
        //Draw a line
        const drawer = new Graphics(this.elementDOM[0].querySelector('.graph-action-canvas'));
        drawer.clear();
        drawer.line([[x, 0], [x, this.long.waveHeight]], {
            strokeStyle: '#bbbbbb',
            lineWidth: 1
        });

        const [backTimeStart, backTimeEnd, backValueMin, backValueMax] = this.backgroundStartToEnd(),
            stepTime = this.stepTime,
            width = this.long.waveWidth,
            height = this.long.waveHeight,
            error = 5,
            time2Pixel = (backTimeEnd - backTimeStart) / width,
            timeMinSub = Math.round((((x - error < 2) ? 2 : x - error) * time2Pixel + backTimeStart) / stepTime),
            timeMaxSub = Math.round((((x + error > width - 2) ? width - 2 : x + error) * time2Pixel + backTimeStart) / stepTime),

            value2Pixel = (backValueMax - backValueMin) / height,
            valueMax = backValueMax - ((y - error < 2) ? 2 : y - error) * value2Pixel,
            valueMin = backValueMax - ((y + error > height - 2) ? height - 2 : y + error) * value2Pixel;

        let min = Infinity, sub = -1;
        if (typeof y === 'number') {
            //Mouse over the current panel, search for a suitable index
            for (let i = 0; i < this.output.length; i++) {
                if (!this.output[i].status) {
                    continue;
                }
                const data = this.output[i].data;
                for (let j = timeMinSub; j <= timeMaxSub; j++) {
                    if (data[j] > valueMin && data[j] < valueMax) {
                        const positionX = (j * stepTime - backTimeStart) / time2Pixel,
                            positionY = (backValueMax - data[j]) / value2Pixel,
                            distance = Math.abs(positionX - x) + Math.abs(positionY - y);

                        if (distance < min) {
                            min = distance;
                            sub = j;
                        }
                    }
                }
            }
        } else if (typeof y === 'string' && y.search('index:') !== -1) {
            //The mouse is not in the current panel and directly displays the value of index
            sub = Number(y.split(':')[1]);
        }


        const tips = $('.graph-action-tip', this.elementDOM),
            unit = (this.type === 'voltage') ? 'V' : 'A';
        if (sub !== -1) {
            tips.attr('style', 'position:absolute; display: block');
            const circleX = (sub * stepTime - backTimeStart) / time2Pixel;

            for (let i = 0; i < this.output.length; i++) {
                const valueNow = this.output[i].data[sub];
                if (this.output[i].status && valueNow < backValueMax && valueNow > backValueMin) {
                    //Curve display
                    const circleY = (backValueMax - valueNow) / value2Pixel;
                    drawer.circle(circleX, circleY, 5, {
                        'fillStyle': color[i]
                    });
                    tips.get(i).text(valueNow.toShort(5).txt + unit)
                        .css({ right: (width - circleX) + 'px', bottom: (height - circleY) + 'px' });
                } else {
                    //Curve hiding
                    tips.get(i).attr('style', 'display: none');
                }
            }
            tips.get(-1).text((sub * stepTime).toShort(5).txt + 's')
                .css({ right: (width - circleX) + 'px', bottom: '0px' });

            return ('index:' + sub);
        } else {
            tips.attr('style', 'display: none');
            return (false);
        }
    },
    //Clear the action canvas
    clearActionCanvas() {
        const canvas = $('.graph-action-canvas', this.elementDOM)[0],
            drawer = canvas.getContext('2d');
        drawer.clearRect(0, 0, this.long.waveWidth, this.long.waveHeight);

        $('.graph-action-tip', this.elementDOM)
            .attr('style', 'display: none');
    },
    //Draw select box
    drawSelect(event, current) {
        //First run, calculate temporary variables
        if (!current.drawer) {
            current.drawer = new Graphics(current.canvas);
            current.offset = $(current.canvas).offset($('div#graph-page'));
        }

        //Width of panel frame
        const border = 2,
            drawer = current.drawer,
            size = current.drawer.length,
            offset = [
                event.offsetX - current.offset[0],
                event.offsetY - current.offset[1]
            ];

        //The source element and the trigger element are different, and the positioning offset needs to be recalculated
        if (event.target !== event.currentTarget) {
            let node = event.target;
            //offset is the offset from the source element where the mouse is located to the block-level element
            while (node.tagName.toLowerCase() !== 'div') {
                node = node.parentNode;
            }
            //Find the offset value of the current block-level element to the page
            while (node !== event.currentTarget) {
                offset[0] += node.offsetLeft;
                offset[1] += node.offsetTop;
                node = node.parentNode;
            }
        }

        //Selected range
        let left = Math.min(current.start[0], offset[0]),
            right = Math.max(current.start[0], offset[0]),
            top = Math.min(current.start[1], offset[1]),
            bottom = Math.max(current.start[1], offset[1]);

        //Scope limit
        if (left < border) { left = border; }
        if (top < border) { top = border; }
        if (right > size.width - border) { right = size.width - border; }
        if (bottom > size.height - border) { bottom = size.height - border; }

        const start = [left, top],                  //Coordinates of the upper left corner
            long = [right - left, bottom - top];    //x, y axis length

        //Draw a box
        drawer.clear();
        drawer.fillRect({ 'fillStyle': 'rgba(187,187,187,0.5)' });
        drawer.clear(start, long);
        drawer.strokeRect(start, long, { 'strokeStyle': '#aaaaaa' });

        //Save current range
        current.select = [left, top, right, bottom];
    },
    //Returns the start and end coordinates of the XY axis of the current background
    backgroundStartToEnd() {
        return ([
            this.axisList[0][0],                            //Start of current time
            this.axisList[0][this.axisList[0].length - 1],  //End of current time
            this.axisList[1][0],                            //Current value starting point
            this.axisList[1][this.axisList[1].length - 1]   //Current value end
        ]);
    },
    //From pixel to actual value
    pixel2Value(range) {
        const [timeStart, timeEnd, valueMin, valueMax] = this.backgroundStartToEnd(),
            time2pixel = (timeEnd - timeStart).toSFixed() / this.long.waveWidth,
            value2pixel = (valueMax - valueMin).toSFixed() / this.long.waveHeight,
            time = [range[0], range[2]].map((n) => (n * time2pixel + timeStart).toSFixed(4)),
            value = [range[3], range[1]].map((n) => (valueMax - n * value2pixel).toSFixed(4));

        return ([time, value]);
    }
};
//Convert the entire waveform page into an image
Graph.toImage = function () {
    if (page.attr('class').search('visionAll') === -1) {
        throw ('The waveform interface has not been opened and cannot be converted');
    }

    //Create a temporary canvas, which is not displayed in the web data stream
    const tempCanvas = new Graphics($('<canvas>', {
        'style': 'display: none',
        'height': page.height() + 'px',
        'width': page.width() + 'px'
    })[0]);
    //Draw background
    tempCanvas.fillRect([0, 0], [tempCanvas.length.width, tempCanvas.length.height], {
        'fillStyle': background
    });
    //Draw title
    $('div#graph-title span').each((n) => {
        const elem = $(n),
            offset = elem.offset(page),
            position = [offset[0], offset[1] + 15.5];

        /*
        For text, offset is the distance from the upper left corner of the element
        to the upper left corner of the page element
        However, for canvas, when writing text, the lower left corner of the text 
        is used as the starting point coordinates, so the coordinates of the text
        written here need to add the height of the text itself, the text itself is 16px
         */

        tempCanvas.toText(elem.text(), position, {
            'font': '16px Microsoft YaHei'
        });
    });
    //Caption attribute
    tempCanvas.attributesAssignment({
        'font': '10px Arial'
    });
    //Horizontal text
    $('div.graph-individual div.graph-leftList div.axis-number, ' +
        'div.graph-individual div.axis-unit').each((n) => {
            const elem = $(n),
                offset = elem.offset(page),
                position = [offset[0], offset[1] + 10.5];

            tempCanvas.toText(elem.text(), position, {}, false);
        });
    //Draw waveform
    $('div.graph-individual canvas.graph-background, ' +
        'div.graph-individual canvas.graph-individual, ' +
        'div.graph-individual canvas.graph-canvas').each((n) => {
            const position = $(n).offset(page);
            tempCanvas.drawImage(n, position[0], position[1]);
        });
    //Restore the default brush attributes
    tempCanvas.attributesDefault();
    //Draw a legend
    $('div.graph-individual tbody').each((table) => {
        const elem = $(table),
            position = elem.offset(page).map((n) => n + 0.5),
            size = [elem.innerWidth(), elem.innerHeight()];

        tempCanvas.fillRect(position, size, {
            'fillStyle': 'rgba(255, 255, 255, 0.6)'
        });
        tempCanvas.strokeRect(position, size, {
            'strokeStyle': '#cccccc',
            'lineWidth': 1
        });

        //Inner box for each row
        $('div.table-legend-swatch-outline', table).each((n, i) => {
            const elem = $(n),
                position = elem.offset(page).map((n) => n + 1.5),
                size = [elem.innerWidth() + 1, elem.innerHeight() + 1];

            if (i) {
                position[1] -= 1;
            }

            tempCanvas.strokeRect(position, size, {
                'strokeStyle': '#cccccc',
                'lineWidth': 1
            });
        });
        //Color block per row
        $('div.table-legend-swatch', table).each((n, i) => {
            const elem = $(n),
                position = elem.offset(page).map((n) => n + 1),
                //Here is the width of the border
                size = [n.clientLeft * 2, n.clientTop * 2];

            if (i) {
                position[1] -= 1;
            }

            tempCanvas.fillRect(position, size, {
                'fillStyle': elem.attr('style').split(';')[0].split(':')[1]
            });
        });
        //Description of each line
        $('td.graph-table-legend.graph-table-legend-label', table).each((n, i) => {
            const elem = $(n),
                position = elem.offset(page);

            position[0] += 1;
            if (i) {
                position[1] += 12;
            } else {
                position[1] += 13;
            }

            tempCanvas.toText(elem.text(), position, {
                'font': '10px Arial',
                'fillStyle': '#696969'
            });
        });
    });
    //The x-axis coordinate is oblique text
    tempCanvas.attributesAssignment({
        'font': '10px Arial'
    });
    const deg = 35 / 180 * Math.PI;     //slope
    tempCanvas.ctx.rotate(deg);
    $('.graph-bottomList .axis-number').each((n) => {
        const elem = $(n),
            position = elem.offset(page),
            x1 = position[0] / Math.cos(deg),
            y1 = position[0] * Math.tan(deg),
            y2 = position[1] - y1,
            x2 = y2 * Math.sin(deg);
        tempCanvas.toText(elem.text(), [x1 + x2, y2 * Math.cos(deg)], {}, false);
    });
    return (tempCanvas.toDataURL());
};

export { Graph };
