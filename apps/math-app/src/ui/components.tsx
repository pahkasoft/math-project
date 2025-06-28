import * as React from "react";
import { Button, Table, Toast, ToastBody, Spinner, Alert, Dropdown, Row, Col } from "react-bootstrap";
import { BigMath } from "math-lib";
import { Form } from "react-bootstrap";
import { MyInput } from "./my-input";
import { Utils } from "@tspro/ts-utils-lib";

export interface NewTabLinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

export const NewTabLink = (props: NewTabLinkProps) => {
    return <a href={props.href} target="_blank" rel="noopener noreferrer" className={props.className}>{props.children}</a>;
}

export const ArrowSymbol = () => <span>&nbsp;→&nbsp;</span>;

export interface ErrorViewProps {
    messageLines?: string[];
}

export interface ErrorViewState {
    open: boolean;
}

export class ErrorView extends React.Component<ErrorViewProps, ErrorViewState> {
    state: ErrorViewState;

    constructor(props: ErrorViewProps) {
        super(props);

        this.state = { open: !!props.messageLines }
    }

    componentDidUpdate(prevProps: ErrorViewProps) {
        if (this.props.messageLines !== prevProps.messageLines) {
            this.setState((state, props) => ({ open: !!props.messageLines }));
        }
    }

    render() {
        const close = () => this.setState({ open: false });
        let messageLines = this.props.messageLines || [];

        return (
            <Toast show={this.state.open} onClose={close}>
                <Toast.Header>
                    <strong>Error</strong>
                </Toast.Header>
                <ToastBody>
                    <Table size="sm" borderless>
                        <tbody>
                            {messageLines.map((message, id) => {
                                return (
                                    <tr key={id}>
                                        <td>{message}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </ToastBody>
            </Toast>
        );
    }
}

export interface StopCalcButtonProps {
    calculating: boolean;
    onInterrupt: () => void;
}

export class StopCalcButton extends React.Component<StopCalcButtonProps, {}> {
    constructor(props: StopCalcButtonProps) {
        super(props);
    }

    render() {
        let { calculating, onInterrupt } = this.props;

        return calculating && (
            <Button variant="light" onClick={onInterrupt}>
                Cancel <Spinner size="sm" animation="border" />
            </Button>
        );
    }
}


export interface SimpleDropDownProps {
    button: React.JSX.Element | string;
    headerTitle: string;
    onMenuOpen?: () => void;
    children?: React.ReactNode;
}

export interface SimpleDropDownState { }

export class SimpleDropDown extends React.Component<SimpleDropDownProps, SimpleDropDownState> {
    state: SimpleDropDownState = {};

    constructor(props: SimpleDropDownProps) {
        super(props);
    }

    render() {
        const toggle = (show: boolean) => {
            if (show && this.props.onMenuOpen) {
                this.props.onMenuOpen();
            }
        }
    
        return (
            // FIXME: onToggle does not work, use onClick for now
            //<Dropdown drop="down" onToggle={show => this.toggle(show)} > 
            <Dropdown drop="down" onClick={() => toggle(true)} >
                <Dropdown.Toggle variant="primary" size="sm">
                    {this.props.button}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Header>{this.props.headerTitle}</Dropdown.Header>
                    <Dropdown.Divider />
                    <div style={{ overflowY: "auto", overflowX: "hidden", maxHeight: "50vh" }}>
                        {this.props.children}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export interface BaseConverterProps {
    show: boolean;
    inputBase: number;
    outputBase: number;
    onClose: () => void;
    onChangeInputBase: (b: number) => void;
    onChangeOutputBase: (b: number) => void;
}

export class BaseConverter extends React.Component<BaseConverterProps, {}> {
    constructor(props: BaseConverterProps) {
        super(props);
    }

    render() {
        let { props } = this;

        if (!props.show) {
            return null;
        }

        function onChangeInputBase(e: React.ChangeEvent<HTMLSelectElement>) {
            let base = parseInt(e.target.value);
            if (base !== props.inputBase) {
                props.onChangeInputBase(base);
            }
            MyInput.focus();
        }

        function onChangeOutputBase(e: React.ChangeEvent<HTMLSelectElement>) {
            let base = parseInt(e.target.value);
            if (base !== props.outputBase) {
                props.onChangeOutputBase(base);
            }
            MyInput.focus();
        }

        function onClickOption() {
            MyInput.focus();
        }

        return <Alert className="mb-0" variant="primary" dismissible onClose={() => props.onClose()}>
            <p>
                Base Converter
            </p>
            <Form>
                <Form.Group>
                    <Row>
                        <Col xs="auto">
                            <Form.Select size="sm" value={props.inputBase} onChange={onChangeInputBase}>
                                {Utils.Arr.mapRangeArray(2, BigMath.BigNumber.MaxBase, base => {
                                    return <option key={base} value={base} onClick={onClickOption}>{BigMath.Helpers.getBaseName(base, true)}</option>;
                                })}
                            </Form.Select>
                        </Col>
                        <Col xs="auto">
                            <ArrowSymbol />
                        </Col>
                        <Col xs="auto">
                            <Form.Select size="sm" value={props.outputBase} onChange={onChangeOutputBase}>
                                {Utils.Arr.mapRangeArray(2, BigMath.BigNumber.MaxBase, base => {
                                    return <option key={base} value={base} onClick={onClickOption}>{BigMath.Helpers.getBaseName(base, true)}</option>;
                                })}
                            </Form.Select>
                        </Col>
                    </Row>
                </Form.Group>
            </Form>
        </Alert>;
    }
}
