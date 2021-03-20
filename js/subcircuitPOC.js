'use strict';
import { PartClass } from './parts';
import { LineClass } from './lines';
import { nodeId } from './nodeID';
import filter from './filter';

// {"0":{"id":"line_3","way":{"0":{"0":980,"1":280},"1":{"0":920,"1":280},"length":2},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"connect":["P_1-0","C_1-1"],"partType":"line","current":{"status":"move","bias":{"0":0,"1":0},"wayBackup":[[980,280],[920,280]]},"elementDOM":{"0":{},"length":1}},"1":{"partType":"capacitor","id":"C_1","input":["100μ"],"rotate":{"0":[1,0],"1":[0,1]},"position":{"0":880,"1":280},"connect":["line_1","line_3"],"current":{"status":"move","bias":{"0":880,"1":280}},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"name":"C_1","elementDOM":{"0":{},"length":1}},"2":{"id":"line_1","way":{"0":{"0":740,"1":280},"1":{"0":840,"1":280},"length":2},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"connect":["R_1-1","C_1-0"],"partType":"line","current":{"status":"move","bias":{"0":0,"1":0},"wayBackup":[[740,280],[840,280]]},"elementDOM":{"0":{},"length":1}},"3":{"partType":"resistance","id":"R_1","input":["10k"],"rotate":{"0":[1,0],"1":[0,1]},"position":{"0":700,"1":280},"connect":["line_2","line_1"],"current":{"status":"move","bias":{"0":700,"1":280}},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"name":"R_1","elementDOM":{"0":{},"length":1}},"4":{"id":"line_2","way":{"0":{"0":500,"1":280},"1":{"0":660,"1":280},"length":2},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"connect":["P_2-1","R_1-0"],"partType":"line","current":{"status":"move","bias":{"0":0,"1":0},"wayBackup":[[500,280],[660,280]]},"elementDOM":{"0":{},"length":1}},"5":{"partType":"Port","id":"P_2","rotate":{"0":[1,0],"1":[0,1]},"position":{"0":460,"1":280},"connect":["","line_2"],"input":[],"current":{"status":"move","bias":{"0":460,"1":280}},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"name":"P_2","elementDOM":{"0":{},"length":1}},"6":{"partType":"Port","id":"P_1","rotate":{"0":[1,0],"1":[0,1]},"position":{"0":1020,"1":280},"connect":["line_3",""],"input":[],"current":{"status":"move","bias":{"0":1020,"1":280}},"circle":[{"0":{},"length":1},{"0":{},"length":1}],"name":"P_1","elementDOM":{"0":{},"length":1}}}

const subcircuit1 = {

};

const subcircuit2 = {

};