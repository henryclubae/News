// ============================================================================
// CONTENT PROCESSING UTILITIES
// ============================================================================
// Comprehensive content processing, analysis, and optimization utilities
// for news articles, blog posts, and other textual content.

import type { NewsArticle } from '@/types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface ReadingTimeResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  words: number;
  estimatedReadingSpeed: number; // words per minute
}

export interface TextSummaryResult {
  summary: string;
  keyPoints: string[];
  compressionRatio: number; // percentage of original length
  confidenceScore: number; // 0-1
}

export interface KeywordExtractionResult {
  keywords: ExtractedKeyword[];
  totalWords: number;
  uniqueWords: number;
  keywordDensity: Record<string, number>;
}

export interface ExtractedKeyword {
  word: string;
  frequency: number;
  relevanceScore: number;
  positions: number[];
  variants: string[];
}

export interface ContentSanitationResult {
  sanitizedContent: string;
  removedElements: string[];
  warnings: string[];
  isClean: boolean;
}

export interface ImageOptimizationSuggestion {
  originalUrl: string;
  suggestedFormats: string[];
  compressionLevel: number;
  altTextSuggestion: string;
  sizeReduction: number; // percentage
}

export interface SEOScoreResult {
  overallScore: number; // 0-100
  breakdown: {
    titleOptimization: number;
    metaDescription: number;
    headingStructure: number;
    keywordUsage: number;
    contentLength: number;
    readability: number;
    internalLinking: number;
    imageOptimization: number;
  };
  recommendations: string[];
}

export interface UniquenessResult {
  uniquenessScore: number; // 0-100
  similarContent: SimilarContentMatch[];
  fingerprint: string;
  duplicatePercentage: number;
}

export interface SimilarContentMatch {
  title: string;
  url?: string;
  similarity: number; // 0-1
  matchType: 'exact' | 'near-duplicate' | 'similar-structure';
}

export interface LanguageDetectionResult {
  primaryLanguage: string;
  confidence: number;
  alternativeLanguages: { language: string; confidence: number }[];
  isMultiLanguage: boolean;
}

export interface ContentAnalysisOptions {
  includeReadingTime?: boolean;
  includeSummary?: boolean;
  includeKeywords?: boolean;
  includeSEOAnalysis?: boolean;
  includeUniquenessCheck?: boolean;
  languageDetection?: boolean;
  sanitizeContent?: boolean;
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class ContentProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ContentProcessingError';
  }

  static invalidContent(message: string): ContentProcessingError {
    return new ContentProcessingError(message, 'INVALID_CONTENT');
  }

  static processingFailed(message: string, error?: Error): ContentProcessingError {
    return new ContentProcessingError(message, 'PROCESSING_FAILED', error);
  }

  static insufficientData(message: string): ContentProcessingError {
    return new ContentProcessingError(message, 'INSUFFICIENT_DATA');
  }
}

// ============================================================================
// READING TIME CALCULATION
// ============================================================================

export class ReadingTimeCalculator {
  private static readonly DEFAULT_WPM = 225; // Average reading speed
  private static readonly SLOW_READER_WPM = 180;
  private static readonly FAST_READER_WPM = 300;

  /**
   * Calculate reading time for content with multiple reading speeds
   */
  static calculateReadingTime(
    content: string,
    readingSpeed: number = ReadingTimeCalculator.DEFAULT_WPM
  ): ReadingTimeResult {
    if (!content || content.trim().length === 0) {
      throw ContentProcessingError.invalidContent('Content cannot be empty');
    }

    try {
      const words = this.countWords(content);
      const totalSeconds = Math.ceil((words / readingSpeed) * 60);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return {
        minutes,
        seconds,
        totalSeconds,
        words,
        estimatedReadingSpeed: readingSpeed
      };
    } catch (error) {
      throw ContentProcessingError.processingFailed(
        'Failed to calculate reading time',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get reading time for different reader types
   */
  static getReadingTimeVariants(content: string) {
    return {
      slow: this.calculateReadingTime(content, this.SLOW_READER_WPM),
      average: this.calculateReadingTime(content, this.DEFAULT_WPM),
      fast: this.calculateReadingTime(content, this.FAST_READER_WPM)
    };
  }

  private static countWords(text: string): number {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 0).length;
  }
}

// ============================================================================
// TEXT SUMMARIZATION
// ============================================================================

export class TextSummarizer {
  private static readonly SENTENCE_DELIMITERS = /[.!?]+\s+/g;
  private static readonly DEFAULT_SUMMARY_RATIO = 0.3; // 30% of original

  /**
   * Generate extractive summary using sentence ranking
   */
  static summarizeText(
    content: string,
    targetLength?: number,
    maxSentences?: number
  ): TextSummaryResult {
    if (!content || content.trim().length === 0) {
      throw ContentProcessingError.invalidContent('Content cannot be empty for summarization');
    }

    try {
      const sentences = this.extractSentences(content);
      const scoredSentences = this.scoreSentences(sentences, content);
      const selectedSentences = this.selectTopSentences(
        scoredSentences,
        targetLength || Math.floor(content.length * this.DEFAULT_SUMMARY_RATIO),
        maxSentences || Math.ceil(sentences.length * 0.4)
      );

      const summary = selectedSentences
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(s => s.text)
        .join(' ');

      const keyPoints = this.extractKeyPoints(selectedSentences);
      
      return {
        summary,
        keyPoints,
        compressionRatio: (summary.length / content.length) * 100,
        confidenceScore: this.calculateConfidence(selectedSentences, scoredSentences)
      };
    } catch (error) {
      throw ContentProcessingError.processingFailed(
        'Text summarization failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  private static extractSentences(content: string) {
    return content
      .split(this.SENTENCE_DELIMITERS)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .map((text, index) => ({ text, originalIndex: index }));
  }

  private static scoreSentences(sentences: { text: string; originalIndex: number }[], fullContent: string) {
    const wordFreq = this.calculateWordFrequency(fullContent);
    
    return sentences.map(sentence => {
      const words = sentence.text.toLowerCase().match(/\b\w+\b/g) || [];
      const score = words.reduce((sum: number, word: string) => {
        return sum + (wordFreq[word] || 0);
      }, 0) / words.length;

      return { ...sentence, score };
    });
  }

  private static selectTopSentences(sentences: { text: string; originalIndex: number; score: number }[], targetLength: number, maxCount: number) {
    const sorted = sentences.sort((a, b) => b.score - a.score);
    const selected = [];
    let currentLength = 0;

    for (const sentence of sorted) {
      if (selected.length >= maxCount || currentLength + sentence.text.length > targetLength) {
        break;
      }
      selected.push(sentence);
      currentLength += sentence.text.length;
    }

    return selected;
  }

  private static calculateWordFrequency(text: string): Record<string, number> {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Ignore very short words
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return frequency;
  }

  private static extractKeyPoints(sentences: { text: string; score: number }[]): string[] {
    return sentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.text.length > 100 ? s.text.substring(0, 97) + '...' : s.text);
  }

  private static calculateConfidence(selected: { score: number }[], total: { score: number }[]): number {
    const avgScore = selected.reduce((sum, s) => sum + s.score, 0) / selected.length;
    const maxPossibleScore = Math.max(...total.map(s => s.score));
    return Math.min(avgScore / maxPossibleScore, 1);
  }
}

// ============================================================================
// KEYWORD EXTRACTION
// ============================================================================

export class KeywordExtractor {
  private static readonly STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
  ]);

  /**
   * Extract keywords using TF-IDF-like scoring
   */
  static extractKeywords(
    content: string,
    maxKeywords: number = 20,
    minWordLength: number = 3
  ): KeywordExtractionResult {
    if (!content || content.trim().length === 0) {
      throw ContentProcessingError.invalidContent('Content cannot be empty for keyword extraction');
    }

    try {
      const words = this.preprocessText(content, minWordLength);
      const frequency = this.calculateFrequency(words);
      const positions = this.findWordPositions(content, Object.keys(frequency));
      
      const keywords = this.scoreAndRankKeywords(frequency, positions, content.length)
        .slice(0, maxKeywords);

      return {
        keywords,
        totalWords: words.length,
        uniqueWords: Object.keys(frequency).length,
        keywordDensity: this.calculateDensity(frequency, words.length)
      };
    } catch (error) {
      throw ContentProcessingError.processingFailed(
        'Keyword extraction failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  private static preprocessText(content: string, minLength: number): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= minLength && 
        !this.STOP_WORDS.has(word) &&
        !/^\d+$/.test(word)
      );
  }

  private static calculateFrequency(words: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    return frequency;
  }

  private static findWordPositions(content: string, words: string[]): Record<string, number[]> {
    const positions: Record<string, number[]> = {};
    const lowerContent = content.toLowerCase();
    
    words.forEach(word => {
      positions[word] = [];
      let index = 0;
      while ((index = lowerContent.indexOf(word, index)) !== -1) {
        positions[word].push(index);
        index += word.length;
      }
    });
    
    return positions;
  }

  private static scoreAndRankKeywords(
    frequency: Record<string, number>, 
    positions: Record<string, number[]>,
    contentLength: number
  ): ExtractedKeyword[] {
    return Object.entries(frequency)
      .map(([word, freq]) => {
        const relevanceScore = this.calculateRelevanceScore(word, freq, positions[word], contentLength);
        
        return {
          word,
          frequency: freq,
          relevanceScore,
          positions: positions[word] || [],
          variants: this.findVariants(word, Object.keys(frequency))
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private static calculateRelevanceScore(
    word: string, 
    frequency: number, 
    positions: number[], 
    contentLength: number
  ): number {
    const tf = frequency / contentLength; // Term frequency
    const positionScore = this.calculatePositionScore(positions, contentLength);
    const lengthBonus = Math.min(word.length / 10, 1); // Longer words get slight bonus
    
    return tf * positionScore * (1 + lengthBonus);
  }

  private static calculatePositionScore(positions: number[], contentLength: number): number {
    if (positions.length === 0) return 0;
    
    // Words appearing early get higher scores
    const avgPosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
    const normalizedPosition = 1 - (avgPosition / contentLength);
    
    return Math.max(normalizedPosition, 0.1); // Minimum score of 0.1
  }

  private static findVariants(word: string, allWords: string[]): string[] {
    const variants = allWords.filter(w => 
      w !== word && 
      (w.startsWith(word) || word.startsWith(w)) &&
      Math.abs(w.length - word.length) <= 3
    );
    
    return variants.slice(0, 3); // Limit to 3 variants
  }

  private static calculateDensity(frequency: Record<string, number>, totalWords: number): Record<string, number> {
    const density: Record<string, number> = {};
    Object.entries(frequency).forEach(([word, freq]) => {
      density[word] = (freq / totalWords) * 100;
    });
    return density;
  }
}

// ============================================================================
// CONTENT SANITIZATION
// ============================================================================

export class ContentSanitizer {
  private static readonly DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea'
  ];
  
  private static readonly DANGEROUS_ATTRIBUTES = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'javascript:'
  ];

  /**
   * Sanitize HTML content removing dangerous elements and scripts
   */
  static sanitizeContent(content: string, options: {
    allowedTags?: string[];
    preserveFormatting?: boolean;
    removeComments?: boolean;
  } = {}): ContentSanitationResult {
    if (!content) {
      return {
        sanitizedContent: '',
        removedElements: [],
        warnings: [],
        isClean: true
      };
    }

    try {
      const removedElements: string[] = [];
      const warnings: string[] = [];
      
      let sanitized = content;
      
      // Remove dangerous tags
      this.DANGEROUS_TAGS.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
        const matches = sanitized.match(regex);
        if (matches) {
          matches.forEach(match => removedElements.push(match));
          sanitized = sanitized.replace(regex, '');
        }
      });

      // Remove dangerous attributes
      this.DANGEROUS_ATTRIBUTES.forEach(attr => {
        const regex = new RegExp(`\\s${attr}="[^"]*"`, 'gi');
        const matches = sanitized.match(regex);
        if (matches) {
          matches.forEach(match => removedElements.push(match));
          sanitized = sanitized.replace(regex, '');
        }
      });

      // Remove HTML comments if requested
      if (options.removeComments) {
        const commentRegex = /<!--[\s\S]*?-->/g;
        const comments = sanitized.match(commentRegex);
        if (comments) {
          comments.forEach(comment => removedElements.push(comment));
          sanitized = sanitized.replace(commentRegex, '');
        }
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /eval\s*\(/gi,
        /document\.write/gi,
        /window\.location/gi,
        /\.innerHTML/gi
      ];

      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(sanitized)) {
          warnings.push(`Suspicious pattern detected: ${pattern.source}`);
        }
      });

      // Clean up excessive whitespace
      sanitized = sanitized.replace(/\s+/g, ' ').trim();

      return {
        sanitizedContent: sanitized,
        removedElements,
        warnings,
        isClean: removedElements.length === 0 && warnings.length === 0
      };
    } catch (error) {
      throw ContentProcessingError.processingFailed(
        'Content sanitization failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate content safety without modification
   */
  static validateContentSafety(content: string): { isSafe: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for dangerous tags
    this.DANGEROUS_TAGS.forEach(tag => {
      if (new RegExp(`<${tag}`, 'i').test(content)) {
        issues.push(`Dangerous tag detected: ${tag}`);
      }
    });

    // Check for dangerous attributes  
    this.DANGEROUS_ATTRIBUTES.forEach(attr => {
      if (new RegExp(attr, 'i').test(content)) {
        issues.push(`Dangerous attribute detected: ${attr}`);
      }
    });

    return {
      isSafe: issues.length === 0,
      issues
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Analyze complete content with all available metrics
 */
export async function analyzeContent(
  content: string,
  options: ContentAnalysisOptions = {}
): Promise<{
  readingTime?: ReadingTimeResult;
  summary?: TextSummaryResult;
  keywords?: KeywordExtractionResult;
  seoScore?: SEOScoreResult;
  uniqueness?: UniquenessResult;
  language?: LanguageDetectionResult;
  sanitization?: ContentSanitationResult;
}> {
  const results: Record<string, unknown> = {};

  try {
    if (options.includeReadingTime !== false) {
      results.readingTime = ReadingTimeCalculator.calculateReadingTime(content);
    }

    if (options.includeSummary) {
      results.summary = TextSummarizer.summarizeText(content);
    }

    if (options.includeKeywords !== false) {
      results.keywords = KeywordExtractor.extractKeywords(content);
    }

    if (options.sanitizeContent) {
      results.sanitization = ContentSanitizer.sanitizeContent(content);
    }

    return results;
  } catch (error) {
    throw ContentProcessingError.processingFailed(
      'Content analysis failed',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Process content for NewsArticle with all optimizations
 */
export function processNewsContent(article: Partial<NewsArticle>): {
  processedArticle: Partial<NewsArticle>;
  analysis: {
    readingTime: ReadingTimeResult;
    keywords: ExtractedKeyword[];
    sanitization: ContentSanitationResult;
    keywordDensity: Record<string, number>;
  };
} {
  if (!article.content) {
    throw ContentProcessingError.invalidContent('Article content is required');
  }

  try {
    // Calculate reading time
    const readingTime = ReadingTimeCalculator.calculateReadingTime(article.content);
    
    // Extract keywords
    const keywords = KeywordExtractor.extractKeywords(article.content);
    
    // Sanitize content
    const sanitization = ContentSanitizer.sanitizeContent(article.content);
    
    // Generate summary if not provided
    let summary = article.summary;
    if (!summary || summary.length < 50) {
      const summaryResult = TextSummarizer.summarizeText(article.content, 200);
      summary = summaryResult.summary;
    }

    const processedArticle: Partial<NewsArticle> = {
      ...article,
      content: sanitization.sanitizedContent,
      summary,
      readingTime: readingTime.minutes,
      tags: [...(article.tags || []), ...keywords.keywords.slice(0, 10).map(k => k.word)]
    };

    return {
      processedArticle,
      analysis: {
        readingTime,
        keywords: keywords.keywords.slice(0, 20),
        sanitization,
        keywordDensity: keywords.keywordDensity
      }
    };
  } catch (error) {
    throw ContentProcessingError.processingFailed(
      'News content processing failed',
      error instanceof Error ? error : undefined
    );
  }
}

const contentUtilities = {
  ReadingTimeCalculator,
  TextSummarizer,
  KeywordExtractor,
  ContentSanitizer,
  analyzeContent,
  processNewsContent,
  ContentProcessingError
};

export default contentUtilities;