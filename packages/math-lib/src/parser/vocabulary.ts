
export enum BracketSymbol {
    LeftBracket = "(",
    RightBracket = ")",
    LeftSquareBracket = "[",
    RightSquareBracket = "]",
    LeftCurlyBracket = "{",
    RightCurlyBracket = "}",
    StraightLine = "|",
    LeftFloor = "⌊",
    RightFloor = "⌋",
    LeftCeil = "⌈",
    RightCeil = "⌉",
}

export const RadicalSymbol = "√";

export namespace Symbols {
    export const LettersLwr = "abcdefghijklmnopqrstuvwxyz";
    export const LettersUpr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    export const GreeksLwr = "αβγδεζηθικλμνξπρσςτυφχψω";
    //export const GreeksUpr = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ";
    export const GreeksUpr = "ΓΔΘΛΞΠΣΥΦΨΩ"; // Removed symbols that look like normal letters
    export const All = LettersLwr + LettersUpr + GreeksLwr + GreeksUpr;
}

export const enum Vocabulary {
    infinity = "∞",
    pi = "π",

    ans = "ans",

    opPlus = "+",
    opMinus = "-",
    opMultiply = "*",
    opDivide = "/",
    opModulo = "%",
    opFactorial = "!",
    opPower = "^",
    opCrossProd = "⨯",
    opTranspose = "ᵀ",
    opDeclare = ":=",
    opComma = ",",

    matrix = "matrix",

    frac = "frac",
    abs = "abs",
    sgn = "sgn",
    sqrt = "sqrt",
    nthroot = "nthroot",
    log = "log",
    ln = "ln",
    exp = "exp",

    sin = "sin",
    cos = "cos",
    tan = "tan",
    asin = "asin",
    acos = "acos",
    atan = "atan",

    sinh = "sinh",
    cosh = "cosh",
    tanh = "tanh",
    asinh = "asinh",
    acosh = "acosh",
    atanh = "atanh",

    gcd = "gcd",
    lcm = "lcm",
    permutation = "permutation",
    combination = "combination",
    summation = "summation",
    product = "product",
    transpose = "transpose",
    det = "det",
    min = "min",
    max = "max",
    clamp = "clamp",
    rnd = "rnd",
    rndint = "rndint",
    round = "round",
    floor = "floor",
    ceil = "ceil",
    trunc = "trunc",
}
