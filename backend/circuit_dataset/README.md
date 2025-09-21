# Circuit Component Dataset

This dataset contains labeled circuit components for training YOLO models.

## Structure
- `images/train/` - Training images
- `images/val/` - Validation images  
- `images/test/` - Test images
- `labels/train/` - Training labels (YOLO format)
- `labels/val/` - Validation labels (YOLO format)
- `labels/test/` - Test labels (YOLO format)

## Label Format
YOLO format: `class_id center_x center_y width height`
- All values normalized to [0, 1]
- class_id corresponds to circuit component classes

## Circuit Component Classes
0: resistor (R)
1: capacitor_polarized (C+)
2: capacitor_unpolarized (C)
3: inductor (L)
4: diode (D)
5: led (LED)
6: transistor_npn (Q)
7: transistor_pnp (Q)
8: ic_dip (IC)
9: op_amp (OpAmp)
10: microcontroller (MCU)
11: and_gate (AND)
12: or_gate (OR)
13: not_gate (NOT)
14: nand_gate (NAND)
15: nor_gate (NOR)
16: xor_gate (XOR)
17: voltage_source (V)
18: current_source (I)
19: ground (GND)
20: vcc (VCC)
21: wire (—)
22: junction (•)
23: terminal (T)
24: multimeter (MM)
25: oscilloscope (OSC)
26: function_generator (FG)
