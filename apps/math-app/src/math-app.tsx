import * as React from "react";
import { createRoot } from "react-dom/client";
import { MathDocument } from "./math-doc";
import { Button, ButtonGroup, Modal, Navbar } from "react-bootstrap";
import { Eval, Parser } from "math-lib";
import * as Ui from "ui";
import { MyInput } from "ui/my-input";
import { Assert, Cookies, Utils } from "@tspro/ts-utils-lib";

const ScrollToBottomElemId = "BottomElem";

class AskCookieConsent extends React.Component<{}, { show: boolean }> {
    constructor(props: {}) {
        super(props);

        this.state = { show: Cookies.isConsentPending() }
    }

    render() {
        let onAccept = () => { Cookies.accept(); this.setState({ show: false }); }
        let onDecline = () => { Cookies.decline(); this.setState({ show: false }); }

        return this.state.show ? (
            <div className="alert alert-primary" role="alert">
                <p>
                    This website uses cookies to provide better user experience.
                </p>
                <button className="btn btn-primary m-1" onClick={onAccept}>Accept</button>
                <button className="btn btn-primary m-1" onClick={onDecline}>Decline</button>
            </div>
        ) : null;
    }
}

export interface MatfAppState {
    contentHeight: number;
    error?: Eval.EvalError | string;
    isCalculating: boolean;
    showAbout: boolean;
}

export class MathApp extends React.Component<{}, MatfAppState> {

    refHeaderDiv = React.createRef<HTMLDivElement>();

    refDoc = React.createRef<MathDocument>();
    get doc() { return this.refDoc.current || undefined; }

    state: MatfAppState;

    constructor(props: {}) {
        super(props);

        this.state = {
            contentHeight: this.calcContentHeight(),
            isCalculating: false,
            showAbout: false
        }

        window.addEventListener("resize", () => this.resize());
    }

    componentDidMount() {
        this.resize();
    }

    componentDidUpdate() {
        this.resize();
        this.scrollToBottom();
    }

    resize() {
        let contentHeight = this.calcContentHeight();
        if (contentHeight !== this.state.contentHeight) {
            this.setState({ contentHeight })
        }
    }

    calcContentHeight() {
        let toolbarHeight = this.refHeaderDiv.current
            ? Utils.Dom.getHeight(this.refHeaderDiv.current)
            : 0;
        return window.innerHeight - toolbarHeight;
    }

    scrollToBottom() {
        let e = document.getElementById(ScrollToBottomElemId);
        if (e) {
            e.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    clearWorkspace() {
        if (this.doc) {
            this.doc.empty();
        }
        this.clearError();
    }

    clearError() {
        this.setState({ error: undefined });
    }

    setError(message: Eval.EvalError | string) {
        this.setState({ error: message });
    }

    getErrorLines(): string[] | undefined {
        let { error } = this.state;

        if (typeof error === "string") {
            return [error];
        }
        else if (error instanceof Eval.EvalError) {
            return [error.getErrorMessage()];
        }
        else {
            return undefined;
        }
    }

    set isCalculating(isCalculating: boolean) {
        this.setState({ isCalculating });
    }

    showAbout(showAbout: boolean) {
        this.setState({ showAbout });
    }

    render() {
        let {
            contentHeight,
            isCalculating,
            showAbout
        } = this.state;

        const requestInterrupt = () => {
            let line = this.doc?.getActiveLine();
            if (line) {
                line.evalState.requestInterrupt();
            }
        }

        const insertOperator = (op: string) => {
            if (op === Parser.Vocabulary.frac) {
                insertFunction(Parser.Vocabulary.frac);
            }
            else {
                this.doc?.handleInput(op);
            }
        }

        const insertSymbol = (sym: string) => {
            this.doc?.handleInput(sym);
        }

        const insertFunction = (fn: string) => {
            this.doc?.handleInput(MyInput.InsertFunction, fn);
        }

        const insertMatrix = (rows: number, cols: number) => {
            this.doc?.handleInput(MyInput.InsertMatrix, "M" + rows + "x" + cols);
        }

        return <>
            <div ref={this.refHeaderDiv}>
                <Navbar bg="primary">
                    <div>
                        <ButtonGroup className="mx-1">
                            <Ui.AppMenu app={this} />
                        </ButtonGroup>
                        <ButtonGroup className="mx-1">
                            <Ui.EditMenu app={this} />
                        </ButtonGroup>
                        <ButtonGroup className="mx-1">
                            <Ui.OperatorMenu insert={insertOperator} />
                            <Ui.FunctionMenu insert={insertFunction} />
                            <Ui.SymbolMenu insert={insertSymbol} />
                            <Ui.MatrixMenu insert={insertMatrix} />
                        </ButtonGroup>
                        <ButtonGroup className="mx-1">
                            <Ui.StopCalcButton calculating={isCalculating} onInterrupt={requestInterrupt} />
                        </ButtonGroup>
                    </div>
                </Navbar>
                
                <AskCookieConsent />
            </div>

            <div style={{ overflow: "auto", height: contentHeight }} onClick={() => MyInput.focus()}>
                <MathDocument ref={this.refDoc} app={this} />
                <Ui.ErrorView messageLines={this.getErrorLines()} />
                <div id={ScrollToBottomElemId}></div>
            </div>

            <Modal show={showAbout}>
                <Modal.Header>
                    <Modal.Title>About Math App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Math App is clean and simple math application/calculator. It does not go very deep into math,
                        however is quite versatile in funtions and expressions.</p>
                    <p>To try type 1+1 and press Enter. All operators and functions are listed in the top menu.</p>
                    <p>Developed using typescript, react, react-bootstrap, bootstrap, and is bundled with webpack.
                        Calculating and rendering expressions are done using own math library.</p>
                    <p>Developed by PahkaSoft</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.showAbout(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>;
    }

    public static start() {
        Cookies.setExpireDays(30);

        const rootElement = Assert.require(document.getElementById("root"), "Root element not found!");
        const root = createRoot(rootElement);

        root.render(
            <React.StrictMode>
                <MathApp />
            </React.StrictMode>
        );
    }
}

