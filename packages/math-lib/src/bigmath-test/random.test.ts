import { BigNumber } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {

    it("random", () => {

        let mc = MC(10, 20);

        for (let i = 0; i < 100; i++) {
            let rnd = BigNumber.random(mc);
            expect(rnd.gte(0, mc) && rnd.lt(1, mc)).toEqual(true);
        }

    });
});
