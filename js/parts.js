'use strict'
// Import external packages
import { $ } from './jquery'
import { Point } from './point'
import { Matrix } from './matrix'
import { SVG_NS } from './init'
import { schMap } from './maphash'
import { styleRule } from './styleRule'
import { partsAll, partsNow } from './collection'

// Define Constants
const u = undefined,
  actionArea = $('#area-of-parts'),
  rotateMatrix = [
    new Matrix([
      [0, 1],
      [-1, 0],
    ]), //CW
    new Matrix([
      [0, -1],
      [1, 0],
    ]), //CCW
    new Matrix([
      [1, 0],
      [0, -1],
    ]), //X-Mirror
    new Matrix([
      [-1, 0],
      [0, 1],
    ]), //Y-Mirror
  ]

// Device Description
const originalElectronic = {
  /**
   * This part is to describe the basic parameters and shape of a component
   *   id             The component name
   *   partType       The component type
   *   input          The component parameters
   *   inputTxt       The description of the component parameters
   *   visionNum      Number of parameters displayed on the parameter panel
   *   pointInfor     Node position and orientation
   *   padding        The component padding
   *   margin         The component margin
   *   txtLocate      The distance between the text and the center of the component
   *   criteriaTrend  Direction of the current with respect to the connection nodes
   *
   */

  // Resistance
  resistance: {
    readWrite: {
      // Editable Data
      id: 'R_',
      input: ['10k'],
    },
    readOnly: {
      // Readonly Data
      partType: 'resistance',
      inputTxt: ['Resistance：'],
      parameterUnit: ['Ω'],
      visionNum: 2,
      txtLocate: 14,
      // Default Orientation is horizontal
      padding: [0, 1],
      margin: 1,
      pointInfor: [
        {
          position: [-40, 0],
          direction: [-1, 0],
        },
        {
          position: [40, 0],
          direction: [1, 0],
        },
      ],
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d: 'M-40,0H-24L-20,-9L-12,9L-4,-9L4,9L12,-9L20,9L24,0H40',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-30',
            y: '-13',
            width: '60',
            height: '26',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Resistance',
    },
  },
  // Capacitor
  capacitor: {
    readWrite: {
      id: 'C_',
      input: ['100u'],
    },
    readOnly: {
      partType: 'capacitor',
      inputTxt: ['Capacitance：'],
      parameterUnit: ['F'],
      visionNum: 2,
      pointInfor: [
        {
          position: [-40, 0],
          direction: [-1, 0],
        },
        {
          position: [40, 0],
          direction: [1, 0],
        },
      ],
      // Default Orientation is horizontal
      padding: [0, 1],
      margin: 1,
      txtLocate: 22,
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d: 'M5,0H40M-40,0H-5M-5,-16V16M5,-16V16',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-30',
            y: '-15',
            width: '60',
            height: '30',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Capacitor',
    },
  },
  // Inductor
  inductance: {
    readWrite: {
      id: 'L_',
      input: ['10u'],
    },
    readOnly: {
      partType: 'inductance',
      inputTxt: ['Inductance：'],
      parameterUnit: ['H'],
      visionNum: 2,
      pointInfor: [
        {
          position: [-40, 0],
          direction: [-1, 0],
        },
        {
          position: [40, 0],
          direction: [1, 0],
        },
      ],
      padding: [0, 1],
      margin: 1,
      txtLocate: 13,
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d:
              'M-40,0H-24M24,0H40M-24,0Q-18,-12,-12,0M-12,0Q-6,-12,0,0M0,0Q6,-12,12,0M12,0Q18,-12,24,0',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-30',
            y: '-10',
            width: '60',
            height: '15',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Inductor',
    },
  },
  // DC Voltage Source
  dc_voltage_source: {
    readWrite: {
      id: 'V_',
      input: ['12'],
    },
    readOnly: {
      partType: 'dc_voltage_source',
      inputTxt: ['Voltage：'],
      parameterUnit: ['V'],
      visionNum: 2,
      pointInfor: [
        {
          position: [0, -40],
          direction: [0, -1],
        },
        {
          position: [0, 40],
          direction: [0, 1],
        },
      ],
      // Default Orientation is horizontal
      padding: 1,
      margin: [1, 0],
      txtLocate: 20,
      aspectInfor: [
        {
          name: 'circle',
          attribute: {
            cx: '0',
            cy: '0',
            r: '19',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M0,-40V-19M0,19V40M0,-15V-9M-3,-12H3M-3,11H3',
            fill: 'none',
            stroke: 'black',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-16',
            y: '-30',
            width: '32',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'DC Voltage Source',
    },
  },
  // AC Voltage Source
  ac_voltage_source: {
    readWrite: {
      id: 'V_',
      input: ['220', '50', '0', '0'],
    },
    readOnly: {
      partType: 'ac_voltage_source',
      inputTxt: ['Vp：', 'Freq：', 'Bias：', 'Phase：'],
      parameterUnit: ['V', 'Hz', 'V', '°'],
      visionNum: 3,
      pointInfor: [
        {
          position: [0, -40],
          direction: [0, -1],
        },
        {
          position: [0, 40],
          direction: [0, 1],
        },
      ],
      // Default Orientation is horizontal
      padding: 1,
      margin: [1, 0],
      txtLocate: 24,
      aspectInfor: [
        {
          name: 'circle',
          attribute: {
            cx: '0',
            cy: '0',
            r: '19',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M-0,-40V-19M0,19V40M-12,0Q-6,-12 0,0M0,0Q6,12 12,0',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-20',
            y: '-30',
            width: '40',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'AC Voltage Source',
    },
  },
  // DC Current Source
  dc_current_source: {
    readWrite: {
      id: 'I_',
      input: ['10'],
    },
    readOnly: {
      partType: 'dc_current_source',
      inputTxt: ['电流值：'],
      parameterUnit: ['A'],
      visionNum: 2,
      pointInfor: [
        {
          position: [0, 40],
          direction: [0, 1],
        },
        {
          position: [0, -40],
          direction: [0, -1],
        },
      ],
      // Default Orientation is horizontal
      padding: [1, 0],
      margin: 1,
      txtLocate: 20,
      aspectInfor: [
        {
          name: 'circle',
          attribute: {
            cx: '0',
            cy: '0',
            r: '19',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M0,-40V-20M0,20V40M0,-12V12',
          },
        },
        {
          name: 'polygon',
          attribute: {
            points: '0,-14 -5,-4 0,-8 5,-4',
            class: 'fill-whole', //'fill' : '#3B4449', 'stroke-width' : '0.5', 'stroke-linecap' : 'square'
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-20',
            y: '-30',
            width: '40',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'DC Current Source',
    },
  },
  // Reference Point
  reference_ground: {
    readWrite: {
      id: 'GND_',
    },
    readOnly: {
      partType: 'reference_ground',
      inputTxt: [],
      visionNum: 0,
      pointInfor: [
        {
          position: [0, -20],
          direction: [0, -1],
        },
      ],
      padding: 0,
      margin: 1,
      txtLocate: 12,
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d: 'M0,-20V0M-12,0H12M-7,5H7M-2,10H2',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-15',
            y: '-10',
            width: '30',
            height: '26',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Reference Point',
    },
  },
  // Voltmeter
  voltage_meter: {
    readWrite: {
      id: 'VM_',
    },
    readOnly: {
      partType: 'voltage_meter',
      inputTxt: [],
      visionNum: 1,
      pointInfor: [
        {
          position: [0, -40],
          direction: [0, -1],
        },
        {
          position: [0, 40],
          direction: [0, 1],
        },
      ],
      // Default Orientation is vertical
      padding: 1,
      margin: [1, 0],
      txtLocate: 24,
      aspectInfor: [
        {
          name: 'circle',
          attribute: {
            cx: '0',
            cy: '0',
            r: '19',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M0,-40V-20M0,20V40M0,-16V-8M-4,-12H4M-4,12H4',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M-7,-6L0,7L7,-6',
            class: 'part-rotate',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-20',
            y: '-30',
            width: '40',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Voltmeter',
    },
  },
  // Ammeter
  current_meter: {
    readWrite: {
      id: 'IM_',
    },
    readOnly: {
      partType: 'current_meter',
      inputTxt: [],
      visionNum: 1,
      pointInfor: [
        {
          position: [0, -40],
          direction: [0, -1],
        },
        {
          position: [0, 40],
          direction: [0, 1],
        },
      ],
      // Default Orientation is horizontal
      padding: 1,
      margin: [1, 0],
      txtLocate: 24,
      aspectInfor: [
        {
          name: 'circle',
          attribute: {
            cx: '0',
            cy: '0',
            r: '19',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M0,-40V-20M0,20V40M0,-16V-8M-4,-12H4M-4,12H4',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M-5,7L0,-5L5,7M-2.5,1H2.5',
            class: 'part-rotate',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-20',
            y: '-30',
            width: '40',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Ammeter',
    },
  },
  //diode
  diode: {
    readWrite: {
      id: 'VD_',
      input: ['1', '0.5', '5M'],
    },
    readOnly: {
      partType: 'diode',
      inputTxt: ['Breakover V:', 'Breakover R', 'Shutoff R：'],
      parameterUnit: ['V', 'Ω', 'Ω'],
      visionNum: 1,
      txtLocate: 18,
      padding: [1, 0],
      margin: 1,
      pointInfor: [
        {
          position: [0, -40],
          direction: [0, -1],
        },
        {
          position: [0, 40],
          direction: [0, 1],
        },
      ],
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d: 'M0,-40V40M-13,-11H13',
          },
        },
        {
          name: 'polygon',
          attribute: {
            points: '0,-11 -13,11 13,11',
            class: 'fill-whole', //'fill' : '#3B4449', 'stroke-width' : '1'
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-13',
            y: '-30',
            width: '26',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Diode',
    },
  },
  //BJT-NPN
  transistor_npn: {
    readWrite: {
      id: 'Q_',
      input: ['40', '26', '0.6', '1'],
    },
    readOnly: {
      partType: 'transistor_npn',
      inputTxt: [
        'Current Magnify Ratio：',
        'Base Node Resistor：',
        'BE Saturate Voltage：',
        'CE Saturate Voltage：',
      ],
      parameterUnit: ['', 'Ω', 'V', 'V'],
      visionNum: 1,
      txtLocate: 25,
      padding: [1, 1, 1, 0],
      margin: 1,
      pointInfor: [
        {
          position: [-20, 0],
          direction: [-1, 0],
        },
        {
          position: [20, -40],
          direction: [0, -1],
        },
        {
          position: [20, 40],
          direction: [0, 1],
        },
      ],
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d: 'M-20,0H0M0,-25V25M20,-40V-28L0,-12M0,12L20,28V40',
          },
        },
        {
          name: 'polygon',
          attribute: {
            points: '0,0 -11,-6 -7,0 -11,6',
            class: 'fill-whole',
            transform: 'translate(18, 26.4) rotate(38.7)',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-10',
            y: '-30',
            width: '30',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'BJT-NPN',
    },
  },
  //opamp
  operational_amplifier: {
    readWrite: {
      id: 'OP_',
      input: ['120', '80M', '60'], //['120', '1G', '80M', '60']
    },
    readOnly: {
      partType: 'operational_amplifier',
      inputTxt: [
        'Open loop gain：',
        'Input Resistance：',
        'Output Resistance：',
      ], //['Open loop gain：', 'Bandwidth Range：', 'Input Resistance：', 'Output Resistance：'],
      parameterUnit: ['dB', 'Ω', 'Ω'], //['dB', 'Hz', 'Ω', 'Ω'],
      visionNum: 1,
      txtLocate: 0,
      padding: 1,
      margin: 1,
      pointInfor: [
        {
          position: [-40, -20],
          direction: [-1, 0],
        },
        {
          position: [-40, 20],
          direction: [-1, 0],
        },
        {
          position: [40, 0],
          direction: [1, 0],
        },
      ],
      aspectInfor: [
        {
          name: 'path',
          attribute: {
            d: 'M-25,-35V35L25,0Z',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M-40,-20H-25M-40,20H-25M25,0H40',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M-22,-20H-16M-22,20H-16M-19,17V23',
            'stroke-width': '1',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-30',
            y: '-35',
            width: '60',
            height: '70',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Op-Amp',
    },
  },
  // Single point voltmeter
  SP_Voltmeter: {
    readWrite: {
      id: 'SPVM_',
    },
    readOnly: {
      partType: 'SP_Voltmeter',
      inputTxt: [],
      visionNum: 0,
      pointInfor: [
        {
          position: [0, -40],
          direction: [0, -1],
        },
      ],
      padding: 1,
      margin: [1, 0],
      txtLocate: 24,
      aspectInfor: [
        {
          name: 'circle',
          attribute: {
            cx: '0',
            cy: '0',
            r: '19',
            class: 'white-fill',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M0,-40V-20',
          },
        },
        {
          name: 'path',
          attribute: {
            d: 'M-7,-6L0,7L7,-6',
            class: 'part-rotate',
          },
        },
        {
          name: 'rect',
          attribute: {
            x: '-20',
            y: '-30',
            width: '40',
            height: '60',
            class: 'focus-part',
          },
        },
      ],
      introduction: 'Single Point Voltmeter',
    },
  },
}

// Part Class (Class for the components)
function PartClass(data) {
  const type = data.partType || data
  // zhaoshinan
  this.partType = type

  this.extend(Object.clone(originalElectronic[type].readWrite))
  Object.setPrototypeOf(this, originalElectronic[type].readOnly)

  // If an object is passed, expand on this object directly.
  if (typeof data === 'object') {
    const obj = Object.clone(data)
    delete obj.partType

    this.extend(obj)
  }

  this.id = partsAll.newId(this.id)
  this.rotate = this.rotate
    ? new Matrix(this.rotate)
    : new Matrix([
        [1, 0],
        [0, 1],
      ])
  this.position = this.position ? Point(this.position) : Point([-5000, -50000])
  this.connect = this.connect || Array(this.pointInfor.length).fill('')
  this.input = this.input || []
  this.current = {}
  this.circle = []
  this.elementDOM = this.createPart()
  this.move()

  // Node DOM Reference
  for (let i = 0; i < this.pointInfor.length; i++) {
    this.circle[i] = $('#' + this.id + '-' + i, this.elementDOM)
    this.setConnect(i)
  }
  // Display text, default position is on top of a component
  this.textVisition(this.text || [10, -10])

  delete this.text
  Object.seal(this)
  partsAll.push(this)
}
PartClass.prototype = {
  constructor: PartClass,

  // Drawing Related
  // Create a SVG on paper
  createPart() {
    // zhaoshinan
    this.name = this.id
    const group = $('<g>', SVG_NS, {
      class: 'editor-parts',
      id: this.id,
      opacity: '0.4',
    })
    const nodepoint = {
      // Node shape
      circle: {},
      rect: {
        x: '-9',
        y: '-9',
        width: '18',
        height: '18',
        class: 'rect-part-point',
      },
    }
    // Construct the component itself
    for (let i = 0; i < this.aspectInfor.length; i++) {
      const elementName = this.aspectInfor[i].name,
        elementAttribute = this.aspectInfor[i].attribute,
        tempData = $('<' + elementName + '>', SVG_NS)
      for (const j in elementAttribute)
        if (elementAttribute.hasOwnProperty(j)) {
          tempData.attr(j, elementAttribute[j])
        }
      group.append(tempData)
    }
    // Create node for component
    for (let i = 0; i < this.pointInfor.length; i++) {
      const position = this.pointInfor[i].position,
        tempDate = $('<g>', SVG_NS, {
          id: this.id + '-' + i,
          transform: 'translate(' + position[0] + ', ' + position[1] + ')',
          class: 'part-point point-open',
        })

      for (const j in nodepoint) {
        if (nodepoint.hasOwnProperty(j)) {
          tempDate.append($('<' + j + '>', SVG_NS, nodepoint[j]))
        }
      }
      group.append(tempDate)
    }
    // Create text for component
    //attention: If the grid is numbered, the text need a different display method
    if (this.visionNum) {
      // Create a text with ID displayed
      const propertyVision = []
      // Substitute μ for u
      for (let i = 0; i < this.visionNum - 1; i++) {
        this.input[i] = this.input[i].replace('u', 'μ')
        propertyVision.push(this.input[i] + this.parameterUnit[i])
      }
      const textMain = this.id.split('_'),
        tempDate = $('<text>', SVG_NS, { class: 'features-text' })

      // Create component ID
      tempDate.append($('<tspan>', SVG_NS).text(textMain[0]))
      tempDate.append($('<tspan>', SVG_NS).text(textMain[1]))

      // Set parameters of a component
      for (let i = 0; i < propertyVision.length; i++) {
        tempDate.append($('<tspan>', SVG_NS).text(propertyVision[i]))
      }
      group.append(tempDate)
    }
    actionArea.append(group)
    return group
  },
  // Move the component itself or text
  move(mouse, attr) {
    if (attr === 'text') {
      const grid = this.current
      grid.position = grid.position.add(grid.mouseBias(mouse))

      grid.text.attr({
        x: grid.position[0],
        y: grid.position[1],
      })
    } else {
      // The center of the component will be moved to this position
      this.position = mouse ? Point(mouse) : this.position
      this.elementDOM.attr(
        'transform',
        'matrix(' +
          this.rotate.join(', ') +
          ', ' +
          this.position.join(', ') +
          ')'
      )
    }
  },
  // Display the text describing the component
  textVisition(coordinates) {
    // No text
    if (!this.visionNum) {
      return false
    }

    const elemtxt = $('text.features-text', this.elementDOM),
      signRotate = $('.part-rotate', this.elementDOM),
      elemtspan = elemtxt.childrens(),
      tempPointInfor = this.pointRotate(),
      // Rotation matrix for the text
      texttransfor = this.rotate.inverse(),
      // Text properties
      textAttr = 'matrix(' + texttransfor.join(',') + ',0,0)'

    // Text rotation
    elemtxt.attr('transform', textAttr)

    // If coordiantes not provided, default coordinate is the current text location
    if (!coordinates) {
      coordinates = elemtxt.attr(['x', 'y']).map((n) => +n || 0)
    }

    if (signRotate.length) {
      signRotate.attr('transform', textAttr)
    }

    // Determin the location of the text, it suppose to be the place with less nodes
    for (let i = 0; i < tempPointInfor.length; i++) {
      const direction = tempPointInfor[i].direction

      if (direction[0] === 0) {
        if (
          (direction[1] < 0 && coordinates[1] < 0) ||
          (direction[1] > 0 && coordinates[1] > 0)
        ) {
          // Vertical
          coordinates[1] = 0
        }
      } else {
        if (
          (direction[0] < 0 && coordinates[0] < 0) ||
          (direction[0] > 0 && coordinates[0] > 0)
        ) {
          // Horizontal
          coordinates[0] = 0
        }
      }
    }
    // The larger coordinate will be the major one
    if (Math.abs(coordinates[0]) > Math.abs(coordinates[1])) {
      coordinates[1] = 0
    } else {
      coordinates[0] = 0
    }

    const // canvas magnify ratio
      exec = /scale\(([\d.]+?)\)/.exec(actionArea.attr('transform')) || [1, 1],
      scale = +exec[1],
      // Dimensions of the device at this time
      rect = $('.focus-part', this.elementDOM)
        .attr(['width', 'height'])
        .map((n) => +n),
      size = this.rotate.multo([rect])[0].map((n) => parseInt(Math.abs(n / 2))),
      // Minimum text offset
      bias = 4,
      // Text height
      height = 16,
      textRow = elemtspan.length,
      totalHeight = (height + 2) * (textRow - 1),
      // Length of displayed ID String
      idWidth = $(elemtspan[0]).STWidth() + $(elemtspan[1]).STWidth()

    if (!coordinates[0]) {
      if (coordinates[1] > 0) {
        // Downward
        let last = idWidth / 2
        $(elemtspan[0]).attr({ dx: -last, dy: '0' })
        for (let i = 2; i < elemtspan.length; i++) {
          const elem = $(elemtspan[i]),
            elemWidth = elem.STWidth() / 2

          elem.attr({ dx: -(elemWidth + last), dy: height })
          last = elemWidth
        }
        elemtxt.attr({ x: '0', y: size[1] + bias + height - textRow })
      } else {
        // Upward
        let last = idWidth / 2
        $(elemtspan[0]).attr({ dx: -last, dy: '0' })
        for (let i = 2; i < elemtspan.length; i++) {
          const elem = $(elemtspan[i]),
            elemWidth = elem.STWidth() / 2

          elem.attr({ dx: -(elemWidth + last), dy: height })
          last = elemWidth
        }
        elemtxt.attr({
          x: '0',
          y: -(size[1] + bias + totalHeight - height - textRow),
        })
      }
    } else {
      if (coordinates[0] > 0) {
        // Rightward
        let last = idWidth
        $(elemtspan[0]).attr({ dx: '0', dy: '0' })
        for (let i = 2; i < elemtspan.length; i++) {
          const text = $(elemtspan[i])
          text.attr({ dx: -last, dy: height })
          last = text.STWidth()
        }

        elemtxt.attr({ x: size[0] + bias, y: -(totalHeight / 2 - height) })
      } else {
        // Leftward
        $(elemtspan[0]).attr({ dx: -idWidth, dy: '0' })
        for (let i = 2; i < elemtspan.length; i++) {
          const elem = $(elemtspan[i])
          elem.attr({ dx: -elem.STWidth(), dy: height })
        }

        elemtxt.attr({ x: -(size[0] + bias), y: -(totalHeight / 2 - height) })
      }
    }
  },
  // Rotate a component
  rotateSelf(matrix, center) {
    this.position = this.position.rotate(matrix, center)
    this.rotate = this.rotate.mul(matrix)
    this.move()

    const textPos = $('text.features-text', this.elementDOM)
      .attr(['x', 'y'])
      .map((n) => +n || 0)
    this.textVisition(matrix.multo([textPos])[0])
  },
  // Shrink the node
  shrinkCircle(pointMark) {
    $('circle', this.circle[pointMark]).removeAttr('style')
  },
  // Enlarge the node
  enlargeCircle(pointMark) {
    $('circle', this.circle[pointMark]).attr('style', 'r:5')
  },

  // Mark
  markSign() {
    const position = this.position.floorToSmall(),
      range = this.marginRotate().padding,
      points = this.pointRotate().map((n) => n.position)

    // Verify the format
    if (!position.isInteger()) {
      throw 'When setting a label, component must align with the canvas'
    }

    // Component padding space
    for (
      let i = position[0] - range.left;
      i <= position[0] + range.right;
      i++
    ) {
      for (
        let j = position[1] - range.top;
        j <= position[1] + range.bottom;
        j++
      ) {
        // Delete the old properties and give the new ones
        schMap.setValueBySmalle([i, j], {
          id: this.id,
          form: 'part',
        })
      }
    }
    // Component node space
    for (let i = 0; i < points.length; i++) {
      schMap.setValueBySmalle(
        [position[0] + points[i][0] / 20, position[1] + points[i][1] / 20],
        {
          id: this.id + '-' + i,
          form: 'part-point',
          connect: [],
        }
      )
    }
  },
  deleteSign() {
    const position = this.position.floorToSmall(),
      range = this.marginRotate().padding,
      points = this.pointRotate().map((n) => n.position)

    // Format validation
    if (!position.isInteger()) {
      throw 'When setting a label, component must align with the canvas'
    }
    // Delete the component padding space
    for (
      let i = position[0] - range.left;
      i <= position[0] + range.right;
      i++
    ) {
      for (
        let j = position[1] - range.top;
        j <= position[1] + range.bottom;
        j++
      ) {
        schMap.deleteValueBySmalle([i, j])
      }
    }
    // Delete the component node space
    for (let i = 0; i < points.length; i++) {
      schMap.deleteValueBySmalle([
        position[0] + points[i][0] / 20,
        position[1] + points[i][1] / 20,
      ])
    }
  },

  // Query operation
  // If the current location is taken
  isCover(pos) {
    // Optain the margin and padding of the current component
    function merge(part) {
      const box = {},
        range = part.marginRotate()

      for (let i = 0; i < 4; i++) {
        const attr = ['left', 'right', 'top', 'bottom'][i]
        box[attr] = range.margin[attr] + range.padding[attr]
      }
      return box
    }

    const coverHash = {},
      boxSize = merge(this),
      margin = this.marginRotate().margin,
      point = this.pointRotate().map((n) =>
        Point.prototype.floorToSmall.call(n.position)
      ),
      position = pos ? Point(pos).roundToSmall() : this.position.roundToSmall()

    // Check the Component's node
    for (let i = 0; i < point.length; i++) {
      const node = position.add(point[i])
      if (schMap.getValueBySmalle(node)) {
        return true
      }
      coverHash[node.join(', ')] = true
    }
    // Scan the padding
    for (
      let i = position[0] - margin.left;
      i <= position[0] + margin.right;
      i++
    ) {
      for (
        let j = position[1] - margin.top;
        j <= position[1] + margin.bottom;
        j++
      ) {
        const status = schMap.getValueBySmalle([i, j])
        // If anything exist within the component's outline, the space will seen as "taken"
        if (status) {
          return true
        } else {
          coverHash[i + ', ' + j] = true
        }
      }
    }
    // Scan the margin
    for (
      let i = position[0] - boxSize.left;
      i <= position[0] + boxSize.right;
      i++
    ) {
      for (
        let j = position[1] - boxSize.top;
        j <= position[1] + boxSize.bottom;
        j++
      ) {
        // Ignore the padding
        if (coverHash[i + ', ' + j]) {
          continue
        }
        const status = schMap.getValueBySmalle([i, j])
        if (status && status.form === 'part') {
          const part = partsAll.findPart(status.id),
            partSize = merge(part),
            diff = this.position.add(-1, part.position).floorToSmall()

          if (diff[0] !== 0) {
            if (diff[0] > 0 && diff[0] < boxSize.left + partSize.right) {
              return true
            } else if (-diff[0] < boxSize.right + partSize.left) {
              return true
            }
          }
          if (diff[1] !== 0) {
            if (diff[1] > 0 && diff[1] < boxSize.top + partSize.bottom) {
              return true
            } else if (-diff[1] < boxSize.bottom + partSize.top) {
              return true
            }
          }
        }
      }
    }

    return false
  },
  //器件内边距中的所有节点和管脚节点
  nodeCollection() {
    const ans = [],
      position = this.position.floorToSmall(),
      range = this.marginRotate().padding,
      points = this.pointRotate().map((n) => n.position)

    for (
      let i = position[0] - range.left;
      i <= position[0] + range.right;
      i++
    ) {
      for (
        let j = position[1] - range.top;
        j <= position[1] + range.bottom;
        j++
      ) {
        ans.push(Point([i * 20, j * 20]))
      }
    }

    for (let i = 0; i < points.length; i++) {
      ans.push(position.mul(20).add(points[i]))
    }

    return ans
  },
  //计算器件当前引脚坐标及方向
  pointRotate() {
    const ans = []
    for (let i = 0; i < this.pointInfor.length; i++) {
      const point = this.pointInfor[i]
      ans.push({
        position: this.rotate.multo([point.position])[0],
        direction: this.rotate.multo(point.direction)[0],
      })
    }
    return ans
  },
  //当前器件边距
  marginRotate() {
    const ans = {},
      attr = ['padding', 'margin']

    for (let i = 0; i < 2; i++) {
      const margin = { left: 0, right: 0, top: 0, bottom: 0 },
        data = this[attr[i]],
        tempMargin = [
          [0, -data.top],
          [-data.left, 0],
          [0, data.bottom],
          [data.right, 0],
        ]

      //四方向计算
      for (let j = 0; j < 4; j++) {
        const ma = this.rotate.multo([tempMargin[j]])[0]
        if (ma[0] !== 0) {
          if (ma[0] > 0) {
            margin.right = ma[0]
          } else {
            margin.left = -ma[0]
          }
        } else if (ma[1] !== 0) {
          if (ma[1] > 0) {
            margin.bottom = ma[1]
          } else {
            margin.top = -ma[1]
          }
        }
      }
      ans[attr[i]] = margin
    }
    return ans
  },
  //按照标准格式输出
  toSimpleData() {
    const text = this.visionNum
      ? $('text', this.elementDOM).attr(['x', 'y'])
      : null

    return {
      partType: this.partType,
      position: Point(this.position),
      rotate: new Matrix(this.rotate),
      input: Array.clone(this.input),
      connect: Array.clone(this.connect),
      text,
      id: this.id,
    }
  },
  //当前器件是否还存在
  isExist() {
    return actionArea.contains(this.elementDOM) && partsAll.has(this)
  },

  //操作
  //直接设置导线连接，会影响端点形状
  setConnect(mark, id) {
    if (arguments.length === 2) {
      //没有输入连接导线的时候，连接表不变
      this.connect[mark] = id
    }

    if (this.connect[mark]) {
      this.circle[mark].attr('class', 'part-point point-close')
    } else {
      this.connect[mark] = ''
      this.circle[mark].attr('class', 'part-point point-open')
    }
    this.shrinkCircle(mark)
  },
  //器件高亮
  toFocus() {
    this.elementDOM.addClass('focus')
    partsNow.push(this)
    return this
  },
  //器件取消高亮
  toNormal() {
    this.elementDOM.removeClass('focus')
    this.current = {}
    return this
  },
  //显示器件参数菜单
  viewParameter(zoom, SVG) {
    //确定DOM部分
    const parameterDiv = $('#parameter-menu'),
      parameterBottom = $('.parameter-bottom-line', parameterDiv)

    let inputGroup = $('.st-menu-input-group', parameterDiv)

    //移除全部group
    inputGroup.remove()
    //添加group
    for (let i = 0; i < this.inputTxt.length + 1; i++) {
      const inputGroup = $('<div>', { class: 'st-menu-input-group' })
      inputGroup.append($('<span>', { class: 'st-menu-input-introduce' }))
      inputGroup.append($('<input>', { required: '' }))
      inputGroup.append($('<span>', { class: 'st-menu-input-bar' }))
      inputGroup.append($('<span>', { class: 'st-menu-input-unit' }))
      parameterDiv.preappend(inputGroup, parameterBottom)
    }
    //添加之后重新匹配DOM
    inputGroup = $('.st-menu-input-group', parameterDiv)
    //器件属性与说明文字的最大宽度
    let introWidth = 3,
      unitWidth = 0
    for (let i = 0; i < inputGroup.length; i++) {
      const intro = i ? this.inputTxt[i - 1] : 'Name：',
        input = i ? this.input[i - 1] : this.name,
        unit = i ? this.parameterUnit[i - 1] : ''
      //把输入的u替换成μ
      if (this.input) {
        this.input[i] = this.input[i] ? this.input[i].replace('μ', 'u') : false
      }
      //添加器件属性
      const group = $(inputGroup[i]),
        groupIntro = group.childrens(0),
        groupUnit = group.childrens(3),
        groupInput = group.childrens(1)

      group.attr('id', 'parameter-' + i)
      groupIntro.text(intro)
      groupUnit.text(unit)
      groupInput.attr('value', input)
      //求属性说明文字的最大宽度
      introWidth =
        groupIntro.width() > introWidth ? groupIntro.width() : introWidth
      unitWidth = groupUnit.width() > unitWidth ? groupUnit.width() : unitWidth
    }
    //inputDOM比器件的input数组多了一个器件ID
    this.input.length--
    //DOM位置调整
    inputGroup
      .childrens('span.st-menu-input-unit')
      .attr('style', 'left:' + (introWidth + 100) + 'px')
    inputGroup
      .childrens('input, span.st-menu-input-bar')
      .attr('style', 'left:' + introWidth + 'px')

    //显示定位
    let boxWidth,
      boxLeftBegin,
      boxLeftEnd,
      boxTopEnd,
      boxTopBegin,
      sharpposx,
      sharpposy,
      triangledown

      //输入框的宽度最小175
    ;(boxWidth =
      120 + introWidth + unitWidth < 175 ? 175 : 120 + introWidth + unitWidth),
      (boxLeftBegin = -boxWidth / 2), //输入框宽度的一半
      (boxLeftEnd = boxLeftBegin),
      (boxTopEnd = -parameterDiv.height() - 20), //输入框高度加上倒三角
      (boxTopBegin = boxTopEnd / 2 + 20),
      (sharpposx = this.position[0] * zoom + SVG[0]), //器件中心点在屏幕中实际的位置
      (sharpposy = this.position[1] * zoom + SVG[1]),
      (triangledown = $('#parameter-menu-triangle-down')) //参数框的小倒三角

    //倒三角默认在对话框中间
    triangledown.css('left', '50%')
    //参数框最上端超过屏幕
    if (sharpposy + boxTopEnd < 0) {
      triangledown.addClass('triangle-up')
      boxTopEnd = 20
    } else {
      triangledown.attr('class', '')
    }
    //参数框最左端超过屏幕
    if (sharpposx + boxLeftBegin < 0) {
      boxLeftEnd = 10 - sharpposx
      triangledown.css('left', sharpposx - 10 + 'px')
    }
    //参数框右端超过屏幕
    if (sharpposx + boxWidth / 2 > window.outerWidth) {
      boxLeftEnd = $(window).width() - 10 - boxWidth - sharpposx
      triangledown.css('left', -boxLeftEnd + 'px')
    }

    //参数框的打开关闭动画
    const keyframeOpen = new styleRule('parameter-open'),
      keyframeEnd = new styleRule('parameter-close')

    keyframeOpen.setRule('0%', {
      opacity: 0,
      transform: 'scale(0,0)',
      left: sharpposx + boxLeftBegin + 'px',
      top: sharpposy + boxTopBegin + 'px',
    })
    keyframeOpen.setRule('100%', {
      opacity: 1,
      transform: 'scale(1,1)',
      left: sharpposx + boxLeftEnd + 'px',
      top: sharpposy + boxTopEnd + 'px',
    })
    keyframeEnd.setRule('0%', {
      opacity: 1,
      transform: 'scale(1,1)',
      left: sharpposx + boxLeftEnd + 'px',
      top: sharpposy + boxTopEnd + 'px',
    })
    keyframeEnd.setRule('100%', {
      opacity: 0,
      transform: 'scale(0,0)',
      left: sharpposx + boxLeftBegin + 'px',
      top: sharpposy + boxTopBegin + 'px',
    })
    parameterDiv.css({
      width: boxWidth + 'px',
      left: sharpposx + boxLeftEnd + 'px',
      top: sharpposy + boxTopEnd + 'px',
    })
    parameterDiv.addClass('parameter-open')
    parameterDiv.removeClass('parameter-close')
    $('body').addClass('open-gray')
  },
  //输入属性之后显示
  inputVision() {
    const parameter = $('#parameter-menu'),
      idMatch = /[A-Za-z]+_[0-9A-Za-z]+/i,
      dataMatch = /\d+(.\d+)?[GMkmunp]?/

    //取消全部错误标志
    parameter.attr('class', 'parameter-open')
    let error = true
    //判断数据格式是否正确
    const inputID = $('#parameter-0 input', parameter).prop('value')
    //匹配器件代号
    if (!inputID.match(idMatch)) {
      parameter.addClass('parameter-error-0')
      error = false
    }
    for (let i = 0; i < this.inputTxt.length; i++) {
      const inputData = $('#parameter-' + (i + 1) + ' input', parameter).prop(
        'value'
      )
      const temp_input_match = inputData.match(dataMatch)
      if (!temp_input_match || inputData !== temp_input_match[0]) {
        parameter.addClass('parameter-error-' + (i + 1))
        error = false
      }
    }
    if (!error) return false
    //变更当前器件的ID
    this.exchangeID(inputID)
    //改变输入参数
    const temptext = $('text.features-text > tspan', this.elementDOM)
    for (let i = 0; i < this.inputTxt.length; i++) {
      this.input[i] = $('#parameter-' + (i + 1) + ' input', parameter).prop(
        'value'
      )
      this.input[i] = this.input[i].replace('u', 'μ')
      if (i < this.visionNum - 1) {
        temptext[i + 2].textContent = this.input[i] + this.parameterUnit[i]
      }
    }
    //修正属性的显示位置
    this.textVisition()
    return true
  },
  //移动之后放下器件
  putDown(isNew) {
    if (isNew) {
      //新建器件需要检测是否可行
      this.position = Point(
        schMap.nodeRound(
          this.position.round(),
          this.position,
          this.isCover.bind(this)
        )
      )
    }

    this.position = this.position.round()
    this.move()
    this.markSign()
  },
  //删除器件
  deleteSelf() {
    if (!this.isExist()) {
      return false
    }
    //删除与之相连的导线
    for (let i = 0; i < this.connect.length; i++) {
      if (this.connect[i]) {
        const line = partsAll.findPart(this.connect[i])

        //有可能该导线已经被删除
        if (line) {
          line.deleteSelf()
        }
      }
    }

    this.deleteSign()
    this.elementDOM.remove()
    partsAll.deletePart(this)
  },
  //变更当前器件ID
  exchangeID(label) {
    // zhaoshinan
    if (label === this.name) return false
    const last = this.name
    //删除旧器件
    partsAll.deletePart(this)
    partsNow.deletePart(this)
    const temptspan = $('tspan', this.elementDOM)
    const points = $('.part-point', this.elementDOM)
    //变更ID及显示
    this.name = label
    this.elementDOM.attr('id', this.id)
    temptspan.get(0).text(this.name.slice(0, this.name.search('_')))
    temptspan.get(1).text(this.name.slice(this.name.search('_') + 1))
    //修正与之相连的器件连接表中的ID
    for (let i = 0; i < this.connect.length; i++) {
      const point = points.get(i)
      const pointLabel = point.attr('id').split('-')
      pointLabel[0] = label
      point.attr('id', pointLabel.join('-'))
      if (this.connect[i]) {
        const tempPart = partsAll.findPart(this.connect[i])
        for (let j = 0; j < tempPart.connect.length; j++) {
          if ((tempPart.connect[j] = last + '-' + i)) {
            tempPart.connect[j] = label + '-' + i
            break
          }
        }
      }
    }
    //图纸重新标记
    this.markSign()
    //新器件入栈
    partsAll.push(this)
    partsNow.push(this)
  },
}

//器件移动相关的方法
partsNow.extend({
  // Check if the component is connected to the wire
  checkConn() {
    var single = 0
    this.forEach((n) => {
      single += n.current.status ? 1 : 0
    })
    if (single == 1) {
      return false
    } else {
      return true
    }
  },
  //由器件开始回溯导线，确定导线状态
  checkLine() {
    const self = this
    //当前没有器件，那么退出
    if (!self.length) {
      return false
    }
    //递归标记器件所连接的导线
    for (let i = 0; i < self.length; i++) {
      ;(function DFS(part) {
        //非法器件
        if (!part) {
          return false
        }
        //已经确定整体移动的器件
        if (part.current.status === 'move') {
          return true
        }

        if (part.partType !== 'line' && self.has(part)) {
          //标记当前器件
          part.current = {}
          part.current.status = 'move'
          //当前器件是被选中的器件
          for (let i = 0; i < part.connect.length; i++) {
            DFS(partsAll.findPart(part.connect[i]))
          }
        } else if (part.partType === 'line') {
          //当前器件是导线
          //标记当前导线
          if (!part.current.status) {
            part.current = {}
            part.current.status = 'half'
          } else if (part.current.status === 'half') {
            part.current.status = 'move'
            return true
          }
          //导线回溯
          if (
            part.connect.every((con) =>
              con
                .split(' ')
                .map((item) => partsAll.findPart(item))
                .some((item) => !item || self.has(item) || item.current.status)
            )
          ) {
            //当前导线整体移动
            part.current.status = 'move'
            part.connect
              .join(' ')
              .split(' ')
              .forEach((item) => DFS(partsAll.findPart(item)))
          }
        }
      })(self[i])
    }
    //器件数据初始化
    partsAll.forEach((item) => {
      const type = item.partType,
        status = item.current.status

      if (status === 'move') {
        item.toFocus()
        if (type === 'line') {
          //导线初始位置为原点，记录当前路径
          item.current.bias = Point([0, 0])
          item.current.wayBackup = Array.clone(item.way)
        } else {
          //器件初始位置为其几何中心当前坐标
          item.current.bias = Point(item.position)
        }
      }
    })
    partsAll.forEach((item) => {
      if (item.current.status === 'half') {
        item.toFocus()
        //导线变形数据初始化
        item.startPath(false, 'movePart')
      }
    })
  },
  //器件准备移动
  moveStart() {
    //拔起全部器件以及变形导线转换模式
    this.forEach((n) => {
      n.current.status !== 'move' && n.toGoing()
      n.deleteSign()
    })
  },
  //器件移动
  moveParts(event) {
    const self = this,
      cur = self.current,
      mouse = cur.mouse(event),
      bias = mouse.add(-1, cur.pageL)

    //器件移动
    this.forEach((item) => {
      if (item.current.status === 'move') {
        //整体移动
        item.move(item.current.bias.add(bias))
      } else {
        //移动变形
        item.setPath(item.current.startPoint.add(bias), 'movePart')
      }
    })
  },
  //放下所有器件
  putDownParts(opt) {
    const self = this,
      cur = self.current,
      mouse = cur.mouse(event),
      bias = mouse.add(-1, cur.pageL)

    //整体移动的器件对齐网格
    self.forEach((part) => {
      if (part.current.status === 'move') {
        if (part.partType === 'line') {
          part.way.clone(part.current.wayBackup)
          part.way.standardize(bias)
        } else {
          part.move(part.current.bias.add(bias))
        }
      }
    })
    //是否能放置器件
    if (
      self.every((n) => (n.current.status === 'move' ? !n.isCover() : true))
    ) {
      //首先放置整体移动的器件
      self.forEach((n) => {
        if (n.current.status === 'move') {
          n.putDown(opt, 'movePart')
          n.elementDOM.removeAttr('opacity')
        }
      })
      //然后放置变形导线
      self.forEach((n) => {
        if (n.current.status !== 'move') {
          n.putDown(false, 'movePart')
        }
      })
      //粘贴器件时还需要再次确定导线连接关系
      if (opt === 'paste') {
        self.forEach((n) => {
          if (n.partType === 'line' && n.isExist()) {
            n.nodeToConnect(0)
            n.nodeToConnect(1)
            n.render()
            n.markSign()
          }
        })
      }
      //删除所有导线以及被删除的器件，重新确定状态
      const temp = self.filter((n) => n.partType !== 'line' && n.isExist())
      self.forEach((n) => n.toNormal())
      self.deleteAll()
      temp.forEach((n) => (n.toFocus(), self.push(n)))
      self.checkLine()
      //放置成功
      return true
    } else {
      //非粘贴状态，当前所有器件恢复原装
      if (opt !== 'paste') {
        //器件
        self.forEach((part) => {
          if (part.partType !== 'line') {
            part.move(part.current.bias)
            part.markSign()
          }
        })
        //导线
        self.forEach((line) => {
          if (line.partType === 'line') {
            line.way.clone(line.current.wayBackup)
            line.render()
            line.markSign()
          }
        })
      }

      //放置失败
      return false
    }
  },
  //旋转检测
  isRotate(sub) {
    const move = this.filter((n) => n.current && n.current.status === 'move')
    //节点集合
    let nodes = []
    for (let i = 0; i < move.length; i++) {
      const node = move[i].way
        ? move[i].way.nodeCollection()
        : move[i].nodeCollection()

      nodes = nodes.concat(node)
    }
    //中心点
    const nodeX = nodes.map((n) => n[0]),
      nodeY = nodes.map((n) => n[1]),
      center = Point([
        (Math.minOfArray(nodeX) + Math.maxOfArray(nodeX)) / 2,
        (Math.minOfArray(nodeY) + Math.maxOfArray(nodeY)) / 2,
      ]).round()

    //搜索
    const ans = Array(4).fill(true),
      start = sub === u ? 0 : sub,
      end = sub === u ? 3 : sub

    for (let k = start; k <= end; k++) {
      const ma = rotateMatrix[k]
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i].rotate(ma, center),
          status = schMap.getValueByOrigin(node)

        if (status && status.id.split(' ').every((n) => !partsNow.has(n))) {
          ans[k] = false
          break
        }
      }
    }

    return sub === u ? ans : ans[sub]
  },
  //旋转
  rotate(sub) {
    this.moveStart()

    const move = this.filter((n) => n.current && n.current.status === 'move'),
      center = Point(this.center.call(move)).round(),
      ma = rotateMatrix[sub]

    //整体移动的器件旋转
    move.forEach((item) => {
      item.rotateSelf(ma, center)
      item.markSign()
    })

    //导线变形
    this.forEach((n) => {
      if (n.current.status !== 'move') {
        n.current.initTrend = n.current.initTrend.rotate(ma)
        n.putDown(false, 'movePart')
      }
    })

    //检查当前集合元素是否存在
    this.deleteParts((n) => n.isExist())
    //重新确定连接关系
    this.checkLine()
  },
})
Object.freezeMethod(partsNow)

//处理器件原型的格式
function css2obj(css) {
  if (css instanceof Array) {
    if (css.length === 2) {
      return {
        top: css[0],
        bottom: css[0],
        left: css[1],
        right: css[1],
      }
    } else if (css.length === 4) {
      return {
        top: css[0],
        right: css[1],
        bottom: css[2],
        left: css[3],
      }
    }
  } else {
    const num = Number(css)
    return {
      left: num,
      right: num,
      top: num,
      bottom: num,
    }
  }
}
for (const i in originalElectronic) {
  const data = originalElectronic[i].readOnly,
    pointInfor = data.pointInfor

  //内外边距
  data.padding = css2obj(data.padding)
  data.margin = css2obj(data.margin)
  //管脚方向矩阵
  for (let j = 0; j < pointInfor.length; j++) {
    pointInfor[j].direction = new Matrix([pointInfor[j].direction])
  }
  //器件原型链链接只读属性，并冻结只读属性
  if (originalElectronic.hasOwnProperty(i)) {
    Object.setPrototypeOf(data, PartClass.prototype)
    Object.freezeAll(data)
  }
}

//添加器件图标
$('#sidebar-menu #menu-add-parts button.parts-list').each((n) => {
  // zhaoshinan
  const elem = $(n),
    special = {
      reference_ground: 'scale(1.3, 1.3)',
      transistor_npn: 'translate(-5,0)',
    },
    type = elem.attr('id'),
    part = originalElectronic[type].readOnly.aspectInfor,
    intro = originalElectronic[type].readOnly.introduction,
    bias = special[type]
      ? 'translate(40,40) ' + special[type]
      : 'translate(40,40)',
    icon = elem
      .append(
        $('<svg>', SVG_NS, {
          x: '0px',
          y: '0px',
          viewBox: '0 0 80 80',
        })
      )
      .append($('<g>', SVG_NS))

  icon.attr('transform', bias)
  elem.prop('introduction', intro)
  for (let i = 0; i < part.length; i++) {
    if (part[i].name === 'rect') {
      continue
    }

    const svgPart = part[i],
      iconSVG = icon.append($('<' + svgPart.name + '>', SVG_NS))
    for (const k in svgPart.attribute) {
      if (svgPart.attribute.hasOwnProperty(k)) {
        if (svgPart.attribute[k] === 'class') {
          continue
        }
        iconSVG.attr(k, svgPart.attribute[k])
      }
    }
  }
})
//菜单关闭按钮位置
$('#menu-add-parts-close').attr(
  'style',
  'top:' + ($('.st-menu-title').prop('clientHeight') - 50) + 'px;'
)

//模块对外的接口
export { PartClass }
