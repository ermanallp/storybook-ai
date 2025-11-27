export interface StoryPage {
    text: string;
    imagePrompt: string;
    imageUrl?: string;
}

export interface Story {
    title: string;
    pages: StoryPage[];
}

export interface StoryRequest {
    name: string;
    age: number;
    interests: string;
    theme: string;
}
