# Multi-Calculator App

A comprehensive web-based calculator application featuring four distinct calculator types with a modern, responsive interface. Built with vanilla HTML, CSS, and JavaScript.

## 🚀 Features

### 📱 Four Calculator Types
- **Basic Calculator** - Standard arithmetic operations
- **Scientific Calculator** - Advanced mathematical functions
- **Graphing Calculator** - Function plotting and analysis
- **Conversion Calculator** - Unit conversions across multiple categories

### ✨ Key Highlights
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **State Persistence** - Calculations and settings saved locally
- **History Tracking** - Keep track of your calculations (max 50 entries per calculator)
- **Keyboard Support** - Full keyboard input support for efficient operation
- **Toast Notifications** - Visual feedback for user actions
- **Modern UI** - Clean, intuitive interface with smooth animations

## 🧮 Calculator Details

### Basic Calculator
- Standard arithmetic operations (+, -, ×, ÷)
- Percentage calculations
- Plus/minus toggle
- Clear and backspace functionality
- Calculation history

### Scientific Calculator
- **Trigonometric Functions**: sin, cos, tan, arcsin, arccos, arctan
- **Logarithmic Functions**: log, ln, exponential
- **Power Functions**: x², xʸ, √, ∛
- **Mathematical Constants**: π, e
- **Memory Functions**: MC, MR, M+, M-
- **Additional**: factorial, absolute value, modulo
- **Angle Modes**: Degrees and Radians
- **Parentheses Support**: Complex expression evaluation

### Graphing Calculator
- **Function Plotting**: Plot up to 3 functions simultaneously (Y1, Y2, Y3)
- **Multiple Modes**: Function, Parametric, and Polar plotting
- **Interactive Features**:
  - Zoom controls (In, Out, Fit, Standard, Trig, Integer, Square)
  - Pan and trace functionality
  - Coordinate display
  - Function table generation
- **TI-84 Style Interface**: Familiar button layout and commands
- **Mobile Responsive**: Toggle between graph and keypad views
- **Color-coded Functions**: Each function has its own color

### Conversion Calculator
- **Length**: Meters, kilometers, inches, feet, yards, miles, etc.
- **Weight**: Grams, kilograms, pounds, ounces, etc.
- **Temperature**: Celsius, Fahrenheit, Kelvin
- **Volume**: Liters, gallons, cups, fluid ounces, etc.
- **Area**: Square meters, acres, square feet, etc.
- **Time**: Seconds, minutes, hours, days, weeks, years
- **Currency**: Real-time exchange rates (requires internet)
- **Bidirectional Conversion**: Convert in both directions
- **Swap Functionality**: Quickly swap units

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks or libraries
- **LocalStorage API** - State persistence
- **Canvas API** - Graph rendering
- **Fetch API** - Currency exchange rate fetching

## 📁 Project Structure

```
CalculatorProgram/
├── index.html          # Main HTML structure
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── .gitignore         # Git ignore patterns
├── README.md          # Project documentation
└── tasks.md           # Development tasks and notes
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required

### Installation & Usage

1. **Clone or Download**
   ```bash
   git clone <repository-url>
   cd CalculatorProgram
   ```

2. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local server for development:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```

3. **Start Calculating!**
   - Click on different calculator tabs to switch modes
   - Use mouse clicks or keyboard input
   - Your progress is automatically saved

## ⌨️ Keyboard Shortcuts

### Basic & Scientific Calculators
- **Numbers**: `0-9`
- **Operations**: `+`, `-`, `*`, `/`
- **Execute**: `Enter` or `=`
- **Clear**: `c` or `C`
- **Backspace**: `Backspace`

### Graphing Calculator
- **Function Entry**: Type directly in function input fields
- **Graph Controls**: Use mouse for pan/zoom
- **Trace Mode**: Click trace button and use arrow keys

## 🎯 Usage Examples

### Basic Calculation
1. Click the **Basic** tab
2. Enter: `25 + 15 × 2`
3. Press `=` to get result: `55`

### Scientific Function
1. Click the **Scientific** tab
2. Enter: `sin(45)` (in degree mode)
3. Result: `0.7071067811865476`

### Graphing Functions
1. Click the **Graphing** tab
2. Enter `x^2` in Y1 field
3. Enter `2*x + 1` in Y2 field
4. Click **Graph** to plot both functions

### Unit Conversion
1. Click the **Conversion** tab
2. Select "Length" category
3. Enter `100` in the "From" field (meters)
4. Select "feet" in the "To" dropdown
5. Result automatically converts to feet

## 🔧 Development

### Code Structure
- **CalculatorState**: Manages application state and persistence
- **TabManager**: Handles tab switching and UI updates
- **Calculator Classes**: Separate classes for each calculator type
- **Utility Classes**: Toast notifications, input feedback, etc.

### Key Features
- **Modular Design**: Each calculator is independently implemented
- **State Management**: Centralized state with localStorage persistence
- **Error Handling**: Graceful error handling for invalid operations
- **Performance**: Optimized rendering for smooth interactions

## 📱 Mobile Support

The application is fully responsive and includes:
- Touch-friendly button sizes
- Mobile-optimized layouts
- Swipe gestures for graphing calculator
- Adaptive font sizes
- Horizontal scroll support where needed

## 🐛 Known Issues & Limitations

- Currency conversion requires internet connection
- Complex mathematical expressions in graphing calculator have limitations
- Some advanced scientific functions may have precision limitations
- Mobile keyboard may interfere with app keyboard shortcuts

## 🤝 Contributing

This is a learning project. Feel free to:
- Report bugs
- Suggest improvements
- Add new features
- Optimize performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🚀 Future Enhancements

- [ ] Add more calculator types (Matrix, Statistics, etc.)
- [ ] Implement themes/dark mode
- [ ] Add more graphing functions
- [ ] Export/import calculation history
- [ ] Add calculator-specific help guides
- [ ] Implement equation solver
- [ ] Add unit test coverage

---

**Made with ❤️ for learning and education** 