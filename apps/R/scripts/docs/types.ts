export interface ConfigProperty {
    scope?: "window" | "resource";
    deprecated?: boolean;
    default?: unknown;
    markdownDescription?: string;
    description?: string;
    enum?: string[];
    type?: string | string[];
    additionalProperties?: {
        type: string;
        properties?: Record<
            string,
            { type: string; enum?: string[]; markdownDescription?: string }
        >;
    };
}

export interface CommandContribution {
    command: string;
    title: string;
    category?: string;
    icon?: string;
}

export interface ViewContribution {
    id: string;
    name: string;
    icon?: string;
}

export interface ViewsWelcomeContribution {
    view: string;
    contents: string;
}

export interface WalkthroughContribution {
    id: string;
    title: string;
    description?: string;
}

export interface PackageJsonShape {
    name: string;
    displayName?: string;
    description?: string;
    version?: string;
    repository?: string | { type?: string; url?: string };
    sponsor?: { url?: string };
    contributes?: {
        commands?: CommandContribution[];
        views?: Record<string, ViewContribution[]>;
        viewsWelcome?: ViewsWelcomeContribution[];
        walkthroughs?: WalkthroughContribution[];
        configuration?: { properties: Record<string, ConfigProperty> };
    };
}

export interface Avatar {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
}
