import {useLatestRef} from "@khanacademy/wonder-blocks-core";
import * as React from "react";
import {useEffect, useImperativeHandle, useRef} from "react";

import {MafsGraph} from "./mafs-graph";
import {initializeGraphState} from "./reducer/initialize-graph-state";
import {
    changeRange,
    changeSnapStep,
    reinitialize,
} from "./reducer/interactive-graph-action";
import {interactiveGraphReducer} from "./reducer/interactive-graph-reducer";
import {getGradableGraph, getRadius} from "./reducer/interactive-graph-state";

import type {InteractiveGraphProps, InteractiveGraphState} from "./types";
import type {Widget} from "../../renderer";
import type {PerseusGraphType} from "@khanacademy/perseus";

export type StatefulMafsGraphProps = {
    box: [number, number];
    backgroundImage?: InteractiveGraphProps["backgroundImage"];
    graph: PerseusGraphType;
    lockedFigures?: InteractiveGraphProps["lockedFigures"];
    range: InteractiveGraphProps["range"];
    snapStep: InteractiveGraphProps["snapStep"];
    step: InteractiveGraphProps["step"];
    gridStep: InteractiveGraphProps["gridStep"];
    containerSizeClass: InteractiveGraphProps["containerSizeClass"];
    markings: InteractiveGraphProps["markings"];
    onChange: InteractiveGraphProps["onChange"];
    showTooltips: Required<InteractiveGraphProps["showTooltips"]>;
    showProtractor: boolean;
    labels: InteractiveGraphProps["labels"];
};

// Rather than be tightly bound to how data was structured in
// the legacy interactive graph, this lets us store state
// however we want and we just transform it before handing it off
// the the parent InteractiveGraph
function mafsStateToInteractiveGraph(state: {graph: InteractiveGraphState}) {
    if (state.graph.type === "circle") {
        return {
            ...state,
            graph: {
                ...state.graph,
                radius: getRadius(state.graph),
            },
        };
    }
    return {
        ...state,
    };
}

export const StatefulMafsGraph = React.forwardRef<
    Partial<Widget>,
    StatefulMafsGraphProps
>((props, ref) => {
    const {onChange, graph} = props;

    const [state, dispatch] = React.useReducer(
        interactiveGraphReducer,
        props,
        initializeGraphState,
    );

    useImperativeHandle(ref, () => ({
        getUserInput: () => getGradableGraph(state, graph),
    }));

    const prevState = useRef<InteractiveGraphState>(state);

    useEffect(() => {
        if (prevState.current !== state) {
            onChange(mafsStateToInteractiveGraph({graph: state}));
        }
        prevState.current = state;
    }, [onChange, state]);

    // Destructuring first to keep useEffect from making excess calls
    const [xSnap, ySnap] = props.snapStep;
    useEffect(() => {
        dispatch(changeSnapStep([xSnap, ySnap]));
    }, [dispatch, xSnap, ySnap]);

    // Destructuring first to keep useEffect from making excess calls
    const [[xMinRange, xMaxRange], [yMinRange, yMaxRange]] = props.range;
    useEffect(() => {
        dispatch(
            changeRange([
                [xMinRange, xMaxRange],
                [yMinRange, yMaxRange],
            ]),
        );
    }, [dispatch, xMinRange, xMaxRange, yMinRange, yMaxRange]);

    const numSegments = graph.type === "segment" ? graph.numSegments : null;
    const numSides = graph.type === "polygon" ? graph.numSides : null;
    const snapTo = graph.type === "polygon" ? graph.snapTo : null;
    const showAngles = graph.type === "polygon" ? graph.showAngles : null;
    const showSides = graph.type === "polygon" ? graph.showSides : null;

    const originalPropsRef = useRef(props);
    const latestPropsRef = useLatestRef(props);
    useEffect(() => {
        // This conditional prevents the state from being "reinitialized" right
        // after the first render. This is an optimization, but also prevents
        // a bug where the graph would be marked "incorrect" during grading
        // even if the user never interacted with it.
        if (latestPropsRef.current !== originalPropsRef.current) {
            dispatch(reinitialize(latestPropsRef.current));
        }
    }, [
        graph.type,
        numSegments,
        numSides,
        snapTo,
        showAngles,
        showSides,
        latestPropsRef,
    ]);

    return <MafsGraph {...props} state={state} dispatch={dispatch} />;
});
