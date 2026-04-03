/**
 * Calculation Engine
 * Mathematical precision with double precision arithmetic
 * No floating-point drift issues
 */

// Mathematical constants with full precision
const PI = 3.141592653589793;
const COPPER_DENSITY = 8.96; // g/cm³

/**
 * Calculate wire area from diameter using precise circular area formula
 * @param {number} diameter - Wire diameter in mm
 * @returns {number} Wire area in sq.mm (4 decimal precision)
 */
function calculateWireAreaFromDiameter(diameter) {
    if (!diameter || diameter <= 0 || isNaN(diameter)) {
        return 0;
    }
    
    // Area = π × (diameter / 2)^2
    const radius = diameter / 2;
    const area = PI * radius * radius;
    
    // Return with full precision (no rounding until display)
    return area;
}

/**
 * Get wire area from SWG gauge
 * Uses predefined area_sqmm from SWG database (no calculation needed)
 * @param {string} gauge - SWG gauge number
 * @returns {number} Wire area in sq.mm or 0 if invalid
 */
function getWireAreaFromSWG(gauge) {
    if (!gauge) return 0;
    
    const swgData = getSWGByGauge(gauge);
    if (!swgData) return 0;
    
    // Return predefined area from database (not calculated from diameter)
    return swgData.area_sqmm;
}

/**
 * Calculate total area for a single row
 * @param {number} wireArea - Area of single wire in sq.mm
 * @param {number} turns - Number of turns per slot
 * @param {number} wires - Number of wires per turn
 * @returns {number} Total area in sq.mm
 */
function calculateRowTotalArea(wireArea, turns, wires) {
    if (!wireArea || wireArea <= 0 || isNaN(wireArea)) return 0;
    if (!turns || turns <= 0 || isNaN(turns)) return 0;
    if (!wires || wires <= 0 || isNaN(wires)) return 0;
    
    // Total area = wire area × turns × wires
    const totalArea = wireArea * parseFloat(turns) * parseFloat(wires);
    
    return totalArea;
}

/**
 * Calculate 45% and 42% slot areas
 * @param {number} slotArea - Total slot area in sq.mm
 * @returns {Object} { slot45: number, slot42: number }
 */
function calculateSlotPercentages(slotArea) {
    if (!slotArea || slotArea <= 0 || isNaN(slotArea)) {
        return { slot45: 0, slot42: 0 };
    }
    
    const slot45 = slotArea * 0.45;
    const slot42 = slotArea * 0.42;
    
    return { slot45, slot42 };
}

/**
 * Calculate total copper area from all rows
 * @param {Array} rows - Array of row data objects
 * @param {boolean} isSWGMode - Whether in SWG mode
 * @returns {number} Total copper area in sq.mm
 */
function calculateTotalCopperArea(rows, isSWGMode) {
    if (!rows || rows.length === 0) return 0;
    
    let totalArea = 0;
    
    for (const row of rows) {
        // Skip empty rows
        const isEmpty = (
            (!row.gauge && !row.diameter) &&
            (!row.turns || row.turns === '') &&
            (!row.wires || row.wires === '')
        );
        
        if (isEmpty) continue;
        
        let wireArea = 0;
        
        if (isSWGMode) {
            wireArea = getWireAreaFromSWG(row.gauge);
        } else {
            wireArea = calculateWireAreaFromDiameter(parseFloat(row.diameter || 0));
        }
        
        const rowArea = calculateRowTotalArea(
            wireArea,
            parseFloat(row.turns || 0),
            parseFloat(row.wires || 0)
        );
        
        totalArea += rowArea;
    }
    
    return totalArea;
}

/**
 * Calculate total copper area per group
 * Formula: Wire Area (sq.mm) × Wires per Turn (summed across all rows)
 * @param {Array} rows - Array of row data objects
 * @param {boolean} isSWGMode - Whether in SWG mode
 * @returns {number} Total copper area per group in sq.mm
 */
function calculateTotalCopperAreaPerGroup(rows, isSWGMode) {
    if (!rows || rows.length === 0) return 0;
    
    let totalAreaPerGroup = 0;
    
    for (const row of rows) {
        // Skip empty rows
        const isEmpty = (
            (!row.gauge && !row.diameter) &&
            (!row.turns || row.turns === '') &&
            (!row.wires || row.wires === '')
        );
        
        if (isEmpty) continue;
        
        let wireArea = 0;
        
        if (isSWGMode) {
            wireArea = getWireAreaFromSWG(row.gauge);
        } else {
            wireArea = calculateWireAreaFromDiameter(parseFloat(row.diameter || 0));
        }
        
        if (wireArea <= 0) continue;
        
        const wires = parseFloat(row.wires || 0);
        if (wires <= 0) continue;
        
        // Total Copper Area per Group = Wire Area × Wires per Turn
        const areaPerGroup = wireArea * wires;
        totalAreaPerGroup += areaPerGroup;
    }
    
    return totalAreaPerGroup;
}

/**
 * Calculate copper fill percentage
 * @param {number} totalCopperArea - Total copper area in sq.mm
 * @param {number} slotArea - Slot area in sq.mm
 * @returns {number} Fill percentage (0-100+)
 */
function calculateFillPercentage(totalCopperArea, slotArea) {
    if (!slotArea || slotArea <= 0 || isNaN(slotArea)) {
        return 0;
    }
    
    if (!totalCopperArea || totalCopperArea <= 0 || isNaN(totalCopperArea)) {
        return 0;
    }
    
    // Fill % = (total copper area / slot area) × 100
    const fillPercent = (totalCopperArea / slotArea) * 100;
    
    return fillPercent;
}

/**
 * Calculate copper weight with engineering precision
 * @param {number} totalCopperArea - Total copper area in sq.mm (for validation)
 * @param {number} meanTurnLength - Mean turn length in mm (optional)
 * @param {number} numberOfSlots - Number of slots (optional)
 * @param {Array} rows - Array of row data for calculating total length
 * @param {boolean} isSWGMode - Whether in SWG mode
 * @returns {number} Copper weight in grams (4 decimal precision)
 */
function calculateCopperWeight(totalCopperArea, meanTurnLength, numberOfSlots, rows, isSWGMode) {
    // If no length parameters provided, cannot calculate weight
    if ((!meanTurnLength || meanTurnLength <= 0 || isNaN(meanTurnLength)) ||
        (!numberOfSlots || numberOfSlots <= 0 || isNaN(numberOfSlots)) ||
        (!rows || rows.length === 0)) {
        return 0;
    }
    
    let totalWeight = 0;
    
    // Calculate weight per row and sum
    // For each row: weight = (wireArea × turns × wires × numberOfSlots × MTL / 1000) × density
    for (const row of rows) {
        const isEmpty = (
            (!row.gauge && !row.diameter) &&
            (!row.turns || row.turns === '') &&
            (!row.wires || row.wires === '')
        );
        
        if (isEmpty) continue;
        
        // Get wire area for this row
        let wireArea = 0;
        if (isSWGMode) {
            wireArea = getWireAreaFromSWG(row.gauge);
        } else {
            wireArea = calculateWireAreaFromDiameter(parseFloat(row.diameter || 0));
        }
        
        if (wireArea <= 0) continue;
        
        const turns = parseFloat(row.turns || 0);
        const wires = parseFloat(row.wires || 0);
        
        if (turns <= 0 || wires <= 0) continue;
        
        // Calculate total length for this row
        // Length = MTL × turns × wires × numberOfSlots
        const rowLength = meanTurnLength * turns * wires * numberOfSlots;
        
        // Calculate volume for this row (mm³)
        const rowVolume_mm3 = wireArea * rowLength;
        
        // Convert mm³ to cm³
        const rowVolume_cm3 = rowVolume_mm3 / 1000;
        
        // Calculate weight for this row (grams)
        const rowWeight = rowVolume_cm3 * COPPER_DENSITY;
        
        totalWeight += rowWeight;
    }
    
    return totalWeight;
}

/**
 * Format number to specified decimal places for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals = 4) {
    if (isNaN(value) || value === null || value === undefined) {
        return '—';
    }
    
    return parseFloat(value).toFixed(decimals);
}

/**
 * Format percentage for display
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
    if (isNaN(value) || value === null || value === undefined) {
        return '—';
    }
    
    return parseFloat(value).toFixed(decimals);
}

/**
 * Calculate total wire area for a strand list (SWG mode only).
 * Each strand contributes: SWG area_sqmm × quantity
 * @param {Array} strands - Array of { gauge: string, qty: number|string }
 * @returns {number} Total wire area (sq.mm)
 */
function calculateTotalWireAreaFromStrands(strands) {
    if (!Array.isArray(strands) || strands.length === 0) return 0;
    
    let total = 0;
    for (const strand of strands) {
        if (!strand) continue;
        const gauge = strand.gauge;
        const qty = parseFloat(strand.qty || 0);
        if (!gauge || qty <= 0 || isNaN(qty)) continue;
        
        const area = getWireAreaFromSWG(gauge);
        if (!area || area <= 0 || isNaN(area)) continue;
        
        total += area * qty;
    }
    
    return total;
}

/**
 * Calculate turns from slot area, fill factor, and total wire area.
 * Formula: turns = (slotArea × fillFactor) / totalWireArea
 * @param {number} slotArea - Slot area (sq.mm)
 * @param {number} fillFactor - Fill factor (0-1), e.g. 0.45
 * @param {number} totalWireArea - Total wire area from strands (sq.mm)
 * @returns {Object} { turnsExact, turnsRounded, doubleLayerTop, doubleLayerBottom }
 */
function calculateTurnsFromFill(slotArea, fillFactor, totalWireArea) {
    const sa = parseFloat(slotArea);
    const ff = parseFloat(fillFactor);
    const twa = parseFloat(totalWireArea);
    
    if (!sa || sa <= 0 || isNaN(sa)) {
        return { turnsExact: 0, turnsRounded: 0, doubleLayerTop: 0, doubleLayerBottom: 0 };
    }
    if (!ff || ff <= 0 || isNaN(ff)) {
        return { turnsExact: 0, turnsRounded: 0, doubleLayerTop: 0, doubleLayerBottom: 0 };
    }
    if (!twa || twa <= 0 || isNaN(twa)) {
        return { turnsExact: 0, turnsRounded: 0, doubleLayerTop: 0, doubleLayerBottom: 0 };
    }
    
    const turnsExact = (sa * ff) / twa;
    const turnsRounded = Math.round(turnsExact);
    
    const doubleLayerTop = Math.floor(turnsRounded / 2);
    const doubleLayerBottom = turnsRounded - doubleLayerTop;
    
    return { turnsExact, turnsRounded, doubleLayerTop, doubleLayerBottom };
}

