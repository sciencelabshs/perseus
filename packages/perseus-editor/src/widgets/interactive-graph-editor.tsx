/* eslint-disable react/no-unsafe */
/* eslint-disable react/sort-comp */
import {
    components,
    interactiveSizes,
    InteractiveGraphWidget,
    SizingUtils,
    Util,
} from "@khanacademy/perseus";
import {View} from "@khanacademy/wonder-blocks-core";
import {OptionItem, SingleSelect} from "@khanacademy/wonder-blocks-dropdown";
import {Checkbox} from "@khanacademy/wonder-blocks-form";
import {spacing} from "@khanacademy/wonder-blocks-tokens";
import {BodyMonospace, LabelSmall} from "@khanacademy/wonder-blocks-typography";
import {StyleSheet} from "aphrodite";
import * as React from "react";
import _ from "underscore";

import GraphPointsCountSelector from "../components/graph-points-count-selector";
import GraphTypeSelector from "../components/graph-type-selector";
import InteractiveGraphSettings from "../components/interactive-graph-settings";
import LabeledRow from "../components/labeled-row";
import LockedFiguresSection from "../components/locked-figures-section";
import SegmentCountSelector from "../components/segment-count-selector";
import {parsePointCount} from "../util/points";

import type {
    PerseusImageBackground,
    PerseusInteractiveGraphWidgetOptions,
    APIOptionsWithDefaults,
    LockedFigure,
} from "@khanacademy/perseus";
import type {PropsFor} from "@khanacademy/wonder-blocks-core";

const {InfoTip} = components;
const {containerSizeClass, getInteractiveBoxFromSizeClass} = SizingUtils;
const DeprecationMixin = Util.DeprecationMixin;
const InteractiveGraph = InteractiveGraphWidget.widget;

type InteractiveGraphProps = PropsFor<typeof InteractiveGraph>;

const defaultBackgroundImage = {
    url: null,
} as const;

const deprecatedProps = {
    showGraph: function (props) {
        return {markings: props.showGraph ? "graph" : "none"};
    },
} as const;

const POLYGON_SIDES = _.map(_.range(3, 13), function (value) {
    return (
        <OptionItem
            key={`polygon-sides-${value}`}
            value={`${value}`}
            label={`${value} sides`}
        />
    );
});

type Range = [min: number, max: number];

export type Props = {
    apiOptions: APIOptionsWithDefaults;

    /**
     * The labels for the x and y axes.
     */
    labels: ReadonlyArray<string>;
    /**
     * The range of the graph in the x and y directions.
     */
    range: [x: Range, y: Range];
    /**
     * How far apart the tick marks on the axes are in the x and y
     * directions.
     */
    step: [x: number, y: number];
    /**
     * How far apart the grid lines are in the x and y directions.
     */
    gridStep: [x: number, y: number];
    /**
     * How far apart the snap-to points are in the x and y directions.
     */
    snapStep: [x: number, y: number];
    /**
     * The size of the graph in pixels.
     */
    box: [x: number, y: number];

    /**
     * An error message to display in the graph area, or true if the
     * graph is valid.
     */
    valid: string | boolean;
    /**
     * The background image to display in the graph area and its properties.
     */
    backgroundImage: PerseusImageBackground;
    /**
     * The type of markings to display on the graph.
     * - graph: shows the axes and the grid lines
     * - grid: shows only the grid lines
     * - none: shows no markings
     */
    markings: "graph" | "grid" | "none";
    /**
     * Whether to show the protractor on the graph.
     */
    showProtractor: boolean;
    /**
     * Whether to show the ruler on the graph.
     */
    showRuler: boolean;
    /**
     * Whether to show tooltips on the graph.
     * (Currently not used, but will be in the future.)
     */
    showTooltips: boolean;
    /**
     * The label to display on the ruler, if any.
     */
    rulerLabel: string;
    /**
     * The number of ticks to display on the ruler.
     */
    rulerTicks: number;
    /**
     * The current correct answer for the graph. Updated by this component
     * when the graph is changed.
     *
     * Note that the "Correct answer:" textbox is not an interactive
     * element. Instead, it is a representation of the correct answer based
     * on the state of the interactive graph previewed at the bottom of the
     * editor page.
     */
    correct: any; // TODO(jeremy)
    /**
     * The locked figures to display in the graph area.
     * Locked figures are graph elements (points, lines, line segmeents,
     * etc.) that are locked in place and not interactive.
     */
    lockedFigures?: Array<LockedFigure>;

    /**
     * The graph to display in the graph area.
     */
    graph: InteractiveGraphProps["graph"];
    onChange: (props: Partial<Props>) => void;
};

type DefaultProps = {
    labels: Props["labels"];
    range: Props["range"];
    step: Props["step"];
    valid: Props["valid"];
    backgroundImage: Props["backgroundImage"];
    markings: Props["markings"];
    showProtractor: Props["showProtractor"];
    showRuler: Props["showRuler"];
    showTooltips: Props["showTooltips"];
    rulerLabel: Props["rulerLabel"];
    rulerTicks: Props["rulerTicks"];
    correct: Props["correct"];
};

/**
 * An editor for the InteractiveGraph widget, which allows the user to
 * specify the graph's properties and the correct answer.
 *
 * Used in the exercise editor.
 */
class InteractiveGraphEditor extends React.Component<Props> {
    displayName = "InteractiveGraphEditor";
    className = "perseus-widget-interactive-graph";

    static widgetName = "interactive-graph";

    static defaultProps: DefaultProps = {
        ...InteractiveGraph.defaultProps,
        valid: true,
        backgroundImage: defaultBackgroundImage,
        showTooltips: false,
        correct: {
            type: InteractiveGraph.defaultProps.graph.type,
            coords: null,
        },
    };

    // TODO(jack): Use versioning instead of DeprecationMixin
    deprecatedProps = deprecatedProps;

    // TODO(jangmi, CP-3288): Remove usage of `UNSAFE_componentWillMount`
    UNSAFE_componentWillMount() {
        DeprecationMixin.UNSAFE_componentWillMount.call(this);
    }

    render() {
        let graph;
        let equationString;

        const gridStep =
            this.props.gridStep ||
            Util.getGridStep(
                this.props.range,
                this.props.step,
                interactiveSizes.defaultBoxSize,
            );
        const snapStep =
            this.props.snapStep || Util.snapStepFromGridStep(gridStep);

        const sizeClass = containerSizeClass.SMALL;
        if (this.props.valid === true) {
            const correct = this.props.correct;

            // TODO(aria): send these down all at once
            const graphProps = {
                ref: "graph",
                box: this.props.box,
                range: this.props.range,
                labels: this.props.labels,
                step: this.props.step,
                gridStep: gridStep,
                snapStep: snapStep,
                graph: correct,
                backgroundImage: this.props.backgroundImage,
                markings: this.props.markings,
                showProtractor: this.props.showProtractor,
                showRuler: this.props.showRuler,
                showTooltips: this.props.showTooltips,
                rulerLabel: this.props.rulerLabel,
                rulerTicks: this.props.rulerTicks,
                lockedFigures: this.props.lockedFigures,
                trackInteraction: function () {},
                onChange: (newProps: InteractiveGraphProps) => {
                    let correct = this.props.correct;
                    // @ts-expect-error - TS2532 - Object is possibly 'undefined'.
                    if (correct.type === newProps.graph.type) {
                        correct = _.extend({}, correct, newProps.graph);
                    } else {
                        // Clear options from previous graph
                        correct = newProps.graph;
                    }
                    this.props.onChange({correct: correct});
                },
            } as const;

            // This is used to force a remount of the graph component
            // when there's a significant change
            const graphKey = `${correct.type}:${correct.numSegments || 0}`;
            graph = (
                // There are a bunch of props that renderer.jsx passes to widgets via
                // getWidgetProps() and widget-container.jsx that the editors don't
                // bother passing.
                // @ts-expect-error - TS2769 - No overload matches this call.
                <InteractiveGraph
                    {...graphProps}
                    key={graphKey}
                    containerSizeClass={sizeClass}
                    apiOptions={{
                        ...this.props.apiOptions,
                        isMobile: false,
                    }}
                />
            );
            // TODO(kevinb): Update getEquationString to only accept the data it actually
            // needs to compute the equation string.
            // @ts-expect-error - TS2345 - Argument of type '{ readonly ref: "graph"; readonly box: any; readonly range: any; readonly labels: any; readonly step: any; readonly gridStep: any; readonly snapStep: any; readonly graph: any; readonly backgroundImage: any; ... 6 more ...; readonly onChange: (newProps: Pick<...> & ... 1 more ... & InexactPartial<...>) => void; }' is not assignable to parameter of type 'Props'.
            equationString = InteractiveGraph.getEquationString(graphProps);
        } else {
            graph = <div className="perseus-error">{this.props.valid}</div>;
        }

        return (
            <View>
                <LabeledRow label="Type of Graph:">
                    <GraphTypeSelector
                        graphType={
                            this.props.graph?.type ??
                            InteractiveGraph.defaultProps.graph.type
                        }
                        onChange={(
                            type: Required<InteractiveGraphProps>["graph"]["type"],
                        ) => {
                            this.props.onChange({
                                graph: {type},
                                correct: {type},
                            });
                        }}
                    />
                </LabeledRow>
                {this.props.correct?.type === "point" && (
                    <LabeledRow label="Number of Points:">
                        <GraphPointsCountSelector
                            numPoints={this.props.correct?.numPoints}
                            onChange={(points) => {
                                this.props.onChange({
                                    correct: {
                                        type: "point",
                                        numPoints: points,
                                    },
                                });
                            }}
                        />
                    </LabeledRow>
                )}
                {this.props.correct?.type === "polygon" && (
                    <>
                        <LabeledRow label="Number of sides:">
                            <SingleSelect
                                key="polygon-select"
                                selectedValue={
                                    this.props.correct?.numSides
                                        ? `${this.props.correct.numSides}`
                                        : "3"
                                }
                                placeholder=""
                                onChange={(newValue) => {
                                    const graph = {
                                        ...this.props.correct,
                                        numSides: parsePointCount(newValue),
                                        coords: null,
                                        // reset the snap for UNLIMITED, which
                                        // only supports "grid"
                                        // From: D6578
                                        snapTo: "grid",
                                    };

                                    this.props.onChange({correct: graph});
                                }}
                                style={styles.singleSelectShort}
                            >
                                {[
                                    ...POLYGON_SIDES,
                                    <OptionItem
                                        key="unlimited"
                                        value="unlimited"
                                        label="unlimited sides"
                                    />,
                                ]}
                            </SingleSelect>
                        </LabeledRow>
                        <LabeledRow label="Snap to:">
                            <SingleSelect
                                selectedValue={
                                    this.props.correct?.snapTo || "grid"
                                }
                                // Never uses placeholder, always has value
                                placeholder=""
                                onChange={(newValue) => {
                                    const graph = {
                                        ...this.props.correct,
                                        snapTo: newValue,
                                        coords: null,
                                    };

                                    this.props.onChange({correct: graph});
                                }}
                                style={styles.singleSelectShort}
                            >
                                <OptionItem value="grid" label="grid" />
                                {this.props.correct?.numSides !==
                                    "unlimited" && (
                                    <OptionItem
                                        value="angles"
                                        label="interior angles"
                                    />
                                )}
                                {this.props.correct?.numSides !==
                                    "unlimited" && (
                                    <OptionItem
                                        value="sides"
                                        label="side measures"
                                    />
                                )}
                            </SingleSelect>
                            <InfoTip>
                                <p>
                                    These options affect the movement of the
                                    vertex points. The grid option will guide
                                    the points to the nearest half step along
                                    the grid.
                                </p>
                                <p>
                                    The interior angle and side measure options
                                    guide the points to the nearest whole angle
                                    or side measure respectively.
                                </p>
                            </InfoTip>
                        </LabeledRow>
                        <View style={styles.row}>
                            <Checkbox
                                label={
                                    <LabelSmall>Show angle measures</LabelSmall>
                                }
                                checked={
                                    // Don't show indeterminate checkbox state
                                    !!this.props.correct?.showAngles
                                }
                                onChange={() => {
                                    this.props.onChange({
                                        correct: {
                                            ...this.props.correct,
                                            showAngles:
                                                !this.props.correct.showAngles,
                                        },
                                    });
                                }}
                            />
                            <InfoTip>
                                <p>Displays the interior angle measures.</p>
                            </InfoTip>
                        </View>
                        <View style={styles.row}>
                            <Checkbox
                                label={
                                    <LabelSmall>Show side measures</LabelSmall>
                                }
                                checked={
                                    // Don't show indeterminate checkbox state
                                    !!this.props.correct?.showSides
                                }
                                onChange={() => {
                                    this.props.onChange({
                                        correct: {
                                            ...this.props.correct,
                                            showSides:
                                                !this.props.correct.showSides,
                                        },
                                    });
                                }}
                            />
                            <InfoTip>
                                <p>Displays the side lengths.</p>
                            </InfoTip>
                        </View>
                    </>
                )}
                {this.props.correct?.type === "segment" && (
                    <LabeledRow label="Number of segments:">
                        <SegmentCountSelector
                            numSegments={this.props.correct?.numSegments}
                            onChange={(sides) => {
                                this.props.onChange({
                                    correct: {
                                        type: "segment",
                                        numSegments: sides,
                                        coords: null,
                                    },
                                });
                            }}
                        />
                    </LabeledRow>
                )}
                <InteractiveGraphSettings
                    box={getInteractiveBoxFromSizeClass(sizeClass)}
                    range={this.props.range}
                    labels={this.props.labels}
                    step={this.props.step}
                    gridStep={gridStep}
                    snapStep={snapStep}
                    valid={this.props.valid}
                    backgroundImage={this.props.backgroundImage}
                    markings={this.props.markings}
                    showProtractor={this.props.showProtractor}
                    showRuler={this.props.showRuler}
                    showTooltips={this.props.showTooltips}
                    rulerLabel={this.props.rulerLabel}
                    rulerTicks={this.props.rulerTicks}
                    onChange={this.props.onChange}
                />
                {this.props.correct.type === "polygon" && (
                    <LabeledRow label="Student answer must">
                        <SingleSelect
                            selectedValue={this.props.correct.match || "exact"}
                            onChange={this.changeMatchType}
                            // Never uses placeholder, always has value
                            placeholder=""
                            style={styles.singleSelectShort}
                        >
                            <OptionItem value="exact" label="match exactly" />
                            <OptionItem
                                value="congruent"
                                label="be congruent"
                            />
                            <OptionItem
                                value="approx"
                                label="be approximately congruent"
                            />
                            <OptionItem value="similar" label="be similar" />
                        </SingleSelect>

                        <InfoTip>
                            <ul>
                                <li>
                                    <p>
                                        <b>Match Exactly:</b> Match exactly in
                                        size, orientation, and location on the
                                        grid even if it is not shown in the
                                        background.
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        <b>Be Congruent:</b> Be congruent in
                                        size and shape, but can be located
                                        anywhere on the grid.
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        <b>Be Approximately Congruent:</b> Be
                                        exactly similar, and congruent in size
                                        and shape to within 0.1 units, but can
                                        be located anywhere on the grid.{" "}
                                        <em>
                                            Use this with snapping to angle
                                            measure.
                                        </em>
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        <b>Be Similar:</b> Be similar with
                                        matching interior angles, and side
                                        measures that are matching or a multiple
                                        of the correct side measures. The figure
                                        can be located anywhere on the grid.
                                    </p>
                                </li>
                            </ul>
                        </InfoTip>
                    </LabeledRow>
                )}
                {this.props.correct.type === "angle" && (
                    <LabeledRow label="Student answer must">
                        <SingleSelect
                            selectedValue={this.props.correct.match || "exact"}
                            onChange={this.changeMatchType}
                            // Never uses placeholder, always has value
                            placeholder=""
                            style={styles.singleSelectShort}
                        >
                            <OptionItem value="exact" label="match exactly" />
                            <OptionItem
                                value="congruent"
                                label="be congruent"
                            />
                        </SingleSelect>
                        <InfoTip>
                            <p>
                                Congruency requires only that the angle measures
                                are the same. An exact match implies congruency,
                                but also requires that the angles have the same
                                orientation and that the vertices are in the
                                same position.
                            </p>
                        </InfoTip>
                    </LabeledRow>
                )}
                <LabeledRow label="Correct answer:">
                    <BodyMonospace
                        style={{
                            fontSize: 12,
                            backgroundColor: "#eee",
                            paddingInline: spacing.xxSmall_6,
                            borderColor: "#ccc",
                            borderStyle: "solid",
                            borderWidth: 1,
                        }}
                    >
                        {equationString}
                    </BodyMonospace>
                    <InfoTip>
                        <p>
                            Graph the correct answer in the graph below and
                            ensure the equation or point coordinates displayed
                            represent the correct answer.
                        </p>
                    </InfoTip>
                </LabeledRow>
                {graph}
                {
                    // Only show the "Add locked figure" dropdown if the graph
                    // is using Mafs.
                    this.props.graph &&
                        this.props.apiOptions?.flags?.mafs?.[
                            "interactive-graph-locked-features-m1"
                        ] &&
                        this.props.apiOptions?.flags?.mafs?.[
                            this.props.graph.type
                        ] && (
                            <LockedFiguresSection
                                figures={this.props.lockedFigures}
                                onChange={this.props.onChange}
                            />
                        )
                }
            </View>
        );
    }

    changeMatchType = (newValue) => {
        const correct = {
            ...this.props.correct,
            match: newValue,
        };
        this.props.onChange({correct: correct});
    };

    serialize(): PerseusInteractiveGraphWidgetOptions {
        const json = _.pick(
            this.props,
            "step",
            "backgroundImage",
            "markings",
            "labels",
            "showProtractor",
            "showRuler",
            "showTooltips",
            "rulerLabel",
            "rulerTicks",
            "range",
            "gridStep",
            "snapStep",
            "lockedFigures",
        );

        // eslint-disable-next-line react/no-string-refs
        const graph = this.refs.graph;
        if (graph) {
            // @ts-expect-error TS2339 Property 'getUserInput' does not exist on type 'ReactInstance'. Property 'getUserInput' does not exist on type 'Component<any, {}, any>'.
            const correct = graph && graph.getUserInput();
            _.extend(json, {
                graph: {type: correct.type},
                correct: correct,
            });

            _.each(
                [
                    "allowReflexAngles",
                    "angleOffsetDeg",
                    "numPoints",
                    "numSides",
                    "numSegments",
                    "showAngles",
                    "showSides",
                    "snapTo",
                    "snapDegrees",
                ],
                function (key) {
                    if (_.has(correct, key)) {
                        // @ts-expect-error - TS2339 - Property 'graph' does not exist on type 'Pick<any, "step" | "range" | "backgroundImage" | "snapStep" | "labels" | "showTooltips" | "markings" | "gridStep" | "showProtractor" | "showRuler" | "rulerLabel" | "rulerTicks">'.
                        json.graph[key] = correct[key];
                    }
                },
            );
        }
        // @ts-expect-error TS2739 Type 'Pick<Readonly<Props> & Readonly<{ children?: ReactNode; }>, "step" | "gridStep" | "snapStep" | "backgroundImage" | "markings" | "labels" | ... 5 more ... | "range">' is missing the following properties from type 'PerseusInteractiveGraphWidgetOptions': graph, correct
        return json;
    }
}

const styles = StyleSheet.create({
    singleSelectShort: {
        // Non-standard spacing, but it's the smallest we can go
        // without running into styling issues with the dropdown.
        height: 26,
    },
    row: {
        flexDirection: "row",
        marginTop: spacing.xSmall_8,
        alignItems: "center",
    },
});

export default InteractiveGraphEditor;
