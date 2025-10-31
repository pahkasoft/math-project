import { Assert, Utils } from "@tspro/ts-utils-lib";
import { Helpers } from "./helpers";
import { MathContext, RoundingMode } from "./mathcontext";
import { roundDigits } from "./internal/round-digits";
import { BasicAlg } from "./internal/basic-alg";
import { AdvancedAlg } from "./internal/advanced-alg";
import { TrigonometricAlg } from "./internal/trigonometric-alg";

/**
 * Type guard to test if given value is instance of BigNumber.
 */
export function isBigNumber(x: unknown): x is BigNumber {
    return x instanceof BigNumber;
}

export type NumberArgument = string | number | BigNumber;

/**
 * Type guard to test if given value is type of NumberArgument.
 */
export function isNumberArgument(x: unknown): x is NumberArgument {
    return typeof x === "string" || typeof x === "number" || x instanceof BigNumber;
}

function safeConvert(x: NumberArgument, mc: MathContext) {
    // There were safety checks which were removed as unnecessary.
    return BigNumber.convert(x, mc);
}

function charToDigit(c: string) {
    let code = c.charCodeAt(0);
    if (code >= 48 && code <= 57) {
        return code - 48; // 0-9
    }
    else if (code >= 65 && code <= 90) {
        return code - 65 + 10; // A-Z
    }
    else if (code >= 97 && code <= 122) {
        return code - 97 + 10; // a-z
    }
    else {
        return -1;
    }
}

function digitToChar(digit: number) {
    return BigNumber.Alphabet[digit] ?? "?";
}

function stringToDigits(s: string) {
    return Array.from(s).map(charToDigit);
}

function digitsToString(digits: number[] | undefined) {
    return (digits ?? []).map(digitToChar).join("");
}

function removeDotAt(str: string, i: number) {
    Assert.assert(str.charAt(i) === ".");
    return str.substring(0, i) + str.substring(i + 1);
}

function insertDotAt(str: string, i: number) {
    return str.substring(0, i) + "." + str.substring(i);
}

function randomDigit(base: number) {
    return Math.floor(Math.random() * base); // Integer in range [0, base)
}

function requireNumberArgument(x: unknown) {
    Assert.assert(isNumberArgument(x), 'Invalid number argument: ' + x);
    return x as NumberArgument;
}

function requireMathContext(mc: unknown) {
    Assert.assert(mc instanceof MathContext, 'Invalid math context: ' + mc);
    return mc as MathContext;
}

function requireSign(sign: unknown) {
    Assert.assert(Number.isNaN(sign) || sign === -1 || sign === 1, "Invalid sign: " + sign);
    return sign as number;
}

function requireDigits(digits: unknown, base: number) {
    Assert.assert(digits === undefined || Utils.Arr.isArray(digits) && digits.every(d => Utils.Math.isInteger(d) && d >= 0 && d < base), "Invalid digits: " + digits);
    return digits as undefined | number[];
}

function requireExponent(exp: unknown) {
    Assert.assert(Number.isNaN(exp) || Utils.Math.isInteger(exp), "Invalid exponent: " + exp);
    return exp as number;
}

// Capture javascript number format
const JsNumberCapture = new RegExp(
    "^\\s*" +
    "([+-]?)" + // sign
    "([0-9]+[\\.]?[0-9]*|[0-9]*[\\.][0-9]+)" + // digits
    "(?:([eE])([+-][0-9]+))?" + // exp
    "(\\s+|$)");

// Capture BigNumber format
const BigNumberCapture = new RegExp(
    "^\\s*" +
    "([+-]?)" + // sign
    "([0-9a-zA-Z]+[\\.]?[0-9a-zA-Z]*|[0-9a-zA-Z]*[\\.][0-9a-zA-Z]+|∞?)" + // digits (can be empty string "")
    "(?:(&[eb]=)([+-]?[0-9a-zA-Z]+))?" + // attr1
    "(?:(&[eb]=)([+-]?[0-9a-zA-Z]+))?" + // attr2
    "(\\s+|$)");

export interface ParsedNumberProps {
    sign: string,
    digits: string,
    exponent: string,
    base: string
}

/** @ignore */
export interface FormatOptions {
    notation?: "sci" | "eng" | "plain" | "user-friendly";
    forceSign?: boolean;
}

export enum IntegerDivisionMode {
    Trunc,
    Floor,
    Euclidean
}

/** @ignore */
export interface NumberProps {
    sign: number;
    digits: number[] | undefined;
    exponent: number;
    mc: MathContext;
}

/**
 * BigNumber is a big number implementation.
 * 
 * BigNumber has properties [[sign]], [[digits]], [[exponent]] and [[mc]].
 * 
 * Special values:
 * <pre>
 *   Zero     = \{ sign: ±1,  digits: [0],       exponent: 0 \}
 *   Infinity = \{ sign: ±1,  digits: undefined, exponent: NaN \}
 *   NaN      = \{ sign: NaN, digits: undefined, exponent: NaN \}
 * </pre>
 */
export class BigNumber {

    static readonly Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static readonly MaxBase = 36;

    static readonly InfinitySymbol = "∞";

    private static readonly ConstantContext = new MathContext(10, 100, RoundingMode.HalfUp);

    static readonly e = new BigNumber("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642743", BigNumber.ConstantContext);
    static readonly ln2 = new BigNumber("0.693147180559945309417232121458176568075500134360255254120680009493393621969694715605863326996418687542", BigNumber.ConstantContext);
    static readonly pi = new BigNumber("3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798", BigNumber.ConstantContext);
    static readonly two_pi = new BigNumber("6.28318530717958647692528676655900576839433879875021164194988918461563281257241799725606965068423413596", BigNumber.ConstantContext);
    static readonly pi_div2 = new BigNumber("1.57079632679489661923132169163975144209858469968755291048747229615390820314310449931401741267105853399", BigNumber.ConstantContext);
    static readonly pi_div4 = new BigNumber("0.785398163397448309615660845819875721049292349843776455243736148076954101571552249657008706335529266996", BigNumber.ConstantContext);

    /**
     * Sign is -1 or 1.
     * 
     * Sign is NaN if this is NaN.
     */
    readonly sign: number;

    /**
     * Array of digits from left to right.
     * For example number "123" has digits array [1, 2, 3].
     * Each digit is integer and 0 <= digit <= this.mc.base - 1.
     * 
     * Digits is undefined if this is NaN or Infinity.
     */
    readonly digits: number[] | undefined;

    /**
     * Exponent is integer.
     * 
     * If exponent is zero then decimal dot is after right most (last) digit.
     * Positive exponent moves decimal dot right (adds zeroes after digits).
     * Negative exponent moves decimal dot left.
     * 
     * Exponent is NaN if this is or NaN or Infinity.
     */
    readonly exponent: number;

    /**
     * Math Context
     */
    readonly mc: MathContext;

    /**
     * Scientific exponent.
     */
    get sciExponent(): number {
        return Number.isNaN(this.exponent) || !this.digits ? NaN : this.exponent + this.digits.length - 1;
    }

    /**
     * Number of significant digits. Trailing zeroes not included.
     * 
     * NaN if this is NaN or Infinity.
     */
    get digitCount(): number {
        return this.digits === undefined ? NaN : this.digits.length;
    }

    /**
     * Number of decimal places.
     * If decimalPlaces = 0 if this is integer number.
     * If decimalPlaces > 0 if this is decimal number.
     * 
     * NaN if this is NaN or Infinity.
     */
    get decimalPlaces(): number {
        return Number.isNaN(this.exponent) ? NaN : Math.max(-this.exponent, 0);
    }

    /**
     * Number of trailing zeroes.
     * 
     * NaN if this is NaN or Infinity.
     */
    get trailingZeroCount(): number {
        return Number.isNaN(this.exponent) ? NaN : Math.max(this.exponent, 0);
    }

    /**
     * Arguments are identical to the class properties.
     */
    constructor(sign: number, digits: number[] | undefined, exponent: number, mc: MathContext);

    /**
     *
     * @param value 
     * @param mc
     */
    constructor(value: NumberArgument, mc: MathContext);
    constructor(...args: unknown[]) {

        if (args.length === 4) {
            this.mc = requireMathContext(args[3]);
            this.sign = requireSign(args[0]);
            this.digits = requireDigits(args[1], this.mc.base)?.slice();
            this.exponent = requireExponent(args[2]);

            if (this.digits === undefined && Number.isNaN(this.exponent)) {
                // NaN: sign = NaN
                // Infinity: sign = -1 |1
                return;
            }
            else {
                Assert.assert(!Number.isNaN(this.sign), "Invalid sign " + this.sign);
                Assert.assert(this.digits !== undefined, "Invalid digits " + this.digits);
                Assert.assert(!Number.isNaN(this.exponent), "Invalid exponent " + this.exponent);
            }
        }
        else if (args.length <= 2) {
            let value = requireNumberArgument(args[0]);
            let mc = requireMathContext(args[1]);

            let jsNumber = false;

            if (value instanceof BigNumber) {
                let o = value.convert(mc);
                this.sign = o.sign; this.digits = o.digits; this.exponent = o.exponent; this.mc = o.mc;
                return;
            }

            if (typeof value === "number") {
                if (Number.isNaN(value)) {
                    // NaN
                    this.sign = NaN; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                    return;
                }
                else if (value === Infinity) {
                    // +Infinity
                    this.sign = 1; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                    return;
                }
                else if (value === -Infinity) {
                    // -Infinity
                    this.sign = -1; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                    return;
                }
                else if (Utils.Math.isInteger(value) && Math.abs(value) < mc.base) {
                    // Single integer digit < base does not need base conversion
                    this.sign = Helpers.getSign(value); this.digits = [Math.abs(value)]; this.exponent = 0; this.mc = mc;
                    return;
                }
                else {
                    value = value.toString();
                    jsNumber = true;
                }
            }

            if (typeof value === "string") {
                let parseProps = BigNumber.parse(value);

                if (!parseProps) {
                    // Parse failed => NaN
                    this.sign = NaN; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                    return;
                }

                let sign = parseProps.sign === "-" ? -1 : +1;
                let base = mc.base;
                let exponent = 0;
                let digits: number[];

                if (jsNumber) {
                    Assert.assert(parseProps.base === "");
                    base = 10;
                }
                else if (parseProps.base !== "") {
                    base = parseInt(parseProps.base, 10);
                    if (!Utils.Math.isInteger(base) || base < 2 || base > BigNumber.MaxBase) {
                        // Base number format error => NaN
                        this.sign = NaN; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                        return;
                    }
                }

                if (parseProps.exponent !== "") {
                    exponent = parseInt(parseProps.exponent, base);
                    if (!Utils.Math.isInteger(exponent)) {
                        // Exponent number format error => NaN
                        this.sign = NaN; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                        return;
                    }
                }

                if (parseProps.digits === "" || parseProps.digits === "0") {
                    // zero
                    this.sign = sign; this.digits = [0]; this.exponent = 0; this.mc = mc;
                    return;
                }
                else if (parseProps.digits === BigNumber.InfinitySymbol) {
                    // infinity
                    this.sign = sign; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                    return;
                }

                let digitsStr = parseProps.digits;

                let i = digitsStr.indexOf(".");
                if (i >= 0) {
                    exponent -= digitsStr.length - i - 1;
                    // Remove dot at i
                    digitsStr = removeDotAt(digitsStr, i);
                }

                digits = stringToDigits(digitsStr);

                // digits is array of ints
                if (digits.some(d => d < 0 || d >= base)) {
                    // NaN
                    this.sign = NaN; this.digits = undefined; this.exponent = NaN; this.mc = mc;
                    return;
                }

                // Convert base => mc.base?
                if (base !== mc.base) {
                    let tmpMc = new MathContext(base, digits.length, RoundingMode.HalfUp);
                    let o = new BigNumber(sign, digits, exponent, tmpMc).convert(mc);
                    this.sign = o.sign; this.digits = o.digits; this.exponent = o.exponent; this.mc = o.mc;
                    return;
                }
                else {
                    this.sign = sign;
                    this.digits = digits;
                    this.exponent = exponent;
                    this.mc = mc;
                }
            }
            else {
                Assert.fail("BigNumber: invalid value " + value);
            }
        }
        else {
            Assert.fail("BigNumber: invalid constructor arguments.");
        }

        // value is finite.

        roundDigits(this, { significantDigits: this.mc.precision }, this.mc.roundingMode);

        if (this.sciExponent > MathContext.MaxExponent) {
            // ~ infinity
            this.digits = undefined; this.exponent = NaN;
            return;
        }
        else if (this.sciExponent < MathContext.MinExponent) {
            // ~ zero
            this.digits = [0]; this.exponent = 0;
            return;
        }
    }

    /**
     * Parse number string into components \{ sign, digits, exponent, base \}.
     * Returns undefined if number format error.
     * 
     * Empty string:
     * <pre>
     * "" => \{ sign: "", digits: "", exponent: "", base: "" \}
     * </pre>
     * 
     * Normal decimal format:
     * <pre>
     * "-123e+8" => \{ sign: "-", digits: "123", exponent: "+8", base: "" \}
     * </pre>
     * 
     * BigNumber format:
     * <pre>
     * "abc123&e=-f03&b=16" => \{ sign: "", digits: "abc123", exponent: "-f03", base: "16" \}
     * </pre>
     * 
     * @param str
     * @returns 
     */
    static parse(str: string): ParsedNumberProps | undefined {
        Assert.assert(typeof str === "string", "str is not string.");

        const m = JsNumberCapture.exec(str) || BigNumberCapture.exec(str);
        if (!m) {
            return undefined;
        }

        if (m[3] === undefined) {
            return {
                sign: m[1],
                digits: m[2],
                exponent: "",
                base: ""
            }
        }
        else if (m[3] === "e" || m[3] === "E") {
            return {
                sign: m[1],
                digits: m[2],
                exponent: m[4], // 0=match, 1=sign, 2=digits, 3="e", 4=exp
                base: ""
            }
        }
        else {
            let ei = m.indexOf("&e=", 3); // 0=match, 1=sign, 2=digits, 3=attr, ...
            let bi = m.indexOf("&b=", 3); // Note: "&E=" and "&B=" not accepted.
            return {
                sign: m[1],
                digits: m[2],
                exponent: ei >= 0 ? m[ei + 1] : "",
                base: bi >= 0 ? m[bi + 1] : ""
            }
        }
    }

    private format(opt?: FormatOptions): string {
        let notation = opt?.notation ?? "sci";
        let forceSign = opt?.forceSign ?? false;

        if (this.isNaN()) {
            return "(NaN)";
        }

        let sign = this.sign < 0 ? "-" : (forceSign ? "+" : "");

        if (this.isAbsInfinity()) {
            return sign + BigNumber.InfinitySymbol;
        }

        if (this.isZero() && !forceSign) {
            sign = "";
        }

        let d_str = digitsToString(this.digits);
        let exp = this.exponent;
        let { base } = this.mc;

        if (!this.isZero()) {
            let dot_i = d_str.length;

            const makePlain = () => {
                // Move dot where exp is
                dot_i += exp;
                exp = 0; // Exponent is relative to dot.
            }

            if (notation === "plain") {
                makePlain();
            }
            else {
                // Other notations: set dot after first digit: 123e-4 => 1.23e-2 (=scientific notation)
                let e_add = d_str.length - 1;
                Assert.assert(e_add >= 0);
                dot_i -= e_add;
                exp += e_add;

                if (notation === "eng") {
                    // Make exp multiple of 3 (=engineering notation)
                    while (exp % 3 !== 0) {
                        dot_i++;
                        exp--;
                    }
                }
                else if (notation === "user-friendly") {
                    const MaxLeadingZeroes = 2;
                    const MaxTrailingZeroes = 6;
                    const MaxPlainLength = 9;

                    let digitCount = d_str.length;

                    if (exp < 0) {
                        let addZeroCount = -exp - 1;
                        if (exp === -1 || addZeroCount <= MaxLeadingZeroes && digitCount + addZeroCount <= MaxPlainLength) {
                            // 1.23e-1 => 0.123 (always when exp = -1)
                            // 1.23e-3 => 0.00123
                            makePlain();
                        }
                    }
                    else if (exp >= 0 && exp < d_str.length) {
                        if (digitCount <= MaxPlainLength) {
                            // 123.456
                            makePlain();
                        }
                    }
                    else if (exp >= d_str.length) {
                        let addZeroCount = exp - d_str.length + 1;
                        if (addZeroCount <= MaxTrailingZeroes && digitCount + addZeroCount <= MaxPlainLength) {
                            // 123000
                            makePlain();
                        }
                    }
                }
            }

            if (dot_i < 0) {
                d_str = "0".repeat(-dot_i) + d_str;
                dot_i = 0;
            }
            else if (dot_i > d_str.length) {
                d_str = d_str + "0".repeat(dot_i - d_str.length);
                dot_i = d_str.length;
            }

            Assert.assert(dot_i >= 0 && dot_i <= d_str.length);

            // Insert dot at dot_i
            if (dot_i !== d_str.length) {
                if (dot_i === 0) {
                    d_str = "0." + d_str;
                }
                else {
                    d_str = insertDotAt(d_str, dot_i);
                }
            }
        }

        const formatAttr = (prefix: string, n: number, b: number = 10, forceSign: boolean = false) => {
            let value = Math.abs(n).toString(b);
            // Make sure value has no exp or dot.
            Assert.assert(/e[+-]|\\./i.test(value) === false);
            return prefix + (n < 0 ? "-" : (forceSign ? "+" : "")) + value;
        }

        let e_str = exp === 0 ? "" : (base === 10 ? formatAttr("e", exp, 10, true) : formatAttr("&e=", exp, base));
        let b_str = base === 10 ? "" : formatAttr("&b=", base);

        return sign + d_str + e_str + b_str;
    }

    toPlainString() {
        return this.format({ notation: "plain" });
    }

    toString() {
        return this.format({ notation: "sci" });
    }

    valueOf() {
        return this.format({ notation: "sci", forceSign: true });
    }

    toScientificString() {
        return this.format({ notation: "sci" });
    }

    toEngineeringString() {
        return this.format({ notation: "eng" });
    }

    toUserFriendlyString() {
        return this.format({ notation: "user-friendly" });
    }

    /**
     * Returns true if value is NaN, false otherwise.
     */
    isNaN() {
        let { sign, digits, exponent } = this;
        return Number.isNaN(sign) && digits === undefined && Number.isNaN(exponent);
    }

    /**
     * Returns true if value is positive or negative infinity, false otherwise.
     */
    isAbsInfinity() {
        let { sign, digits, exponent } = this;
        return !Number.isNaN(sign) && digits === undefined && Number.isNaN(exponent);
    }

    /**
     * Returns true if value is integer, false otherwise.
     */
    isInteger() {
        return !Number.isNaN(this.exponent) && this.exponent >= 0;
    }

    /**
     * Returns true if value is finite, false otherwise.
     */
    isFinite() {
        let { sign, digits, exponent } = this;
        return !Number.isNaN(sign) && digits !== undefined && !Number.isNaN(exponent);
    }

    /**
     * Returns true if value is negative (includes -0), false otherwise.
     */
    isNegative() {
        return !Number.isNaN(this.sign) && this.sign < 0;
    }

    /**
     * Returns true if value is positive (includes +0), false otherwise.
     */
    isPositive() {
        return !Number.isNaN(this.sign) && this.sign > 0;
    }

    /**
     * Returns true if value is 0, or false otherwise.
     */
    isZero() {
        return this.digits !== undefined && this.digits.length === 1 && this.digits[0] === 0;
    }

    /**
     * Returns true if value is -1 or 1, or false otherwise.
     */
    isAbsOne() {
        return this.digits !== undefined && this.digits.length === 1 && this.digits[0] === 1 && this.exponent === 0;
    }

    /**
     * Returns true if value is odd number, or false otherwise.
     */
    isOdd() {
        if (!this.isInteger() || !this.digits) {
            return false;
        }
        else if (this.mc.base % 2 === 0) {
            let lastDigit = this.exponent === 0 ? this.digits[this.digits.length - 1] : 0;
            return lastDigit % 2 === 1;
        }
        else {
            let sum = 0;
            for (let i = 0; i < this.digits.length; i++) {
                sum += this.digits[i];
            }
            return sum % 2 === 1;
        }
    }

    /**
     * Returns true if value is even number, or false otherwise.
     */
    isEven() {
        if (!this.isInteger() || !this.digits) {
            return false;
        }
        else if (this.mc.base % 2 === 0) {
            let lastDigit = this.exponent === 0 ? this.digits[this.digits.length - 1] : 0;
            return lastDigit % 2 === 0;
        }
        else {
            let sum = 0;
            for (let i = 0; i < this.digits.length; i++) {
                sum += this.digits[i];
            }
            return sum % 2 === 0;
        }
    }

    /**
     * Returns the value as JavaScript Number.
     */
    toNumber(): number {
        if (this.isNaN()) {
            return NaN;
        }
        else if (this.isAbsInfinity()) {
            return this.sign * Infinity;
        }
        else if (this.isZero()) {
            return this.isNegative() ? -0 : 0;
        }
        else {
            let res = 0;
            for (let i = this.digitCount - 1, exp = this.exponent; i >= 0; i--, exp++) {
                res += Math.pow(this.mc.base, exp) * this.digits![i];
            }
            return this.sign * res;
        }
    }

    convert(toMC: MathContext) {
        requireMathContext(toMC);

        if (this.mc.equals(toMC)) {
            return this;
        }
        else if (this.mc.base === toMC.base || this.isNaN() || this.isAbsInfinity()) {
            return new BigNumber(this.sign, this.digits, this.exponent, toMC);
        }
        else if (this.digits !== undefined && this.digits.length === 1 && this.digits[0] < toMC.base && this.exponent === 0) {
            return new BigNumber(this.sign, this.digits, this.exponent, toMC);
        }
        else {
            const nToBase = (n: number) => new BigNumber(n.toString(toMC.base), toMC);

            let bb = nToBase(this.mc.base);
            let res = new BigNumber(0, toMC);

            for (let i = this.digitCount - 1, exp = this.exponent; i >= 0; i--, exp++) {
                let digit = nToBase(this.digits![i]);
                let term = bb.pow(exp, toMC).mul(digit, toMC);
                res = res.add(term, toMC);
            }

            return res.mulSign(this.sign);
        }
    }

    static convert(value: NumberArgument, mc: MathContext): BigNumber {
        if (value instanceof BigNumber) {
            return value.convert(mc);
        }
        else {
            return new BigNumber(value, mc);
        }
    }

    toSignificantDigits(significantDigits: number, rm?: RoundingMode) {
        Helpers.validatePrecision(significantDigits);
        if (this.digitCount <= significantDigits) {
            return this;
        }
        else {
            let result = this.dup();
            roundDigits(result, { significantDigits }, rm ?? RoundingMode.HalfUp);
            return result;
        }
    }

    toDecimalPlaces(decimalPlaces: number, rm?: RoundingMode) {
        Helpers.validateDecimalPlaces(decimalPlaces);
        if (this.decimalPlaces <= decimalPlaces) {
            return this;
        }
        else {
            let result = this.dup();
            roundDigits(result, { decimalPlaces }, rm ?? RoundingMode.HalfUp);
            return result;
        }
    }

    cmp(b: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        b = safeConvert(b, mc);
        return BasicAlg.cmp(a, b, mc);
    }

    eq(b: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        b = safeConvert(b, mc);
        return BasicAlg.cmp(a, b, mc) === 0;
    }

    lt(b: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        b = safeConvert(b, mc);
        let i = BasicAlg.cmp(a, b, mc);
        return i !== undefined && i < 0;
    }

    lte(b: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        b = safeConvert(b, mc);
        let i = BasicAlg.cmp(a, b, mc);
        return i !== undefined && i <= 0;
    }

    gt(b: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        b = safeConvert(b, mc);
        let i = BasicAlg.cmp(a, b, mc);
        return i !== undefined && i > 0;
    }

    gte(b: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        b = safeConvert(b, mc);
        let i = BasicAlg.cmp(a, b, mc);
        return i !== undefined && i >= 0;
    }

    dup() {
        return new BigNumber(this.sign, this.digits, this.exponent, this.mc);
    }

    abs() {
        return this.sign < 0 ? new BigNumber(Math.abs(this.sign), this.digits, this.exponent, this.mc) : this;
    }

    neg() {
        return new BigNumber(-this.sign, this.digits, this.exponent, this.mc);
    }

    sgn(): number {
        return this.isZero() ? 0 : this.sign;
    }

    mulSign(s: number) {
        return Helpers.getSign(s) < 0 ? this.neg() : this;
    }

    shiftExponent(amount: number) {
        Assert.assert(Utils.Math.isInteger(amount));

        if (this.isNaN()) {
            return this;
        }
        else if (this.isAbsInfinity() || this.isZero()) {
            return this;
        }
        else {
            return new BigNumber(this.sign, this.digits, this.exponent + amount, this.mc);
        }
    }

    trunc() {
        if (this.isNaN() || this.isAbsInfinity() || this.isInteger()) {
            return this;
        }
        else {
            // Another way to do trunc: return this.toDecimalPlaces(0, RoundingMode.Down);

            let { sign, mc, decimalPlaces } = this;
            let digits = Assert.require(this.digits);

            // Remove decimal part of digits.
            let digits2 = digits.slice(0, Math.max(0, digits.length - decimalPlaces));
            if (digits2.length === 0) {
                digits2.push(0);
            }
            return new BigNumber(sign, digits2, 0, mc);
        }
    }

    floor() {
        if (this.isNaN() || this.isAbsInfinity() || this.isInteger()) {
            return this;
        }
        else {
            return this.toDecimalPlaces(0, RoundingMode.Floor);
        }
    }

    ceil() {
        if (this.isNaN() || this.isAbsInfinity() || this.isInteger()) {
            return this;
        }
        else {
            return this.toDecimalPlaces(0, RoundingMode.Ceil);
        }
    }

    round(decimalPlaces?: number) {
        return this.toDecimalPlaces(decimalPlaces ?? 0, RoundingMode.HalfUp);
    }

    add(x: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        return BasicAlg.add(a, b, mc);
    }

    sub(x: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        return BasicAlg.add(a, b.neg(), mc);
    }

    mul(x: NumberArgument, mc: MathContext) {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        return BasicAlg.mul(a, b, mc);
    }

    div(x: NumberArgument, mc: MathContext): BigNumber {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        let { Q } = BasicAlg.div(a, b, undefined, mc);
        return Q;
    }

    divideAndRemainder(x: NumberArgument, mode: IntegerDivisionMode, mc: MathContext): { Q: BigNumber, R: BigNumber } {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        let { Q, R } = BasicAlg.div(a, b, mode, mc);
        return { Q, R: Assert.require(R) }
    }

    divToInt(x: NumberArgument, mode: IntegerDivisionMode, mc: MathContext): BigNumber {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        let { Q } = BasicAlg.div(a, b, mode, mc);
        return Q;
    }

    mod(x: NumberArgument, mode: IntegerDivisionMode, mc: MathContext): BigNumber {
        let a = safeConvert(this, mc);
        let b = safeConvert(x, mc);
        let { R } = BasicAlg.div(a, b, mode, mc);
        return Assert.require(R);
    }

    reciproc(mc: MathContext) {
        return new BigNumber(1, mc).div(this, mc);
    }

    static min(mc: MathContext, ...args: NumberArgument[]): BigNumber {
        let arr = args.map(n => safeConvert(n, mc));
        if (arr.length === 0) {
            return new BigNumber(NaN, mc);
        }
        let min = arr.shift()!;
        arr.forEach(n => min = min.isNaN() ? min : (n.lt(min, mc) ? n : min));
        return min;
    }

    static max(mc: MathContext, ...args: NumberArgument[]): BigNumber {
        let arr = args.map(n => safeConvert(n, mc));
        if (arr.length === 0) {
            return new BigNumber(NaN, mc);
        }
        let max = arr.shift()!;
        arr.forEach(n => max = max.isNaN() ? max : (n.gt(max, mc) ? n : max));
        return max;
    }

    static gcd(a: NumberArgument, b: NumberArgument, mc: MathContext): BigNumber {
        a = safeConvert(a, mc).abs();
        b = safeConvert(b, mc).abs();

        if (!a.isInteger() || !b.isInteger()) {
            return new BigNumber(NaN, mc);
        }
        else {
            return AdvancedAlg.gcd(a, b, mc);
        }
    }

    static lcm(a: NumberArgument, b: NumberArgument, mc: MathContext): BigNumber {
        a = safeConvert(a, mc).abs();
        b = safeConvert(b, mc).abs();

        if (!a.isInteger() || !b.isInteger()) {
            return new BigNumber(NaN, mc);
        }
        else {
            return a.mul(b, mc).div(AdvancedAlg.gcd(a, b, mc), mc);
        }
    }

    static pow(x: NumberArgument, exp: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        exp = safeConvert(exp, mc);
        return AdvancedAlg.pow(x, exp, mc);
    }

    pow(exp: NumberArgument, mc: MathContext) {
        let x = safeConvert(this, mc);
        exp = safeConvert(exp, mc);
        return AdvancedAlg.pow(x, exp, mc);
    }

    static factorial(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return AdvancedAlg.factorial(x, 1, mc);
    }

    factorial(mc: MathContext) {
        let x = safeConvert(this, mc);
        return AdvancedAlg.factorial(x, 1, mc);
    }

    static doubleFactorial(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return AdvancedAlg.factorial(x, 2, mc);
    }

    static sqrt(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return AdvancedAlg.sqrt(x, mc);
    }

    sqrt(mc: MathContext) {
        let x = safeConvert(this, mc);
        return AdvancedAlg.sqrt(x, mc);
    }

    static nthroot(index: NumberArgument, x: NumberArgument, mc: MathContext): BigNumber {
        index = safeConvert(index, mc);
        x = safeConvert(x, mc);
        return AdvancedAlg.nthroot(index, x, mc);
    }

    static ln(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return AdvancedAlg.ln(x, mc);
    }

    ln(mc: MathContext) {
        let x = safeConvert(this, mc);
        return AdvancedAlg.ln(x, mc);
    }

    static exp(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return AdvancedAlg.exp(x, mc);
    }

    exp(mc: MathContext) {
        let x = safeConvert(this, mc);
        return AdvancedAlg.exp(x, mc);
    }

    static log(base: NumberArgument, x: NumberArgument, mc: MathContext): BigNumber {
        base = safeConvert(base, mc);
        x = safeConvert(x, mc);
        return AdvancedAlg.log(base, x, mc);
    }

    static sin(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.sin(x, mc);
    }

    static cos(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.cos(x, mc);
    }

    static tan(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.tan(x, mc);
    }

    static asin(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.asin(x, mc);
    }

    static acos(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.acos(x, mc);
    }

    static atan(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.atan(x, mc);
    }

    static atan2(y: NumberArgument, x: NumberArgument, mc: MathContext): BigNumber {
        y = safeConvert(y, mc);
        x = safeConvert(x, mc);
        return TrigonometricAlg.atan2(y, x, mc);
    }

    static sinh(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.sinh(x, mc);
    }

    static cosh(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.cosh(x, mc);
    }

    static tanh(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.tanh(x, mc);
    }

    static asinh(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.asinh(x, mc);
    }

    static acosh(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.acosh(x, mc);
    }

    static atanh(x: NumberArgument, mc: MathContext): BigNumber {
        x = safeConvert(x, mc);
        return TrigonometricAlg.atanh(x, mc);
    }

    /**
     * Returns random number [0, 1)
     * @param mc 
     */
    static random(mc: MathContext) {
        let digits: number[] = []
        for (let i = 0; i < mc.precision; i++) {
            digits.push(randomDigit(mc.base));
        }
        return new BigNumber(1, digits, -mc.precision, mc);
    }
}
