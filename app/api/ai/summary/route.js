import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { content, title } = await req.json();

        if (!content || typeof content !== 'string') {
            return NextResponse.json({ summary: "No content available to summarize." });
        }

        // --- Enhanced Extractive Summarization Logic ---

        // 1. Sentence Segmentation (Better Regex)
        // Splits on . ! ? but tries to avoid common abbreviations like Mr. Dr. etc. (basic attempt)
        const rawSentences = content.match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g) || [content];

        // Filter out very short noise
        const sentences = rawSentences.filter(s => s.trim().length > 10);

        if (sentences.length === 0) {
            return NextResponse.json({ summary: content.substring(0, 100) + "..." });
        }
        if (sentences.length <= 2) {
            // Return formatted bullets even for short content
            const bullets = sentences.map(s => `• ${s.trim()}`).join('\n');
            return NextResponse.json({ summary: bullets });
        }

        // 2. Tokenization & cleanup
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'it', 'this', 'that', 'with', 'as', 'be', 'are', 'was', 'were', 'by', 'but', 'not', 'or', 'if', 'from', 'about', 'can', 'will', 'my', 'your', 'we', 'they', 'he', 'she', 'i', 'you', 'me', 'so', 'just', 'all', 'some', 'like', 'have', 'do']);

        const tokenize = (text) => text.toLowerCase().match(/\b\w+\b/g) || [];

        // 3. Frequency Analysis
        const wordFreq = {};
        const contentWords = tokenize(content);

        contentWords.forEach(word => {
            if (!stopWords.has(word) && word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // 4. Title Analysis
        const titleWords = new Set(tokenize(title || ''));

        // 5. Scoring Sentences
        const sentenceScores = sentences.map((sentence, index) => {
            const words = tokenize(sentence);
            if (words.length === 0) return { text: sentence, score: 0, index };

            let score = 0;
            words.forEach(word => {
                // Base frequency score
                if (wordFreq[word]) {
                    score += wordFreq[word];
                }
                // Title boost (3x weight)
                if (titleWords.has(word) && !stopWords.has(word)) {
                    score += (wordFreq[word] || 1) * 3;
                }
            });

            // Normalize by length (penalize overly long sentences slightly)
            score = score / (words.length * 0.8);

            // Position Boost
            // 1st sentence gets huge boost (Lead bias)
            if (index === 0) score *= 2.0;
            // 2nd sentence gets small boost
            if (index === 1) score *= 1.5;

            return { text: sentence.trim(), score, index };
        });

        // 6. Selection & Formatting
        // Sort by score descending
        const topSentences = sentenceScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 3) // Top 3
            .sort((a, b) => a.index - b.index); // Restore order

        // Retrieve valid text and ensure bullet points
        const summaryText = topSentences.map(s => `• ${s.text}`).join('\n\n');

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({ summary: summaryText });
    } catch (error) {
        console.error('AI Summary Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
