# Virtual Circuits Lab

## Introduction
This is a web-based circuit simulator created using JavaScript, jQuery, Python and Flask to replicate the on-campus laboratory experience and provide ECE students virtual access to circuits lab.  
This repository only includes the frontend of this project. Please refer to the backend at [virtual-circuits-lab](https://github.com/FloriaPeng/virtual-circuits-lab).

To start the frontend server:

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

---

## Operation instructions

### Devices
In the `Add New Component` page, single click the divice you want to select and single click again to drop it.  
To select multiple component on the gridboard, please use mouse area selection to draw selection rectangle.  
Moving a component will only change the coordinates of the device and wire, the connection will (theortically) stay unchanged.

### Device Properties
Right click on a device and choose `Edit Parameters` or double left click to set the properties of that device.  
The properties includes `Name` and other settings:  
> The proper `Name` format is `String + underscore + String/Number`.
> When setting the parameters, only the following metric prefixe simplifications can be used:  `G`、`M`、`k`、`m`、`u`、`n`、`p`.
> Input an invalid `Name` or parameter will prevent you from exiting the properties panel utill it is corrected.
> `ESC` and `ENTER` keys from the keyboard are enabled when setting a device's property. They represents `cancel` and `confirm` respectively.

### Draw wires
Left click any unconnected pin of a device and drag will draw a wire. When the mouse is released, the wire drawing is complete.  
Left click any connected pin will make it disconenct. You can drag the wire to redraw the circuit connection.
Left click a node that consists of multiple wires will cause it to disconenct from the node. You can drag the wire to redraw the circuit connection.
Left click a part of a wire will reform that part of the wire.

### Other
Right click and drag at the blank space of the gridboard will move the canvas.  
When not focusing on any devices, scroll the mouse can zoom in and out the canvas.

### Settings
Currently **disabled**, as the plotting functionality of this project is still under development stage.  
~~You can set time interval and step time in the `Settings` panel.  
Time interval specifies the length of the simulation and step time specifies the sampling frequency. Theortically, the less the step size, the higher the simulation accuracy.  
These values are only for simulation methods, the corresponding time is not real time. The time interval is the total simulation time.~~

---

## Browser
Chrome 42+  

## Attention
Chrome has a bug when scaling the page, if the page scale is not 100%, some of the background grid may be missing.

## Licence
MIT License
