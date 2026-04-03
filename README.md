# ⚡ Electric Winding Design Calculator

A production-ready, fully validated, mathematically precise Electric Winding Design Calculator Web Application for motor rewinding and workshop use.

## 🎯 Features

### Core Functionality

- **Dual Operating Modes**
  - **SWG Mode**: Select from complete SWG (Standard Wire Gauge) database (10-40 including half gauges)
  - **Wire Diameter Mode**: Enter wire diameter directly in millimeters

- **Slot Area Module**
  - Input slot area in square millimeters
  - Auto-calculated 45% and 42% slot area values
  - Real-time validation

- **Winding Configuration Table**
  - Add/remove rows dynamically
  - Per-row calculations:
    - Wire area (from SWG lookup or diameter calculation)
    - Total area per row (wire area × turns × wires)
  - Real-time recalculation on input changes

- **Summary Engine**
  - Total copper area across all rows
  - Copper fill percentage with color-coded status:
    - 🟢 Green: ≤45% (optimal)
    - 🟡 Yellow: 45-50% (acceptable)
    - 🔴 Red: >50% (warning)
  - Visual fill progress bar

- **Copper Weight Calculator**
  - Engineering-grade precision using copper density (8.96 g/cm³)
  - Requires Mean Turn Length (MTL) and Number of Slots
  - Accurate to 4 decimal places

- **SWG Reference Database**
  - Complete SWG dataset (gauges 10-40 with half gauges)
  - Searchable and filterable reference table
  - Includes diameter (mm) and area (sq.mm) for each gauge

## 🏗️ Architecture

### Modular JavaScript Structure

```
/js/
  ├── swgDatabase.js      # SWG reference database and lookup functions
  ├── calculatorEngine.js # Mathematical calculations with double precision
  ├── validation.js       # Comprehensive input validation
  └── uiController.js     # DOM interactions and real-time updates
```

### Key Design Principles

- **Separation of Concerns**: UI, calculation, validation, and data are separated
- **Mathematical Precision**: Full double precision arithmetic, no floating-point drift
- **Real-time Updates**: All calculations update instantly on input changes
- **Robust Validation**: Comprehensive input validation with clear error messages
- **Zero Hard-coded Values**: All formulas centralized in calculation engine

## 📐 Mathematical Precision

- Uses full double precision (64-bit floating point)
- π constant: `3.141592653589793` (not truncated)
- Copper density: `8.96 g/cm³`
- All calculations maintain precision until display formatting
- Display formatting uses `toFixed()` only for presentation

### Formulas

**Wire Area (from diameter):**
```
area = π × (diameter / 2)²
```

**Row Total Area:**
```
rowArea = wireArea × turns × wires
```

**Slot Percentages:**
```
slot45 = slotArea × 0.45
slot42 = slotArea × 0.42
```

**Fill Percentage:**
```
fillPercent = (totalCopperArea / slotArea) × 100
```

**Copper Weight:**
```
For each row:
  length = MTL × turns × wires × numberOfSlots
  volume_mm³ = wireArea × length
  volume_cm³ = volume_mm³ / 1000
  weight = volume_cm³ × 8.96

Total weight = sum of all row weights
```

## 🛡️ Validation Rules

- No negative inputs
- No zero values for required fields
- Slot area must be greater than zero
- Valid SWG gauge selection required (SWG mode)
- Valid wire diameter required (mm mode)
- Turns and wires must be positive numbers
- Fill percentage warnings for >100% or >50%

## 🎨 UI/UX Features

- **Professional Industrial Theme**: Clean, modern design suitable for workshop use
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Feedback**: Instant calculation updates and visual indicators
- **Color-coded Status**: Visual fill percentage indicators
- **Modal SWG Reference**: Easy access to complete SWG database
- **Clear Error Messages**: User-friendly validation feedback

## 🚀 Getting Started

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No build process or dependencies required

2. **Select Operating Mode**
   - Toggle between SWG Mode and Wire Diameter (mm) Mode using the switch at the top

3. **Enter Slot Area**
   - Input the slot area in square millimeters
   - View auto-calculated 45% and 42% values

4. **Configure Windings**
   - Click "Add Row" to add winding configurations
   - For each row:
     - Select SWG gauge (SWG mode) or enter diameter (mm mode)
     - Enter turns per slot
     - Enter wires per turn
   - Remove rows as needed

5. **View Summary**
   - Monitor total copper area
   - Check fill percentage with color-coded status
   - View visual fill progress bar

6. **Calculate Weight (Optional)**
   - Enter Mean Turn Length (mm)
   - Enter Number of Slots
   - View calculated copper weight

7. **Access SWG Reference**
   - Click "View SWG Reference Table" button
   - Search and filter SWG database
   - Close modal by clicking X or outside the modal

## 🧪 Testing

The application has been tested with:
- Extreme thin wires (gauge 40)
- Extreme thick wires (gauge 10)
- Very high turn counts
- Very small and large slot areas
- Decimal wire diameters
- Half SWG gauges (15.5, 16.5, etc.)
- Multiple row configurations
- Edge cases and boundary conditions

## 📊 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with ES6+ JavaScript support.

## 🔧 Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Grid, Flexbox, CSS Variables
- **Vanilla JavaScript (ES6+)**: No frameworks required
- **Modular Architecture**: Clean separation of concerns

## 📝 Notes

- All calculations use engineering-grade precision
- Results are suitable for real workshop and motor rewinding applications
- The application is production-ready and fully validated
- No external dependencies or build process required

## 🎯 Use Cases

- Motor rewinding design
- Transformer winding calculations
- Coil design and optimization
- Workshop engineering calculations
- Educational purposes

## 📄 License

This application is provided as-is for engineering and workshop use.

---

**Built with precision for real-world engineering applications.**


