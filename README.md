# Virtual Circuit Lab

## Introduction
This is a web-based circuit simulator created using JavaScript, jQuery, Python and Flask to replicate the on-campus laboratory experience and provide ECE students virtual access to circuits lab.

To start the frontend server

1. Download this Github Repository
2. Install node.js (download from official cite)
https://nodejs.org/en/download/  
3. Package installation command (in node.js command prompt)
```node  
npm install gulp-cli -g  
cd circuit-simulator-1.0  
npm install  
```  
4. And then, in node command line, execute
```node  
gulp build  
```  

## Operation instructions

### Settings
The plotting of this simulation is still under development.
You can set Time interval and step time in the setting prompt.  
Time interval specifies the length of the simulation and step time specifies how frequent do we perform the simulation.  
This part can only be configured for simulation time, not the real time. The time interval is the total simulation time.
Theortically, the less the step size, the higher the simulation accuracy.

### Devices
In the `Add New Component` page, single click the divice you want to select and single click again to drop it.
Keep pressing the mouse to select more than one device.
Moving a component will only change the coordinates of the device and wire, the connection will stay the same. (Theortically)

### Device Properties
Double left click or single right click on a device can set the properties of that device.
The properties includes ID and other settings.
The proper ID format is `String + underscore + String/Number`.
When setting the parameters, only the following simplifications can be used:  `G`、`M`、`k`、`m`、`u`、`n`、`p`.
Input an invalid ID or parameter will prevent you from exiting the properties panel till it is corrected.
`ECS` and `ENTER` keys from the keyboard are enabled when setting a device's property. They represents `cancel` and `confirm` respectively.

### Draw wires
Left click any unconnected pin of a device and drag will draw a wire. When the mouse is released, the wire drawing is complete.
Left click any connected pin will make it disconenct. You can drag the wire to redraw the circuit.
Left click a node consists of multiple wires will cause it disconenct from the node. You can drag the wire to redraw the circuit.
Left click a part of a wire will reform that part of the wire.

### Other
Right click and drag the empty canvas will move the canvas.
When not focusing on any devices, scroll the mouse can zoom the canvas.

## Browser
Chrome 42+  

## Attention
Chrome has a bug when scale the page, if the page scale is not 100%, the background grid may be missing.

## Licence
MIT License