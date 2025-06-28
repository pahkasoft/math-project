import * as React from "react";
import { BigMath, Engine, Eval } from "math-lib";
import { MathDocument } from "math-doc";

export class MathLine {
    constructor(readonly doc: MathDocument, readonly mathObject: Engine.MathObject, readonly evalState: Eval.EvalState) { }

    setMathContext(mc: BigMath.MathContext) {
        this.evalState.setMathContext(mc);
    }
}


export interface MathLineComponentProps {
    line: MathLine;
}

export class MathLineComponent extends React.Component<MathLineComponentProps, {}> {
    constructor(props: MathLineComponentProps) {
        super(props);
    }

    render() {
        let { line } = this.props;
        return line.mathObject.Component;
    }
}
