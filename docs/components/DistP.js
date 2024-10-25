import * as Plot from "npm:@observablehq/plot";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { require } from "d3-require";
const jStat = await require("jstat@1.9.4");
const math = await require("mathjs@9.4.2");


export class DistP {
    /**
     * @param {string} name - Name of the distribution.
     * @param {string} lever - Lever the distribution is associated with.
     * @param {function|string} distfunc - A distribution function or 'fitted' to sample based on provided data.
     * @param {array} bounds - Array [lower bound, upper bound].
     * @param {string} boundMethod - Bound method to handle outliers, e.g., 'drop_recursive'.
     * @param {object} kwargs - Keyword arguments for the distribution function.
     * @param {number} size - Size of samples array.
     * @param {array} samples - Sample data for the distribution.
     */
    constructor({
        name = 'default name',
        lever = 'default lever',
        distfunc = 'default',
        bounds = [0, 1e6],
        boundMethod = 'drop_recursive',
        size = 5000,
        kwargs = {},
        samples = [0, 1, 2]
    } = {}) {
        this.name = name;
        this.lever = lever;
        this.distfunc = distfunc;
        this.bounds = bounds;
        this.boundMethod = boundMethod;
        this.size = size;
        this.kwargs = kwargs;
        this.samples = samples;
        this.samplesMean = 0;
        this.samplesMedian = 0;
        this.samplesStd = 0;
        this.samplesPercentiles = [];

        this.postInit();
    }

    postInit() {
        if (this.distfunc === 'default') return;

        if (this.distfunc === 'fitted') {
            this.samples = this._fitted();
        } else {
            this.samples = this.distfunc(this.size, this.kwargs);
            if (this.bounds) this._bounds();
        }

        this.updateDistStats();
    }

    updateDistStats() {
        const mean = this._mean(this.samples);
        const median = this._median(this.samples);
        const std = this._std(this.samples);

        this.samplesMean = mean;
        this.samplesMedian = median;
        this.samplesStd = std;
        this.samplesPercentiles = [0, 25, 50, 75, 100].map(p =>
            this._percentile(this.samples, p)
        );
    }

    _mean(data) {
        return data.reduce((a, b) => a + b, 0) / data.length;
    }

    _median(data) {
        const sorted = data.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
            ? sorted[middle]
            : (sorted[middle - 1] + sorted[middle]) / 2;
    }

    _std(data) {
        const mean = this._mean(data);
        const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    }

    _percentile(arr, p) {
        arr.sort((a, b) => a - b);
        const index = (p / 100) * (arr.length - 1);
        const lower = Math.floor(index);
        const upper = lower + 1;
        const weight = index % 1;

        return upper < arr.length
            ? arr[lower] * (1 - weight) + arr[upper] * weight
            : arr[lower];
    }

    _fitted() {
        const filtered = this.samples.filter(
            x => x >= this.bounds[0] && x <= this.bounds[1]
        );
        const randomIndices = Array.from({ length: this.size }, () =>
            Math.floor(Math.random() * filtered.length)
        );
        return randomIndices.map(i => filtered[i]);
    }

    multConst(k) {
        this.samples = this.samples.map(x => x * k);
    }

    chainMult(distribution) {
        this.samples = this.samples.map((x, i) => x * distribution.samples[i]);
    }

    chainDivide(distribution) {
        this.samples = this.samples.map((x, i) => x / distribution.samples[i]);
    }

    chainAdd(distribution) {
        this.samples = this.samples.map((x, i) => x + distribution.samples[i]);
    }

    chainSub(distribution) {
        this.samples = this.samples.map((x, i) => x - distribution.samples[i]);
    }

    confInt(ci = [2.5, 97.5]) {
        return ci.map(p => this._percentile(this.samples, p));
    }

    _bounds() {
        if (this.boundMethod === 'stack') {
            this.samples = this.samples.map(x =>
                x < this.bounds[0] ? this.bounds[0] : x > this.bounds[1] ? this.bounds[1] : x
            );
        } else if (this.boundMethod === 'drop_recursive') {
            this.samples = this._boundsSampler(this.bounds, this.samples);
        }
    }

    _boundsSampler(bounds, samples) {
        samples = samples.filter(x => x >= bounds[0] && x <= bounds[1]);

        if (samples.length >= this.size) {
            return this._sampleRandomly(samples, this.size);
        } else {
            const fracMiss = samples.length / this.size;
            const newSize = Math.floor(this.size / fracMiss);
            return this._sampleRandomly(samples.concat(samples), newSize);
        }
    }

    _sampleRandomly(arr, size) {
        return Array.from({ length: size }, () => arr[Math.floor(Math.random() * arr.length)]);
    }

    histplot(args = {}) {
        // Use Plotly or d3.js to create a histogram for visualization
        Plotly.newPlot(
            args.container,
            [{ x: this.samples, type: 'histogram', cumulative: { enabled: args.cumulative } }],
            { title: 'Histogram Plot' }
        );
    }

    kdeplot(args = {}) {
        // Use d3.js or other libraries for KDE plot
        // For simplicity, I leave this for customization
    }
}

export class MatrixSolver {

    constructor({
        currentState = math.matrix([
            [3000],
            [6000],
            [2200],
            [1800],
            [200]
          ]), 
        transferMatrix =math.matrix([
            [0.7500, 0.1000, 0.1000, 0.0000, 0.0000],
            [0.1500, 0.8500, 0.0500, 0.0000, 0.0500],
            [0.0500, 0.0000, 0.8000, 0.0500, 0.0500],
            [0.0500, 0.1000, 0.0000, 0.9500, 0.1000],
            [0.0000, 0.0500, 0.0500, 0.0000, 0.8500]
          ]),
        costMatrix = math.matrix([
            [500], 
            [200], 
            [150], 
            [100], 
            [50]]) 
        } = {}) 
        {
            this.currentState = currentState;
            this.transferMatrix = transferMatrix;
            this.costMatrix = costMatrix;
            this.futureState = math.multiply(transferMatrix, currentState);
            this.difference = math.subtract(this.futureState, this.currentState);
            this.cost_difference = math.dotMultiply(this.difference, this.costMatrix);
            this.cost_difference_total = math.sum(this.cost_difference);
        }

    formatCurrency(amount) {
            return amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

    generateLatexEquation() {
        // Ensure currentState is an array of arrays (matrix)
        if (!Array.isArray(this.currentState.toArray()) || !this.currentState.toArray().every(Array.isArray)) {
            throw new TypeError("currentState must be an array of arrays");
        }
    
        // Ensure transferMatrix is an array of arrays (matrix)
        if (!Array.isArray(this.transferMatrix.toArray()) || !this.transferMatrix.toArray().every(Array.isArray)) {
            throw new TypeError("transferMatrix must be an array of arrays");
        }
    
        // Ensure futureState is an array of arrays (matrix)
        if (!Array.isArray(this.futureState.toArray()) || !this.futureState.toArray().every(Array.isArray)) {
            throw new TypeError("futureState must be an array of arrays");
        }
    
        // Convert currentState to LaTeX format
        const currentStateLatex = this.currentState.toArray()
            .map(row => `${row[0]}`)  // Format each row
            .join(' \\\\\n');  // Join rows with LaTeX newline
        
        // Convert transferMatrix to LaTeX format
        const transferMatrixLatex = this.transferMatrix.toArray()
            .map(row => row.map(value => `${value.toFixed(4)}`).join(' & '))  // Format each row with "&" separator
            .join(' \\\\\n');  // Join rows with LaTeX newline
        
        // Convert futureState to LaTeX format
        const futureStateLatex = this.futureState.toArray()
            .map(row => `${row[0].toFixed(2)}`)  // Format each row
            .join(' \\\\\n');  // Join rows with LaTeX newline

        // Convert difference (State_future - State_current) to LaTeX format
        const differenceLatex = this.difference.toArray()
            .map(row => `${this.formatCurrency(row[0].toFixed(2))}`)
            .join(' \\\\\n');

        // Convert cost matrix to LaTeX format
        const costMatrixLatex = this.costMatrix.toArray()
            .map(row => `\\$${this.formatCurrency(row[0].toFixed(2))}`)
            .join(' \\\\\n');

        // Convert cost difference to LaTeX format
        const costDifferenceLatex = this.cost_difference.toArray()
            .map(row => `\\$${this.formatCurrency(row[0].toFixed(2))}`)
            .join(' \\\\\n');

        // Construct the full LaTeX equation string for main state calculations
        const calculationStateLatex = `
        \\\\
        \\\\
    \\text{State}_{\\text{current}} \\times \\mathbf{T}_{\\text{transfer}} = \\text{State}_{\\text{future}}
    \\\\
    ~\\\\
    \\therefore
    \\\\
    ~\\\\
    
    \\begin{bmatrix}
    ${currentStateLatex}
    \\end{bmatrix}
    \\times
    \\begin{bmatrix}
    ${transferMatrixLatex}
    \\end{bmatrix}
    =
    \\begin{bmatrix}
    ${futureStateLatex}
    \\end{bmatrix}
        `;
    
    // Construct the LaTeX equation string for cost difference calculations
    const costDifferenceLatexOutput = `
    \\\\
    \\\\
    \\\\
    \\text{Future} - \\text{Current} = \\text{Difference} \\odot \\text{Cost} = \\text{Total Cost Differential}
    \\\\
    ~\\\\
    \\\\
    \\Bigg(
    \\begin{bmatrix}
    ${futureStateLatex}
    \\end{bmatrix}
    \\ - 
    \\begin{bmatrix}
    ${currentStateLatex}
    \\end{bmatrix}
    \\Bigg)
    =
    \\begin{bmatrix}
    ${differenceLatex}
    \\end{bmatrix}
    \\odot
    \\begin{bmatrix}
    ${costMatrixLatex}
    \\end{bmatrix}
    =
    \\begin{bmatrix}
    ${costDifferenceLatex}
    \\end{bmatrix}
    \\\\
    \\\\
    \\\\
    ~\\\\
    \\text{Total Cost Differential} = \\$${this.cost_difference_total.toFixed(2)}
`;
    
        // Return two separate LaTeX outputs: one for the main equation and one for cost difference
        return {
            "matrices": {
                "currentState": this.currentState,
                "transferStateMatrix": this.transferMatrix,
                "futureStateMatrix": this.futureState,
                "differenceMatrix": this.difference,
                "costDifferenceMatrix": this.cost_difference,
                "costDifferenceTotal": this.cost_difference_total
            },
            "latex-matrices": {
                "currentStateMatrix_tex": currentStateLatex,
                "futureStateMatrix_tex": futureStateLatex,
                "transferStateMatrix_tex": transferMatrixLatex,
                "differenceMatrix_tex": differenceLatex,
                "costMatrix_tex": costMatrixLatex,
                "costDifferenceMatrix_tex": costDifferenceLatex,
                "calculationStateMatrix_tex": calculationStateLatex,
            },
            "latex-cost-difference": {
                "costDifferenceMatrix_tex": costDifferenceLatexOutput
            }
        };
    }
}


