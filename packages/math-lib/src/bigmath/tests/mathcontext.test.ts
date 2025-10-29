import { MathContext, RoundingMode } from "bigmath";

describe(MathContext.name, () => {
    it("MathContext", () => {

        // Test base
        expect(() => new MathContext(NaN, 20, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(-1, 20, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(0, 20, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(1, 20, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(2, 20, RoundingMode.HalfUp)).not.toThrow();
        expect(() => new MathContext(5.1, 20, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(36, 20, RoundingMode.HalfUp)).not.toThrow();
        expect(() => new MathContext(37, 20, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(Infinity, 20, RoundingMode.HalfUp)).toThrow();

        // Test precision
        expect(() => new MathContext(10, NaN, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(10, -1, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(10, 0, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(10, 1, RoundingMode.HalfUp)).not.toThrow();
        expect(() => new MathContext(10, 1.5, RoundingMode.HalfUp)).toThrow();
        expect(() => new MathContext(10, Infinity, RoundingMode.HalfUp)).not.toThrow();

        // Test rounding mode
        expect(() => new MathContext(10, 20, RoundingMode.HalfUp)).not.toThrow();
        expect(() => new MathContext(10, 20, RoundingMode.HalfDown)).not.toThrow();
        expect(() => new MathContext(10, 20, RoundingMode.HalfEven)).not.toThrow();
    });
});
