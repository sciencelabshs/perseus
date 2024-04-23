import * as React from "react";

import Renderer from "../../renderer";
import {interactiveGraphQuestionBuilder} from "../interactive-graphs/interactive-graph-question-builder";

import type {PerseusRenderer} from "@khanacademy/perseus";

type StoryArgs = Record<any, any>;

export default {
    title: "Perseus/Widgets/Interactive Graph Visual Regression Tests",
};

export const MafsWithCustomAxisLabels = (
    args: StoryArgs,
): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withAxisLabels(
                "\\text{Custom $x$ label}",
                "\\text{Custom $y$ label}",
            )
            .build()}
    />
);

export const MafsWithFractionalGridStep = (
    args: StoryArgs,
): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withGridStep(2.571, 3.123)
            .build()}
    />
);

export const MafsWithFractionalAxisTicks = (
    args: StoryArgs,
): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withTickStep(1.5, 1.5)
            .build()}
    />
);

export const MafsWithGridMarkings = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withMarkings("grid")
            .build()}
    />
);

export const MafsWithNoMarkings = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withMarkings("none")
            .build()}
    />
);

export const MafsWithSmallRange = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withXRange(-2, 2)
            .withYRange(-2, 2)
            .build()}
    />
);

export const MafsWithLargeRange = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder()
            .withXRange(-50, 50)
            .withYRange(-50, 50)
            .build()}
    />
);

export const MafsWithYAxisAtLeft = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withXRange(0, 20).build()}
    />
);

export const MafsWithYAxisNearLeft = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withXRange(-1, 20).build()}
    />
);

export const MafsWithYAxisOffLeft = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withXRange(1, 20).build()}
    />
);

export const MafsWithYAxisAtRight = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withXRange(-20, 0).build()}
    />
);

export const MafsWithYAxisOffRight = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withXRange(-20, -1).build()}
    />
);

export const MafsWithXAxisAtBottom = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withYRange(0, 20).build()}
    />
);

export const MafsWithXAxisNearBottom = (
    args: StoryArgs,
): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withYRange(-1, 20).build()}
    />
);

export const MafsWithXAxisOffBottom = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withYRange(1, 20).build()}
    />
);

export const MafsWithXAxisAtTop = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withYRange(-20, 0).build()}
    />
);

export const MafsWithXAxisOffTop = (args: StoryArgs): React.ReactElement => (
    <MafsQuestionRenderer
        question={interactiveGraphQuestionBuilder().withYRange(-20, -1).build()}
    />
);

function MafsQuestionRenderer(props: {question: PerseusRenderer}) {
    const {question} = props;
    return (
        <Renderer
            content={question.content}
            widgets={question.widgets}
            images={question.images}
            apiOptions={{
                flags: {
                    mafs: {
                        segment: true,
                    },
                },
            }}
        />
    );
}