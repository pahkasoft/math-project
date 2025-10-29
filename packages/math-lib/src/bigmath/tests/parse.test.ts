import { BigNumber } from "bigmath";

describe(BigNumber.name, () => {
    it("parse", () => {

        const parse = BigNumber.parse;

        expect(parse("")).toEqual({ sign: "", digits: "", exponent: "", base: "" });
        expect(parse("&")).toEqual(undefined);
        expect(parse("?")).toEqual(undefined);

        expect(parse("1")).toEqual({ sign: "", digits: "1", exponent: "", base: "" });
        expect(parse("+1")).toEqual({ sign: "+", digits: "1", exponent: "", base: "" });
        expect(parse("-1")).toEqual({ sign: "-", digits: "1", exponent: "", base: "" });

        expect(parse("∞")).toEqual({ sign: "", digits: "∞", exponent: "", base: "" });
        expect(parse("+∞")).toEqual({ sign: "+", digits: "∞", exponent: "", base: "" });
        expect(parse("-∞")).toEqual({ sign: "-", digits: "∞", exponent: "", base: "" });

        expect(parse("++1")).toEqual(undefined);
        expect(parse("--1")).toEqual(undefined);

        expect(parse("+1e-3")).toEqual({ sign: "+", digits: "1", exponent: "-3", base: "" });
        expect(parse("-1e+3")).toEqual({ sign: "-", digits: "1", exponent: "+3", base: "" });
        expect(parse("+1E-3")).toEqual({ sign: "+", digits: "1", exponent: "-3", base: "" });
        expect(parse("+1e3")).toEqual({ sign: "+", digits: "1e3", exponent: "", base: "" }); // exp notation requires sign, e+3 or e-3.
        expect(parse("-FFA")).toEqual({ sign: "-", digits: "FFA", exponent: "", base: "" });

        expect(parse("1&b=2")).toEqual({ sign: "", digits: "1", exponent: "", base: "2" });
        expect(parse("1&b=+2")).toEqual({ sign: "", digits: "1", exponent: "", base: "+2" });
        expect(parse("1&b=-2")).toEqual({ sign: "", digits: "1", exponent: "", base: "-2" }); // base=-2 is illegal. Parser does not care.

        expect(parse("1&e=2")).toEqual({ sign: "", digits: "1", exponent: "2", base: "" }); // exp=2 is illegal in base=2. Parser does not care.
        expect(parse("1&e=+2")).toEqual({ sign: "", digits: "1", exponent: "+2", base: "" });
        expect(parse("1&e=-2")).toEqual({ sign: "", digits: "1", exponent: "-2", base: "" });

        expect(parse("1&B=2")).toEqual(undefined); // only accept lower case &b= &e=.
        expect(parse("1&E=2")).toEqual(undefined);
        expect(parse("1&x=2")).toEqual(undefined); // invalid attr.
        expect(parse("1&X=2")).toEqual(undefined);

        expect(parse(".")).toEqual(undefined);
        expect(parse(".e+2")).toEqual(undefined);
        expect(parse(".&e=+2")).toEqual(undefined);

        expect(parse(".12")).toEqual({ sign: "", digits: ".12", exponent: "", base: "" });
        expect(parse("1.2")).toEqual({ sign: "", digits: "1.2", exponent: "", base: "" });
        expect(parse("12.")).toEqual({ sign: "", digits: "12.", exponent: "", base: "" });
        expect(parse("1.2.")).toEqual(undefined);
        expect(parse(".1.2")).toEqual(undefined);
        expect(parse("1.2.3")).toEqual(undefined);

        expect(parse("+1.a&e=0&b=16")).toEqual({ sign: "+", digits: "1.a", exponent: "0", base: "16" });
        expect(parse("  +1.a&e=0&b=16  ")).toEqual({ sign: "+", digits: "1.a", exponent: "0", base: "16" });

        expect(parse("123 +1.a&e=0&b=16")).toEqual({ sign: "", digits: "123", exponent: "", base: "" }); // parses first value
        expect(parse("+1.a&e=0&b=16 123")).toEqual({ sign: "+", digits: "1.a", exponent: "0", base: "16" });
        expect(parse("OOPS +1.a&e=0&b=16")).toEqual({ sign: "", digits: "OOPS", exponent: "", base: "" }); // base could be 36.
        expect(parse("+1.a&e=0&b=16 OOPS")).toEqual({ sign: "+", digits: "1.a", exponent: "0", base: "16" });

    });
});
