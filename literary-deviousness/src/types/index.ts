export type RagQuery = {
    query: string;
    parameters?: Record<string, any>;
};

export type RagCitation = {
    source: string;
    page?: number;
    context?: string;
};

export type RagDimensionScore = {
    dimension: string;
    score: number;
};

export type RagEvidence = {
    evidenceId: string;
    description: string;
};

export type RagResult = {
    resultId: string;
    query: RagQuery;
    citations: RagCitation[];
    scores: RagDimensionScore[];
    evidence: RagEvidence[];
};