"use strict";
// Import external packages
import { $ } from "./jquery";
import { Point } from "./point";
import { Matrix } from "./matrix";
import { SVG_NS } from "./init";
import { schMap } from "./maphash";
import { styleRule } from "./styleRule";
import { partsAll, partsNow } from "./collection";
import { PartClass } from "./parts";

// Define Constants
const u = undefined,
  actionArea = $("#area-of-parts"),
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
  ];
// var labelSet = new Set();
// Subcircuit Templates
const subcircuitTemplates = {
  /**
   * This part is to describe the basic parameters and shape of a component
   *   id             The component name
   *   partType       The component type
   *   input          The component parameters that relate to a component's input, if it has any
   *   inputTxt       The description of the component parameters
   *   visionNum      Number of parameters displayed on the parameter panel; this includes name of component, so length of input attr = visionNum - 1
   *   pointInfor     Node position and orientation (it is the placement and orientation of the pin from which we can drag a wire and connect the component to other stuff)
   *   padding        The component padding
   *   margin         The component margin
   *   txtLocate      The distance between the text and the center of the component
   *
   */

  // Subcircuit with varying number of ports
  // subcircuitOnePort: {
  //   readWrite: {
  //     // Editable Data
  //     id: "X_",
  //     // This depends what components go in the subcircuit,
  //     // so they need to be initialized dynamically in the constructor
  //     input: [],
  //     inputTxt: [],
  //     parameterUnit: [],
  //     components: {},
  //     introduction: "SubcircuitOnePort",
  //   },
  //   readOnly: {
  //     // Readonly Data
  //     partType: "subcircuit",
  //     visionNum: 2,
  //     txtLocate: 14,
  //     // Default Orientation is horizontal
  //     padding: [0, 1],
  //     margin: 1,
  //     pointInfor: [
  //       {
  //         position: [-40, 0],
  //         direction: [-1, 0],
  //       },
  //       {
  //         position: [40, 0],
  //         direction: [1, 0],
  //       },
  //     ],
  //     aspectInfor: [
  //       {
  //         name: "path",
  //         attribute: {
  //           d: "M-40,0H-24L-20,-9L-12,9L-4,-9L4,9L12,-9L20,9L24,0H40",
  //         },
  //       },
  //       {
  //         name: "rect",
  //         attribute: {
  //           x: "-30",
  //           y: "-13",
  //           width: "60",
  //           height: "26",
  //           class: "focus-part",
  //         },
  //       },
  //     ],
  //   },
  // },
  subcircuitTwoPort: { // NOTE: TODO: input, inputTxt, visionNum, parameterUnit must be dynamically initialized in the constructor based on components we read in the json passed in
    readWrite: {
      // Editable Data
      id: "X_",
      // This depends what components go in the subcircuit,
      // so they need to be initialized dynamically in the constructor
      input: [],
      inputTxt: [],
      parameterUnit: [],
      components: {}, // json object of components where components of the same type are keyed by the same initial, eg key: "P", value: list of ports
      visionNum: 1, // input.length + 1, // number of parameters in the param panel for subcircuit: input valus of its components + subcircuit name; double check this works
      portIdentifiers: {},
    },
    readOnly: {
      // Readonly Data
      partType: "subcircuit",
      txtLocate: 5,
      // Default Orientation is horizontal
      padding: [0, 1],
      margin: 1,
      pointInfor: [
        {
          position: [-40, 0],
          direction: [0, -1],
        },
        {
          position: [40, 0],
          direction: [0, 1],
        },
      ],
      aspectInfor: [
        { // this draws left vertical side 
          name: 'path',
          attribute: {
            d: 'M-40,20 l0 -48', //83 0 83 0 0 49 0 49',  
          },
        }, 
        { // this draws top horizontal side
          name: 'path',
          attribute: {
              d: 'M-40,-28 l80,0',
          },
        }, 
        { // this draws right vertical side
            name: 'path',
            attribute: {
              d: 'M40,-28 l0,48'
            },
        },
        { // this draws bottom horizontal side
            name: 'path',
            attribute: {
              d: 'M40,20 l-80,0'
            },
        },
        {
          name: "rect",
          attribute: {
            x: "306",
            y: "245",
            width: "188",
            height: "110",
            class: "focus-part",
          },
        },
      ],
      // deleted intro attribute here, since it is used as displayed text when user hovers over subcircuit icon in side menu of parts
      // but we want to display custom user name for subcircuit, not a generic template name!
      // check buildSubcircuitSVGForPartsMenuButton function to see how we initialized intro to actually be user's custom name
      // in parts.js, intro is initialized to the introduction field from parts template
    },
  },
  // subcircuitThreePort: {
  //   readWrite: {
  //     // Editable Data
  //     id: "X_",
  //     // This depends what components go in the subcircuit,
  //     // so they need to be initialized dynamically in the constructor
  //     input: [],
  //     inputTxt: [],
  //     parameterUnit: [],
  //     components: {},
  //     introduction: "SubcircuitThreePort",
  //   },
  //   readOnly: {
  //     // Readonly Data
  //     partType: "subcircuit",
  //     visionNum: 2,
  //     txtLocate: 14,
  //     // Default Orientation is horizontal
  //     padding: [0, 1],
  //     margin: 1,
  //     pointInfor: [
  //       {
  //         position: [-40, 0],
  //         direction: [-1, 0],
  //       },
  //       {
  //         position: [40, 0],
  //         direction: [1, 0],
  //       },
  //     ],
  //     aspectInfor: [
  //       {
  //         name: "path",
  //         attribute: {
  //           d: "M-40,0H-24L-20,-9L-12,9L-4,-9L4,9L12,-9L20,9L24,0H40",
  //         },
  //       },
  //       {
  //         name: "rect",
  //         attribute: {
  //           x: "-30",
  //           y: "-13",
  //           width: "60",
  //           height: "26",
  //           class: "focus-part",
  //         },
  //       },
  //     ],
  //   },
  // },
  // subcircuitFourPort: {
  //   readWrite: {
  //     // Editable Data
  //     id: "X_",
  //     // This depends what components go in the subcircuit,
  //     // so they need to be initialized dynamically in the constructor
  //     input: [],
  //     inputTxt: [],
  //     parameterUnit: [],
  //     components: {},
  //     introduction: "SubcircuitFourPort",
  //   },
  //   readOnly: {
  //     // Readonly Data
  //     partType: "subcircuit",
  //     visionNum: 2,
  //     txtLocate: 14,
  //     // Default Orientation is horizontal
  //     padding: [0, 1],
  //     margin: 1,
  //     pointInfor: [
  //       {
  //         position: [-40, 0],
  //         direction: [-1, 0],
  //       },
  //       {
  //         position: [40, 0],
  //         direction: [1, 0],
  //       },
  //     ],
  //     aspectInfor: [
  //       {
  //         name: "path",
  //         attribute: {
  //           d: "M-40,0H-24L-20,-9L-12,9L-4,-9L4,9L12,-9L20,9L24,0H40",
  //         },
  //       },
  //       {
  //         name: "rect",
  //         attribute: {
  //           x: "-30",
  //           y: "-13",
  //           width: "60",
  //           height: "26",
  //           class: "focus-part",
  //         },
  //       },
  //     ],
  //   },
  // },
};

// Subcircuit Constructor
function Subcircuit(data, isConcreteInstance = false) {
  if (data.partType){ // Data full blown object, so deconstruct it 
      // PartClass.call()
      const { name, partType, isBlackBox, components, connect, portIdentifiers } = data;
      this.name = name;
      this.isBlackBox = isBlackBox;
      this.components = components;
      this.connect = connect;
      this.partType = partType;
      this.portIdentifiers = portIdentifiers;
    }
    else { 
      // data is of this form, because we are creating a concrete instance of the subcircuit so we only need to pass in this info
      // const data = {
      //     subcircuitHTMLId: event.currentTarget.id,
      //     portIdentifiers: event.currentTarget.portIdentifiers
      // }
      // PartClass.call()
      this.partType = data["subcircuitHTMLId"].split("_")[0];
      this.name = data["subcircuitHTMLId"].split("_")[1];
      this.portIdentifiers = data["portIdentifiers"];
    }

  this.extend(Object.clone(subcircuitTemplates[this.partType].readWrite));
  Object.setPrototypeOf(this, subcircuitTemplates[this.partType].readOnly);

  // If an object is passed, expand on this object directly.
  // TODO: Not sure if we will keep this if statement
  if (typeof data === "object") {
    const obj = Object.clone(data);
    delete obj.partType;
    this.extend(obj);
  }

  if(isConcreteInstance) { // here wrapped all this code in this if statement because this constructor was taken from parts constructor
    // parts are implemented differently to subcircuits in that they are there on side menu from get-go, so whenever their constructor is called, it is to create a concrete instance of a part
    // meaning, placing a part on the grid, so we need to assign a new id to this part and push it to the partsAll array which keeps track of the parts currently on the grid
    // but, in our subcircuit use case: constructor could be called in 2 cases:
    // 1. Creating subcircuit for the first time; ie wanting to just add it to the parts menu list, NOT on a grid ==> NOT a concrete instance of a subcircuit!
    // 2. Dragging and dropping our new subcircuit onto the grid ==> an actual CONCRETE instance of a subcircuit in which we should record the fact that a subcircuit has just been plopped onto a grid
    // by notifying the partsAll array! -- this case is what this is if statement is for.
    this.id = partsAll.newId(this.id);
    this.rotate = this.rotate
      ? new Matrix(this.rotate)
      : new Matrix([
          [1, 0],
          [0, 1],
        ]);
    this.position = this.position ? Point(this.position) : Point([-5000, -50000]);
    this.connect = this.connect || Array(this.pointInfor.length).fill("");
    this.input = this.input || []; 
    //, so might need a hashmap where keys are element IDs and the values
    // are the inputs of each element
    this.current = {}; // TODO: what is this?
    this.circle = [];
    this.elementDOM = this.createPart(); // Create part creates an SVG element by using html tags
    this.move(); // TODO: what is this?

    // Node DOM Reference
    for (let i = 0; i < this.pointInfor.length; i++) {
      this.circle[i] = $("#" + this.id + "-" + i, this.elementDOM); // Represents pin on the DOM
      this.setConnect(i);
    }
    // Display text, default position is on top of a component
    this.textVisition(this.text || [10, -10]);

    delete this.text; // TODO: Figure out why this is here
    Object.seal(this);
    partsNow.deleteAll();
    partsAll.push(this);
  }
}

Subcircuit.prototype = {
  constructor: Subcircuit,

  // initialize input array
  // subcircuit json: {"name":"tst","partType":"subcircuitTwoPort","isBlackBox":false,"components":
  //{"P":[{"id":"P_1","name":"P_1","value":0,"node1":"0","node2":"gnd"},{"id":"P_2","name":"P_2","value":0,"node1":"gnd","node2":"2"}],
  //"C":[{"id":"C_1","name":"C_1","value":0.0001,"node1":"2","node2":"0"}]},"connect":["",""]}
  // initializeInputs(components) {
  //   for (const [partType, partList] of Object.entries(components)) {
  //     if(partType !== "P") { // inptu: , [ { L1: [10u, 50Ohms ]} ]
  //       // inputTxt: [ { L1: [inductanceUnit, ohmUnit] }]
  //       // paramUnit: [ { L1: [paramUnitString1, paramUnitString2]} ]
  //       partList.forEach( (part) => {
  //         let inputJson = {};
  //         inputJson[part.id] = 
  //         this.input.push()
  //       })
  //     }
  //   }  
  // },

  // Drawing Related
  // Create a SVG on paper
  createPart() {
    console.log("create part in subcircuits called")
    // New Identification
    const group = $("<g>", SVG_NS, {
      class: "editor-parts",
      id: this.name + "_" + this.id,
      opacity: "0.4",
    });
    console.log(this.name + "_" + this.id)
    const nodepoint = {
      // Node shape
      circle: {},
      rect: {
        x: "-9",
        y: "-9",
        width: "18",
        height: "18",
        class: "rect-part-point",
      },
    };
    // Construct the component itself
    for (let i = 0; i < this.aspectInfor.length; i++) {
      const elementName = this.aspectInfor[i].name,
        elementAttribute = this.aspectInfor[i].attribute,
        tempData = $("<" + elementName + ">", SVG_NS);
      for (const j in elementAttribute)
        if (elementAttribute.hasOwnProperty(j)) {
          tempData.attr(j, elementAttribute[j]);
        }
      group.append(tempData);
    }
    // Create node for component
    for (let i = 0; i < this.pointInfor.length; i++) {
      const position = this.pointInfor[i].position,
        tempDate = $("<g>", SVG_NS, {
          id: this.id + "-" + i,
          transform: "translate(" + position[0] + ", " + position[1] + ")",
          class: "part-point point-open",
        });

      for (const j in nodepoint) {
        if (nodepoint.hasOwnProperty(j)) {
          tempDate.append($("<" + j + ">", SVG_NS, nodepoint[j]));
        }
      }
      group.append(tempDate);
    }
    // Create text for component
    //attention: If the grid is numbered, the text need a different display method
    if (this.visionNum) {
      // Create a text with ID displayed
      const propertyVision = [];
      // Substitute μ for u
      for (let i = 0; i < this.visionNum - 1; i++) {
        this.input[i] = this.input[i].replace("u", "μ");
        propertyVision.push(this.input[i] + this.parameterUnit[i]);
      }
      const textMain = this.name,
        tempDate = $("<text>", SVG_NS, { class: "features-text" });

      tempDate.append($("<tspan>", SVG_NS).text(textMain));

      // Set parameters of a component
      for (let i = 0; i < propertyVision.length; i++) {
        tempDate.append($("<tspan>", SVG_NS).text(propertyVision[i]));
      }

      for(let i = 0; i < Object.keys(this.portIdentifiers).length; i++) {
        tempDate.append($("<tspan>", SVG_NS).text(this.portIdentifiers["P_" + (i+1)])); // appends the custom name that is accessed by the key that is the port ID in the portIdentifiers map! 
      }

      group.append(tempDate);
    }
    actionArea.append(group);
    return group;
  },
  // Move the component itself or text
  move(mouse, attr) {
    if (attr === "text") {
      const grid = this.current;
      grid.position = grid.position.add(grid.mouseBias(mouse));

      grid.text.attr({
        x: grid.position[0],
        y: grid.position[1],
      });
    } else {
      // The center of the component will be moved to this position
      this.position = mouse ? Point(mouse) : this.position;
      this.elementDOM.attr(
        "transform",
        "matrix(" +
          this.rotate.join(", ") +
          ", " +
          this.position.join(", ") +
          ")"
      );
    }
  },
  // Display the text describing the component
  textVisition(coordinates) {
    // No text
    if (!this.visionNum) {
      return false;
    }

    const elemtxt = $("text.features-text", this.elementDOM),
      signRotate = $(".part-rotate", this.elementDOM),
      elemtspan = elemtxt.childrens(),
      tempPointInfor = this.pointRotate(),
      // Rotation matrix for the text
      texttransfor = this.rotate.inverse(),
      // Text properties
      textAttr = "matrix(" + texttransfor.join(",") + ",0,0)";

    // Text rotation
    elemtxt.attr("transform", textAttr);

    // If coordiantes not provided, default coordinate is the current text location
    if (!coordinates) {
      coordinates = elemtxt.attr(["x", "y"]).map((n) => +n || 0);
    }

    if (signRotate.length) {
      signRotate.attr("transform", textAttr);
    }

    // Determin the location of the text, it suppose to be the place with less nodes
    for (let i = 0; i < tempPointInfor.length; i++) {
      const direction = tempPointInfor[i].direction;

      if (direction[0] === 0) {
        if (
          (direction[1] < 0 && coordinates[1] < 0) ||
          (direction[1] > 0 && coordinates[1] > 0)
        ) {
          // Vertical
          coordinates[1] = 0;
        }
      } else {
        if (
          (direction[0] < 0 && coordinates[0] < 0) ||
          (direction[0] > 0 && coordinates[0] > 0)
        ) {
          // Horizontal
          coordinates[0] = 0;
        }
      }
    }
    // The larger coordinate will be the major one
    if (Math.abs(coordinates[0]) > Math.abs(coordinates[1])) {
      coordinates[1] = 0;
    } else {
      coordinates[0] = 0;
    }

    const // canvas magnify ratio
      exec = /scale\(([\d.]+?)\)/.exec(actionArea.attr("transform")) || [1, 1],
      scale = +exec[1],
      // Dimensions of the device at this time
      rect = $(".focus-part", this.elementDOM)
        .attr(["width", "height"])
        .map((n) => +n),
      size = this.rotate.multo([rect])[0].map((n) => parseInt(Math.abs(n / 2))),
      // Minimum text offset
      bias = 4,
      // Text height
      height = 16,
      textRow = elemtspan.length,
      totalHeight = (height + 2) * textRow,
      // Length of displayed ID String
      idWidth = $(elemtspan[0]).STWidth();
    // idWidth = $(elemtspan[0]).STWidth() + $(elemtspan[1]).STWidth()

    if (!coordinates[0]) {
      if (coordinates[1] > 0) {
        // Downward
        let last = idWidth / 2;
        $(elemtspan[0]).attr({ dx: -last, dy: "0" });
        for (let i = 1; i < elemtspan.length; i++) {
          const elem = $(elemtspan[i]),
            elemWidth = elem.STWidth() / 2;

          elem.attr({ dx: -(elemWidth + last), dy: height });
          last = elemWidth;
        }
        elemtxt.attr({ x: "0", y: size[1] + bias + height - textRow });
      } else {
        // Upward
        let last = idWidth / 2;
        $(elemtspan[0]).attr({ dx: -last, dy: "0" });
        for (let i = 1; i < elemtspan.length; i++) {
          const elem = $(elemtspan[i]),
            elemWidth = elem.STWidth() / 2;

          elem.attr({ dx: -(elemWidth + last), dy: height });
          last = elemWidth;
        }
        elemtxt.attr({
          x: "0",
          y: -(size[1] + bias + totalHeight - height - textRow),
        });
      }
    } else {
      if (coordinates[0] > 0) {
        // Rightward
        let last = idWidth;
        $(elemtspan[0]).attr({ dx: "0", dy: "0" });
        for (let i = 1; i < elemtspan.length; i++) {
          const text = $(elemtspan[i]);
          text.attr({ dx: -last, dy: height });
          last = text.STWidth();
        }

        elemtxt.attr({ x: size[0] + bias, y: -(totalHeight / 2 - height) });
      } else {
        // Leftward
        $(elemtspan[0]).attr({ dx: -idWidth, dy: "0" });
        for (let i = 1; i < elemtspan.length; i++) {
          const elem = $(elemtspan[i]);
          elem.attr({ dx: -elem.STWidth(), dy: height });
        }

        elemtxt.attr({ x: -(size[0] + bias), y: -(totalHeight / 2 - height) });
      }
    }
  },
  // Rotate a component
  rotateSelf(matrix, center) {
    this.position = this.position.rotate(matrix, center);
    this.rotate = this.rotate.mul(matrix);
    this.move();

    const textPos = $("text.features-text", this.elementDOM)
      .attr(["x", "y"])
      .map((n) => +n || 0);
    this.textVisition(matrix.multo([textPos])[0]);
  },

  // These probably won't change, because they have the same functionality as in parts.js
  // Shrink the node
  shrinkCircle(pointMark) {
    $("circle", this.circle[pointMark]).removeAttr("style");
  },
  // Enlarge the node
  enlargeCircle(pointMark) {
    $("circle", this.circle[pointMark]).attr("style", "r:5");
  },

  // Mark
  markSign() {
    const position = this.position.floorToSmall(),
      range = this.marginRotate().padding,
      points = this.pointRotate().map((n) => n.position);

    // Verify the format
    if (!position.isInteger()) {
      throw "When setting a label, component must align with the canvas";
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
          form: "part",
        });
      }
    }
    // Component node space
    for (let i = 0; i < points.length; i++) {
      schMap.setValueBySmalle(
        [position[0] + points[i][0] / 20, position[1] + points[i][1] / 20],
        {
          id: this.id + "-" + i,
          form: "part-point",
          connect: [],
        }
      );
    }
  },
  deleteSign() {
    const position = this.position.floorToSmall(),
      range = this.marginRotate().padding,
      points = this.pointRotate().map((n) => n.position);

    // Format validation
    if (!position.isInteger()) {
      throw "When setting a label, component must align with the canvas";
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
        schMap.deleteValueBySmalle([i, j]);
      }
    }
    // Delete the component node space
    for (let i = 0; i < points.length; i++) {
      schMap.deleteValueBySmalle([
        position[0] + points[i][0] / 20,
        position[1] + points[i][1] / 20,
      ]);
    }
  },

  // Query operation
  // If the current location is taken
  isCover(pos) {
    // Optain the margin and padding of the current component
    function merge(part) {
      const box = {},
        range = part.marginRotate();

      for (let i = 0; i < 4; i++) {
        const attr = ["left", "right", "top", "bottom"][i];
        box[attr] = range.margin[attr] + range.padding[attr];
      }
      return box;
    }

    const coverHash = {},
      boxSize = merge(this),
      margin = this.marginRotate().margin,
      point = this.pointRotate().map((n) =>
        Point.prototype.floorToSmall.call(n.position)
      ),
      position = pos ? Point(pos).roundToSmall() : this.position.roundToSmall();

    // Check the Component's node
    for (let i = 0; i < point.length; i++) {
      const node = position.add(point[i]);
      if (schMap.getValueBySmalle(node)) {
        return true;
      }
      coverHash[node.join(", ")] = true;
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
        const status = schMap.getValueBySmalle([i, j]);
        // If anything exist within the component's outline, the space will seen as "taken"
        if (status) {
          return true;
        } else {
          coverHash[i + ", " + j] = true;
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
        if (coverHash[i + ", " + j]) {
          continue;
        }
        const status = schMap.getValueBySmalle([i, j]);
        if (status && status.form === "part") {
          const part = partsAll.findPart(status.id),
            partSize = merge(part),
            diff = this.position.add(-1, part.position).floorToSmall();

          if (diff[0] !== 0) {
            if (diff[0] > 0 && diff[0] < boxSize.left + partSize.right) {
              return true;
            } else if (-diff[0] < boxSize.right + partSize.left) {
              return true;
            }
          }
          if (diff[1] !== 0) {
            if (diff[1] > 0 && diff[1] < boxSize.top + partSize.bottom) {
              return true;
            } else if (-diff[1] < boxSize.bottom + partSize.top) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },
  //All nodes and pin nodes in the device margin
  nodeCollection() {
    const ans = [],
      position = this.position.floorToSmall(),
      range = this.marginRotate().padding,
      points = this.pointRotate().map((n) => n.position);

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
        ans.push(Point([i * 20, j * 20]));
      }
    }

    for (let i = 0; i < points.length; i++) {
      ans.push(position.mul(20).add(points[i]));
    }

    return ans;
  },
  //Calculate the current pin coordinates and direction of the device
  pointRotate() {
    const ans = [];
    for (let i = 0; i < this.pointInfor.length; i++) {
      const point = this.pointInfor[i];
      ans.push({
        position: this.rotate.multo([point.position])[0],
        direction: this.rotate.multo(point.direction)[0],
      });
    }
    return ans;
  },
  //Current device margin
  marginRotate() {
    const ans = {},
      attr = ["padding", "margin"];

    for (let i = 0; i < 2; i++) {
      const margin = { left: 0, right: 0, top: 0, bottom: 0 },
        data = this[attr[i]],
        tempMargin = [
          [0, -data.top],
          [-data.left, 0],
          [0, data.bottom],
          [data.right, 0],
        ];

      //Four directions calculation
      for (let j = 0; j < 4; j++) {
        const ma = this.rotate.multo([tempMargin[j]])[0];
        if (ma[0] !== 0) {
          if (ma[0] > 0) {
            margin.right = ma[0];
          } else {
            margin.left = -ma[0];
          }
        } else if (ma[1] !== 0) {
          if (ma[1] > 0) {
            margin.bottom = ma[1];
          } else {
            margin.top = -ma[1];
          }
        }
      }
      ans[attr[i]] = margin;
    }
    return ans;
  },
  //Output in standard format
  toSimpleData() {
    const text = this.visionNum
      ? $("text", this.elementDOM).attr(["x", "y"])
      : null;

    return {
      partType: this.partType,
      position: Point(this.position),
      rotate: new Matrix(this.rotate),
      input: Array.clone(this.input),
      connect: Array.clone(this.connect),
      text,
      id: this.id,
    };
  },
  //Does the current device still exist
  isExist() {
    return actionArea.contains(this.elementDOM) && partsAll.has(this);
  },

  //operating
  //Setting the wire connection directly will affect the shape of the end point
  setConnect(mark, id) {
    if (arguments.length === 2) {
      //When there is no input connecting wire, the connection table remains unchanged
      this.connect[mark] = id;
    }

    if (this.connect[mark]) {
      this.circle[mark].attr("class", "part-point point-close");
    } else {
      this.connect[mark] = "";
      this.circle[mark].attr("class", "part-point point-open");
    }
    this.shrinkCircle(mark);
  },
  //Device focus
  toFocus() {
    this.elementDOM.addClass("focus");
    partsNow.push(this);
    // console.log("partsNow in toFocus() of parts.js");
    // console.log(partsNow);
    return this;
  },
  //Device cancel focus
  toNormal() {
    this.elementDOM.removeClass("focus");
    this.current = {};
    return this;
  },
  //Display device parameter menu
  viewParameter(zoom, SVG) {
    //Determine the DOM part
    const parameterDiv = $("#parameter-menu"),
      parameterBottom = $(".parameter-bottom-line", parameterDiv);

    let inputGroup = $(".st-menu-input-group", parameterDiv);

    //Remove all groups
    inputGroup.remove();
    //Add group
    for (let i = 0; i < this.inputTxt.length + 1; i++) {
      const inputGroup = $("<div>", { class: "st-menu-input-group" });
      inputGroup.append($("<span>", { class: "st-menu-input-introduce" }));
      inputGroup.append($("<input>", { required: "" }));
      inputGroup.append($("<span>", { class: "st-menu-input-bar" }));
      inputGroup.append($("<span>", { class: "st-menu-input-unit" }));
      parameterDiv.preappend(inputGroup, parameterBottom);
    }
    //Rematch DOM after adding
    inputGroup = $(".st-menu-input-group", parameterDiv);
    //Maximum width of device attributes and description text
    let introWidth = 3,
      unitWidth = 0;
    for (let i = 0; i < inputGroup.length; i++) {
      const intro = i ? this.inputTxt[i - 1] : "Name：",
        input = i ? this.input[i - 1] : this.name,
        unit = i ? this.parameterUnit[i - 1] : "";
      //Replace the input u with μ
      if (this.input) {
        this.input[i] = this.input[i] ? this.input[i].replace("μ", "u") : false;
      }
      //Add device properties
      const group = $(inputGroup[i]),
        groupIntro = group.childrens(0),
        groupUnit = group.childrens(3),
        groupInput = group.childrens(1);

      group.attr("id", "parameter-" + i);
      groupIntro.text(intro);
      groupUnit.text(unit);
      groupInput.attr("value", input);
      //Find the maximum width of the attribute description text
      introWidth =
        groupIntro.width() > introWidth ? groupIntro.width() : introWidth;
      unitWidth = groupUnit.width() > unitWidth ? groupUnit.width() : unitWidth;
    }
    //inputDOM has one more device ID than the input array of the device
    this.input.length--;
    //DOM position adjustment
    inputGroup
      .childrens("span.st-menu-input-unit")
      .attr("style", "left:" + (introWidth + 100) + "px");
    inputGroup
      .childrens("input, span.st-menu-input-bar")
      .attr("style", "left:" + introWidth + "px");

    //Show positioning
    let boxWidth,
      boxLeftBegin,
      boxLeftEnd,
      boxTopEnd,
      boxTopBegin,
      sharpposx,
      sharpposy,
      triangledown;

    //The minimum width of the input box is 175
    (boxWidth =
      120 + introWidth + unitWidth < 175 ? 175 : 120 + introWidth + unitWidth),
      //Half the width of the input box
      (boxLeftBegin = -boxWidth / 2),
      (boxLeftEnd = boxLeftBegin),
      //Input box height plus inverted triangle
      (boxTopEnd = -parameterDiv.height() - 20),
      (boxTopBegin = boxTopEnd / 2 + 20),
      //The actual position of the device center point on the screen
      (sharpposx = this.position[0] * zoom + SVG[0]),
      (sharpposy = this.position[1] * zoom + SVG[1]),
      //The small inverted triangle of the parameter box
      (triangledown = $("#parameter-menu-triangle-down"));

    //The inverted triangle is in the middle of the dialog by default
    triangledown.css("left", "50%");
    //The top of the parameter box exceeds the screen
    if (sharpposy + boxTopEnd < 0) {
      triangledown.addClass("triangle-up");
      boxTopEnd = 20;
    } else {
      triangledown.attr("class", "");
    }
    //The leftmost end of the parameter box exceeds the screen
    if (sharpposx + boxLeftBegin < 0) {
      boxLeftEnd = 10 - sharpposx;
      triangledown.css("left", sharpposx - 10 + "px");
    }
    //The right end of the parameter box exceeds the screen
    if (sharpposx + boxWidth / 2 > window.outerWidth) {
      boxLeftEnd = $(window).width() - 10 - boxWidth - sharpposx;
      triangledown.css("left", -boxLeftEnd + "px");
    }

    //Parameter box opening and closing animation
    const keyframeOpen = new styleRule("parameter-open"),
      keyframeEnd = new styleRule("parameter-close");

    keyframeOpen.setRule("0%", {
      opacity: 0,
      transform: "scale(0,0)",
      left: sharpposx + boxLeftBegin + "px",
      top: sharpposy + boxTopBegin + "px",
    });
    keyframeOpen.setRule("100%", {
      opacity: 1,
      transform: "scale(1,1)",
      left: sharpposx + boxLeftEnd + "px",
      top: sharpposy + boxTopEnd + "px",
    });
    keyframeEnd.setRule("0%", {
      opacity: 1,
      transform: "scale(1,1)",
      left: sharpposx + boxLeftEnd + "px",
      top: sharpposy + boxTopEnd + "px",
    });
    keyframeEnd.setRule("100%", {
      opacity: 0,
      transform: "scale(0,0)",
      left: sharpposx + boxLeftBegin + "px",
      top: sharpposy + boxTopBegin + "px",
    });
    parameterDiv.css({
      width: boxWidth + "px",
      left: sharpposx + boxLeftEnd + "px",
      top: sharpposy + boxTopEnd + "px",
    });
    parameterDiv.addClass("parameter-open");
    parameterDiv.removeClass("parameter-close");
    $("body").addClass("open-gray");
  },
  //Display after entering attributes
  inputVision() {
    const parameter = $("#parameter-menu"),
      idMatch = /[0-9A-Za-z]+/i,
      dataMatch = /\d+(.\d+)?[GMkmunp]?/;

    //Cancel all error flags
    parameter.attr("class", "parameter-open");
    let error = true;
    //Determine whether the data format is correct
    const inputID = $("#parameter-0 input", parameter).prop("value");
    //Matching device code
    if (!inputID.match(idMatch)) {
      parameter.addClass("parameter-error-0");
      error = false;
    }
    var qmPanelUpdate = 0;
    if (this.partType == "Label" && this.name != inputID) {
      if (labelSet.has(inputID)) {
        parameter.addClass("parameter-error-0");
        error = false;
      } else {
        var qmNode1inner = document.getElementById("qmNode1");
        var qmNode2inner = document.getElementById("qmNode2");
        if (this.name == qmNode1inner.value) {
          qmNode1inner.value = inputID;
          qmPanelUpdate += 1;
        }
        if (this.name == qmNode2inner.value) {
          qmNode2inner.value = inputID;
          qmPanelUpdate += 2;
        }
        labelSet.delete(this.name);
        labelSet.add(inputID);
      }
    }
    for (let i = 0; i < this.inputTxt.length; i++) {
      const inputData = $("#parameter-" + (i + 1) + " input", parameter).prop(
        "value"
      );
      const temp_input_match = inputData.match(dataMatch);
      if (!temp_input_match || inputData !== temp_input_match[0]) {
        if (this.partType !== "diode") {
          parameter.addClass("parameter-error-" + (i + 1));
          error = false;
        }
      }
    }
    if (!error) return false;
    //Change the ID of the current device
    this.exchangeID(inputID);
    //Change input parameters
    const temptext = $("text.features-text > tspan", this.elementDOM);
    for (let i = 0; i < this.inputTxt.length; i++) {
      this.input[i] = $("#parameter-" + (i + 1) + " input", parameter).prop(
        "value"
      );
      this.input[i] = this.input[i].replace("u", "μ");
      if (i < this.visionNum - 1) {
        temptext[i + 1].textContent = this.input[i] + this.parameterUnit[i];
      }
    }
    //Fix the display position of the attribute
    this.textVisition();
    return true;
  },
  //Put down the device after moving
  putDown(isNew) {
    if (isNew) {
      //New devices need to be tested for feasibility
      this.position = Point(
        schMap.nodeRound(
          this.position.round(),
          this.position,
          this.isCover.bind(this)
        )
      );
    }

    this.position = this.position.round();
    this.move();
    this.markSign();
  },
  //Delete device
  deleteSelf() {
    if (!this.isExist()) {
      return false;
    }
    //Delete the wire connected to it
    for (let i = 0; i < this.connect.length; i++) {
      if (this.connect[i]) {
        const line = partsAll.findPart(this.connect[i]);

        //It is possible that the wire has been deleted
        if (line) {
          line.deleteSelf();
        }
      }
    }
    if (this.partType == "Label") {
      var qmNode1inner = document.getElementById("qmNode1");
      var qmNode2inner = document.getElementById("qmNode2");
      if (this.name == qmNode1inner.value) {
        qmNode1inner.value = "";
      }
      if (this.name == qmNode2inner.value) {
        qmNode2inner.value = "";
      }
      labelSet.delete(this.name);
    }
    this.deleteSign();
    this.elementDOM.remove();
    partsAll.deletePart(this);
  },
  //Change the current device Name
  exchangeID(label) {
    // New Identification
    if (label === this.name) return false;
    this.name = label;
    const last = this.name;
    //Delete old device
    partsAll.deletePart(this);
    partsNow.deletePart(this);
    const temptspan = $("tspan", this.elementDOM);
    const points = $(".part-point", this.elementDOM);
    //Change ID and display
    this.elementDOM.attr("id", this.id);
    temptspan.get(0).text(this.name.slice(0));
    // temptspan.get(1).text(this.name.slice(this.name.search('_') + 1))
    //Correct the ID in the connection table of the connected device
    for (let i = 0; i < this.connect.length; i++) {
      const point = points.get(i);
      const pointLabel = point.attr("id").split("-");
      pointLabel[0] = label;
      point.attr("id", pointLabel.join("-"));
      if (this.connect[i]) {
        const tempPart = partsAll.findPart(this.connect[i]);
      }
    }
    //Remark the drawing
    this.markSign();
    //New device on the stack
    partsAll.push(this);
    partsNow.push(this);
  },
};

// //Device movement related methods
// partsNow.extend({
//   // Check if the component is connected to the wire
//   checkConn() {
//     var single = 0;
//     this.forEach((n) => {
//       single += n.current.status ? 1 : 0;
//     });
//     if (single == 1) {
//       return false;
//     } else {
//       return true;
//     }
//   },
//   //Trace back the wire from the device to determine the wire state
//   checkLine() {
//     const self = this;
//     //There is no device currently, then exit
//     if (!self.length) {
//       return false;
//     }
//     //Recursively mark the wires connected to the device
//     for (let i = 0; i < self.length; i++) {
//       (function DFS(part) {
//         //Invalid device
//         if (!part) {
//           return false;
//         }
//         //Devices that have been determined to move as a whole
//         if (part.current.status === "move") {
//           return true;
//         }

//         if (part.partType !== "line" && self.has(part)) {
//           //Mark the current device
//           part.current = {};
//           part.current.status = "move";
//           //The current device is the selected device
//           for (let i = 0; i < part.connect.length; i++) {
//             DFS(partsAll.findPart(part.connect[i]));
//           }
//         } else if (part.partType === "line") {
//           //Current device is wire
//           //Mark current wire
//           if (!part.current.status) {
//             part.current = {};
//             part.current.status = "half";
//           } else if (part.current.status === "half") {
//             part.current.status = "move";
//             return true;
//           }
//           //Trace back
//           if (
//             part.connect.every((con) =>
//               con
//                 .split(" ")
//                 .map((item) => partsAll.findPart(item))
//                 .some((item) => !item || self.has(item) || item.current.status)
//             )
//           ) {
//             //Current wire overall movement
//             part.current.status = "move";
//             part.connect
//               .join(" ")
//               .split(" ")
//               .forEach((item) => DFS(partsAll.findPart(item)));
//           }
//         }
//       })(self[i]);
//     }
//     //Device data initialization
//     partsAll.forEach((item) => {
//       const type = item.partType,
//         status = item.current.status;

//       if (status === "move") {
//         item.toFocus();
//         if (type === "line") {
//           //The initial position of the wire is the origin, and the current path is recorded
//           item.current.bias = Point([0, 0]);
//           item.current.wayBackup = Array.clone(item.way);
//         } else {
//           //The initial position of the device is the current coordinates of its geometric center
//           item.current.bias = Point(item.position);
//         }
//       }
//     });
//     partsAll.forEach((item) => {
//       if (item.current.status === "half") {
//         item.toFocus();
//         //Wire deformation data initialization
//         item.startPath(false, "movePart");
//       }
//     });
//   },
//   //Device ready to move
//   moveStart() {
//     //Unplug all devices and transform wire conversion mode
//     this.forEach((n) => {
//       n.current.status !== "move" && n.toGoing();
//       n.deleteSign();
//     });
//   },
//   //move a device
//   moveParts(event) {
//     const self = this,
//       cur = self.current,
//       mouse = cur.mouse(event),
//       bias = mouse.add(-1, cur.pageL);

//     //move a device
//     this.forEach((item) => {
//       if (item.current.status === "move") {
//         //move as a whole
//         item.move(item.current.bias.add(bias));
//       } else {
//         //move while transform
//         item.setPath(item.current.startPoint.add(bias), "movePart");
//       }
//     });
//   },
//   //Put down all devices
//   putDownParts(opt) {
//     const self = this,
//       cur = self.current,
//       mouse = cur.mouse(event),
//       bias = mouse.add(-1, cur.pageL);

//     //Alignment of the whole moving device to the grid
//     self.forEach((part) => {
//       if (part.current.status === "move") {
//         if (part.partType === "line") {
//           part.way.clone(part.current.wayBackup);
//           part.way.standardize(bias);
//         } else {
//           part.move(part.current.bias.add(bias));
//         }
//       }
//     });
//     //Can the device be placed
//     if (
//       self.every((n) => (n.current.status === "move" ? !n.isCover() : true))
//     ) {
//       //First place the whole moving device
//       self.forEach((n) => {
//         if (n.current.status === "move") {
//           n.putDown(opt, "movePart");
//           n.elementDOM.removeAttr("opacity");
//         }
//       });
//       //Then place the deformed wire
//       self.forEach((n) => {
//         if (n.current.status !== "move") {
//           n.putDown(false, "movePart");
//         }
//       });
//       //When pasting the device, you need to determine the wire connection relationship again
//       if (opt === "paste") {
//         self.forEach((n) => {
//           if (n.partType === "line" && n.isExist()) {
//             n.nodeToConnect(0);
//             n.nodeToConnect(1);
//             n.render();
//             n.markSign();
//           }
//         });
//       }
//       //Delete all wires and deleted devices, re-determine the status
//       const temp = self.filter((n) => n.partType !== "line" && n.isExist());
//       self.forEach((n) => n.toNormal());
//       self.deleteAll();
//       temp.forEach((n) => (n.toFocus(), self.push(n)));
//       self.checkLine();
//       //place successfully
//       return true;
//     } else {
//       //Non-pasted state, all current devices are restored to original
//       if (opt !== "paste") {
//         //device
//         self.forEach((part) => {
//           if (part.partType !== "line") {
//             part.move(part.current.bias);
//             part.markSign();
//           }
//         });
//         //wire
//         self.forEach((line) => {
//           if (line.partType === "line") {
//             line.way.clone(line.current.wayBackup);
//             line.render();
//             line.markSign();
//           }
//         });
//       }

//       //place failed
//       return false;
//     }
//   },
//   //rotation check
//   isRotate(sub) {
//     const move = this.filter((n) => n.current && n.current.status === "move");
//     //Node collection
//     let nodes = [];
//     for (let i = 0; i < move.length; i++) {
//       const node = move[i].way
//         ? move[i].way.nodeCollection()
//         : move[i].nodeCollection();

//       nodes = nodes.concat(node);
//     }
//     //center point
//     const nodeX = nodes.map((n) => n[0]),
//       nodeY = nodes.map((n) => n[1]),
//       center = Point([
//         (Math.minOfArray(nodeX) + Math.maxOfArray(nodeX)) / 2,
//         (Math.minOfArray(nodeY) + Math.maxOfArray(nodeY)) / 2,
//       ]).round();

//     //search
//     const ans = Array(4).fill(true),
//       start = sub === u ? 0 : sub,
//       end = sub === u ? 3 : sub;

//     for (let k = start; k <= end; k++) {
//       const ma = rotateMatrix[k];
//       for (let i = 0; i < nodes.length; i++) {
//         const node = nodes[i].rotate(ma, center),
//           status = schMap.getValueByOrigin(node);

//         if (status && status.id.split(" ").every((n) => !partsNow.has(n))) {
//           ans[k] = false;
//           break;
//         }
//       }
//     }

//     return sub === u ? ans : ans[sub];
//   },
//   //rotate
//   rotate(sub) {
//     this.moveStart();

//     const move = this.filter((n) => n.current && n.current.status === "move"),
//       center = Point(this.center.call(move)).round(),
//       ma = rotateMatrix[sub];

//     //overall rotate
//     move.forEach((item) => {
//       item.rotateSelf(ma, center);
//       item.markSign();
//     });

//     //wire transform
//     this.forEach((n) => {
//       if (n.current.status !== "move") {
//         n.current.initTrend = n.current.initTrend.rotate(ma);
//         n.putDown(false, "movePart");
//       }
//     });

//     //Check if the current collection element exists
//     this.deleteParts((n) => n.isExist());
//     //Re-determine the connection relationship
//     this.checkLine();
//   },
// });
// Object.freezeMethod(partsNow);

//Processing device prototype format
function css2obj(css) {
  if (css instanceof Array) {
    if (css.length === 2) {
      return {
        top: css[0],
        bottom: css[0],
        left: css[1],
        right: css[1],
      };
    } else if (css.length === 4) {
      return {
        top: css[0],
        right: css[1],
        bottom: css[2],
        left: css[3],
      };
    }
  } else {
    const num = Number(css);
    return {
      left: num,
      right: num,
      top: num,
      bottom: num,
    };
  }
}
for (const i in subcircuitTemplates) {
  const data = subcircuitTemplates[i].readOnly,
    pointInfor = data.pointInfor;

  //Inner and outer margins
  data.padding = css2obj(data.padding);
  data.margin = css2obj(data.margin);
  //Pin direction matrix
  for (let j = 0; j < pointInfor.length; j++) {
    pointInfor[j].direction = new Matrix([pointInfor[j].direction]);
  }
  //Link the read-only attribute of the device prototype chain and freeze the read-only attribute
  if (subcircuitTemplates.hasOwnProperty(i)) {
    Object.setPrototypeOf(data, Subcircuit.prototype);
    Object.freezeAll(data);
  }
}

//Add device icon
// This function is based on the commented code below, which is taken from the parts.js file
// The commented code below, found in parts.js, is responsible for iterating over the index.html file to go through each button already there (resistor button, capacitor button, etc...)
// and inject SVGs for the buttons to be displayed upon loading up the UI page
// However, our function buildSubcircuitSVGForPartsMenuButton injects an SVG for a subcircuit button with id "subcircuitHTMLId" ON-DEMAND when the user creates the subcircuit; this function is not called when loading up the page
// so to implement persistence of subcircuits created and have them show up in parts menu days after they were created, the commented code below which is in parts.js will need to be modified to query the database in backend which
// contains the stored created subcircuits and add those as well when loading up UI for users
function buildSubcircuitSVGForPartsMenuButton(subcircuitHTMLId, portIdentifiers) {
  // New Identification
  const elem = $(`#${subcircuitHTMLId}`), //$(`#sidebar-menu #menu-add-parts button.parts-list #${subcircuitHTMLId}`),
    special = {
      reference_ground: "scale(1.3, 1.3)",
      transistor_npn: "translate(-5,0)",
    },
    type = elem.attr("id").split("_")[0], 
    parts = subcircuitTemplates[type].readOnly.aspectInfor,
    intro = elem.attr("id").split("_")[1], // for subcircuit part, unlike the other parts, when hovering over its icon in side menu,
    // we want to display the custom name the user gave it, instead of generic template introduction
    bias = special[type]
      ? "translate(40,40) " + special[type]
      : "translate(40,40)",
    icon = elem
      .append(
        $("<svg>", SVG_NS, {
          x: "0px",
          y: "0px",
          viewBox: "0 0 80 80",
        })
      )
      .append($("<g>", SVG_NS));

  icon.attr("transform", bias);
  elem.prop("introduction", intro);
  elem.prop("portIdentifiers", portIdentifiers);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].name === "rect") {
      continue;
    }

    // this section here is responsible for going through the aspectInfor array (the array of lines and shapes needed to draw part shape) and adding it to svg icon for the part
    const svgPart = parts[i],
      iconSVG = icon.append($("<" + svgPart.name + ">", SVG_NS));
    for (const k in svgPart.attribute) {
      if (svgPart.attribute.hasOwnProperty(k)) {
        if (svgPart.attribute[k] === "class") {
          continue;
        }
        iconSVG.attr(k, svgPart.attribute[k]);
      }
    }
  }
}
// $("#sidebar-menu #menu-add-parts button.parts-list").each((n) => {
//   // New Identification
//   const elem = $(n),
//     special = {
//       reference_ground: "scale(1.3, 1.3)",
//       transistor_npn: "translate(-5,0)",
//     },
//     type = elem.attr("id"),
//     part = subcircuitTemplates[type].readOnly.aspectInfor,
//     intro = subcircuitTemplates[type].readOnly.introduction,
//     bias = special[type]
//       ? "translate(40,40) " + special[type]
//       : "translate(40,40)",
//     icon = elem
//       .append(
//         $("<svg>", SVG_NS, {
//           x: "0px",
//           y: "0px",
//           viewBox: "0 0 80 80",
//         })
//       )
//       .append($("<g>", SVG_NS));

//   icon.attr("transform", bias);
//   elem.prop("introduction", intro);
//   for (let i = 0; i < part.length; i++) {
//     if (part[i].name === "rect") {
//       continue;
//     }

//     const svgPart = part[i],
//       iconSVG = icon.append($("<" + svgPart.name + ">", SVG_NS));
//     for (const k in svgPart.attribute) {
//       if (svgPart.attribute.hasOwnProperty(k)) {
//         if (svgPart.attribute[k] === "class") {
//           continue;
//         }
//         iconSVG.attr(k, svgPart.attribute[k]);
//       }
//     }
//   }
// });
// //Menu close button position
// $("#menu-add-parts-close").attr(
//   "style",
//   "top:" + ($(".st-menu-title").prop("clientHeight") - 50) + "px;"
// );

//Module external interface
export { Subcircuit, buildSubcircuitSVGForPartsMenuButton };