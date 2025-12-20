import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
    try {
        const { content, title } = await req.json();

        // DEBUG LOGGING
        console.log("--- AI SUMMARY REQUEST ---");
        console.log("Has Content:", !!content);
        console.log("Key Exists:", !!process.env.GEMINI_API_KEY);
        console.log("Key Length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

        if (!content || typeof content !== 'string') {
            return NextResponse.json({ summary: "No content available to summarize." });
        }

        // --- 1. Generative AI Logic (Google Gemini) ---
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // Switch to Lite model to avoid 429 Rate Limits
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });

                const prompt = `Summarize the following Reddit post titled "${title || 'Untitled'}". 
                Provide the summary as 1 to 3 concise, information-dense bullet points. 
                Do not use conversational filler (e.g., "The post discusses..."). Just state the points.
                
                Content:
                ${content.substring(0, 10000)} // Limit context to avoid errors
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Ensure it looks like bullets if the model didn't do it perfectly
                const summary = text.startsWith('•') || text.startsWith('-') || text.startsWith('*')
                    ? text
                    : text.split('\n').map(line => line.trim() && !line.startsWith('•') ? `• ${line}` : line).join('\n');

                return NextResponse.json({ summary: summary.trim() });

            } catch (aiError) {
                console.error("Gemini API Error (Falling back to local):", aiError);
                // Continue to fallback...
            }
        }

        // --- 2. Fallback: Enhanced Extractive Summarization Logic ---
        // (Used if no API key is set OR if the API fails)

        // Sentence Segmentation (Using Intl.Segmenter)
        const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
        const rawSentences = Array.from(segmenter.segment(content)).map(s => s.segment.trim());

        // Filter out very short noise
        const sentences = rawSentences.filter(s => s.length > 15);

        if (sentences.length === 0) {
            return NextResponse.json({ summary: "• " + content.substring(0, 100) + "..." });
        }
        if (sentences.length <= 3) {
            const bullets = sentences.map(s => `• ${s}`).join('\n\n');
            return NextResponse.json({ summary: bullets });
        }

        // Tokenization & cleanup
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'it', 'this', 'that', 'with', 'as', 'be', 'are', 'was', 'were', 'by', 'but', 'not', 'or', 'if', 'from', 'about', 'can', 'will', 'my', 'your', 'we', 'they', 'he', 'she', 'i', 'you', 'me', 'so', 'just', 'all', 'some', 'like', 'have', 'do', 'has', 'had', 'been', 'would', 'could', 'should']);
        const tokenize = (text) => text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];

        // Scoring
        const wordFreq = {};
        const contentWords = tokenize(content);
        contentWords.forEach(word => {
            if (!stopWords.has(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        const titleWords = new Set(tokenize(title || ''));
        const sentenceScores = sentences.map((sentence, index) => {
            const words = tokenize(sentence);
            if (words.length === 0) return { text: sentence, score: 0, index };

            let score = 0;
            words.forEach(word => {
                if (wordFreq[word]) score += wordFreq[word];
                if (titleWords.has(word) && !stopWords.has(word)) score += (wordFreq[word] || 1) * 2.5;
            });

            score = score / Math.pow(words.length, 0.5);

            if (index === 0) score *= 1.8;
            if (index === sentences.length - 1) score *= 1.4;

            return { text: sentence, score, index };
        });

        const topSentences = sentenceScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .sort((a, b) => a.index - b.index);

        const summaryText = topSentences.map(s => `• ${s.text}`).join('\n\n');

        return NextResponse.json({ summary: summaryText });
    } catch (error) {
        console.error('AI Summary Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
