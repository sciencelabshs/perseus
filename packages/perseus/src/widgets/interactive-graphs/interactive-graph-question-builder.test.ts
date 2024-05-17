import {interactiveGraphQuestionBuilder} from "./interactive-graph-question-builder";

import type {PerseusRenderer} from "../../perseus-types";

describe("InteractiveGraphQuestionBuilder", () => {
    it("builds a default graph question", () => {
        const question: PerseusRenderer =
            interactiveGraphQuestionBuilder().build();

        expect(question.content).toBe("[[☃ interactive-graph 1]]");
    });

    it("sets the grid step", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withGridStep(7, 8)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.gridStep).toEqual([7, 8]);
    });

    it("sets the axis labels", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withAxisLabels("the x label", "the y label")
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.labels).toEqual(["the x label", "the y label"]);
    });

    it("sets the background markings", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withMarkings("grid")
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.markings).toBe("grid");
    });

    it("sets the ranges", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withXRange(-1, 2)
            .withYRange(3, 4)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.range).toEqual([
            [-1, 2],
            [3, 4],
        ]);
    });

    it("sets the snap step", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withSnapStep(5, 6)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.snapStep).toEqual([5, 6]);
    });

    it("sets the axis tick step", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withTickStep(7, 8)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.step).toEqual([7, 8]);
    });

    it("creates a segment graph with a specified number of segments", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withSegments(3)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options).toEqual(
            expect.objectContaining({
                graph: {
                    type: "segment",
                    numSegments: 3,
                },
                correct: {
                    type: "segment",
                    numSegments: 3,
                    coords: [
                        expect.anything(),
                        expect.anything(),
                        expect.anything(),
                    ],
                },
            }),
        );
    });

    it("creates a circle graph", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .withCircle()
            .build();
        const graph = question.widgets["interactive-graph 1"];
        expect(graph.options).toEqual(
            expect.objectContaining({
                graph: {type: "circle"},
                correct: {type: "circle", radius: 5, center: [0, 0]},
            }),
        );
    });

    it("adds a locked point", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .addLockedPointAt(3, 5)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.lockedFigures).toEqual([
            {
                type: "point",
                coord: [3, 5],
                color: "green",
                filled: true,
            },
        ]);
    });

    it("adds multiple locked points", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .addLockedPointAt(3, 5)
            .addLockedPointAt(6, 7)
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.lockedFigures).toEqual([
            {
                type: "point",
                coord: [3, 5],
                color: "green",
                filled: true,
            },
            {
                type: "point",
                coord: [6, 7],
                color: "green",
                filled: true,
            },
        ]);
    });

    it("adds a locked line", () => {
        const question: PerseusRenderer = interactiveGraphQuestionBuilder()
            .addLockedLine([1, 2], [3, 4])
            .build();
        const graph = question.widgets["interactive-graph 1"];

        expect(graph.options.lockedFigures).toEqual([
            {
                type: "line",
                kind: "line",
                points: [
                    {
                        type: "point",
                        coord: [1, 2],
                        color: "green",
                        filled: true,
                    },
                    {
                        type: "point",
                        coord: [3, 4],
                        color: "green",
                        filled: true,
                    },
                ],
                color: "green",
                lineStyle: "solid",
                showPoint1: true,
                showPoint2: true,
            },
        ]);
    });
});
