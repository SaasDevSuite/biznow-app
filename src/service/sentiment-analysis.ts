// import { SentimentAnalyzer, PorterStemmer, WordTokenizer } from 'natural';
import { removeStopwords } from 'stopword';

import pkg from 'natural';
const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = pkg;

// Function for sentiment analysis using the natural library
export function getSentiment(text: string) {
    /**
     * Removing non-alphabetical and special characters
     * Converting to lowercase
     */
    const alphaOnlyReview = text.replace(/[^a-zA-Z\s]+/g, '');

    /**
     * Tokenization
     */
    const tokenizer = new WordTokenizer();
    const tokenizedText = tokenizer.tokenize(alphaOnlyReview);

    /** Remove stop words */
    const filteredText = removeStopwords(tokenizedText);

    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const score = analyzer.getSentiment(filteredText);

    // Determine sentiment based on score
    let sentiment = 'neutral'; // Default sentiment is neutral

    if (score > 0.05) {
        sentiment = 'positive';
    } else if (score < -0.05) {
        sentiment = 'negative';
    }

    return {
        sentiment: sentiment,
        score: score,
    };
}

export async function analyzeSentiment(text: string) {

    return await getSentiment(text);
}
