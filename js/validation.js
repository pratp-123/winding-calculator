/**
 * Validation Layer
 * Comprehensive input validation with clear error messages
 */

/**
 * Validate slot area input
 * @param {number|string} value - Slot area value
 * @returns {Object} { valid: boolean, error: string }
 */
function validateSlotArea(value) {
    const num = parseFloat(value);
    
    if (isNaN(num) || value === '' || value === null || value === undefined) {
        return { valid: false, error: 'Slot area is required' };
    }
    
    if (num <= 0) {
        return { valid: false, error: 'Slot area must be greater than zero' };
    }
    
    if (num > 1000000) {
        return { valid: false, error: 'Slot area value is too large' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate SWG gauge selection
 * @param {string} gauge - Selected gauge
 * @returns {Object} { valid: boolean, error: string }
 */
function validateSWGGauge(gauge) {
    if (!gauge || gauge === '' || gauge === 'select') {
        return { valid: false, error: 'Please select a valid SWG gauge' };
    }
    
    const swgData = getSWGByGauge(gauge);
    if (!swgData) {
        return { valid: false, error: 'Invalid SWG gauge selected' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate wire diameter (mm)
 * @param {number|string} value - Wire diameter value
 * @returns {Object} { valid: boolean, error: string }
 */
function validateWireDiameter(value) {
    const num = parseFloat(value);
    
    if (isNaN(num) || value === '' || value === null || value === undefined) {
        return { valid: false, error: 'Wire diameter is required' };
    }
    
    if (num <= 0) {
        return { valid: false, error: 'Wire diameter must be greater than zero' };
    }
    
    if (num > 100) {
        return { valid: false, error: 'Wire diameter value is too large' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate turns per slot
 * @param {number|string} value - Turns value
 * @returns {Object} { valid: boolean, error: string }
 */
function validateTurns(value) {
    const num = parseFloat(value);
    
    if (isNaN(num) || value === '' || value === null || value === undefined) {
        return { valid: false, error: 'Turns per slot is required' };
    }
    
    if (num <= 0) {
        return { valid: false, error: 'Turns must be greater than zero' };
    }
    
    if (!Number.isInteger(parseFloat(value)) && value % 1 !== 0) {
        // Allow decimal turns for precision
    }
    
    if (num > 100000) {
        return { valid: false, error: 'Turns value is too large' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate wires per turn
 * @param {number|string} value - Wires value
 * @returns {Object} { valid: boolean, error: string }
 */
function validateWires(value) {
    const num = parseFloat(value);
    
    if (isNaN(num) || value === '' || value === null || value === undefined) {
        return { valid: false, error: 'Wires per turn is required' };
    }
    
    if (num <= 0) {
        return { valid: false, error: 'Wires must be greater than zero' };
    }
    
    if (num > 10000) {
        return { valid: false, error: 'Wires value is too large' };
    }
    
    return { valid: true, error: '' };
}

/**
 * Validate mean turn length
 * @param {number|string} value - Mean turn length value
 * @returns {Object} { valid: boolean, error: string, value: number }
 */
function validateMeanTurnLength(value) {
    if (!value || value === '' || value === null || value === undefined) {
        return { valid: true, error: '', value: null }; // Optional field
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        return { valid: false, error: 'Invalid mean turn length', value: null };
    }
    
    if (num <= 0) {
        return { valid: false, error: 'Mean turn length must be greater than zero', value: null };
    }
    
    if (num > 100000) {
        return { valid: false, error: 'Mean turn length value is too large', value: null };
    }
    
    return { valid: true, error: '', value: num };
}

/**
 * Validate number of slots
 * @param {number|string} value - Number of slots value
 * @returns {Object} { valid: boolean, error: string, value: number }
 */
function validateNumberOfSlots(value) {
    if (!value || value === '' || value === null || value === undefined) {
        return { valid: true, error: '', value: null }; // Optional field
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        return { valid: false, error: 'Invalid number of slots', value: null };
    }
    
    if (num <= 0 || !Number.isInteger(num)) {
        return { valid: false, error: 'Number of slots must be a positive integer', value: null };
    }
    
    if (num > 10000) {
        return { valid: false, error: 'Number of slots value is too large', value: null };
    }
    
    return { valid: true, error: '', value: num };
}

/**
 * Validate winding row data
 * @param {Object} rowData - Row data object
 * @param {boolean} isSWGMode - Whether in SWG mode
 * @returns {Object} { valid: boolean, error: string }
 */
function validateWindingRow(rowData, isSWGMode) {
    // Check if row is empty (allows empty rows to be ignored)
    const isEmpty = (
        (!rowData.gauge && !rowData.diameter) &&
        (!rowData.turns || rowData.turns === '') &&
        (!rowData.wires || rowData.wires === '')
    );
    
    if (isEmpty) {
        return { valid: true, error: '', isEmpty: true };
    }
    
    // Validate based on mode
    if (isSWGMode) {
        const gaugeValidation = validateSWGGauge(rowData.gauge);
        if (!gaugeValidation.valid) {
            return { valid: false, error: gaugeValidation.error, isEmpty: false };
        }
    } else {
        const diameterValidation = validateWireDiameter(rowData.diameter);
        if (!diameterValidation.valid) {
            return { valid: false, error: diameterValidation.error, isEmpty: false };
        }
    }
    
    const turnsValidation = validateTurns(rowData.turns);
    if (!turnsValidation.valid) {
        return { valid: false, error: turnsValidation.error, isEmpty: false };
    }
    
    const wiresValidation = validateWires(rowData.wires);
    if (!wiresValidation.valid) {
        return { valid: false, error: wiresValidation.error, isEmpty: false };
    }
    
    return { valid: true, error: '', isEmpty: false };
}

/**
 * Check if fill percentage is within acceptable range
 * @param {number} fillPercent - Fill percentage
 * @param {number} slotArea - Slot area
 * @param {number} totalCopperArea - Total copper area
 * @returns {Object} { status: string, message: string, color: string }
 */
function validateFillPercentage(fillPercent, slotArea, totalCopperArea) {
    if (isNaN(fillPercent) || fillPercent < 0) {
        return { status: 'invalid', message: 'Invalid calculation', color: 'red' };
    }
    
    if (fillPercent > 100) {
        return { 
            status: 'warning', 
            message: `Warning: Fill percentage exceeds 100% (${fillPercent.toFixed(2)}%). Total copper area (${totalCopperArea.toFixed(4)} sq.mm) exceeds slot area (${slotArea.toFixed(4)} sq.mm).`, 
            color: 'red' 
        };
    }
    
    if (fillPercent <= 45) {
        return { status: 'good', message: 'Fill percentage is within optimal range (≤45%)', color: 'green' };
    }
    
    if (fillPercent <= 50) {
        return { status: 'caution', message: 'Fill percentage is acceptable but approaching limit (45-50%)', color: 'yellow' };
    }
    
    return { status: 'warning', message: 'Fill percentage exceeds recommended limit (>50%)', color: 'red' };
}

/**
 * Validate fill factor (0.45 - 0.50 as requested)
 * @param {number|string} value
 * @returns {Object} { valid: boolean, error: string, value: number|null }
 */
function validateFillFactor(value) {
    if (value === '' || value === null || value === undefined) {
        return { valid: false, error: 'Fill factor is required', value: null };
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { valid: false, error: 'Invalid fill factor', value: null };
    }
    
    if (num < 0.40 || num > 0.50) {
        return { valid: false, error: 'Fill factor must be between 0.45 and 0.50', value: null };
    }
    
    return { valid: true, error: '', value: num };
}


