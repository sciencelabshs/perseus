import * as React from "react";

import VideoTranscriptLink from "../video-transcript-link";

type StoryArgs = Record<any, any>;

type Story = {
    title: string;
};

export default {
    title: "Perseus/Components/Video Transcript Link",
} as Story;

export const YoutubeVideoLink: React.FC<StoryArgs> = (
    args,
): React.ReactElement => {
    return (
        <VideoTranscriptLink location="https://www.youtube.com/watch?v=YoutubeId" />
    );
};

export const SlugVideoLink: React.FC<StoryArgs> = (
    args,
): React.ReactElement => {
    return <VideoTranscriptLink location="slug-video-id" />;
};
