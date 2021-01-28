//Polynomial, transfer function class
class Polynomial {
    //Constructor
    constructor(...args) {
        //Format check
        if (args.length > 2) throw ('The input has at most two elements: numerator and denominator');
        if (!args.length) throw ('Input can not be empty');
        let num = (typeof args[0][0] === 'number') ? args : args[0];
        for (let i = 0; i < num.length; i++) {
            if (!Polynomial.isPolynomial(num[i])) throw ('Wrong format');
        }
        this.numerator = Array.clone(num[0]);                       //Numerator
        this.denominator = (num[1]) ? Array.clone(num[1]) : [1];    //Denominator
    }

    //Polynomial format check
    static isPolynomial(input) {
        if (!(input instanceof Array)) return (false);
        for (let i = 0; i < input.length; i++) {
            if (typeof input[i] !== 'number') return (false);
        }
        return (true);
    }
    //Ignore polynomial multiplication with denominator equal to 1, the format is not checked by defualt
    static conv(a, b, flag = false) {
        if (flag) {
            for (let i = 0; i < 2; i++) {
                const input = [a, b][i];
                if (!Polynomial.isPolynomial(input)) throw ('Polynomial elements must be numeric arrays');
            }
        }
        const ans = [];
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                const sub = i + j;
                if (!ans[sub]) ans[sub] = 0;
                ans[sub] += a[i] * b[j];
            }
        }
        //Put 0 in empty spaces
        for (let i = 0; i < ans.length; i++) {
            if (!ans[i]) ans[i] = 0;
        }
        //The highest power cannot be 0
        while (!ans[ans.length - 1]) {
            ans.pop();
        }
        return (ans);
    }
    //Power of polynomial
    static exp(a, e) {
        if ((!Polynomial.isPolynomial(a)) || (typeof e !== 'number')) throw ('Worng format');
        let ans = [1];
        for (let i = 0; i < e; i++) {
            ans = Polynomial.conv(ans, a);
        }
        return (ans);
    }

    //Simplify polynomial
    simple() {
        //If there exist common divisor, reduce
        while ((!this.numerator[0]) && (!this.denominator[0])) {
            this.numerator.shift();
            this.denominator.shift();
        }
        //attention：extract common factors and common divisors of coefficients

        return (this);
    }
    //Reciprocal of polynomial
    inverse() {
        [this.numerator, this.denominator] = [this.denominator, this.numerator];
        return (this);
    }
    //Polynomial multiplication
    mul(input) {
        //Multiplicand
        const multiplicand = (input instanceof Polynomial) ? input : new Polynomial(input);
        //Multiply the numerator and denominator separately
        const ans = new Polynomial(
            Polynomial.conv(this.numerator, multiplicand.numerator),
            Polynomial.conv(this.denominator, multiplicand.denominator)
        );
        ans.simple();
        return (ans);
    }
    //Polynomial addition
    add(input) {
        //Summand
        const summand = (input instanceof Polynomial) ? input : new Polynomial(input);
        let numerator, denominator;
        //If the denominator is the same, then the numerators are added directly
        if (this.denominator.isEqual(summand.denominator)) {
            numerator = [this.numerator, input.numerator, []];
            denominator = this.denominator;
        } else {
            denominator = Polynomial.conv(this.denominator, summand.denominator);
            numerator = [
                Polynomial.conv(this.numerator, summand.denominator),
                Polynomial.conv(this.denominator, summand.numerator),
                []
            ];
        }
        const lengthLong = Math.max(numerator[0].length, numerator[1].length);
        for (let i = 0; i < lengthLong; i++) {
            numerator[2][i] = numerator[0][i] + numerator[1][i];
        }
        const ans = new Polynomial(denominator, numerator[2]);
        ans.simple();
        return (ans);
    }
    //The coefficient of the highest order term in the denominator is 1
    maxToOne() {
        //The coefficient of the highest order term in the denominator is 1
        const number = this.denominator[this.denominator.length - 1];
        for (let i = 0; i < this.numerator.length; i++) {
            this.numerator[i] /= number;
        }
        for (let i = 0; i < this.denominator.length; i++) {
            this.denominator[i] /= number;
        }
        this.denominator[this.denominator.length - 1] = 1;
        return (this);
    }
    //Replace variable
    replaceUnknow(input) {
        //Replaced polynomial
        const replaced = (input instanceof Polynomial) ? input : new Polynomial(input);
        const ans = [[],[]];
        for (let k = 0; k < 2; k++) {
            const factor = [this.numerator, this.denominator][k];
            for (let i = 0; i < factor.length; i++) {
                const polyNow = Polynomial.conv(
                    Polynomial.exp(replaced.numerator, i),
                    Polynomial.exp(replaced.denominator, factor.length - i - 1)
                );
                for (let j = 0; j < polyNow.length; j++) {
                    if (!ans[k][j]) ans[k][j] = 0;
                    ans[k][j] += polyNow[j] * factor[i];
                }
            }
        }
        const diff = this.numerator.length - this.denominator.length;
        if (diff > 0) {
            //The highest order in the numerator is higher than that of the denominator
            const additional = Polynomial.exp(replaced.denominator, diff);
            ans[1] = Polynomial.conv(ans[1], additional);
        }else if (diff < 0) {
            //The highest order in the numerator is lower than that of the denominator
            const additional = Polynomial.exp(replaced.denominator, -diff);
            ans[0] = Polynomial.conv(ans[0], additional);
        }
        return ((new Polynomial(ans)).simple());
    }
    //Bilinear discretization
    toDiscrete(time) {
        //Discretization with bilinear transformation
        const disTransfer = this.replaceUnknow(
            new Polynomial([-2, 2], [time, time])
        ).maxToOne();
        const ans = {
            'outputFactor': disTransfer.denominator,
            'inputFactor': disTransfer.numerator
        };
        //If output factor > input factor, add zeros to input factor
        if (ans.outputFactor.length > ans.inputFactor.length) {
            ans.inputFactor.concat(new Array(ans.outputFactor.length - ans.inputFactor.length));
        }
        //Pop output factor
        ans.outputFactor.pop();
        ans.outputFactor.reverse();
        //Inverse output factor
        for (let i = 0; i < ans.outputFactor.length; i++)
            ans.outputFactor[i] *= -1;
        ans.inputFactor.reverse();
        //Initialize input and output factor with zero
        ans.input = new Array(ans.inputFactor.length).fill(0);
        ans.output = new Array(ans.outputFactor.length).fill(0);
        return (ans);
    }
}

export { Polynomial };
