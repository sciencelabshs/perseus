import * as React from "react";

import {RendererWithDebugUI} from "../../../../../testing/renderer-with-debug-ui";
import {
    questionWithPassage,
    multiChoiceQuestion,
    multiChoiceQuestionSimple,
    // @ts-expect-error [FEI-5003] - TS2307 - Cannot find module '../__testdata__/radio_testdata' or its corresponding type declarations.
} from "../__testdata__/radio_testdata";

import type {PerseusRenderer} from "../../perseus-types";
import type {APIOptions} from "../../types";

type StoryArgs = {
    // Radio Options
    static: boolean;
    // API Options
    crossOutEnabled: boolean;
    // Renderer Options
    reviewMode: boolean;
};

type Story = {
    title: string;
    args: StoryArgs;
};

export default {
    title: "Perseus/Widgets/Radio",
    args: {
        static: false,
        crossOutEnabled: false,
        reviewMode: false,
    },
} as Story;

const applyStoryArgs = (
    question: PerseusRenderer,
    args: StoryArgs,
): PerseusRenderer => {
    const q = {
        ...question,
        widgets: {},
    } as const;

    for (const [widgetId, widget] of Object.entries(question.widgets)) {
        q.widgets[widgetId] = {...widget, static: args.static};
    }

    return q;
};

const buildApiOptions = (args: StoryArgs): APIOptions => {
    return {
        crossOutEnabled: args.crossOutEnabled,
    };
};

export const SingleSelect: React.FC<StoryArgs> = (args): React.ReactElement => {
    return (
        <RendererWithDebugUI
            question={applyStoryArgs(questionWithPassage, args)}
            apiOptions={buildApiOptions(args)}
            reviewMode={args.reviewMode}
        />
    );
};

export const MultiSelectSimple: React.FC<StoryArgs> = (
    args,
): React.ReactElement => {
    return (
        <RendererWithDebugUI
            question={applyStoryArgs(multiChoiceQuestionSimple, args)}
            apiOptions={buildApiOptions(args)}
            reviewMode={args.reviewMode}
        />
    );
};

export const MultiSelect: React.FC<StoryArgs> = (args): React.ReactElement => {
    return (
        <RendererWithDebugUI
            question={applyStoryArgs(multiChoiceQuestion, args)}
            apiOptions={buildApiOptions(args)}
            reviewMode={args.reviewMode}
        />
    );
};