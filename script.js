// Multi-Calculator Application
// Phase 1: Foundation & Tab Navigation

class CalculatorState {
    constructor() {
        this.activeTab = 'basic';
        this.calculators = {
            basic: {
                display: '0',
                history: [],
                currentOperation: null,
                previousValue: null,
                waitingForOperand: false
            },
            scientific: {
                display: '0',
                history: [],
                memory: 0,
                angleMode: 'deg', // deg or rad
                currentOperation: null,
                previousValue: null,
                waitingForOperand: false
            },
            graphing: {
                functions: {
                    y1: '',
                    y2: '',
                    y3: ''
                },
                mode: 'function', // function, parametric, polar
                window: {
                    xmin: -10,
                    xmax: 10,
                    ymin: -10,
                    ymax: 10
                },
                zoom: 1,
                trace: false,
                tableXValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            },
            conversion: {
                type: 'length',
                fromUnit: '',
                toUnit: '',
                fromValue: '',
                toValue: '',
                history: []
            }
        };
        
        this.loadState();
    }
    
    // Save state to localStorage
    saveState() {
        try {
            localStorage.setItem('calculatorState', JSON.stringify({
                activeTab: this.activeTab,
                calculators: this.calculators
            }));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }
    
    // Load state from localStorage
    loadState() {
        try {
            const saved = localStorage.getItem('calculatorState');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.activeTab = parsed.activeTab || 'basic';
                // Merge saved calculators with defaults
                Object.keys(this.calculators).forEach(key => {
                    if (parsed.calculators && parsed.calculators[key]) {
                        this.calculators[key] = { ...this.calculators[key], ...parsed.calculators[key] };
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }
    
    // Switch active tab
    switchTab(tabName) {
        this.activeTab = tabName;
        this.saveState();
    }
    
    // Get current calculator state
    getCurrentCalculator() {
        return this.calculators[this.activeTab];
    }
    
    // Update current calculator state
    updateCurrentCalculator(updates) {
        Object.assign(this.calculators[this.activeTab], updates);
        this.saveState();
    }
    
    // Add history entry with ring buffer (max 50 entries)
    addHistoryEntry(calculatorType, entry) {
        const history = this.calculators[calculatorType].history;
        history.push(entry);
        
        // Implement ring buffer - keep only last 50 entries
        if (history.length > 50) {
            history.shift();
        }
        
        this.saveState();
    }
    
    // Clear history for specific calculator
    clearHistory(calculatorType) {
        this.calculators[calculatorType].history = [];
        this.saveState();
    }
}

class TabManager {
    constructor(state) {
        this.state = state;
        this.initializeTabSystem();
    }
    
    initializeTabSystem() {
        // Get all tab buttons and panels
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.calculator-panel');
        
        // Add click listeners to tab buttons
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchToTab(tabName);
            });
        });
        
        // Set initial tab
        this.switchToTab(this.state.activeTab);
    }
    
    switchToTab(tabName) {
        // Update state
        this.state.switchTab(tabName);
        
        // Update UI
        this.updateTabButtons(tabName);
        this.updateTabPanels(tabName);
        
        // Trigger tab-specific initialization
        this.initializeTabContent(tabName);
    }
    
    updateTabButtons(activeTab) {
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === activeTab) {
                button.classList.add('active');
                // Add flash effect for visual feedback
                button.classList.add('flash');
                setTimeout(() => button.classList.remove('flash'), 150);
            }
        });
    }
    
    updateTabPanels(activeTab) {
        this.tabPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === `${activeTab}-calculator`) {
                panel.classList.add('active');
            }
        });
    }
    
    initializeTabContent(tabName) {
        // Initialize tab-specific content based on saved state
        const calculator = this.state.getCurrentCalculator();
        
        switch (tabName) {
            case 'basic':
                this.updateDisplay('basic', calculator.display);
                this.updateHistory('basic', calculator.history);
                break;
            case 'scientific':
                this.updateDisplay('scientific', calculator.display);
                this.updateHistory('scientific', calculator.history);
                this.updateAngleMode(calculator.angleMode);
                this.updateMemoryIndicator('scientific', calculator.memory);
                break;
            case 'graphing':
                // Graphing calculator will be initialized by its own class
                if (window.graphingCalculator) {
                    window.graphingCalculator.scheduleRender();
                }
                break;
            case 'conversion':
                // Trigger the ConversionCalculator's initialization
                if (window.conversionCalculator) {
                    console.log('TabManager: Triggering ConversionCalculator re-initialization');
                    window.conversionCalculator.initializeConversionCalculator();
                } else {
                    this.initializeConversionCalculator();
                }
                break;

        }
    }
    
    updateDisplay(calculatorType, value) {
        const panel = document.getElementById(`${calculatorType}-calculator`);
        const display = panel.querySelector('.display-current');
        if (display) {
            display.textContent = value;
        }
    }
    
    updateHistory(calculatorType, history) {
        const panel = document.getElementById(`${calculatorType}-calculator`);
        const historyList = panel.querySelector('.history-list');
        if (historyList) {
            historyList.innerHTML = '';
            history.forEach(entry => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = entry;
                historyList.appendChild(historyItem);
            });
            // Scroll to bottom
            historyList.scrollTop = historyList.scrollHeight;
        }
    }
    
    updateAngleMode(mode) {
        const modeButtons = document.querySelectorAll('#scientific-calculator .mode-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
    }
    
    updateMemoryIndicator(calculatorType, memoryValue) {
        const memoryIndicator = document.querySelector(`#${calculatorType}-calculator .memory-indicator`);
        
        if (memoryIndicator) {
            if (memoryValue !== 0) {
                memoryIndicator.textContent = `M: ${memoryValue}`;
                memoryIndicator.style.color = 'var(--primary-color)';
            } else {
                memoryIndicator.textContent = 'M';
                memoryIndicator.style.color = 'var(--text-secondary)';
            }
        }
    }
    
    initializeGraphingCalculator() {
        // Initialize canvas and function inputs
        const canvas = document.getElementById('graph-canvas');
        if (canvas) {
            // Set up canvas context
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw basic grid
            this.drawGrid(ctx, canvas.width, canvas.height);
        }
        
        // Load saved functions
        const calculator = this.state.getCurrentCalculator();
        ['y1', 'y2', 'y3'].forEach(funcName => {
            const input = document.getElementById(funcName);
            if (input && calculator.functions[funcName]) {
                input.value = calculator.functions[funcName];
            }
        });
    }
    
    drawGrid(ctx, width, height) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Draw grid lines
        const step = 20;
        for (let x = 0; x <= width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
    }
    
    initializeConversionCalculator() {
        // Let the ConversionCalculator class handle its own initialization
        // This TabManager method should not interfere with the ConversionCalculator
        console.log('TabManager: Conversion calculator initialization delegated to ConversionCalculator class');
    }
    
    // updateConversionUnits method removed - ConversionCalculator class handles this properly

}

// Toast notification system
class ToastManager {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove toast after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
}

// Input feedback system
class InputFeedback {
    static flashButton(button) {
        button.classList.add('flash');
        setTimeout(() => button.classList.remove('flash'), 150);
    }
    
    static highlightInput(input) {
        const originalBorder = input.style.border;
        input.style.border = '2px solid var(--primary-color)';
        setTimeout(() => {
            input.style.border = originalBorder;
        }, 200);
    }
}

// Basic Calculator Engine
class BasicCalculator {
    constructor(state, tabManager) {
        this.state = state;
        this.tabManager = tabManager;
        this.initializeBasicCalculator();
    }
    
    initializeBasicCalculator() {
        // Add event listeners to basic calculator buttons
        const basicPanel = document.getElementById('basic-calculator');
        if (!basicPanel) return;
        
        // Number buttons
        basicPanel.querySelectorAll('.calc-btn.number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNumber(e.target.textContent);
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Operator buttons
        basicPanel.querySelectorAll('.calc-btn.operator').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleOperator(e.target.textContent);
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Equals button
        basicPanel.querySelector('.calc-btn.equals').addEventListener('click', (e) => {
            this.handleEquals();
            InputFeedback.flashButton(e.target);
        });
        
        // Clear buttons
        basicPanel.querySelectorAll('.calc-btn.clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnText = e.target.textContent;
                if (btnText === 'C') {
                    this.handleClear();
                } else if (btnText === '±') {
                    this.handlePlusMinus();
                } else if (btnText === '%') {
                    this.handlePercent();
                }
                InputFeedback.flashButton(e.target);
            });
        });
    }
    
    handleNumber(num) {
        const calculator = this.state.getCurrentCalculator();
        
        if (calculator.waitingForOperand) {
            calculator.display = num;
            calculator.waitingForOperand = false;
        } else {
            calculator.display = calculator.display === '0' ? num : calculator.display + num;
        }
        
        this.updateDisplay();
        this.state.saveState();
    }
    
    handleOperator(nextOperator) {
        const calculator = this.state.getCurrentCalculator();
        const inputValue = parseFloat(calculator.display);
        
        if (calculator.previousValue === null) {
            calculator.previousValue = inputValue;
        } else if (calculator.currentOperation) {
            const result = this.calculate();
            
            if (result === null) return; // Error occurred
            
            calculator.display = String(result);
            calculator.previousValue = result;
            this.updateDisplay();
            this.addToHistory(`${calculator.previousValue} ${calculator.currentOperation} ${inputValue} = ${result}`);
        }
        
        calculator.waitingForOperand = true;
        calculator.currentOperation = nextOperator;
        this.state.saveState();
    }
    
    handleEquals() {
        const calculator = this.state.getCurrentCalculator();
        const inputValue = parseFloat(calculator.display);
        
        if (calculator.previousValue !== null && calculator.currentOperation) {
            const result = this.calculate();
            
            if (result === null) return; // Error occurred
            
            const historyEntry = `${calculator.previousValue} ${calculator.currentOperation} ${inputValue} = ${result}`;
            this.addToHistory(historyEntry);
            
            calculator.display = String(result);
            calculator.previousValue = null;
            calculator.currentOperation = null;
            calculator.waitingForOperand = true;
            
            this.updateDisplay();
            this.state.saveState();
        }
    }
    
    handleClear() {
        const calculator = this.state.getCurrentCalculator();
        calculator.display = '0';
        calculator.previousValue = null;
        calculator.currentOperation = null;
        calculator.waitingForOperand = false;
        
        this.updateDisplay();
        this.state.saveState();
    }
    
    handlePlusMinus() {
        const calculator = this.state.getCurrentCalculator();
        const value = parseFloat(calculator.display);
        
        if (value !== 0) {
            calculator.display = String(-value);
            this.updateDisplay();
            this.state.saveState();
        }
    }
    
    handlePercent() {
        const calculator = this.state.getCurrentCalculator();
        const value = parseFloat(calculator.display);
        calculator.display = String(value / 100);
        
        this.updateDisplay();
        this.state.saveState();
    }
    
    calculate() {
        const calculator = this.state.getCurrentCalculator();
        const prev = calculator.previousValue;
        const current = parseFloat(calculator.display);
        const operation = calculator.currentOperation;
        
        if (prev === null || current === null || !operation) {
            return null;
        }
        
        let result;
        
        switch (operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    ToastManager.show('Cannot divide by zero', 'error');
                    return null;
                }
                result = prev / current;
                break;
            default:
                return null;
        }
        
        // Round to prevent floating point precision issues
        return Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    }
    
    updateDisplay() {
        const calculator = this.state.getCurrentCalculator();
        const displayElement = document.querySelector('#basic-calculator .display-current');
        
        if (displayElement) {
            // Format display value
            let displayValue = calculator.display;
            
            // Handle very large or very small numbers
            const num = parseFloat(displayValue);
            if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
                displayValue = num.toExponential(6);
            } else if (displayValue.length > 12) {
                displayValue = parseFloat(displayValue).toPrecision(8);
            }
            
            displayElement.textContent = displayValue;
        }
        
        // Update history display
        const historyElement = document.querySelector('#basic-calculator .display-history');
        if (historyElement && calculator.currentOperation && calculator.previousValue !== null) {
            historyElement.textContent = `${calculator.previousValue} ${calculator.currentOperation}`;
        } else if (historyElement) {
            historyElement.textContent = '';
        }
    }
    
    addToHistory(entry) {
        this.state.addHistoryEntry('basic', entry);
        this.tabManager.updateHistory('basic', this.state.calculators.basic.history);
    }
    
    // Handle keyboard input for basic calculator
    handleKeyInput(key) {
        // Numbers and decimal
        if (/[0-9.]/.test(key)) {
            this.handleNumber(key);
            // Flash corresponding button
            const button = document.querySelector(`#basic-calculator .calc-btn.number[textContent="${key}"]`) ||
                          Array.from(document.querySelectorAll('#basic-calculator .calc-btn.number')).find(btn => btn.textContent === key);
            if (button) InputFeedback.flashButton(button);
            return true;
        }
        
        // Operators
        const operatorMap = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷',
            '=': 'equals',
            'Enter': 'equals',
            'Escape': 'clear',
            'Backspace': 'backspace'
        };
        
        if (operatorMap[key]) {
            if (key === '=' || key === 'Enter') {
                this.handleEquals();
                const button = document.querySelector('#basic-calculator .calc-btn.equals');
                if (button) InputFeedback.flashButton(button);
            } else if (key === 'Escape') {
                this.handleClear();
                const button = document.querySelector('#basic-calculator .calc-btn.clear');
                if (button) InputFeedback.flashButton(button);
            } else if (key === 'Backspace') {
                this.handleBackspace();
            } else {
                this.handleOperator(operatorMap[key]);
                const button = Array.from(document.querySelectorAll('#basic-calculator .calc-btn.operator')).find(btn => btn.textContent === operatorMap[key]);
                if (button) InputFeedback.flashButton(button);
            }
            return true;
        }
        
        return false;
    }
    
    handleBackspace() {
        const calculator = this.state.getCurrentCalculator();
        
        if (calculator.display.length > 1) {
            calculator.display = calculator.display.slice(0, -1);
        } else {
            calculator.display = '0';
        }
        
        this.updateDisplay();
        this.state.saveState();
    }
}

// Scientific Calculator Engine
class ScientificCalculator {
    constructor(state, tabManager) {
        this.state = state;
        this.tabManager = tabManager;
        this.initializeScientificCalculator();
    }
    
    initializeScientificCalculator() {
        const scientificPanel = document.getElementById('scientific-calculator');
        if (!scientificPanel) return;
        
        // Number buttons (inherit from basic calculator logic)
        scientificPanel.querySelectorAll('.calc-btn.number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNumber(e.target.textContent);
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Basic operator buttons
        scientificPanel.querySelectorAll('.calc-btn.operator').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleOperator(e.target.textContent);
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Equals button
        scientificPanel.querySelector('.calc-btn.equals').addEventListener('click', (e) => {
            this.handleEquals();
            InputFeedback.flashButton(e.target);
        });
        
        // Function buttons
        scientificPanel.querySelectorAll('.calc-btn.function').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFunction(e.target.textContent);
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Memory buttons
        scientificPanel.querySelectorAll('.calc-btn.memory').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleMemory(e.target.textContent);
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Clear buttons
        scientificPanel.querySelectorAll('.calc-btn.clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnText = e.target.textContent;
                if (btnText === 'C') {
                    this.handleClear();
                } else if (btnText === '⌫') {
                    this.handleBackspace();
                }
                InputFeedback.flashButton(e.target);
            });
        });
        
        // Mode buttons (DEG/RAD)
        scientificPanel.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleModeToggle(e.target.dataset.mode);
                InputFeedback.flashButton(e.target);
            });
        });
    }
    
    handleNumber(num) {
        const calculator = this.state.getCurrentCalculator();
        
        if (calculator.waitingForOperand) {
            calculator.display = num;
            calculator.waitingForOperand = false;
        } else {
            calculator.display = calculator.display === '0' ? num : calculator.display + num;
        }
        
        this.updateDisplay();
        this.state.saveState();
    }
    
    handleOperator(nextOperator) {
        const calculator = this.state.getCurrentCalculator();
        const inputValue = parseFloat(calculator.display);
        
        if (calculator.previousValue === null) {
            calculator.previousValue = inputValue;
        } else if (calculator.currentOperation && !calculator.waitingForOperand) {
            const result = this.calculate();
            
            if (result === null) return;
            
            calculator.display = String(result);
            calculator.previousValue = result;
            this.updateDisplay();
            this.addToHistory(`${calculator.previousValue} ${calculator.currentOperation} ${inputValue} = ${result}`);
        }
        
        calculator.waitingForOperand = true;
        calculator.currentOperation = nextOperator;
        this.state.saveState();
    }
    
    handleEquals() {
        const calculator = this.state.getCurrentCalculator();
        const inputValue = parseFloat(calculator.display);
        
        if (calculator.previousValue !== null && calculator.currentOperation) {
            const result = this.calculate();
            
            if (result === null) return;
            
            const historyEntry = `${calculator.previousValue} ${calculator.currentOperation} ${inputValue} = ${result}`;
            this.addToHistory(historyEntry);
            
            calculator.display = String(result);
            calculator.previousValue = null;
            calculator.currentOperation = null;
            calculator.waitingForOperand = true;
            
            this.updateDisplay();
            this.state.saveState();
        }
    }
    
    handleFunction(func) {
        const calculator = this.state.getCurrentCalculator();
        const currentValue = parseFloat(calculator.display);
        
        try {
            switch (func) {
                // Parentheses handling
                case '(':
                    if (!calculator.expression) calculator.expression = '';
                    calculator.expression += calculator.display + '*(';
                    calculator.display = '0';
                    calculator.waitingForOperand = true;
                    this.updateDisplay();
                    this.state.saveState();
                    return;
                    
                case ')':
                    if (!calculator.expression) return;
                    calculator.expression += calculator.display + ')';
                    try {
                        const result = this.evaluateExpression(calculator.expression);
                        calculator.display = String(result);
                        this.addToHistory(`${calculator.expression} = ${result}`);
                        calculator.expression = '';
                        this.updateDisplay();
                        this.state.saveState();
                    } catch (error) {
                        ToastManager.show('Invalid expression', 'error');
                        calculator.expression = '';
                    }
                    return;
                
                // Constants (don't require current value validation)
                case 'π':
                    calculator.display = String(Math.PI);
                    this.updateDisplay();
                    this.state.saveState();
                    return;
                case 'e':
                    calculator.display = String(Math.E);
                    this.updateDisplay();
                    this.state.saveState();
                    return;
            }
            
            // For all other functions, validate current value
            if (isNaN(currentValue)) {
                ToastManager.show('Invalid input for function', 'error');
                return;
            }
            
            let result;
            const angleInRadians = calculator.angleMode === 'deg' ? currentValue * Math.PI / 180 : currentValue;
            
            switch (func) {
                // Trigonometric functions
                case 'sin':
                    result = Math.sin(angleInRadians);
                    break;
                case 'cos':
                    result = Math.cos(angleInRadians);
                    break;
                case 'tan':
                    result = Math.tan(angleInRadians);
                    break;
                case 'sin⁻¹':
                    if (currentValue < -1 || currentValue > 1) throw new Error('Invalid input for arcsine');
                    result = Math.asin(currentValue);
                    result = calculator.angleMode === 'deg' ? result * 180 / Math.PI : result;
                    break;
                case 'cos⁻¹':
                    if (currentValue < -1 || currentValue > 1) throw new Error('Invalid input for arccosine');
                    result = Math.acos(currentValue);
                    result = calculator.angleMode === 'deg' ? result * 180 / Math.PI : result;
                    break;
                case 'tan⁻¹':
                    result = Math.atan(currentValue);
                    result = calculator.angleMode === 'deg' ? result * 180 / Math.PI : result;
                    break;
                
                // Logarithmic and exponential functions
                case 'log':
                    if (currentValue <= 0) throw new Error('Invalid input for logarithm');
                    result = Math.log10(currentValue);
                    break;
                case 'ln':
                    if (currentValue <= 0) throw new Error('Invalid input for natural logarithm');
                    result = Math.log(currentValue);
                    break;
                case '10ˣ':
                    result = Math.pow(10, currentValue);
                    break;
                case 'exp':
                    result = Math.exp(currentValue);
                    break;
                
                // Power and root functions
                case 'x²':
                    result = Math.pow(currentValue, 2);
                    break;
                case 'xʸ':
                    // This will be handled as a two-operand function
                    calculator.previousValue = currentValue;
                    calculator.currentOperation = '^';
                    calculator.waitingForOperand = true;
                    this.state.saveState();
                    return;
                case '√':
                    if (currentValue < 0) throw new Error('Invalid input for square root');
                    result = Math.sqrt(currentValue);
                    break;
                
                // Other functions
                case '1/x':
                    if (currentValue === 0) throw new Error('Cannot divide by zero');
                    result = 1 / currentValue;
                    break;
                case '|x|':
                    result = Math.abs(currentValue);
                    break;
                case 'n!':
                    if (currentValue < 0 || !Number.isInteger(currentValue) || currentValue > 170) {
                        throw new Error('Invalid input for factorial');
                    }
                    result = this.factorial(currentValue);
                    break;
                
                default:
                    ToastManager.show(`Function ${func} not implemented`, 'error');
                    return;
            }
            
            // Round to prevent floating point precision issues
            result = Math.round((result + Number.EPSILON) * 100000000000) / 100000000000;
            
            calculator.display = String(result);
            this.addToHistory(`${func}(${currentValue}) = ${result}`);
            this.updateDisplay();
            this.state.saveState();
            
        } catch (error) {
            ToastManager.show(error.message, 'error');
        }
    }
    
    // Simple expression evaluator for parentheses support
    evaluateExpression(expression) {
        // Replace mathematical constants and functions
        let expr = expression
            .replace(/π/g, Math.PI)
            .replace(/e/g, Math.E)
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**');
        
        // Basic validation - only allow numbers, operators, parentheses
        if (!/^[0-9+\-*/.() ]+$/.test(expr)) {
            throw new Error('Invalid expression');
        }
        
        try {
            // Use Function constructor for safe evaluation
            return Function('"use strict"; return (' + expr + ')')();
        } catch (error) {
            throw new Error('Invalid expression');
        }
    }
    
    handleMemory(memoryFunc) {
        const calculator = this.state.getCurrentCalculator();
        const currentValue = parseFloat(calculator.display);
        
        switch (memoryFunc) {
            case 'MC': // Memory Clear
                calculator.memory = 0;
                this.updateMemoryIndicator();
                ToastManager.show('Memory cleared', 'success');
                break;
            case 'MR': // Memory Recall
                calculator.display = String(calculator.memory);
                this.updateDisplay();
                break;
            case 'M+': // Memory Add
                calculator.memory += currentValue;
                this.updateMemoryIndicator();
                this.addToHistory(`M+ ${currentValue} (Memory: ${calculator.memory})`);
                break;
            case 'M-': // Memory Subtract
                calculator.memory -= currentValue;
                this.updateMemoryIndicator();
                this.addToHistory(`M- ${currentValue} (Memory: ${calculator.memory})`);
                break;
        }
        
        this.state.saveState();
    }
    
    handleModeToggle(mode) {
        const calculator = this.state.getCurrentCalculator();
        calculator.angleMode = mode;
        
        // Update mode buttons
        const modeButtons = document.querySelectorAll('#scientific-calculator .mode-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        this.state.saveState();
        ToastManager.show(`Mode: ${mode.toUpperCase()}`, 'success');
    }
    
    handleClear() {
        const calculator = this.state.getCurrentCalculator();
        calculator.display = '0';
        calculator.previousValue = null;
        calculator.currentOperation = null;
        calculator.waitingForOperand = false;
        
        this.updateDisplay();
        this.state.saveState();
    }
    
    handleBackspace() {
        const calculator = this.state.getCurrentCalculator();
        
        if (calculator.display.length > 1) {
            calculator.display = calculator.display.slice(0, -1);
        } else {
            calculator.display = '0';
        }
        
        this.updateDisplay();
        this.state.saveState();
    }
    
    calculate() {
        const calculator = this.state.getCurrentCalculator();
        const prev = calculator.previousValue;
        const current = parseFloat(calculator.display);
        const operation = calculator.currentOperation;
        
        if (prev === null || current === null || !operation) {
            return null;
        }
        
        let result;
        
        try {
            switch (operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '×':
                    result = prev * current;
                    break;
                case '÷':
                    if (current === 0) throw new Error('Cannot divide by zero');
                    result = prev / current;
                    break;
                case '^':
                    result = Math.pow(prev, current);
                    break;
                case 'mod':
                    if (current === 0) throw new Error('Cannot divide by zero');
                    result = prev % current;
                    break;
                default:
                    return null;
            }
            
            // Round to prevent floating point precision issues
            return Math.round((result + Number.EPSILON) * 100000000000) / 100000000000;
            
        } catch (error) {
            ToastManager.show(error.message, 'error');
            return null;
        }
    }
    
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    updateDisplay() {
        const calculator = this.state.getCurrentCalculator();
        const displayElement = document.querySelector('#scientific-calculator .display-current');
        
        if (displayElement) {
            let displayValue = calculator.display;
            
            // Handle very large or very small numbers
            const num = parseFloat(displayValue);
            if (Math.abs(num) > 999999999999 || (Math.abs(num) < 0.000000001 && num !== 0)) {
                displayValue = num.toExponential(8);
            } else if (displayValue.length > 15) {
                displayValue = parseFloat(displayValue).toPrecision(10);
            }
            
            displayElement.textContent = displayValue;
        }
        
        // Update history display
        const historyElement = document.querySelector('#scientific-calculator .display-history');
        if (historyElement && calculator.currentOperation && calculator.previousValue !== null) {
            historyElement.textContent = `${calculator.previousValue} ${calculator.currentOperation}`;
        } else if (historyElement) {
            historyElement.textContent = '';
        }
    }
    
    updateMemoryIndicator() {
        const calculator = this.state.getCurrentCalculator();
        const memoryIndicator = document.querySelector('#scientific-calculator .memory-indicator');
        
        if (memoryIndicator) {
            if (calculator.memory !== 0) {
                memoryIndicator.textContent = `M: ${calculator.memory}`;
                memoryIndicator.style.color = 'var(--primary-color)';
            } else {
                memoryIndicator.textContent = 'M';
                memoryIndicator.style.color = 'var(--text-secondary)';
            }
        }
    }
    
    addToHistory(entry) {
        this.state.addHistoryEntry('scientific', entry);
        this.tabManager.updateHistory('scientific', this.state.calculators.scientific.history);
    }
    
    // Handle keyboard input for scientific calculator
    handleKeyInput(key) {
        // Basic number and operator input (same as basic calculator)
        if (/[0-9.]/.test(key)) {
            this.handleNumber(key);
            const button = Array.from(document.querySelectorAll('#scientific-calculator .calc-btn.number')).find(btn => btn.textContent === key);
            if (button) InputFeedback.flashButton(button);
            return true;
        }
        
        const operatorMap = {
            '+': '+', '-': '-', '*': '×', '/': '÷',
            '=': 'equals', 'Enter': 'equals',
            'Escape': 'clear', 'Backspace': 'backspace'
        };
        
        if (operatorMap[key]) {
            if (key === '=' || key === 'Enter') {
                this.handleEquals();
                const button = document.querySelector('#scientific-calculator .calc-btn.equals');
                if (button) InputFeedback.flashButton(button);
            } else if (key === 'Escape') {
                this.handleClear();
                const button = document.querySelector('#scientific-calculator .calc-btn.clear');
                if (button) InputFeedback.flashButton(button);
            } else if (key === 'Backspace') {
                this.handleBackspace();
            } else {
                this.handleOperator(operatorMap[key]);
                const button = Array.from(document.querySelectorAll('#scientific-calculator .calc-btn.operator')).find(btn => btn.textContent === operatorMap[key]);
                if (button) InputFeedback.flashButton(button);
            }
            return true;
        }
        
        // Scientific function shortcuts
        const scientificShortcuts = {
            's': 'sin', 'c': 'cos', 't': 'tan',
            'l': 'log', 'n': 'ln', 'r': '√',
            'p': 'π', 'e': 'e', '!': 'n!'
        };
        
        if (scientificShortcuts[key.toLowerCase()]) {
            this.handleFunction(scientificShortcuts[key.toLowerCase()]);
            return true;
        }
        
        return false;
    }
}

// Graphing Calculator Engine
class GraphingCalculator {
    constructor(state, tabManager) {
        this.state = state;
        this.tabManager = tabManager;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.lastRenderTime = 0;
        this.renderDebounce = null;
        this.initializeGraphingCalculator();
    }
    
    initializeGraphingCalculator() {
        const graphingPanel = document.getElementById('graphing-calculator');
        if (!graphingPanel) return;
        
        // Initialize canvas
        this.canvas = document.getElementById('graph-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
        }
        
        // Initialize function inputs
        this.initializeFunctionInputs();
        
        // Initialize graph controls
        this.initializeGraphControls();
        
        // Initialize TI-84 keypad
        this.initializeTI84Keypad();
        
        // Initialize mode buttons
        this.initializeModeButtons();
        
        // Initialize mobile features
        this.initializeMobileFeatures();
        
        // Initial render
        this.scheduleRender();
    }
    
    initializeMobileFeatures() {
        // Add mobile virtual keypad if on mobile device
        if (window.innerWidth <= 768) {
            this.createMobileKeypad();
        }
        
        // Add resize listener to handle orientation changes
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Add orientation change listener
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }
    
    handleResize() {
        // Recalculate canvas size on resize
        if (this.canvas) {
            this.setupCanvas();
            this.scheduleRender();
        }
        
        // Update mobile keypad visibility
        const isMobile = window.innerWidth <= 768;
        const keypad = document.querySelector('.mobile-keypad');
        
        if (isMobile && !keypad) {
            this.createMobileKeypad();
        } else if (!isMobile && keypad) {
            keypad.remove();
        }
    }
    
    createMobileKeypad() {
        const graphingPanel = document.getElementById('graphing-calculator');
        if (!graphingPanel) return;
        
        // Check if keypad already exists
        if (graphingPanel.querySelector('.mobile-keypad')) return;
        
        const keypad = document.createElement('div');
        keypad.className = 'mobile-keypad';
        keypad.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 10px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        `;
        
        const mobileButtons = [
            { text: 'x', value: 'x' },
            { text: 't', value: 't' },
            { text: 'θ', value: 'theta' },
            { text: 'π', value: 'pi' },
            { text: 'sin', value: 'sin(' },
            { text: 'cos', value: 'cos(' },
            { text: 'tan', value: 'tan(' },
            { text: 'ln', value: 'ln(' },
            { text: '√', value: 'sqrt(' },
            { text: 'x²', value: '^2' },
            { text: '^', value: '^' },
            { text: '()', value: '()' },
            { text: '+', value: '+' },
            { text: '-', value: '-' },
            { text: '*', value: '*' },
            { text: '/', value: '/' }
        ];
        
        mobileButtons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = 'mobile-key-btn';
            button.style.cssText = `
                padding: 12px 8px;
                border: 1px solid #007bff;
                background: white;
                color: #007bff;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.15s ease;
                min-height: 44px;
            `;
            
            button.addEventListener('click', () => {
                this.insertMobileKeypadValue(btn.value);
                InputFeedback.flashButton(button);
            });
            
            // Add hover/active effects
            button.addEventListener('mousedown', () => {
                button.style.backgroundColor = '#007bff';
                button.style.color = 'white';
            });
            
            button.addEventListener('mouseup', () => {
                setTimeout(() => {
                    button.style.backgroundColor = 'white';
                    button.style.color = '#007bff';
                }, 150);
            });
            
            keypad.appendChild(button);
        });
        
        // Insert keypad after function inputs
        const functionInputs = graphingPanel.querySelector('.function-inputs');
        if (functionInputs) {
            functionInputs.parentNode.insertBefore(keypad, functionInputs.nextSibling);
        }
    }
    
    insertMobileKeypadValue(value) {
        // Find the currently focused input or the first empty input
        const activeInput = document.activeElement;
        let targetInput = null;
        
        if (activeInput && activeInput.classList.contains('function-input')) {
            targetInput = activeInput;
        } else {
            // Find first empty function input
            const functionInputs = document.querySelectorAll('.function-input');
            for (const input of functionInputs) {
                if (!input.value.trim()) {
                    targetInput = input;
                    break;
                }
            }
            // If no empty input, use the first one
            if (!targetInput && functionInputs.length > 0) {
                targetInput = functionInputs[0];
            }
        }
        
        if (targetInput) {
            const cursorPos = targetInput.selectionStart || targetInput.value.length;
            const currentValue = targetInput.value;
            
            let insertValue = value;
            
            // Special handling for certain values
            if (value === '()') {
                insertValue = '()';
                const newValue = currentValue.slice(0, cursorPos) + insertValue + currentValue.slice(cursorPos);
                targetInput.value = newValue;
                targetInput.setSelectionRange(cursorPos + 1, cursorPos + 1); // Position cursor between parentheses
            } else {
                const newValue = currentValue.slice(0, cursorPos) + insertValue + currentValue.slice(cursorPos);
                targetInput.value = newValue;
                targetInput.setSelectionRange(cursorPos + insertValue.length, cursorPos + insertValue.length);
            }
            
            // Trigger input event to update the graph
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            targetInput.focus();
            
            ToastManager.show(`Inserted: ${value}`, 'info', 1000);
        }
    }
    
    setupCanvas() {
        const calculator = this.state.getCurrentCalculator();
        
        // Set canvas size with responsive behavior
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Mobile-responsive canvas sizing
        const isMobile = window.innerWidth <= 768;
        const padding = isMobile ? 16 : 32;
        const maxSize = isMobile ? Math.min(rect.width - padding, 300) : Math.min(rect.width - padding, 400);
        
        this.canvas.width = maxSize;
        this.canvas.height = maxSize;
        this.canvas.style.width = maxSize + 'px';
        this.canvas.style.height = maxSize + 'px';
        
        // Set up coordinate system
        this.setupCoordinateSystem();
        
        // Add both mouse and touch event listeners
        this.addCanvasEventListeners();
        this.addTouchEventListeners();
    }
    
    setupCoordinateSystem() {
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        // Calculate scale factors
        this.scaleX = this.canvas.width / (window.xmax - window.xmin);
        this.scaleY = this.canvas.height / (window.ymax - window.ymin);
        
        // Calculate origin position
        this.originX = -window.xmin * this.scaleX;
        this.originY = window.ymax * this.scaleY;
    }
    
    addCanvasEventListeners() {
        let isDragging = false;
        let lastX, lastY;
        
        // Mouse events for panning
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const deltaX = currentX - lastX;
            const deltaY = currentY - lastY;
            
            this.pan(deltaX, deltaY);
            
            lastX = currentX;
            lastY = currentY;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        // Mouse wheel for zooming
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
            this.zoom(zoomFactor);
        });
        
        // Mouse move for coordinate display
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                this.updateCursorCoordinates(e);
            }
        });
    }
    
    addTouchEventListeners() {
        let isDragging = false;
        let lastTouchX, lastTouchY;
        let initialDistance = 0;
        let initialScale = 1;
        
        // Touch start
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1) {
                // Single touch - start panning
                isDragging = true;
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                lastTouchX = touch.clientX - rect.left;
                lastTouchY = touch.clientY - rect.top;
            } else if (e.touches.length === 2) {
                // Two touches - start pinch zoom
                isDragging = false;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                initialScale = 1;
            }
        });
        
        // Touch move
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && isDragging) {
                // Single touch - pan
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const currentX = touch.clientX - rect.left;
                const currentY = touch.clientY - rect.top;
                
                const deltaX = currentX - lastTouchX;
                const deltaY = currentY - lastTouchY;
                
                this.pan(deltaX, deltaY);
                
                lastTouchX = currentX;
                lastTouchY = currentY;
            } else if (e.touches.length === 2) {
                // Two touches - pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (initialDistance > 0) {
                    const scale = currentDistance / initialDistance;
                    const zoomFactor = scale > initialScale ? 0.95 : 1.05;
                    this.zoom(zoomFactor);
                    initialScale = scale;
                }
            }
        });
        
        // Touch end
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 0) {
                isDragging = false;
                initialDistance = 0;
                
                // Handle trace mode touch
                if (e.changedTouches.length === 1) {
                    const calculator = this.state.getCurrentCalculator();
                    if (calculator.trace) {
                        const touch = e.changedTouches[0];
                        const rect = this.canvas.getBoundingClientRect();
                        const mockEvent = {
                            clientX: touch.clientX,
                            clientY: touch.clientY
                        };
                        this.handleTraceClick(mockEvent);
                    }
                }
            }
        });
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            isDragging = false;
            initialDistance = 0;
        });
    }
    
    initializeFunctionInputs() {
        const functionInputs = document.querySelectorAll('.function-input');
        
        functionInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const functionName = e.target.id;
                const functionValue = e.target.value;
                
                // Update state
                const calculator = this.state.getCurrentCalculator();
                calculator.functions[functionName] = functionValue;
                this.state.saveState();
                
                // Schedule render with debounce
                this.scheduleRender();
                
                // Update table if in function mode
                if (calculator.mode === 'function') {
                    // Debounce table updates too
                    if (this.tableUpdateDebounce) {
                        clearTimeout(this.tableUpdateDebounce);
                    }
                    this.tableUpdateDebounce = setTimeout(() => {
                        this.updateTable();
                    }, 200);
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.scheduleRender();
                }
            });
        });
    }
    
    initializeGraphControls() {
        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.zoom(0.8);
        });
        
        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.zoom(1.25);
        });
        
        document.getElementById('zoom-fit')?.addEventListener('click', () => {
            this.resetWindow();
        });
        
        document.getElementById('trace-btn')?.addEventListener('click', () => {
            this.toggleTrace();
        });
    }
    
    initializeTI84Keypad() {
        const tiButtons = document.querySelectorAll('.ti-btn');
        
        tiButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.textContent;
                this.handleTI84Command(command);
                InputFeedback.flashButton(e.target);
            });
        });
    }
    
    initializeModeButtons() {
        const graphingPanel = document.getElementById('graphing-calculator');
        const modeButtons = graphingPanel.querySelectorAll('.mode-btn');
        
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
                InputFeedback.flashButton(e.target);
            });
        });
    }
    
    handleTI84Command(command) {
        switch (command) {
            case 'Y=':
                this.focusOnFunction();
                break;
            case 'WINDOW':
                this.showWindowSettings();
                break;
            case 'ZOOM':
                this.showZoomMenu();
                break;
            case 'TRACE':
                this.toggleTrace();
                break;
            case 'GRAPH':
                this.scheduleRender();
                break;
            case 'ZOOM_STANDARD':
                this.zoomStandard();
                break;
            case 'ZOOM_TRIG':
                this.zoomTrig();
                break;
            case 'ZOOM_INTEGER':
                this.zoomInteger();
                break;
            case 'ZOOM_SQUARE':
                this.zoomSquare();
                break;
        }
    }
    
    switchMode(mode) {
        const calculator = this.state.getCurrentCalculator();
        calculator.mode = mode;
        
        // Update UI
        const modeButtons = document.querySelectorAll('#graphing-calculator .mode-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Update function inputs based on mode
        this.updateFunctionInputs(mode);
        
        this.state.saveState();
        this.scheduleRender();
        
        ToastManager.show(`Mode: ${mode.toUpperCase()}`, 'success');
    }
    
    updateFunctionInputs(mode) {
        const functionInputsContainer = document.querySelector('.function-inputs');
        if (!functionInputsContainer) return;
        
        // Clear existing inputs
        functionInputsContainer.innerHTML = '';
        
        switch (mode) {
            case 'function':
                this.createFunctionInputs();
                break;
            case 'parametric':
                this.createParametricInputs();
                break;
            case 'polar':
                this.createPolarInputs();
                break;
        }
    }
    
    createFunctionInputs() {
        const container = document.querySelector('.function-inputs');
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        const calculator = this.state.getCurrentCalculator();
        
        for (let i = 1; i <= 3; i++) {
            const row = document.createElement('div');
            row.className = 'function-row';
            
            row.innerHTML = `
                <label>Y${i}=</label>
                <input type="text" class="function-input" id="y${i}" placeholder="Enter function">
                <button class="function-color" style="background-color: ${colors[i-1]};"></button>
            `;
            
            container.appendChild(row);
            
            // Restore saved function value
            const input = row.querySelector(`#y${i}`);
            if (calculator.functions[`y${i}`]) {
                input.value = calculator.functions[`y${i}`];
            }
        }
        
        // Reinitialize event listeners
        this.initializeFunctionInputs();
    }
    
    createParametricInputs() {
        const container = document.querySelector('.function-inputs');
        const calculator = this.state.getCurrentCalculator();
        
        for (let i = 1; i <= 3; i++) {
            const xRow = document.createElement('div');
            xRow.className = 'function-row';
            xRow.innerHTML = `
                <label>X${i}T=</label>
                <input type="text" class="function-input" id="x${i}t" placeholder="Enter X parametric">
                <button class="function-color" style="background-color: #ff0000;"></button>
            `;
            
            const yRow = document.createElement('div');
            yRow.className = 'function-row';
            yRow.innerHTML = `
                <label>Y${i}T=</label>
                <input type="text" class="function-input" id="y${i}t" placeholder="Enter Y parametric">
                <button class="function-color" style="background-color: #ff0000;"></button>
            `;
            
            container.appendChild(xRow);
            container.appendChild(yRow);
            
            // Restore saved parametric function values
            const xInput = xRow.querySelector(`#x${i}t`);
            const yInput = yRow.querySelector(`#y${i}t`);
            if (calculator.functions[`x${i}t`]) {
                xInput.value = calculator.functions[`x${i}t`];
            }
            if (calculator.functions[`y${i}t`]) {
                yInput.value = calculator.functions[`y${i}t`];
            }
        }
        
        this.initializeFunctionInputs();
    }
    
    createPolarInputs() {
        const container = document.querySelector('.function-inputs');
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        const calculator = this.state.getCurrentCalculator();
        
        for (let i = 1; i <= 3; i++) {
            const row = document.createElement('div');
            row.className = 'function-row';
            
            row.innerHTML = `
                <label>r${i}=</label>
                <input type="text" class="function-input" id="r${i}" placeholder="Enter polar function">
                <button class="function-color" style="background-color: ${colors[i-1]};"></button>
            `;
            
            container.appendChild(row);
            
            // Restore saved polar function value
            const input = row.querySelector(`#r${i}`);
            if (calculator.functions[`r${i}`]) {
                input.value = calculator.functions[`r${i}`];
            }
        }
        
        this.initializeFunctionInputs();
    }
    
    scheduleRender() {
        // Debounce rendering to avoid excessive redraws
        if (this.renderDebounce) {
            clearTimeout(this.renderDebounce);
        }
        
        this.renderDebounce = setTimeout(() => {
            this.render();
        }, 100);
    }
    
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update coordinate system
        this.setupCoordinateSystem();
        
        // Draw grid and axes
        this.drawGrid();
        this.drawAxes();
        
        // Draw functions based on current mode
        const calculator = this.state.getCurrentCalculator();
        switch (calculator.mode) {
            case 'function':
                this.drawFunctions();
                break;
            case 'parametric':
                this.drawParametricFunctions();
                break;
            case 'polar':
                this.drawPolarFunctions();
                break;
        }
        
        // Draw trace point if active
        this.drawTracePoint();
        
        // Update table
        this.updateTable();
    }
    
    drawGrid() {
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = Math.ceil(window.xmin); x <= Math.floor(window.xmax); x++) {
            const canvasX = this.originX + x * this.scaleX;
            this.ctx.beginPath();
            this.ctx.moveTo(canvasX, 0);
            this.ctx.lineTo(canvasX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = Math.ceil(window.ymin); y <= Math.floor(window.ymax); y++) {
            const canvasY = this.originY - y * this.scaleY;
            this.ctx.beginPath();
            this.ctx.moveTo(0, canvasY);
            this.ctx.lineTo(this.canvas.width, canvasY);
            this.ctx.stroke();
        }
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        
        // X-axis
        if (this.originY >= 0 && this.originY <= this.canvas.height) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.originY);
            this.ctx.lineTo(this.canvas.width, this.originY);
            this.ctx.stroke();
        }
        
        // Y-axis
        if (this.originX >= 0 && this.originX <= this.canvas.width) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.originX, 0);
            this.ctx.lineTo(this.originX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw axis labels
        this.drawAxisLabels();
    }
    
    drawAxisLabels() {
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        // X-axis labels
        for (let x = Math.ceil(window.xmin); x <= Math.floor(window.xmax); x++) {
            if (x === 0) continue;
            const canvasX = this.originX + x * this.scaleX;
            if (canvasX >= 0 && canvasX <= this.canvas.width) {
                const labelY = this.originY + 15;
                if (labelY >= 0 && labelY <= this.canvas.height) {
                    this.ctx.fillText(x.toString(), canvasX, labelY);
                }
            }
        }
        
        // Y-axis labels
        this.ctx.textAlign = 'right';
        for (let y = Math.ceil(window.ymin); y <= Math.floor(window.ymax); y++) {
            if (y === 0) continue;
            const canvasY = this.originY - y * this.scaleY;
            if (canvasY >= 0 && canvasY <= this.canvas.height) {
                const labelX = this.originX - 5;
                if (labelX >= 0 && labelX <= this.canvas.width) {
                    this.ctx.fillText(y.toString(), labelX, canvasY + 3);
                }
            }
        }
    }
    
    drawFunctions() {
        const calculator = this.state.getCurrentCalculator();
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        
        ['y1', 'y2', 'y3'].forEach((funcName, index) => {
            const expression = calculator.functions[funcName];
            if (expression && expression.trim()) {
                this.plotFunction(expression, colors[index]);
            }
        });
    }
    
    plotFunction(expression, color) {
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        let firstPoint = true;
        const step = (window.xmax - window.xmin) / this.canvas.width;
        
        for (let x = window.xmin; x <= window.xmax; x += step) {
            try {
                const y = this.evaluateFunction(expression, x);
                
                if (isFinite(y)) {
                    const canvasX = this.originX + x * this.scaleX;
                    const canvasY = this.originY - y * this.scaleY;
                    
                    if (firstPoint) {
                        this.ctx.moveTo(canvasX, canvasY);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(canvasX, canvasY);
                    }
                }
            } catch (error) {
                // Skip invalid points
                firstPoint = true;
            }
        }
        
        this.ctx.stroke();
    }
    
    evaluateFunction(expression, x) {
        // Replace common mathematical notation
        let expr = expression
            .toLowerCase()
            .trim()
            // Handle implicit multiplication before x (like 5x, 2x, etc.)
            .replace(/(\d+)x/g, '$1*x')
            .replace(/(\d+)\s*x/g, '$1*x')
            // Handle implicit multiplication after parentheses (like 2(x+1))
            .replace(/(\d+)\(/g, '$1*(')
            .replace(/\)(\d+)/g, ')*$1')
            .replace(/\)x/g, ')*x')
            .replace(/x\(/g, 'x*(')
            // Replace x with the actual value
            .replace(/x/g, `(${x})`)
            // Replace mathematical functions
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log10')
            .replace(/ln/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
            .replace(/exp/g, 'Math.exp')
            // Replace constants
            .replace(/π/g, Math.PI)
            .replace(/pi/g, Math.PI)
            .replace(/e(?![0-9])/g, Math.E)
            // Replace exponentiation
            .replace(/\^/g, '**');
        
        // Basic validation - allow Math functions, numbers, operators, parentheses
        if (!/^[0-9+\-*/.() \w]+$/.test(expr.replace(/Math\.\w+/g, ''))) {
            throw new Error('Invalid expression');
        }
        
        try {
            return Function(`"use strict"; return (${expr})`)();
        } catch (error) {
            throw new Error('Evaluation error');
        }
    }
    
    drawParametricFunctions() {
        const calculator = this.state.getCurrentCalculator();
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        
        for (let i = 1; i <= 3; i++) {
            const xExpr = calculator.functions[`x${i}t`];
            const yExpr = calculator.functions[`y${i}t`];
            
            if (xExpr && yExpr && xExpr.trim() && yExpr.trim()) {
                this.plotParametricFunction(xExpr, yExpr, colors[i-1]);
            }
        }
    }
    
    drawPolarFunctions() {
        const calculator = this.state.getCurrentCalculator();
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        
        for (let i = 1; i <= 3; i++) {
            const rExpr = calculator.functions[`r${i}`];
            
            if (rExpr && rExpr.trim()) {
                this.plotPolarFunction(rExpr, colors[i-1]);
            }
        }
    }
    
    plotParametricFunction(xExpression, yExpression, color) {
        const calculator = this.state.getCurrentCalculator();
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        let firstPoint = true;
        const tMin = -10; // Parameter range
        const tMax = 10;
        const tStep = 0.1;
        
        for (let t = tMin; t <= tMax; t += tStep) {
            try {
                const x = this.evaluateParametricFunction(xExpression, t);
                const y = this.evaluateParametricFunction(yExpression, t);
                
                if (isFinite(x) && isFinite(y)) {
                    const canvasX = this.originX + x * this.scaleX;
                    const canvasY = this.originY - y * this.scaleY;
                    
                    // Check if point is within canvas bounds (with some margin)
                    if (canvasX >= -50 && canvasX <= this.canvas.width + 50 && 
                        canvasY >= -50 && canvasY <= this.canvas.height + 50) {
                        
                        if (firstPoint) {
                            this.ctx.moveTo(canvasX, canvasY);
                            firstPoint = false;
                        } else {
                            this.ctx.lineTo(canvasX, canvasY);
                        }
                    } else {
                        firstPoint = true; // Reset for next valid point
                    }
                }
            } catch (error) {
                firstPoint = true; // Reset on error
            }
        }
        
        this.ctx.stroke();
    }
    
    plotPolarFunction(rExpression, color) {
        const calculator = this.state.getCurrentCalculator();
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        let firstPoint = true;
        const thetaMin = 0;
        const thetaMax = 2 * Math.PI;
        const thetaStep = Math.PI / 180; // 1 degree steps
        
        for (let theta = thetaMin; theta <= thetaMax; theta += thetaStep) {
            try {
                const r = this.evaluatePolarFunction(rExpression, theta);
                
                if (isFinite(r) && r >= 0) {
                    // Convert polar to cartesian
                    const x = r * Math.cos(theta);
                    const y = r * Math.sin(theta);
                    
                    const canvasX = this.originX + x * this.scaleX;
                    const canvasY = this.originY - y * this.scaleY;
                    
                    // Check if point is within canvas bounds (with some margin)
                    if (canvasX >= -50 && canvasX <= this.canvas.width + 50 && 
                        canvasY >= -50 && canvasY <= this.canvas.height + 50) {
                        
                        if (firstPoint) {
                            this.ctx.moveTo(canvasX, canvasY);
                            firstPoint = false;
                        } else {
                            this.ctx.lineTo(canvasX, canvasY);
                        }
                    } else {
                        firstPoint = true; // Reset for next valid point
                    }
                }
            } catch (error) {
                firstPoint = true; // Reset on error
            }
        }
        
        this.ctx.stroke();
    }
    
    evaluateParametricFunction(expression, t) {
        // Replace common mathematical notation for parametric functions
        let expr = expression
            .toLowerCase()
            .trim()
            // Handle implicit multiplication before t (like 5t, 2t, etc.)
            .replace(/(\d+)t/g, '$1*t')
            .replace(/(\d+)\s*t/g, '$1*t')
            // Handle implicit multiplication after parentheses
            .replace(/(\d+)\(/g, '$1*(')
            .replace(/\)(\d+)/g, ')*$1')
            .replace(/\)t/g, ')*t')
            .replace(/t\(/g, 't*(')
            // Replace t with the actual value
            .replace(/t/g, `(${t})`)
            // Replace mathematical functions
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log10')
            .replace(/ln/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
            .replace(/exp/g, 'Math.exp')
            // Replace constants
            .replace(/π/g, Math.PI)
            .replace(/pi/g, Math.PI)
            .replace(/e(?![0-9])/g, Math.E)
            // Replace exponentiation
            .replace(/\^/g, '**');
        
        try {
            return Function(`"use strict"; return (${expr})`)();
        } catch (error) {
            throw new Error('Parametric evaluation error');
        }
    }
    
    evaluatePolarFunction(expression, theta) {
        // Replace common mathematical notation for polar functions
        let expr = expression
            .toLowerCase()
            .trim()
            // Handle implicit multiplication before theta variables
            .replace(/(\d+)θ/g, '$1*theta')
            .replace(/(\d+)theta/g, '$1*theta')
            .replace(/(\d+)\s*θ/g, '$1*theta')
            .replace(/(\d+)\s*theta/g, '$1*theta')
            // Handle implicit multiplication after parentheses
            .replace(/(\d+)\(/g, '$1*(')
            .replace(/\)(\d+)/g, ')*$1')
            .replace(/\)θ/g, ')*theta')
            .replace(/\)theta/g, ')*theta')
            .replace(/θ\(/g, 'theta*(')
            .replace(/theta\(/g, 'theta*(')
            // Replace theta symbols with the actual value
            .replace(/θ/g, `(${theta})`)
            .replace(/theta/g, `(${theta})`)
            // Replace mathematical functions
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log10')
            .replace(/ln/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/abs/g, 'Math.abs')
            .replace(/exp/g, 'Math.exp')
            // Replace constants
            .replace(/π/g, Math.PI)
            .replace(/pi/g, Math.PI)
            .replace(/e(?![0-9])/g, Math.E)
            // Replace exponentiation
            .replace(/\^/g, '**');
        
        try {
            return Function(`"use strict"; return (${expr})`)();
        } catch (error) {
            throw new Error('Polar evaluation error');
        }
    }
    
    updateTable() {
        const tableBody = document.querySelector('.function-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        const calculator = this.state.getCurrentCalculator();
        const mode = calculator.mode;
        
        switch (mode) {
            case 'function':
                this.updateFunctionTable();
                break;
            case 'parametric':
                this.updateParametricTable();
                break;
            case 'polar':
                this.updatePolarTable();
                break;
        }
    }
    
    drawTracePoint() {
        const calculator = this.state.getCurrentCalculator();
        if (!calculator.trace || !calculator.tracePoint) return;
        
        const point = calculator.tracePoint;
        const canvasX = this.originX + point.x * this.scaleX;
        const canvasY = this.originY - point.y * this.scaleY;
        
        // Draw trace point
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw coordinate label
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        const label = `(${point.x.toFixed(3)}, ${point.y.toFixed(3)})`;
        const labelX = canvasX + 8;
        const labelY = canvasY - 8;
        
        // Draw background for label
        const metrics = this.ctx.measureText(label);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(labelX - 2, labelY - 12, metrics.width + 4, 16);
        
        // Draw label text
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(label, labelX, labelY);
    }
    
    updateFunctionTable() {
        const tableBody = document.querySelector('.function-table tbody');
        const calculator = this.state.getCurrentCalculator();
        
        // Initialize default X values if not exists
        if (!calculator.tableXValues) {
            calculator.tableXValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }
        
        // Update table header
        const tableHeader = document.querySelector('.function-table thead tr');
        if (tableHeader) {
            tableHeader.innerHTML = '<th>X (editable)</th><th>Y1</th><th>Y2</th><th>Y3</th>';
        }
        
        // Clear existing content
        tableBody.innerHTML = '';
        
        for (let i = 0; i < calculator.tableXValues.length; i++) {
            const x = calculator.tableXValues[i];
            const row = document.createElement('tr');
            
            // Create editable X input
            const xCell = document.createElement('td');
            const xInput = document.createElement('input');
            xInput.type = 'number';
            xInput.value = x;
            xInput.step = 'any';
            xInput.className = 'table-x-input';
            xInput.style.width = '80px';
            xInput.style.padding = '4px';
            xInput.style.border = '1px solid #ddd';
            xInput.style.borderRadius = '3px';
            xInput.style.textAlign = 'center';
            
            // Add event listener for X value changes
            xInput.addEventListener('input', (e) => {
                const newX = parseFloat(e.target.value);
                if (!isNaN(newX)) {
                    calculator.tableXValues[i] = newX;
                    this.state.saveState();
                    this.updateTableRow(row, newX, i);
                }
            });
            
            xCell.appendChild(xInput);
            row.appendChild(xCell);
            
            // Calculate Y values for this X
            ['y1', 'y2', 'y3'].forEach(funcName => {
                const yCell = document.createElement('td');
                yCell.className = `y-cell-${funcName}`;
                row.appendChild(yCell);
            });
            
            tableBody.appendChild(row);
            
            // Update the Y values for this row
            this.updateTableRow(row, x, i);
        }
        
        // Add a button to add more rows
        this.addTableControls();
    }
    
    updateTableRow(row, x, rowIndex) {
        const calculator = this.state.getCurrentCalculator();
        
        ['y1', 'y2', 'y3'].forEach(funcName => {
            const yCell = row.querySelector(`.y-cell-${funcName}`);
            const expression = calculator.functions[funcName];
            let value = '';
            
            // Only calculate if there's actually a function entered
            if (expression && expression.trim()) {
                try {
                    const y = this.evaluateFunction(expression, x);
                    value = isFinite(y) ? y.toFixed(4) : 'Error';
                } catch (error) {
                    value = 'Error';
                }
            }
            // If no function is entered, leave cell empty
            
            yCell.textContent = value;
            
            // Add color coding based on function - only if there's a value
            if (value !== '' && value !== 'Error') {
                const colors = ['#ff0000', '#00ff00', '#0000ff'];
                const colorIndex = ['y1', 'y2', 'y3'].indexOf(funcName);
                yCell.style.color = colors[colorIndex];
                yCell.style.fontWeight = 'bold';
            } else {
                yCell.style.color = '#999';
                yCell.style.fontWeight = 'normal';
                yCell.style.fontStyle = value === 'Error' ? 'normal' : 'italic';
            }
        });
    }
    
    addTableControls() {
        const tableContainer = document.querySelector('.function-table').parentElement;
        let controlsContainer = tableContainer.querySelector('.table-controls');
        
        if (!controlsContainer) {
            controlsContainer = document.createElement('div');
            controlsContainer.className = 'table-controls';
            controlsContainer.style.marginTop = '10px';
            controlsContainer.style.textAlign = 'center';
            
            // Add Row button
            const addRowBtn = document.createElement('button');
            addRowBtn.textContent = '+ Add Row';
            addRowBtn.className = 'table-control-btn';
            addRowBtn.style.padding = '6px 12px';
            addRowBtn.style.margin = '0 5px';
            addRowBtn.style.border = '1px solid #007bff';
            addRowBtn.style.backgroundColor = '#007bff';
            addRowBtn.style.color = 'white';
            addRowBtn.style.borderRadius = '4px';
            addRowBtn.style.cursor = 'pointer';
            
            addRowBtn.addEventListener('click', () => {
                this.addTableRow();
            });
            
            // Remove Row button
            const removeRowBtn = document.createElement('button');
            removeRowBtn.textContent = '- Remove Row';
            removeRowBtn.className = 'table-control-btn';
            removeRowBtn.style.padding = '6px 12px';
            removeRowBtn.style.margin = '0 5px';
            removeRowBtn.style.border = '1px solid #dc3545';
            removeRowBtn.style.backgroundColor = '#dc3545';
            removeRowBtn.style.color = 'white';
            removeRowBtn.style.borderRadius = '4px';
            removeRowBtn.style.cursor = 'pointer';
            
            removeRowBtn.addEventListener('click', () => {
                this.removeTableRow();
            });
            
            // Reset to Default button
            const resetBtn = document.createElement('button');
            resetBtn.textContent = 'Reset to 1-10';
            resetBtn.className = 'table-control-btn';
            resetBtn.style.padding = '6px 12px';
            resetBtn.style.margin = '0 5px';
            resetBtn.style.border = '1px solid #28a745';
            resetBtn.style.backgroundColor = '#28a745';
            resetBtn.style.color = 'white';
            resetBtn.style.borderRadius = '4px';
            resetBtn.style.cursor = 'pointer';
            
            resetBtn.addEventListener('click', () => {
                this.resetTableToDefault();
            });
            
            controlsContainer.appendChild(addRowBtn);
            controlsContainer.appendChild(removeRowBtn);
            controlsContainer.appendChild(resetBtn);
            
            tableContainer.appendChild(controlsContainer);
        }
    }
    
    addTableRow() {
        const calculator = this.state.getCurrentCalculator();
        const lastX = calculator.tableXValues[calculator.tableXValues.length - 1] || 0;
        calculator.tableXValues.push(lastX + 1);
        this.state.saveState();
        this.updateFunctionTable();
        ToastManager.show('Row added', 'success');
    }
    
    removeTableRow() {
        const calculator = this.state.getCurrentCalculator();
        if (calculator.tableXValues.length > 1) {
            calculator.tableXValues.pop();
            this.state.saveState();
            this.updateFunctionTable();
            ToastManager.show('Row removed', 'success');
        } else {
            ToastManager.show('Cannot remove last row', 'error');
        }
    }
    
    resetTableToDefault() {
        const calculator = this.state.getCurrentCalculator();
        calculator.tableXValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.state.saveState();
        this.updateFunctionTable();
        ToastManager.show('Table reset to X = 1-10', 'success');
    }
    
    updateParametricTable() {
        const tableBody = document.querySelector('.function-table tbody');
        const calculator = this.state.getCurrentCalculator();
        
        // Update table header
        const tableHeader = document.querySelector('.function-table thead tr');
        if (tableHeader) {
            tableHeader.innerHTML = '<th>T</th><th>X1</th><th>Y1</th><th>X2</th><th>Y2</th><th>X3</th><th>Y3</th>';
        }
        
        const tMin = -5;
        const tMax = 5;
        const tStep = 1;
        
        for (let t = tMin; t <= tMax; t += tStep) {
            const row = document.createElement('tr');
            let rowHtml = `<td>${t.toFixed(1)}</td>`;
            
            for (let i = 1; i <= 3; i++) {
                const xExpr = calculator.functions[`x${i}t`];
                const yExpr = calculator.functions[`y${i}t`];
                
                let xValue = '';
                let yValue = '';
                
                // Only calculate if there's actually a function entered
                if (xExpr && xExpr.trim()) {
                    try {
                        const x = this.evaluateParametricFunction(xExpr, t);
                        xValue = isFinite(x) ? x.toFixed(4) : 'Error';
                    } catch (error) {
                        xValue = 'Error';
                    }
                }
                // If no function is entered, leave empty
                
                if (yExpr && yExpr.trim()) {
                    try {
                        const y = this.evaluateParametricFunction(yExpr, t);
                        yValue = isFinite(y) ? y.toFixed(4) : 'Error';
                    } catch (error) {
                        yValue = 'Error';
                    }
                }
                // If no function is entered, leave empty
                
                rowHtml += `<td>${xValue}</td><td>${yValue}</td>`;
            }
            
            row.innerHTML = rowHtml;
            tableBody.appendChild(row);
        }
    }
    
    updatePolarTable() {
        const tableBody = document.querySelector('.function-table tbody');
        const calculator = this.state.getCurrentCalculator();
        
        // Update table header
        const tableHeader = document.querySelector('.function-table thead tr');
        if (tableHeader) {
            tableHeader.innerHTML = '<th>θ (deg)</th><th>r1</th><th>r2</th><th>r3</th>';
        }
        
        const thetaStep = 30; // 30 degree steps
        
        for (let degrees = 0; degrees <= 360; degrees += thetaStep) {
            const theta = degrees * Math.PI / 180; // Convert to radians
            const row = document.createElement('tr');
            
            let rowHtml = `<td>${degrees}°</td>`;
            
            for (let i = 1; i <= 3; i++) {
                const rExpr = calculator.functions[`r${i}`];
                let value = '';
                
                // Only calculate if there's actually a function entered
                if (rExpr && rExpr.trim()) {
                    try {
                        const r = this.evaluatePolarFunction(rExpr, theta);
                        value = isFinite(r) ? r.toFixed(4) : 'Error';
                    } catch (error) {
                        value = 'Error';
                    }
                }
                // If no function is entered, leave empty
                
                rowHtml += `<td>${value}</td>`;
            }
            
            row.innerHTML = rowHtml;
            tableBody.appendChild(row);
        }
    }
    
    zoom(factor) {
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        const centerX = (window.xmin + window.xmax) / 2;
        const centerY = (window.ymin + window.ymax) / 2;
        const rangeX = (window.xmax - window.xmin) * factor / 2;
        const rangeY = (window.ymax - window.ymin) * factor / 2;
        
        window.xmin = centerX - rangeX;
        window.xmax = centerX + rangeX;
        window.ymin = centerY - rangeY;
        window.ymax = centerY + rangeY;
        
        this.state.saveState();
        this.scheduleRender();
    }
    
    pan(deltaX, deltaY) {
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        const dx = -deltaX / this.scaleX;
        const dy = deltaY / this.scaleY;
        
        window.xmin += dx;
        window.xmax += dx;
        window.ymin += dy;
        window.ymax += dy;
        
        this.state.saveState();
        this.scheduleRender();
    }
    
    resetWindow() {
        const calculator = this.state.getCurrentCalculator();
        calculator.window = {
            xmin: -10,
            xmax: 10,
            ymin: -10,
            ymax: 10
        };
        
        this.state.saveState();
        this.scheduleRender();
        ToastManager.show('Window reset to [-10,10]', 'success');
    }
    
    toggleTrace() {
        const calculator = this.state.getCurrentCalculator();
        calculator.trace = !calculator.trace;
        
        if (calculator.trace) {
            ToastManager.show('Trace mode ON - Click on functions to trace', 'success');
            this.initializeTraceMode();
        } else {
            ToastManager.show('Trace mode OFF', 'success');
            this.disableTraceMode();
        }
        
        this.state.saveState();
        this.scheduleRender();
    }
    
    initializeTraceMode() {
        // Add trace cursor
        this.canvas.style.cursor = 'crosshair';
        
        // Add trace click handler
        this.traceClickHandler = (e) => {
            this.handleTraceClick(e);
        };
        
        this.canvas.addEventListener('click', this.traceClickHandler);
    }
    
    disableTraceMode() {
        this.canvas.style.cursor = 'default';
        
        if (this.traceClickHandler) {
            this.canvas.removeEventListener('click', this.traceClickHandler);
            this.traceClickHandler = null;
        }
        
        // Clear trace point
        const calculator = this.state.getCurrentCalculator();
        calculator.tracePoint = null;
    }
    
    handleTraceClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        const mathX = (canvasX - this.originX) / this.scaleX;
        const mathY = (this.originY - canvasY) / this.scaleY;
        
        // Find the closest function point
        let closestFunction = null;
        let closestDistance = Infinity;
        let closestPoint = null;
        
        if (calculator.mode === 'function') {
            ['y1', 'y2', 'y3'].forEach((funcName, index) => {
                const expression = calculator.functions[funcName];
                if (expression && expression.trim()) {
                    try {
                        const y = this.evaluateFunction(expression, mathX);
                        if (isFinite(y)) {
                            const distance = Math.abs(y - mathY);
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestFunction = funcName;
                                closestPoint = { x: mathX, y: y };
                            }
                        }
                    } catch (error) {
                        // Skip invalid points
                    }
                }
            });
        }
        
        if (closestPoint && closestDistance < 2) { // Within 2 units
            calculator.tracePoint = {
                function: closestFunction,
                x: closestPoint.x,
                y: closestPoint.y
            };
            
            ToastManager.show(`${closestFunction.toUpperCase()}: (${closestPoint.x.toFixed(3)}, ${closestPoint.y.toFixed(3)})`, 'info', 5000);
            this.scheduleRender();
        }
    }
    
    updateCursorCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        
        const calculator = this.state.getCurrentCalculator();
        const window = calculator.window;
        
        const mathX = (canvasX - this.originX) / this.scaleX;
        const mathY = (this.originY - canvasY) / this.scaleY;
        
        const coordsDisplay = document.getElementById('cursor-coords');
        if (coordsDisplay) {
            coordsDisplay.textContent = `X: ${mathX.toFixed(3)}, Y: ${mathY.toFixed(3)}`;
        }
    }
    
    focusOnFunction() {
        const firstInput = document.querySelector('.function-input');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    showWindowSettings() {
        ToastManager.show('Window settings: Use zoom controls or drag to pan', 'info');
    }
    
    showZoomMenu() {
        ToastManager.show('Zoom: Use mouse wheel, zoom buttons, or try zoom presets', 'info');
    }
    
    // Advanced zoom presets
    zoomStandard() {
        const calculator = this.state.getCurrentCalculator();
        calculator.window = {
            xmin: -10,
            xmax: 10,
            ymin: -10,
            ymax: 10
        };
        this.state.saveState();
        this.scheduleRender();
        ToastManager.show('Standard zoom: [-10,10]', 'success');
    }
    
    zoomTrig() {
        const calculator = this.state.getCurrentCalculator();
        calculator.window = {
            xmin: -2 * Math.PI,
            xmax: 2 * Math.PI,
            ymin: -4,
            ymax: 4
        };
        this.state.saveState();
        this.scheduleRender();
        ToastManager.show('Trig zoom: [-2π,2π] × [-4,4]', 'success');
    }
    
    zoomInteger() {
        const calculator = this.state.getCurrentCalculator();
        calculator.window = {
            xmin: -47,
            xmax: 47,
            ymin: -31,
            ymax: 31
        };
        this.state.saveState();
        this.scheduleRender();
        ToastManager.show('Integer zoom: pixel-perfect grid', 'success');
    }
    
    zoomSquare() {
        const calculator = this.state.getCurrentCalculator();
        const size = 10;
        calculator.window = {
            xmin: -size,
            xmax: size,
            ymin: -size,
            ymax: size
        };
        this.state.saveState();
        this.scheduleRender();
        ToastManager.show('Square zoom: equal x and y scales', 'success');
    }
    
    // Handle keyboard input for graphing calculator
    handleKeyInput(key) {
        // Basic navigation and function entry
        if (key === 'Enter') {
            this.scheduleRender();
            return true;
        }
        
        // Function shortcuts
        const shortcuts = {
            'g': 'GRAPH',
            'w': 'WINDOW',
            'z': 'ZOOM',
            't': 'TRACE',
            'y': 'Y=',
            '6': 'ZOOM_STANDARD',
            '7': 'ZOOM_TRIG',
            '8': 'ZOOM_INTEGER',
            '9': 'ZOOM_SQUARE'
        };
        
        if (shortcuts[key.toLowerCase()]) {
            this.handleTI84Command(shortcuts[key.toLowerCase()]);
            return true;
        }
        
        return false;
    }
}

// Conversion Calculator Engine
class ConversionCalculator {
    constructor(state, tabManager) {
        this.state = state;
        this.tabManager = tabManager;
        this.conversionData = this.initializeConversionData();
        this.currencyCache = null;
        this.currencyLastUpdate = null;
        this.initialized = false;
        // Don't auto-initialize - wait for tab to be accessed
        console.log('ConversionCalculator: Constructor completed, waiting for tab access');
    }
    
    initializeConversionCalculator() {
        if (this.initialized) {
            console.log('ConversionCalculator: Already initialized, skipping');
            return;
        }
        
        console.log('ConversionCalculator: Starting initialization...');
        const conversionPanel = document.getElementById('conversion-calculator');
        if (!conversionPanel) {
            console.error('ConversionCalculator: Panel not found!');
            return;
        }
        console.log('ConversionCalculator: Panel found, continuing initialization...');
        
        // Check if the panel is visible/active
        const isVisible = conversionPanel.classList.contains('active');
        console.log('ConversionCalculator: Panel is visible:', isVisible);
        
        // Initialize category selector
        console.log('ConversionCalculator: Initializing category selector...');
        this.initializeCategorySelector();
        
        // Initialize unit selectors
        console.log('ConversionCalculator: Initializing unit selectors...');
        this.initializeUnitSelectors();
        
        // Initialize input fields
        console.log('ConversionCalculator: Initializing input fields...');
        this.initializeInputFields();
        
        // Initialize convert button
        console.log('ConversionCalculator: Initializing convert button...');
        this.initializeConvertButton();
        
        // Initialize swap button
        console.log('ConversionCalculator: Initializing swap button...');
        this.initializeSwapButton();
        
        // Load saved state
        console.log('ConversionCalculator: Loading saved state...');
        this.loadSavedState();
        
        this.initialized = true;
        console.log('ConversionCalculator: Initialization complete');
    }
    
    initializeConversionData() {
        return {
            length: {
                name: 'Length',
                units: {
                    meter: { name: 'Meter', factor: 1 },
                    kilometer: { name: 'Kilometer', factor: 1000 },
                    centimeter: { name: 'Centimeter', factor: 0.01 },
                    millimeter: { name: 'Millimeter', factor: 0.001 },
                    inch: { name: 'Inch', factor: 0.0254 },
                    foot: { name: 'Foot', factor: 0.3048 },
                    yard: { name: 'Yard', factor: 0.9144 },
                    mile: { name: 'Mile', factor: 1609.344 }
                }
            },
            weight: {
                name: 'Weight',
                units: {
                    kilogram: { name: 'Kilogram', factor: 1 },
                    gram: { name: 'Gram', factor: 0.001 },
                    pound: { name: 'Pound', factor: 0.453592 },
                    ounce: { name: 'Ounce', factor: 0.0283495 },
                    ton: { name: 'Ton', factor: 1000 },
                    stone: { name: 'Stone', factor: 6.35029 }
                }
            },
            temperature: {
                name: 'Temperature',
                units: {
                    celsius: { name: 'Celsius' },
                    fahrenheit: { name: 'Fahrenheit' },
                    kelvin: { name: 'Kelvin' }
                }
            },
            volume: {
                name: 'Volume',
                units: {
                    liter: { name: 'Liter', factor: 1 },
                    milliliter: { name: 'Milliliter', factor: 0.001 },
                    gallon: { name: 'Gallon (US)', factor: 3.78541 },
                    quart: { name: 'Quart', factor: 0.946353 },
                    pint: { name: 'Pint', factor: 0.473176 },
                    cup: { name: 'Cup', factor: 0.236588 },
                    fluid_ounce: { name: 'Fluid Ounce', factor: 0.0295735 }
                }
            },
            area: {
                name: 'Area',
                units: {
                    square_meter: { name: 'Square Meter', factor: 1 },
                    square_kilometer: { name: 'Square Kilometer', factor: 1000000 },
                    square_centimeter: { name: 'Square Centimeter', factor: 0.0001 },
                    square_foot: { name: 'Square Foot', factor: 0.092903 },
                    square_inch: { name: 'Square Inch', factor: 0.00064516 },
                    acre: { name: 'Acre', factor: 4046.86 },
                    hectare: { name: 'Hectare', factor: 10000 }
                }
            },
            time: {
                name: 'Time',
                units: {
                    second: { name: 'Second', factor: 1 },
                    minute: { name: 'Minute', factor: 60 },
                    hour: { name: 'Hour', factor: 3600 },
                    day: { name: 'Day', factor: 86400 },
                    week: { name: 'Week', factor: 604800 },
                    month: { name: 'Month', factor: 2629746 },
                    year: { name: 'Year', factor: 31556952 }
                }
            },
            currency: {
                name: 'Currency',
                units: {
                    USD: { name: 'US Dollar' },
                    EUR: { name: 'Euro' },
                    GBP: { name: 'British Pound' },
                    JPY: { name: 'Japanese Yen' },
                    CAD: { name: 'Canadian Dollar' },
                    AUD: { name: 'Australian Dollar' },
                    CHF: { name: 'Swiss Franc' },
                    CNY: { name: 'Chinese Yuan' },
                    INR: { name: 'Indian Rupee' },
                    BRL: { name: 'Brazilian Real' }
                }
            }
        };
    }
    
    initializeCategorySelector() {
        console.log('ConversionCalculator: Initializing category selector...');
        const categorySelect = document.getElementById('conversion-type');
        if (!categorySelect) {
            console.log('ConversionCalculator: Category select not found!');
            return;
        }
        console.log('ConversionCalculator: Category select found');
        
        // Use existing HTML options - don't recreate them
        // The HTML already contains the correct category options
        
        // Add event listener
        categorySelect.addEventListener('change', (e) => {
            this.handleCategoryChange(e.target.value);
        });
        
        // Initialize with the currently selected category (defaults to first option in HTML)
        const currentCategory = categorySelect.value || 'length';
        console.log('ConversionCalculator: Initializing with category:', currentCategory);
        this.handleCategoryChange(currentCategory);
    }
    
    initializeUnitSelectors() {
        const fromUnitSelect = document.getElementById('from-unit');
        const toUnitSelect = document.getElementById('to-unit');
        
        if (fromUnitSelect) {
            fromUnitSelect.addEventListener('change', () => {
                this.saveCurrentState();
                this.performConversion();
            });
        }
        
        if (toUnitSelect) {
            toUnitSelect.addEventListener('change', () => {
                this.saveCurrentState();
                this.performConversion();
            });
        }
    }
    
    initializeInputFields() {
        const fromValueInput = document.getElementById('from-value');
        const toValueInput = document.getElementById('to-value');
        
        if (fromValueInput) {
            fromValueInput.addEventListener('input', (e) => {
                this.handleFromValueChange(e.target.value);
            });
        }
        
        if (toValueInput) {
            toValueInput.addEventListener('input', (e) => {
                this.handleToValueChange(e.target.value);
            });
        }
    }
    
    initializeConvertButton() {
        // No dedicated convert button in HTML - conversions happen automatically
        // Add a swap button to the conversion arrow
        const conversionArrow = document.querySelector('.conversion-arrow');
        if (conversionArrow) {
            conversionArrow.style.cursor = 'pointer';
            conversionArrow.title = 'Click to swap units';
            conversionArrow.addEventListener('click', () => {
                this.swapUnits();
            });
        }
    }
    
    initializeSwapButton() {
        // Handled in initializeConvertButton
    }
    
    handleCategoryChange(category) {
        console.log('ConversionCalculator: Handling category change to:', category);
        this.updateUnitSelectors(category);
        this.saveCurrentState();
        this.clearValues();
        
        // Load currency rates if currency category is selected
        if (category === 'currency') {
            this.loadCurrencyRates();
        }
    }
    
    updateUnitSelectors(category) {
        console.log('ConversionCalculator: Updating unit selectors for category:', category);
        const fromUnitSelect = document.getElementById('from-unit');
        const toUnitSelect = document.getElementById('to-unit');
        
        console.log('ConversionCalculator: From unit select:', fromUnitSelect ? 'found' : 'not found');
        console.log('ConversionCalculator: To unit select:', toUnitSelect ? 'found' : 'not found');
        console.log('ConversionCalculator: Category data exists:', this.conversionData[category] ? 'yes' : 'no');
        
        if (!fromUnitSelect || !toUnitSelect) {
            console.error('ConversionCalculator: Unit select elements not found! Aborting unit selector update');
            return;
        }
        
        if (!this.conversionData[category]) {
            console.error('ConversionCalculator: Category data not found for:', category);
            console.log('ConversionCalculator: Available categories:', Object.keys(this.conversionData));
            return;
        }
        
        // Clear existing options
        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';
        
        // Add units for the selected category
        const units = this.conversionData[category].units;
        console.log('ConversionCalculator: Units for category', category, ':', Object.keys(units));
        
        Object.keys(units).forEach(unitKey => {
            const fromOption = document.createElement('option');
            fromOption.value = unitKey;
            fromOption.textContent = units[unitKey].name;
            fromUnitSelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = unitKey;
            toOption.textContent = units[unitKey].name;
            toUnitSelect.appendChild(toOption);
        });
        
        // Set default selections (different units)
        const unitKeys = Object.keys(units);
        if (unitKeys.length > 1) {
            fromUnitSelect.value = unitKeys[0];
            toUnitSelect.value = unitKeys[1];
        } else if (unitKeys.length > 0) {
            fromUnitSelect.value = unitKeys[0];
            toUnitSelect.value = unitKeys[0];
        }
        
        console.log('ConversionCalculator: Unit selectors updated. From:', fromUnitSelect.value, 'To:', toUnitSelect.value);
        console.log('ConversionCalculator: From options count:', fromUnitSelect.options.length);
        console.log('ConversionCalculator: To options count:', toUnitSelect.options.length);
    }
    
    handleFromValueChange(value) {
        this.saveCurrentState();
        if (value.trim()) {
            this.performConversion();
        } else {
            this.clearToValue();
        }
    }
    
    handleToValueChange(value) {
        this.saveCurrentState();
        if (value.trim()) {
            this.performReverseConversion();
        } else {
            this.clearFromValue();
        }
    }
    
    performConversion() {
        const fromValue = parseFloat(document.getElementById('from-value')?.value);
        const fromUnit = document.getElementById('from-unit')?.value;
        const toUnit = document.getElementById('to-unit')?.value;
        const category = document.getElementById('conversion-type')?.value;
        
        if (isNaN(fromValue) || !fromUnit || !toUnit || !category) return;
        
        try {
            let result;
            
            if (category === 'temperature') {
                result = this.convertTemperature(fromValue, fromUnit, toUnit);
            } else if (category === 'currency') {
                result = this.convertCurrency(fromValue, fromUnit, toUnit);
            } else {
                result = this.convertStandardUnit(fromValue, fromUnit, toUnit, category);
            }
            
            if (result !== null) {
                document.getElementById('to-value').value = this.formatResult(result);
                this.addToHistory(fromValue, fromUnit, result, toUnit, category);
            }
        } catch (error) {
            ToastManager.show('Conversion error: ' + error.message, 'error');
        }
    }
    
    performReverseConversion() {
        const toValue = parseFloat(document.getElementById('to-value')?.value);
        const fromUnit = document.getElementById('from-unit')?.value;
        const toUnit = document.getElementById('to-unit')?.value;
        const category = document.getElementById('conversion-type')?.value;
        
        if (isNaN(toValue) || !fromUnit || !toUnit || !category) return;
        
        try {
            let result;
            
            if (category === 'temperature') {
                result = this.convertTemperature(toValue, toUnit, fromUnit);
            } else if (category === 'currency') {
                result = this.convertCurrency(toValue, toUnit, fromUnit);
            } else {
                result = this.convertStandardUnit(toValue, toUnit, fromUnit, category);
            }
            
            if (result !== null) {
                document.getElementById('from-value').value = this.formatResult(result);
            }
        } catch (error) {
            ToastManager.show('Conversion error: ' + error.message, 'error');
        }
    }
    
    convertStandardUnit(value, fromUnit, toUnit, category) {
        const categoryData = this.conversionData[category];
        if (!categoryData || !categoryData.units[fromUnit] || !categoryData.units[toUnit]) {
            throw new Error('Invalid units');
        }
        
        const fromFactor = categoryData.units[fromUnit].factor;
        const toFactor = categoryData.units[toUnit].factor;
        
        // Convert to base unit, then to target unit
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    }
    
    convertTemperature(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        
        // Convert to Celsius first
        let celsius;
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                throw new Error('Invalid temperature unit');
        }
        
        // Convert from Celsius to target unit
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return celsius * 9/5 + 32;
            case 'kelvin':
                return celsius + 273.15;
            default:
                throw new Error('Invalid temperature unit');
        }
    }
    
    convertCurrency(value, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return value;
        
        if (!this.currencyCache) {
            ToastManager.show('Currency rates not loaded. Please wait...', 'info');
            this.loadCurrencyRates();
            return null;
        }
        
        const fromRate = this.currencyCache[fromCurrency];
        const toRate = this.currencyCache[toCurrency];
        
        if (!fromRate || !toRate) {
            throw new Error('Currency rate not available');
        }
        
        // Convert via USD
        const usdValue = value / fromRate;
        return usdValue * toRate;
    }
    
    async loadCurrencyRates() {
        // Check if we have recent data (less than 1 hour old)
        if (this.currencyCache && this.currencyLastUpdate) {
            const hourAgo = Date.now() - (60 * 60 * 1000);
            if (this.currencyLastUpdate > hourAgo) {
                return;
            }
        }
        
        try {
            ToastManager.show('Loading currency rates...', 'info');
            
            // Use exchangerate-api.io (free tier)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data && data.rates) {
                this.currencyCache = { USD: 1, ...data.rates };
                this.currencyLastUpdate = Date.now();
                ToastManager.show('Currency rates updated', 'success');
                
                // Perform conversion if values are present
                const fromValue = document.getElementById('from-value')?.value;
                if (fromValue && fromValue.trim()) {
                    this.performConversion();
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Currency API error:', error);
            // Fallback to approximate rates
            this.currencyCache = {
                USD: 1,
                EUR: 0.85,
                GBP: 0.73,
                JPY: 110,
                CAD: 1.25,
                AUD: 1.35,
                CHF: 0.92,
                CNY: 6.45,
                INR: 74,
                BRL: 5.2
            };
            this.currencyLastUpdate = Date.now();
            ToastManager.show('Using approximate currency rates', 'warning');
        }
    }
    
    swapUnits() {
        const fromUnitSelect = document.getElementById('from-unit');
        const toUnitSelect = document.getElementById('to-unit');
        const fromValueInput = document.getElementById('from-value');
        const toValueInput = document.getElementById('to-value');
        
        if (fromUnitSelect && toUnitSelect) {
            // Swap unit selections
            const tempUnit = fromUnitSelect.value;
            fromUnitSelect.value = toUnitSelect.value;
            toUnitSelect.value = tempUnit;
            
            // Swap values
            if (fromValueInput && toValueInput) {
                const tempValue = fromValueInput.value;
                fromValueInput.value = toValueInput.value;
                toValueInput.value = tempValue;
            }
            
            this.saveCurrentState();
            ToastManager.show('Units swapped', 'success');
        }
    }
    
    formatResult(value) {
        if (Math.abs(value) >= 1000000 || (Math.abs(value) < 0.001 && value !== 0)) {
            return value.toExponential(6);
        } else {
            return parseFloat(value.toFixed(8)).toString();
        }
    }
    
    addToHistory(fromValue, fromUnit, toValue, toUnit, category) {
        const calculator = this.state.getCurrentCalculator();
        const fromUnitName = this.conversionData[category].units[fromUnit].name;
        const toUnitName = this.conversionData[category].units[toUnit].name;
        
        const historyEntry = `${fromValue} ${fromUnitName} = ${this.formatResult(toValue)} ${toUnitName}`;
        this.state.addHistoryEntry('conversion', historyEntry);
        
        // Update history display
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const calculator = this.state.getCurrentCalculator();
        const historyContainer = document.querySelector('#conversion-calculator .history-list');
        
        if (historyContainer) {
            historyContainer.innerHTML = '';
            calculator.history.slice(-10).forEach(entry => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = entry;
                historyContainer.appendChild(historyItem);
            });
            historyContainer.scrollTop = historyContainer.scrollHeight;
        }
    }
    
    clearValues() {
        const fromValueInput = document.getElementById('from-value');
        const toValueInput = document.getElementById('to-value');
        
        if (fromValueInput) fromValueInput.value = '';
        if (toValueInput) toValueInput.value = '';
    }
    
    clearFromValue() {
        const fromValueInput = document.getElementById('from-value');
        if (fromValueInput) fromValueInput.value = '';
    }
    
    clearToValue() {
        const toValueInput = document.getElementById('to-value');
        if (toValueInput) toValueInput.value = '';
    }
    
    saveCurrentState() {
        const calculator = this.state.getCurrentCalculator();
        
        calculator.category = document.getElementById('conversion-type')?.value || 'length';
        calculator.fromUnit = document.getElementById('from-unit')?.value || '';
        calculator.toUnit = document.getElementById('to-unit')?.value || '';
        calculator.fromValue = document.getElementById('from-value')?.value || '';
        calculator.toValue = document.getElementById('to-value')?.value || '';
        
        this.state.saveState();
    }
    
    loadSavedState() {
        const calculator = this.state.getCurrentCalculator();
        
        // Set category
        const categorySelect = document.getElementById('conversion-type');
        if (categorySelect && calculator.category) {
            categorySelect.value = calculator.category;
            this.updateUnitSelectors(calculator.category);
        }
        
        // Set units
        setTimeout(() => {
            const fromUnitSelect = document.getElementById('from-unit');
            const toUnitSelect = document.getElementById('to-unit');
            
            if (fromUnitSelect && calculator.fromUnit) {
                fromUnitSelect.value = calculator.fromUnit;
            }
            if (toUnitSelect && calculator.toUnit) {
                toUnitSelect.value = calculator.toUnit;
            }
            
            // Set values
            const fromValueInput = document.getElementById('from-value');
            const toValueInput = document.getElementById('to-value');
            
            if (fromValueInput && calculator.fromValue) {
                fromValueInput.value = calculator.fromValue;
            }
            if (toValueInput && calculator.toValue) {
                toValueInput.value = calculator.toValue;
            }
            
            // Update history
            this.updateHistoryDisplay();
            
            // Load currency rates if needed
            if (calculator.category === 'currency') {
                this.loadCurrencyRates();
            }
        }, 100);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Create global state
    window.calculatorState = new CalculatorState();
    
    // Initialize tab manager
    window.tabManager = new TabManager(window.calculatorState);
    
    // Initialize basic calculator
    window.basicCalculator = new BasicCalculator(window.calculatorState, window.tabManager);
    
    // Initialize scientific calculator
    window.scientificCalculator = new ScientificCalculator(window.calculatorState, window.tabManager);
    
    // Initialize graphing calculator
    window.graphingCalculator = new GraphingCalculator(window.calculatorState, window.tabManager);
    
    // Create conversion calculator instance and initialize it immediately for testing
    console.log('Main: Creating ConversionCalculator instance...');
    window.conversionCalculator = new ConversionCalculator(window.calculatorState, window.tabManager);
    console.log('Main: ConversionCalculator instance created');
    
    // Force initialization for testing
    console.log('Main: Force initializing ConversionCalculator for testing...');
    setTimeout(() => {
        window.conversionCalculator.initializeConversionCalculator();
    }, 100);
    
    // Add global event listeners
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Initialize clear history buttons
    document.querySelectorAll('.clear-history').forEach(button => {
        button.addEventListener('click', (e) => {
            const panel = e.target.closest('.calculator-panel');
            const calculatorType = panel.id.replace('-calculator', '');
            window.calculatorState.clearHistory(calculatorType);
            window.tabManager.updateHistory(calculatorType, []);
            ToastManager.show('History cleared', 'success');
        });
    });
    

    
    // Conversion type selector is handled by ConversionCalculator class
    
    console.log('Calculator application initialized');
    ToastManager.show('Calculator ready!', 'success');
});

// Keyboard input handler
function handleKeyboardInput(event) {
    // Get currently active calculator
    const activeTab = window.calculatorState.activeTab;
    
    // Don't interfere with input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Handle different key inputs based on active tab
    switch (activeTab) {
        case 'basic':
            if (window.basicCalculator && window.basicCalculator.handleKeyInput(event.key)) {
                event.preventDefault();
            }
            break;
        case 'scientific':
            handleScientificKeys(event);
            break;
        case 'graphing':
            handleGraphingKeys(event);
            break;
        // Conversion and insurance calculators use normal input fields
    }
}

function handleScientificKeys(event) {
    if (window.scientificCalculator && window.scientificCalculator.handleKeyInput(event.key)) {
        event.preventDefault();
    }
}

function handleGraphingKeys(event) {
    if (window.graphingCalculator && window.graphingCalculator.handleKeyInput(event.key)) {
        event.preventDefault();
    }
}

// Add CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 