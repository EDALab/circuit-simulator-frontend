import { $ } from './jquery';

//initial data
const iniData = {
    Series: [
        { partType: 'resistance', id: 'R_1', position: [700, 160], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['1k'] },
        { partType: 'resistance', id: 'R_2', position: [700, 320], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['1k'] },
        { partType: 'reference_ground', id: 'GND_1', position: [500, 420], rotate: [[1, 0], [0, 1]] },
        { partType: 'voltage_meter', id: 'V_R1', position: [780, 160], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'dc_current_source', id: 'V_1', position: [500, 180], rotate: [[1, 0], [0, 1]], text: [20, -2], input: ['10m'] },
        { partType: 'dc_voltage_source', id: 'V_2', position: [500, 300], rotate: [[1, 0], [0, 1]], text: [20, -2], input: ['12'] },
        { partType: 'current_meter', id: 'I_in', position: [600, 100], rotate: [[1, 0], [0, 1]], text: [-9.5, -11] },
        { partType: 'line', way: [[700, 120], [700, 100]] },
        { partType: 'line', way: [[780, 200], [780, 220], [700, 220]] },
        { partType: 'line', way: [[700, 200], [700, 220]] },
        { partType: 'line', way: [[700, 220], [700, 280]] },
        { partType: 'line', way: [[500, 400], [500, 380]] },
        { partType: 'line', way: [[500, 140], [500, 100], [580, 100]] },
        { partType: 'line', way: [[620, 100], [700, 100]] },
        { partType: 'line', way: [[700, 100], [780, 100], [780, 120]] },
        { partType: 'line', way: [[500, 340], [500, 380]] },
        { partType: 'line', way: [[500, 380], [700, 380], [700, 360]] },
        { partType: 'line', way: [[500, 260], [500, 220]] }
    ],
    Bridge: [
        { partType: 'resistance', id: 'R_1', input: ['10k'], position: [460, 180], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_2', input: ['5k'], position: [460, 380], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_3', input: ['1k'], position: [560, 280], rotate: [[1, 0], [0, 1]] },
        { partType: 'resistance', id: 'R_4', input: ['5k'], position: [660, 180], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_5', input: ['10k'], position: [660, 380], rotate: [[0, 1], [-1, 0]] },
        { partType: 'ac_voltage_source', id: 'V_1', input: ['50', '50', '0', '0'], position: [340, 280], rotate: [[1, 0], [0, 1]] },
        { partType: 'voltage_meter', id: 'V_R4', position: [760, 180], rotate: [[1, 0], [0, 1]] },
        { partType: 'current_meter', id: 'I_R4', position: [560, 100], rotate: [[1, 0], [0, 1]] },
        { partType: 'reference_ground', id: 'GND_1', position: [340, 500], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[340, 240], [340, 100], [460, 100]] },
        { partType: 'line', way: [[660, 140], [660, 100]] },
        { partType: 'line', way: [[460, 100], [460, 140]] },
        { partType: 'line', way: [[340, 320], [340, 460]] },
        { partType: 'line', way: [[660, 420], [660, 460], [460, 460]] },
        { partType: 'line', way: [[460, 460], [460, 420]] },
        { partType: 'line', way: [[460, 220], [460, 280]] },
        { partType: 'line', way: [[660, 220], [660, 280]] },
        { partType: 'line', way: [[520, 280], [460, 280]] },
        { partType: 'line', way: [[460, 280], [460, 340]] },
        { partType: 'line', way: [[600, 280], [660, 280]] },
        { partType: 'line', way: [[660, 280], [660, 340]] },
        { partType: 'line', way: [[460, 100], [540, 100]] },
        { partType: 'line', way: [[760, 220], [760, 280], [660, 280]] },
        { partType: 'line', way: [[340, 480], [340, 460]] },
        { partType: 'line', way: [[340, 460], [460, 460]] },
        { partType: 'line', way: [[580, 100], [660, 100]] },
        { partType: 'line', way: [[660, 100], [760, 100], [760, 140]] }
    ],
    FirstOrderCircuitDC: [
        { partType: 'dc_voltage_source', id: 'V_1', position: [180, 280], rotate: [[1, 0], [0, 1]], input: ['10'] },
        { partType: 'resistance', id: 'R_1', position: [340, 200], rotate: [[1, 0], [0, 1]], input: ['1k'] },
        { partType: 'capacitor', id: 'C_1', position: [420, 280], rotate: [[0, 1], [-1, 0]], input: ['1u'] },
        { partType: 'reference_ground', id: 'GND_1', position: [340, 400], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[380, 200], [420, 200]] },
        { partType: 'line', way: [[180, 240], [180, 200], [260, 200]] },
        { partType: 'line', way: [[180, 320], [180, 360], [260, 360]] },
        { partType: 'line', way: [[340, 380], [340, 360]] },
        { partType: 'line', way: [[340, 360], [420, 360]] },
        { partType: 'line', way: [[520, 240], [520, 200], [420, 200]] },
        { partType: 'line', way: [[420, 240], [420, 200]] },
        { partType: 'line', way: [[520, 320], [520, 360], [420, 360]] },
        { partType: 'line', way: [[420, 320], [420, 360]] },
        { partType: 'line', way: [[260, 240], [260, 200]] },
        { partType: 'line', way: [[260, 200], [300, 200]] },
        { partType: 'line', way: [[260, 320], [260, 360]] },
        { partType: 'line', way: [[260, 360], [340, 360]] },
        { partType: 'voltage_meter', id: 'V_in', position: [260, 280], rotate: [[1, 0], [0, 1]] },
        { partType: 'voltage_meter', id: 'V_C1', position: [520, 280], rotate: [[1, 0], [0, 1]] }
    ],
    FirstOrderCircuitAC: [
        { partType: 'resistance', id: 'R_1', position: [340, 200], rotate: [[1, 0], [0, 1]], input: ['200'] },
        { partType: 'capacitor', id: 'C_1', position: [420, 280], rotate: [[0, 1], [-1, 0]], input: ['10u'] },
        { partType: 'reference_ground', id: 'GND_1', position: [340, 400], rotate: [[1, 0], [0, 1]] },
        { partType: 'voltage_meter', id: 'V_in', position: [260, 280], rotate: [[1, 0], [0, 1]] },
        { partType: 'voltage_meter', id: 'V_C1', position: [520, 280], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[380, 200], [420, 200]] },
        { partType: 'line', way: [[340, 380], [340, 360]] },
        { partType: 'line', way: [[340, 360], [420, 360]] },
        { partType: 'line', way: [[520, 240], [520, 200], [420, 200]] },
        { partType: 'line', way: [[420, 240], [420, 200]] },
        { partType: 'line', way: [[520, 320], [520, 360], [420, 360]] },
        { partType: 'line', way: [[420, 320], [420, 360]] },
        { partType: 'line', way: [[260, 240], [260, 200]] },
        { partType: 'line', way: [[260, 320], [260, 360]] },
        { partType: 'ac_voltage_source', id: 'V_1', position: [160, 280], rotate: [[1, 0], [0, 1]], input: ['20', '100', '0', '0'] },
        { partType: 'line', way: [[160, 240], [160, 200], [260, 200]] },
        { partType: 'line', way: [[260, 200], [300, 200]] },
        { partType: 'line', way: [[160, 320], [160, 360], [260, 360]] },
        { partType: 'line', way: [[260, 360], [340, 360]] }
    ],
    BridgeRectifier: [
        { partType: 'diode', id: 'D_1', position: [300, 200], rotate: [[1, 0], [0, 1]], text: [18, 6] },
        { partType: 'diode', id: 'D_2', position: [380, 200], rotate: [[1, 0], [0, 1]], text: [18, 6] },
        { partType: 'diode', id: 'D_3', position: [300, 440], rotate: [[1, 0], [0, 1]], text: [18, 6] },
        { partType: 'diode', id: 'D_4', position: [380, 440], rotate: [[1, 0], [0, 1]], text: [18, 6] },
        { partType: 'ac_voltage_source', id: 'V_1', position: [180, 320], rotate: [[1, 0], [0, 1]], text: [-38, -10], input: ['220', '200', '0', '0'] },
        { partType: 'capacitor', id: 'C_1', position: [500, 320], rotate: [[0, 1], [-1, 0]], text: [-36, -2], input: ['100u'] },
        { partType: 'resistance', id: 'R_1', position: [560, 320], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['2k'] },
        { partType: 'current_meter', id: 'I_out', position: [440, 140], rotate: [[1, 0], [0, 1]], text: [-12, -11] },
        { partType: 'voltage_meter', id: 'V_out', position: [640, 320], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'voltage_meter', id: 'V_in', position: [240, 320], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'reference_ground', id: 'GND_1', position: [300, 540], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[180, 280], [180, 260], [240, 260]] },
        { partType: 'line', way: [[180, 360], [180, 380], [240, 380]] },
        { partType: 'line', way: [[300, 160], [300, 140], [380, 140]] },
        { partType: 'line', way: [[640, 280], [640, 140], [560, 140]] },
        { partType: 'line', way: [[640, 360], [640, 500], [560, 500]] },
        { partType: 'line', way: [[380, 240], [380, 380]] },
        { partType: 'line', way: [[380, 380], [380, 400]] },
        { partType: 'line', way: [[300, 400], [300, 260]] },
        { partType: 'line', way: [[300, 260], [300, 240]] },
        { partType: 'line', way: [[560, 280], [560, 140]] },
        { partType: 'line', way: [[380, 480], [380, 500]] },
        { partType: 'line', way: [[300, 480], [300, 500]] },
        { partType: 'line', way: [[380, 500], [500, 500]] },
        { partType: 'line', way: [[560, 360], [560, 500]] },
        { partType: 'line', way: [[500, 360], [500, 500]] },
        { partType: 'line', way: [[460, 140], [500, 140]] },
        { partType: 'line', way: [[500, 280], [500, 140]] },
        { partType: 'line', way: [[420, 140], [380, 140]] },
        { partType: 'line', way: [[380, 140], [380, 160]] },
        { partType: 'line', way: [[560, 140], [500, 140]] },
        { partType: 'line', way: [[560, 500], [500, 500]] },
        { partType: 'line', way: [[240, 280], [240, 260]] },
        { partType: 'line', way: [[240, 260], [300, 260]] },
        { partType: 'line', way: [[240, 360], [240, 380]] },
        { partType: 'line', way: [[240, 380], [380, 380]] },
        { partType: 'line', way: [[300, 520], [300, 500]] },
        { partType: 'line', way: [[300, 500], [380, 500]] }
    ],
    halfWaveRectifier: [
        { partType: 'ac_voltage_source', id: 'V_1', position: [180, 220], rotate: [[1, 0], [0, 1]], text: [-38, -10], input: ['20', '200', '0', '0'] },
        { partType: 'diode', id: 'D_1', position: [280, 140], rotate: [[0, 1], [-1, 0]], text: [-11.5, -18] },
        { partType: 'resistance', id: 'R_1', position: [460, 220], rotate: [[0, 1], [-1, 0]], text: [-30, -2], input: ['100'] },
        { partType: 'line', way: [[180, 180], [180, 140], [240, 140]] },
        { partType: 'line', way: [[320, 140], [380, 140]] },
        { partType: 'line', way: [[420, 140], [460, 140]] },
        { partType: 'line', way: [[520, 180], [520, 140], [460, 140]] },
        { partType: 'line', way: [[460, 140], [460, 180]] },
        { partType: 'line', way: [[180, 260], [180, 300], [320, 300]] },
        { partType: 'reference_ground', id: 'GND_1', position: [320, 340], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[320, 320], [320, 300]] },
        { partType: 'line', way: [[320, 300], [460, 300]] },
        { partType: 'line', way: [[520, 260], [520, 300], [460, 300]] },
        { partType: 'line', way: [[460, 300], [460, 260]] },
        { partType: 'current_meter', id: 'I_out', position: [400, 140], rotate: [[1, 0], [0, 1]], text: [-12, -11] },
        { partType: 'voltage_meter', id: 'V_out', position: [520, 220], rotate: [[1, 0], [0, 1]], text: [24, 6] }
    ],
    PhaseAmplifier: [
        { partType: 'ac_voltage_source', id: 'V_1', position: [260, 240], rotate: [[0, 1], [-1, 0]], text: [-7, 34], input: ['10', '200', '0', '0'] },
        { partType: 'operational_amplifier', id: 'OP_1', position: [500, 220], rotate: [[1, 0], [0, 1]], text: [-11.5, 0], input: ['120', '80M', '40'] },
        { partType: 'resistance', id: 'R_1', position: [380, 240], rotate: [[1, 0], [0, 1]], text: [-7, 26], input: ['10k'] },
        { partType: 'reference_ground', id: 'GND_1', position: [160, 240], rotate: [[0, 1], [-1, 0]] },
        { partType: 'voltage_meter', id: 'V_in', position: [320, 320], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'reference_ground', id: 'GND_2', position: [320, 420], rotate: [[1, 0], [0, 1]] },
        { partType: 'resistance', id: 'R_2', position: [500, 140], rotate: [[1, 0], [0, 1]], text: [-7, -32], input: ['10k'] },
        { partType: 'resistance', id: 'R_3', position: [380, 200], rotate: [[1, 0], [0, 1]], text: [-7, -32], input: ['10k'] },
        { partType: 'reference_ground', id: 'GND_3', position: [300, 200], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_4', position: [560, 320], rotate: [[0, 1], [-1, 0]], text: [-30, -2], input: ['10k'] },
        { partType: 'voltage_meter', id: 'V_out', position: [620, 320], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'line', way: [[180, 240], [220, 240]] },
        { partType: 'line', way: [[340, 240], [320, 240]] },
        { partType: 'line', way: [[460, 240], [420, 240]] },
        { partType: 'line', way: [[320, 280], [320, 240]] },
        { partType: 'line', way: [[320, 240], [300, 240]] },
        { partType: 'line', way: [[320, 400], [320, 380]] },
        { partType: 'line', way: [[340, 200], [320, 200]] },
        { partType: 'line', way: [[460, 200], [440, 200]] },
        { partType: 'line', way: [[460, 140], [440, 140], [440, 200]] },
        { partType: 'line', way: [[440, 200], [420, 200]] },
        { partType: 'line', way: [[540, 140], [560, 140], [560, 220]] },
        { partType: 'line', way: [[560, 280], [560, 220]] },
        { partType: 'line', way: [[560, 220], [540, 220]] },
        { partType: 'line', way: [[560, 360], [560, 380]] },
        { partType: 'line', way: [[320, 380], [320, 360]] },
        { partType: 'line', way: [[620, 280], [620, 220], [560, 220]] },
        { partType: 'line', way: [[620, 360], [620, 380], [560, 380]] },
        { partType: 'line', way: [[560, 380], [320, 380]] }
    ],
    currentAmplifier: [
        { partType: 'dc_voltage_source', id: 'V_1', position: [180, 280], rotate: [[0, 1], [-1, 0]], text: [-7, -36], input: ['10'] },
        { partType: 'resistance', id: 'R_1', position: [300, 280], rotate: [[1, 0], [0, 1]], text: [-7, -32], input: ['10k'] },
        { partType: 'transistor_npn', id: 'Q_1', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'transistor_pnp', id: 'Q_2', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'n_MOSFET', id: 'Q_3', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'p_MOSFET', id: 'Q_3', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'reference_ground', id: 'GND_1', position: [100, 280], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_2', position: [500, 400], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['100'] },
        { partType: 'line', way: [[120, 280], [140, 280]] },
        { partType: 'line', way: [[220, 280], [240, 280]] },
        { partType: 'line', way: [[500, 360], [500, 320]] },
        { partType: 'line', way: [[420, 280], [460, 280]] },
        { partType: 'line', way: [[380, 280], [340, 280]] },
        { partType: 'current_meter', id: 'I_in', position: [400, 280], rotate: [[1, 0], [0, 1]], text: [-9.5, -11] },
        { partType: 'current_meter', id: 'I_ap', position: [340, 200], rotate: [[1, 0], [0, 1]], text: [-9.5, -11] },
        { partType: 'line', way: [[360, 200], [500, 200], [500, 240]] },
        { partType: 'line', way: [[320, 200], [240, 200], [240, 280]] },
        { partType: 'line', way: [[240, 280], [260, 280]] },
        { partType: 'reference_ground', id: 'GND_2', position: [500, 480], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[500, 440], [500, 460]] }
    ],
    CommonEmitterAmplifier: [
        { partType: 'config', endtime: '50m', stepsize: '10u' },
        { partType: 'dc_voltage_source', id: 'V_1', position: [220, 100], rotate: [[0, 1], [-1, 0]], text: [-7, -36], input: ['20'] },
        { partType: 'reference_ground', id: 'GND_1', position: [140, 100], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_1', position: [300, 180], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['100k'] },
        { partType: 'resistance', id: 'R_2', position: [300, 380], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['100k'] },
        { partType: 'resistance', id: 'R_3', position: [400, 160], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['10k'] },
        { partType: 'resistance', id: 'R_4', position: [400, 400], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['2k'] },
        { partType: 'transistor_npn', id: 'Q_1', position: [380, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'transistor_pnp', id: 'Q_2', position: [380, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'n_MOSFET', id: 'Q_3', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'p_MOSFET', id: 'Q_3', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'resistance', id: 'R_5', position: [600, 340], rotate: [[0, 1], [-1, 0]], text: [-30, -2], input: ['1M'] },
        { partType: 'capacitor', id: 'C_1', position: [500, 220], rotate: [[1, 0], [0, 1]], text: [-7, 32], input: ['10n'] },
        { partType: 'capacitor', id: 'C_2', position: [240, 280], rotate: [[1, 0], [0, 1]], text: [-7, -38], input: ['10μ'] },
        { partType: 'ac_voltage_source', id: 'V_2', position: [120, 360], rotate: [[1, 0], [0, 1]], text: [-38, -10], input: ['3', '300', '0', '0'] },
        { partType: 'voltage_meter', id: 'V_in', position: [180, 360], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'voltage_meter', id: 'V_out', position: [660, 340], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'reference_ground', id: 'GND_2', position: [120, 500], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[160, 100], [180, 100]] },
        { partType: 'line', way: [[260, 100], [300, 100]] },
        { partType: 'line', way: [[400, 120], [400, 100], [300, 100]] },
        { partType: 'line', way: [[300, 140], [300, 100]] },
        { partType: 'line', way: [[400, 240], [400, 220]] },
        { partType: 'line', way: [[400, 320], [400, 360]] },
        { partType: 'line', way: [[300, 220], [300, 280]] },
        { partType: 'line', way: [[300, 340], [300, 280]] },
        { partType: 'line', way: [[300, 280], [360, 280]] },
        { partType: 'line', way: [[540, 220], [600, 220]] },
        { partType: 'line', way: [[660, 300], [660, 220], [600, 220]] },
        { partType: 'line', way: [[600, 220], [600, 300]] },
        { partType: 'line', way: [[460, 220], [400, 220]] },
        { partType: 'line', way: [[400, 220], [400, 200]] },
        { partType: 'line', way: [[280, 280], [300, 280]] },
        { partType: 'line', way: [[180, 320], [180, 280]] },
        { partType: 'line', way: [[120, 320], [120, 280], [180, 280]] },
        { partType: 'line', way: [[180, 280], [200, 280]] },
        { partType: 'line', way: [[120, 480], [120, 460]] },
        { partType: 'line', way: [[180, 400], [180, 460]] },
        { partType: 'line', way: [[120, 400], [120, 460]] },
        { partType: 'line', way: [[300, 420], [300, 460]] },
        { partType: 'line', way: [[180, 460], [120, 460]] },
        { partType: 'line', way: [[400, 440], [400, 460]] },
        { partType: 'line', way: [[300, 460], [180, 460]] },
        { partType: 'line', way: [[600, 380], [600, 460]] },
        { partType: 'line', way: [[400, 460], [300, 460]] },
        { partType: 'line', way: [[660, 380], [660, 460], [600, 460]] },
        { partType: 'line', way: [[600, 460], [400, 460]] }
    ],
    EmitterFollower: [
        { partType: 'config', endtime: '20m', stepsize: '2u' },
        { partType: 'dc_voltage_source', id: 'V_1', position: [220, 100], rotate: [[0, 1], [-1, 0]], text: [-7, -36], input: ['20'] },
        { partType: 'reference_ground', id: 'GND_1', position: [140, 100], rotate: [[0, 1], [-1, 0]] },
        { partType: 'resistance', id: 'R_1', position: [300, 180], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['10k'] },
        { partType: 'resistance', id: 'R_2', position: [300, 380], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['10k'] },
        { partType: 'resistance', id: 'R_4', position: [400, 400], rotate: [[0, 1], [-1, 0]], text: [16, -2], input: ['680'] },
        { partType: 'transistor_npn', id: 'Q_1', position: [380, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'transistor_pnp', id: 'Q_2', position: [380, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'n_MOSFET', id: 'Q_3', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'p_MOSFET', id: 'Q_3', position: [480, 280], rotate: [[1, 0], [0, 1]], text: [25, 6], input: ['40', '26', '0.6', '1'] },
        { partType: 'resistance', id: 'R_5', position: [600, 400], rotate: [[0, 1], [-1, 0]], text: [-30, -2], input: ['100k'] },
        { partType: 'capacitor', id: 'C_1', position: [500, 340], rotate: [[1, 0], [0, 1]], text: [-7, -38], input: ['10n'] },
        { partType: 'capacitor', id: 'C_2', position: [240, 280], rotate: [[1, 0], [0, 1]], text: [-7, -38], input: ['10μ'] },
        { partType: 'ac_voltage_source', id: 'V_2', position: [120, 360], rotate: [[1, 0], [0, 1]], text: [-38, -10], input: ['3', '1k', '0', '0'] },
        { partType: 'voltage_meter', id: 'V_in', position: [180, 360], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'voltage_meter', id: 'V_out', position: [660, 400], rotate: [[1, 0], [0, 1]], text: [24, 6] },
        { partType: 'reference_ground', id: 'GND_2', position: [120, 500], rotate: [[1, 0], [0, 1]] },
        { partType: 'line', way: [[160, 100], [180, 100]] },
        { partType: 'line', way: [[260, 100], [300, 100]] },
        { partType: 'line', way: [[400, 320], [400, 340]] },
        { partType: 'line', way: [[300, 220], [300, 280]] },
        { partType: 'line', way: [[300, 340], [300, 280]] },
        { partType: 'line', way: [[300, 280], [360, 280]] },
        { partType: 'line', way: [[280, 280], [300, 280]] },
        { partType: 'line', way: [[180, 320], [180, 280]] },
        { partType: 'line', way: [[120, 320], [120, 280], [180, 280]] },
        { partType: 'line', way: [[180, 280], [200, 280]] },
        { partType: 'line', way: [[120, 480], [120, 460]] },
        { partType: 'line', way: [[180, 400], [180, 460]] },
        { partType: 'line', way: [[120, 400], [120, 460]] },
        { partType: 'line', way: [[300, 420], [300, 460]] },
        { partType: 'line', way: [[180, 460], [120, 460]] },
        { partType: 'line', way: [[400, 440], [400, 460]] },
        { partType: 'line', way: [[300, 460], [180, 460]] },
        { partType: 'line', way: [[600, 440], [600, 460]] },
        { partType: 'line', way: [[400, 460], [300, 460]] },
        { partType: 'line', way: [[660, 440], [660, 460], [600, 460]] },
        { partType: 'line', way: [[600, 460], [400, 460]] },
        { partType: 'line', way: [[400, 240], [400, 100], [300, 100]] },
        { partType: 'line', way: [[300, 100], [300, 140]] },
        { partType: 'line', way: [[540, 340], [600, 340]] },
        { partType: 'line', way: [[660, 360], [660, 340], [600, 340]] },
        { partType: 'line', way: [[600, 340], [600, 360]] },
        { partType: 'line', way: [[460, 340], [400, 340]] },
        { partType: 'line', way: [[400, 340], [400, 360]] }
    ]
};
//SVG naming space
const SVG_NS = 'http://www.w3.org/2000/svg';

//Extend the object, add all the attributes of fromObj to this (not copy)
//The prototype chain of this and fromObj does not change
//Non-enumerable attributes are not added, __proto__ internal attributes are not added
//Existing extended attributes will overwrite the original attributes
Object.prototype.extend = function (fromObj) {
    //Input is not an object, return directly
    if (!(fromObj instanceof Object)) {
        return (this);
    }
    for (const i in fromObj) {
        if (fromObj.hasOwnProperty(i)) {
            this[i] = fromObj[i];
        }
    }
    return (this);
};
Object.prototype.extend({
    //Whether objects are equal
    isEqual(obj) {
        const thisKeys = Object.keys(this),
            fromKeys = Object.keys(obj);

        if (!thisKeys.isEqual(fromKeys)) {
            return (false);
        }

        for (let i = 0; i < thisKeys.length; i++) {
            if (this[thisKeys[i]] instanceof Object) {
                if (!this[thisKeys[i]].isEqual(obj[thisKeys[i]])) {
                    return (false);
                }
            } else {
                if (this[thisKeys[i]] !== obj[thisKeys[i]]) {
                    return (false);
                }
            }
        }
        return (true);
    }
});
//Native object extension
Array.extend({
    //Array deep copy, need to avoid circular references
    clone(arr, factor = 1) {
        const ans = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] instanceof Array) {
                ans[i] = Array.clone(arr[i], factor);
            } else if (arr[i] instanceof Object) {
                ans[i] = Object.clone(arr[i]);
            } else if (typeof arr[i] === 'number') {
                ans[i] = arr[i] * factor;
            } else {
                ans[i] = arr[i];
            }
        }
        return (ans);
    }
});
Array.prototype.extend({
    //Are the arrays equal
    isEqual(b) {
        if (!b) {
            return (false);
        }
        if (this.length !== b.length) {
            return (false);
        }
        for (let i = 0; i < this.length; i++) {
            if (this[i] instanceof Object) {
                if (!this[i].isEqual(b[i])) {
                    return (false);
                }
            } else {
                if (this[i] !== b[i]) {
                    return (false);
                }
            }
        }
        return (true);
    },
    //Take out the element whose index is index
    get(index) {
        const sub = (index >= 0) ?
            index : (this.length + index);

        if (index >= 0 || index < this.length) {
            return (this[sub]);
        } else {
            return (false);
        }
    }
});
Object.extend({
    //Deep copy objects, need to avoid circular references
    clone(fromObj) {
        const toObj = {};
        for (const i in fromObj) {
            if (fromObj.hasOwnProperty(i)) {
                if (fromObj[i] instanceof Array) {
                    toObj[i] = Array.clone(fromObj[i]);
                } else if (fromObj[i] instanceof Object) {
                    toObj[i] = Object.clone(fromObj[i]);
                } else {
                    toObj[i] = fromObj[i];
                }
            }
        }
        Object.setPrototypeOf(toObj, Object.getPrototypeOf(fromObj));
        return (toObj);
    },
    //Whether the object is empty
    isEmpty(fromObj) {
        for (const i in fromObj) {
            if (fromObj.hasOwnProperty(i)) {
                return (false);
            }
        }
        return (true);
    },
    //Freeze the current object and all objects under the current object
    freezeAll(obj) {
        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (typeof obj[i] === 'object') {
                    Object.freezeAll(obj[i]);
                }
            }
        }
        Object.freeze(obj);
    },
    //Adjust all enumerable attributes of the current object to hidden and read-only
    freezeMethod(obj) {
        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                Object.defineProperty(obj, i, {
                    configurable: false,
                    writable: false,
                    enumerable: false
                });
            }
        }
    },
    //Enclose the current object and all object properties of the current object
    sealAll(obj) {
        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (typeof obj[i] === 'object') {
                    Object.sealAll(obj[i]);
                }
            }
        }
        Object.seal(obj);
    }
});
Math.extend({
    //Maximum value of the array
    maxOfArray(arr) {
        let ans = -Infinity;
        for (let i = 0; i < arr.length; i++) {
            const num = Number(arr[i]);
            if (!Number.isNaN(num) && num > ans) {
                ans = num;
            }
        }
        return (ans);
    },
    //Minimum value of array
    minOfArray(arr) {
        let ans = Infinity;
        for (let i = 0; i < arr.length; i++) {
            const num = Number(arr[i]);
            if (!Number.isNaN(num) && num < ans) {
                ans = num;
            }
        }
        return (ans);
    },
    //Find the average
    average(arr) {
        let ans = 0;
        for (let i = 0; i < arr.length; i++) {
            ans += arr[i];
        }
        return (ans /= arr.length);
    }
});
Number.prototype.extend({
    // Keep valid numbers, default 6 valid numbers
    toSFixed(rank = 6) {
        const num = this.valueOf();
        if (!num) {
            return (0);
        }

        const sign = num / Math.abs(num),
            number = num * sign,
            index = rank - 1 - Math.floor(Math.log10(number));

        let ans;
        if (index > 0) {
            ans = parseFloat(number.toFixed(index));
        } else if (index < 0) {
            const temp = Math.pow(10, index);
            ans = Math.round(number / temp) * temp;
        } else {
            ans = Math.round(number);
        }
        return (ans * sign);
    },
    // Numbers are converted to abbreviated strings, and 6 significant digits are reserved by default
    // When the number is less than 10^-12 and greater than 10^9, 6 decimal places are retained
    toShort(save = 6) {
        const number = this.valueOf();
        if (!number) {
            return ('0');
        }

        const sign = number / Math.abs(number),
            unitS = ['m', 'μ', 'n', 'p'],
            unitL = ['k', 'M', 'G'];

        let sub = -1, ans = 0, rank = 1,
            uint = number * sign;

        while (uint < 1) {
            rank *= 1000;
            uint *= 1000;
            sub++;
            if (uint > 1 || sub === 3) {
                ans = (sign * uint).toSFixed(save);
                return ({
                    rank,
                    number: ans,
                    unit: unitS[sub],
                    txt: ans + unitS[sub]
                });
            }
        }
        while (uint > 1000) {
            rank *= 0.001;
            uint *= 0.001;
            sub++;
            if (uint < 1000 || sub === 2) {
                ans = (sign * uint).toSFixed(save);
                return ({
                    rank,
                    number: ans,
                    unit: unitL[sub],
                    txt: ans + unitL[sub]
                });
            }
        }
        return ({
            rank: 1,
            unit: '',
            number: number.toSFixed(save),
            txt: number.toSFixed(save).toString()
        });
    },
    // Magnitude
    rank() {
        const number = this.valueOf();
        if (!number) {
            return (0);
        }

        const sign = number / Math.abs(number);
        return (Math.pow(10, Math.floor(Math.log10(number * sign))));
    },
    // How many digits
    powRank() {
        const number = this.valueOf();
        if (!number) {
            return (0);
        }

        const sign = number / Math.abs(number);
        return (Math.floor(Math.log10(number * sign))) + 1;
    },
    // Unitization
    toUnit() {
        const number = this.valueOf();

        if (number > 0) {
            return (1);
        } else if (number < 0) {
            return (-1);
        } else {
            return (0);
        }
    }
});
String.prototype.extend({
    // Convert to real value
    toVal() {
        const hash = {
            G: 1e9, M: 1e6, k: 1e3,
            m: 1e-3, u: 1e-6, n: 1e-9, p: 1e-12
        };

        if (this.search(/[dD][bB]$/) !== -1) {
            //db conversion
            return (Math.pow(10, parseFloat(this) / 20));
        } else if (this.search(/^update/) !== -1) {
            //There is update keyword, the string remains as it is
            return this;
        }

        const input = this.replace('μ', 'u'),
            number = parseFloat(input.match(/\d+(.\d+)?/)[0]),
            unit = input.match(/[GMkmunp]/),
            rank = unit ? hash[unit[0]] : 1;

        return ((number * rank).toSFixed());
    }
});

//Modify some methods as hidden and unmodifiable
Object.freezeMethod(Array);
Object.freezeMethod(Object);
Object.freezeMethod(Object.prototype);
Object.freezeMethod(Number.prototype);
Object.freezeMethod(String.prototype);

//Right-click and select on webpages are prohibited
window.document.oncontextmenu = function () { return (false); };

//Add bottom right icon
$('#action-container .fab').each((n) => {
    //Icon style
    const icon = {
        'run': {
            'long': 1580,
            'transform': [86, 100],
            'd': 'M1384 609l-1328 -738q-23 -13 -39.5 -3t-16.5 36v1472q0 26 ' +
                '16.5 36t39.5 -3l1328 -738q23 -13 23 -31t-23 -31z'
        },
        'adds': {
            'long': 1408,
            'transform': [0, 0],
            'd': 'M1408 800v-192q0 -40 -28 -68t-68 -28h-416v-416q0 -40 -28 ' +
                '-68t-68 -28h-192q-40 0 -68 28t-28 68v416h-416q-40 0 -68 28t-28 ' +
                '68v192q0 40 28 68t68 28h416v416q0 40 28 68t68 28h192q40 0 68 ' +
                '-28t28 -68v-416h416q40 0 68 -28t28 -68z'
        },
        'config': {
            'long': 1920,
            'transform': [-30, 200],
            'd': 'M896 640q0 106 -75 181t-181 75t-181 -75t-75 -181t75 -181t181 -75t181 ' +
                '75t75 181zM1664 128q0 52 -38 90t-90 38t-90 -38t-38 -90q0 -53 37.5 ' +
                '-90.5t90.5 -37.5t90.5 37.5t37.5 90.5zM1664 1152q0 52 -38 90t-90 38t-90 ' +
                '-38t-38 -90q0 -53 37.5 -90.5t90.5 -37.5 t90.5 37.5t37.5 90.5zM1280 731v-185q0 ' +
                '-10 -7 -19.5t-16 -10.5l-155 -24q-11 -35 -32 -76q34 -48 90 -115q7 -10 7 -20q0 ' +
                '-12 -7 -19q-23 -30 -82.5 -89.5t-78.5 -59.5q-11 0 -21 7l-115 90q-37 -19 -77 -31q-11 ' +
                '-108 -23 -155q-7 -24 -30 -24h-186q-11 0 -20 7.5t-10 17.5 l-23 153q-34 10 -75 ' +
                '31l-118 -89q-7 -7 -20 -7q-11 0 -21 8q-144 133 -144 160q0 9 7 19q10 14 41 53t47 ' +
                '61q-23 44 -35 82l-152 24q-10 1 -17 9.5t-7 19.5v185q0 10 7 19.5t16 10.5l155 24q11 ' +
                '35 32 76q-34 48 -90 115q-7 11 -7 20q0 12 7 20q22 30 82 89t79 59q11 0 21 -7 l115 ' +
                '-90q34 18 77 32q11 108 23 154q7 24 30 24h186q11 0 20 -7.5t10 -17.5l23 -153q34 -10 ' +
                '75 -31l118 89q8 7 20 7q11 0 21 -8q144 -133 144 -160q0 -9 -7 -19q-12 -16 -42 -54t-45 ' +
                '-60q23 -48 34 -82l152 -23q10 -2 17 -10.5t7 -19.5zM1920 198v-140q0 -16 -149 -31 q-12 -27 ' +
                '-30 -52q51 -113 51 -138q0 -4 -4 -7q-122 -71 -124 -71q-8 0 -46 47t-52 68q-20 -2 -30 -2t-30 ' +
                '2q-14 -21 -52 -68t-46 -47q-2 0 -124 71q-4 3 -4 7q0 25 51 138q-18 25 -30 52q-149 15 -149 ' +
                '31v140q0 16 149 31q13 29 30 52q-51 113 -51 138q0 4 4 7q4 2 35 20 t59 34t30 16q8 0 46 ' +
                '-46.5t52 -67.5q20 2 30 2t30 -2q51 71 92 112l6 2q4 0 124 -70q4 -3 4 -7q0 -25 -51 -138q17 ' +
                '-23 30 -52q149 -15 149 -31zM1920 1222v-140q0 -16 -149 -31q-12 -27 -30 -52q51 -113 51 -138q0 ' +
                '-4 -4 -7q-122 -71 -124 -71q-8 0 -46 47t-52 68 q-20 -2 -30 -2t-30 2q-14 -21 -52 -68t-46 -47q-2 ' +
                '0 -124 71q-4 3 -4 7q0 25 51 138q-18 25 -30 52q-149 15 -149 31v140q0 16 149 31q13 29 30 52q-51 113 ' +
                '-51 138q0 4 4 7q4 2 35 20t59 34t30 16q8 0 46 -46.5t52 -67.5q20 2 30 2t30 -2q51 71 92 112l6 2q4 ' +
                '0 124 -70 q4 -3 4 -7q0 -25 -51 -138q17 -23 30 -52q149 -15 149 -31z'
        },
        'staticOutput': {
            'long': 1920,
            'transform': [-80, 280],
            'd': "M 1263.643 996.167 L 1263.643 166.167 A 162.481 162.481 0 0 1 1276.611 101.728 A 162.204 162.204 0 0 1 1312.275 49.043 Q 1334.971 26.753 1365.366 13.379 A 158.24 158.24 0 0 1 1429.805 0.005 L 2060.41 0.005 A 158.24 158.24 0 0 1 2124.849 13.379 A 176.327 176.327 0 0 1 2177.939 49.043 Q 2200.635 71.333 2213.604 101.728 A 162.481 162.481 0 0 1 2226.572 166.167 L 2226.572 316.118 L 2060.41 316.118 L 2060.41 166.167 L 1429.805 166.167 L 1429.805 996.167 L 2060.41 996.167 L 2060.41 847.026 L 2226.572 847.026 L 2226.572 996.167 A 162.481 162.481 0 0 1 2213.604 1060.605 A 166.908 166.908 0 0 1 2177.939 1113.696 A 166.908 166.908 0 0 1 2124.849 1149.36 Q 2094.453 1162.329 2060.41 1162.329 L 1429.805 1162.329 A 162.481 162.481 0 0 1 1365.366 1149.36 A 166.908 166.908 0 0 1 1312.275 1113.696 A 166.908 166.908 0 0 1 1276.611 1060.605 A 162.481 162.481 0 0 1 1263.643 996.167 Z M 590.889 1162.329 L 0 1162.329 L 0 0.005 L 590.889 0.005 A 521.132 521.132 0 0 1 684.78 8.126 A 415.802 415.802 0 0 1 759.077 28.779 A 370.399 370.399 0 0 1 861.055 87.094 A 343.909 343.909 0 0 1 887.144 110.644 A 356.576 356.576 0 0 1 962.913 224.034 A 415.182 415.182 0 0 1 969.009 239.116 A 436.72 436.72 0 0 1 994.685 348.093 A 543.806 543.806 0 0 1 997.783 406.899 L 997.783 755.434 A 513.331 513.331 0 0 1 988.679 854.001 A 419.065 419.065 0 0 1 969.009 923.218 Q 940.234 998.598 887.144 1051.689 Q 834.053 1104.78 759.077 1133.555 A 430.146 430.146 0 0 1 655.53 1158.613 A 545.457 545.457 0 0 1 590.889 1162.329 Z M 166.162 996.167 L 590.889 996.167 A 345.065 345.065 0 0 0 661.194 989.447 Q 704.302 980.471 737.134 959.506 A 189.285 189.285 0 0 0 769.209 933.755 A 202.196 202.196 0 0 0 820.41 844.075 Q 829.519 811.969 831.227 773.519 A 407.569 407.569 0 0 0 831.621 755.434 L 831.621 406.899 Q 831.621 350.161 815.41 305.581 A 210.654 210.654 0 0 0 784.36 248.406 A 193.447 193.447 0 0 0 767.993 229.795 A 201.555 201.555 0 0 0 701.124 185.825 A 235.585 235.585 0 0 0 692.207 182.378 A 263.663 263.663 0 0 0 636.598 169.052 A 347.992 347.992 0 0 0 590.889 166.167 L 166.162 166.167 L 166.162 996.167 Z"
        },
        'quickMeasure': {
            'long': 1920,
            'transform': [-140, 280],
            'd': "M 1873.44 1120.314 L 1825.783 1120.314 L 1407.815 299.221 L 1407.815 1120.314 L 1247.658 1120.314 L 1247.658 0.002 L 1422.658 0.002 L 1849.221 843.752 L 2276.565 0.002 L 2450.783 0.002 L 2450.783 1120.314 L 2291.408 1120.314 L 2291.408 299.221 L 1873.44 1120.314 Z M 960.158 160.158 L 960.158 960.158 Q 960.158 992.971 947.658 1022.267 Q 935.158 1051.564 913.283 1073.439 Q 891.408 1095.314 862.111 1107.814 Q 832.815 1120.314 800.002 1120.314 L 560.158 1120.314 L 560.158 1328.127 L 400.002 1328.127 L 400.002 1120.314 L 160.158 1120.314 Q 127.346 1120.314 98.049 1107.814 Q 68.752 1095.314 46.877 1073.439 Q 25.002 1051.564 12.502 1022.267 Q 0.002 992.971 0.002 960.158 L 0.002 160.158 Q 0.002 127.346 12.502 98.049 Q 25.002 68.752 46.877 47.267 A 169.953 169.953 0 0 1 98.049 12.892 Q 127.346 0.002 160.158 0.002 L 800.002 0.002 Q 832.815 0.002 862.111 12.892 A 169.953 169.953 0 0 1 913.283 47.267 Q 935.158 68.752 947.658 98.049 Q 960.158 127.346 960.158 160.158 Z M 400.002 830.471 L 560.158 830.471 L 560.158 960.158 L 800.002 960.158 L 800.002 160.158 L 160.158 160.158 L 160.158 960.158 L 400.002 960.158 L 400.002 830.471 Z"
        },
        'acOutput': {
            'long': 1920,
            'transform': [-80, 280],
            'd': "M 1216.406 960.158 L 1216.406 160.158 Q 1216.406 127.346 1228.906 98.049 Q 1241.406 68.752 1263.281 47.267 A 169.953 169.953 0 0 1 1314.453 12.892 Q 1343.75 0.002 1376.563 0.002 L 1984.375 0.002 Q 2017.188 0.002 2046.484 12.892 A 169.953 169.953 0 0 1 2097.656 47.267 Q 2119.531 68.752 2132.031 98.049 Q 2144.531 127.346 2144.531 160.158 L 2144.531 304.689 L 1984.375 304.689 L 1984.375 160.158 L 1376.563 160.158 L 1376.563 960.158 L 1984.375 960.158 L 1984.375 816.408 L 2144.531 816.408 L 2144.531 960.158 Q 2144.531 992.971 2132.031 1022.267 Q 2119.531 1051.564 2097.656 1073.439 Q 2075.781 1095.314 2046.484 1107.814 Q 2017.188 1120.314 1984.375 1120.314 L 1376.563 1120.314 Q 1343.75 1120.314 1314.453 1107.814 Q 1285.156 1095.314 1263.281 1073.439 Q 1241.406 1051.564 1228.906 1022.267 Q 1216.406 992.971 1216.406 960.158 Z M 432.031 0.002 L 592.188 0.002 L 1024.219 1120.314 L 864.063 1120.314 L 764.844 862.502 L 259.375 862.502 L 160.156 1120.314 L 0 1120.314 L 432.031 0.002 Z M 512.5 208.596 L 320.313 702.346 L 703.125 702.346 L 512.5 208.596 Z"
        }
    };
    //Basic parameters
    const elem = $(n),
        id = elem.attr('id').split('-')[1],
        zoom = 0.6, view = icon[id] && icon[id].long;

    //Skip text
    if (id === 'text') {
        return;
    }

    elem.append($('<svg>', SVG_NS, {
        'viewBox': '0 0 ' + view + ' ' + view
    })).append($('<g>', SVG_NS, {
        'transform': 'translate(' + (icon[id]['transform'][0] + (1 - zoom) / 2 * view) +
            ', ' + (icon[id]['transform'][1] + (1 - zoom) / 2 * view) + ')' +
            ' scale(' + zoom + ', ' + zoom + ')'
    })).append($('<path>', SVG_NS, {
        'd': icon[id]['d']
    }));
});

//Add quick measurement button
$('#qmRun .fab-rect').each((n) => {
    //Icon style
    const icon = {
        'qmrun': {
            'long': 1580,
            'transform': [86, 100],
            'd': 'M1384 609l-1328 -738q-23 -13 -39.5 -3t-16.5 36v1472q0 26 ' +
                '16.5 36t39.5 -3l1328 -738q23 -13 23 -31t-23 -31z'
        },
    };
    //Basic parameters
    const elem = $(n),
        id = elem.attr('id').split('-')[1],
        zoom = 0.6, view = icon[id] && icon[id].long;

    //Skip text
    if (id === 'text') {
        return;
    }

    elem.append($('<svg>', SVG_NS, {
        'viewBox': '0 0 ' + view + ' ' + view
    })).append($('<g>', SVG_NS, {
        'transform': 'translate(' + (icon[id]['transform'][0] + (1 - zoom) / 2 * view) +
            ', ' + (icon[id]['transform'][1] + (1 - zoom) / 2 * view) + ')' +
            ' scale(' + zoom + ', ' + zoom + ')'
    })).append($('<path>', SVG_NS, {
        'd': icon[id]['d']
    }));
});

export { iniData, SVG_NS };
