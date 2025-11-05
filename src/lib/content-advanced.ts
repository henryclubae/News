// ============================================================================
// CONTENT PROCESSING UTILITIES - PART 2
// ============================================================================
// Additional content processing features: Image optimization, SEO scoring,
// uniqueness verification, and multi-language handling.

// Removed unused NewsArticle type import to satisfy no-unused-vars

// ============================================================================
// ADDITIONAL INTERFACES
// ============================================================================

export interface ScoredSentence {
  text: string;
  originalIndex: number;
  score: number;
}

export interface ContentAnalysisResult {
  readingTime?: import('./content').ReadingTimeResult;
  summary?: import('./content').TextSummaryResult;
  keywords?: import('./content').KeywordExtractionResult;
  seoScore?: SEOScoreResult;
  uniqueness?: UniquenessResult;
  language?: LanguageDetectionResult;
  sanitization?: import('./content').ContentSanitationResult;
}

export interface NewsContentAnalysis {
  readingTime: import('./content').ReadingTimeResult;
  keywords: import('./content').ExtractedKeyword[];
  sanitization: import('./content').ContentSanitationResult;
  keywordDensity: Record<string, number>;
}

export interface SEOScoreResult {
  overallScore: number;
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
  uniquenessScore: number;
  similarContent: SimilarContentMatch[];
  fingerprint: string;
  duplicatePercentage: number;
}

export interface SimilarContentMatch {
  title: string;
  url?: string;
  similarity: number;
  matchType: 'exact' | 'near-duplicate' | 'similar-structure';
}

export interface LanguageDetectionResult {
  primaryLanguage: string;
  confidence: number;
  alternativeLanguages: { language: string; confidence: number }[];
  isMultiLanguage: boolean;
}

export interface ImageOptimizationSuggestion {
  originalUrl: string;
  suggestedFormats: string[];
  compressionLevel: number;
  altTextSuggestion: string;
  sizeReduction: number;
}

// ============================================================================
// IMAGE OPTIMIZATION HELPERS
// ============================================================================

export class ImageOptimizer {
  private static readonly SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png'];
  private static readonly MAX_WIDTH = 1200;
  private static readonly QUALITY_SETTINGS = {
    high: 90,
    medium: 75,
    low: 60
  };

  /**
   * Analyze images in content and suggest optimizations
   */
  static analyzeImages(content: string): ImageOptimizationSuggestion[] {
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
    const suggestions: ImageOptimizationSuggestion[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const [, src, alt] = match;
      
      suggestions.push({
        originalUrl: src,
        suggestedFormats: this.getSuggestedFormats(src),
        compressionLevel: this.getOptimalCompression(src),
        altTextSuggestion: this.generateAltText(src, alt),
        sizeReduction: this.estimateSizeReduction(src)
      });
    }

    return suggestions;
  }

  /**
   * Generate optimized image URLs with different formats
   */
  static generateOptimizedUrls(originalUrl: string): Record<string, string> {
    const urls: Record<string, string> = {};
    const baseName = originalUrl.replace(/\.[^.]+$/, '');
    
    this.SUPPORTED_FORMATS.forEach(format => {
      urls[format] = `${baseName}.${format}`;
    });

    return urls;
  }

  private static getSuggestedFormats(url: string): string[] {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (extension === 'png') {
      return ['webp', 'avif', 'png'];
    }
    
    return ['webp', 'avif', 'jpeg'];
  }

  private static getOptimalCompression(url: string): number {
    // Simple heuristic based on URL patterns
    if (url.includes('thumb') || url.includes('small')) {
      return this.QUALITY_SETTINGS.medium;
    }
    
    if (url.includes('hero') || url.includes('banner')) {
      return this.QUALITY_SETTINGS.high;
    }
    
    return this.QUALITY_SETTINGS.medium;
  }

  private static generateAltText(src: string, existingAlt?: string): string {
    if (existingAlt && existingAlt.length > 10) {
      return existingAlt;
    }

    // Extract meaningful information from URL
    const filename = src.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    const words = filename.split(/[-_]/).filter(w => w.length > 2);
    
    return words.length > 0 
      ? words.join(' ').replace(/^\w/, c => c.toUpperCase())
      : 'Image';
  }

  private static estimateSizeReduction(url: string): number {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'png': return 40; // WebP can reduce PNG by ~40%
      case 'jpeg':
      case 'jpg': return 25; // WebP can reduce JPEG by ~25%
      default: return 20;
    }
  }
}

// ============================================================================
// SEO SCORE CALCULATION
// ============================================================================

export class SEOAnalyzer {
  private static readonly OPTIMAL_TITLE_LENGTH = { min: 30, max: 60 };
  private static readonly OPTIMAL_META_DESC_LENGTH = { min: 120, max: 160 };
  private static readonly OPTIMAL_CONTENT_LENGTH = { min: 300, max: 2000 };

  /**
   * Calculate comprehensive SEO score for content
   */
  static calculateSEOScore(
    content: string,
    title?: string,
    metaDescription?: string,
    keywords?: string[]
  ): SEOScoreResult {
    const breakdown = {
      titleOptimization: this.scoreTitleOptimization(title, keywords),
      metaDescription: this.scoreMetaDescription(metaDescription, keywords),
      headingStructure: this.scoreHeadingStructure(content),
      keywordUsage: this.scoreKeywordUsage(content, keywords),
      contentLength: this.scoreContentLength(content),
      readability: this.scoreReadability(content),
      internalLinking: this.scoreInternalLinking(content),
      imageOptimization: this.scoreImageOptimization(content)
    };

    const overallScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / 8;
    const recommendations = this.generateRecommendations(breakdown, content, title, metaDescription);

    return {
      overallScore: Math.round(overallScore),
      breakdown,
      recommendations
    };
  }

  private static scoreTitleOptimization(title?: string, keywords?: string[]): number {
    if (!title) return 0;
    
    let score = 0;
    
    // Length check
    if (title.length >= this.OPTIMAL_TITLE_LENGTH.min && title.length <= this.OPTIMAL_TITLE_LENGTH.max) {
      score += 40;
    } else if (title.length < this.OPTIMAL_TITLE_LENGTH.min) {
      score += (title.length / this.OPTIMAL_TITLE_LENGTH.min) * 40;
    } else {
      score += Math.max(0, 40 - ((title.length - this.OPTIMAL_TITLE_LENGTH.max) * 2));
    }
    
    // Keyword presence
    if (keywords && keywords.length > 0) {
      const titleLower = title.toLowerCase();
      const keywordMatches = keywords.filter(kw => titleLower.includes(kw.toLowerCase()));
      score += (keywordMatches.length / keywords.length) * 60;
    } else {
      score += 30; // Partial credit if no keywords provided
    }
    
    return Math.min(score, 100);
  }

  private static scoreMetaDescription(description?: string, keywords?: string[]): number {
    if (!description) return 0;
    
    let score = 0;
    
    // Length check
    if (description.length >= this.OPTIMAL_META_DESC_LENGTH.min && 
        description.length <= this.OPTIMAL_META_DESC_LENGTH.max) {
      score += 50;
    } else {
      score += Math.max(0, 50 - Math.abs(description.length - 140) * 2);
    }
    
    // Keyword presence
    if (keywords && keywords.length > 0) {
      const descLower = description.toLowerCase();
      const keywordMatches = keywords.filter(kw => descLower.includes(kw.toLowerCase()));
      score += (keywordMatches.length / keywords.length) * 50;
    } else {
      score += 25;
    }
    
    return Math.min(score, 100);
  }

  private static scoreHeadingStructure(content: string): number {
    const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
    
    let score = 0;
    
    // H1 check
    if (h1Count === 1) score += 30;
    else if (h1Count === 0) score += 0;
    else score += 15; // Multiple H1s are less optimal
    
    // H2 presence
    if (h2Count > 0) score += 35;
    
    // Hierarchy check
    if (h2Count > 0 && h3Count > 0) score += 35;
    
    return Math.min(score, 100);
  }

  private static scoreKeywordUsage(content: string, keywords?: string[]): number {
    if (!keywords || keywords.length === 0) return 50; // Neutral score
    
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;
    let totalDensity = 0;
    let keywordsFound = 0;

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const matches = (contentLower.match(new RegExp(`\\b${keywordLower}\\b`, 'g')) || []).length;
      
      if (matches > 0) {
        keywordsFound++;
        const density = (matches / wordCount) * 100;
        
        // Optimal density is 1-3%
        if (density >= 1 && density <= 3) {
          totalDensity += 100;
        } else if (density < 1) {
          totalDensity += density * 100;
        } else {
          totalDensity += Math.max(0, 100 - ((density - 3) * 20));
        }
      }
    });

    const presenceScore = (keywordsFound / keywords.length) * 50;
    const densityScore = keywords.length > 0 ? (totalDensity / keywords.length) * 0.5 : 0;
    
    return Math.min(presenceScore + densityScore, 100);
  }

  private static scoreContentLength(content: string): number {
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount >= this.OPTIMAL_CONTENT_LENGTH.min && wordCount <= this.OPTIMAL_CONTENT_LENGTH.max) {
      return 100;
    }
    
    if (wordCount < this.OPTIMAL_CONTENT_LENGTH.min) {
      return (wordCount / this.OPTIMAL_CONTENT_LENGTH.min) * 100;
    }
    
    // Very long content gets diminishing returns
    return Math.max(50, 100 - ((wordCount - this.OPTIMAL_CONTENT_LENGTH.max) / 100));
  }

  private static scoreReadability(content: string): number {
    // Simplified readability based on sentence length and word complexity
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const complexWords = words.filter(word => word.length > 6).length;
    const complexWordRatio = complexWords / words.length;
    
    let score = 100;
    
    // Penalize very long sentences
    if (avgWordsPerSentence > 20) {
      score -= (avgWordsPerSentence - 20) * 3;
    }
    
    // Penalize too many complex words
    if (complexWordRatio > 0.3) {
      score -= (complexWordRatio - 0.3) * 200;
    }
    
    return Math.max(score, 0);
  }

  private static scoreInternalLinking(content: string): number {
    const internalLinks = (content.match(/<a[^>]+href="(?!https?:\/\/)[^"]*"[^>]*>/gi) || []).length;
    const externalLinks = (content.match(/<a[^>]+href="https?:\/\/[^"]*"[^>]*>/gi) || []).length;
    const totalLinks = internalLinks + externalLinks;
    
    if (totalLinks === 0) return 30; // Some credit for no spammy linking
    
    const internalRatio = internalLinks / totalLinks;
    
    // Good balance of internal links
    if (internalRatio >= 0.3 && internalRatio <= 0.7) return 100;
    if (internalRatio >= 0.1) return 70;
    
    return 40; // Mostly external links
  }

  private static scoreImageOptimization(content: string): number {
    const images = content.match(/<img[^>]*>/gi) || [];
    
    if (images.length === 0) return 70; // No images to optimize
    
    let score = 0;
    const totalImages = images.length;
    
    images.forEach(img => {
      // Check for alt text
      if (img.includes('alt="') && !img.includes('alt=""')) {
        score += 50;
      }
      
      // Check for lazy loading
      if (img.includes('loading="lazy"')) {
        score += 30;
      }
      
      // Check for responsive attributes
      if (img.includes('srcset=') || img.includes('sizes=')) {
        score += 20;
      }
    });
    
    return Math.min(score / totalImages, 100);
  }

  private static generateRecommendations(
    breakdown: SEOScoreResult['breakdown'],
    content: string,
    title?: string,
    metaDescription?: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (breakdown.titleOptimization < 70) {
      if (!title) {
        recommendations.push('Add a title to your content');
      } else if (title.length < 30) {
        recommendations.push('Title is too short, aim for 30-60 characters');
      } else if (title.length > 60) {
        recommendations.push('Title is too long, keep it under 60 characters');
      }
    }
    
    if (breakdown.metaDescription < 70) {
      if (!metaDescription) {
        recommendations.push('Add a meta description');
      } else {
        recommendations.push('Optimize meta description length (120-160 characters)');
      }
    }
    
    if (breakdown.headingStructure < 70) {
      recommendations.push('Improve heading structure with proper H1, H2, H3 tags');
    }
    
    if (breakdown.contentLength < 70) {
      recommendations.push('Consider adding more content (aim for 300+ words)');
    }
    
    if (breakdown.readability < 70) {
      recommendations.push('Improve readability with shorter sentences and simpler words');
    }
    
    if (breakdown.imageOptimization < 70) {
      recommendations.push('Add alt text to images and consider lazy loading');
    }
    
    return recommendations;
  }
}

// ============================================================================
// CONTENT UNIQUENESS VERIFICATION
// ============================================================================

export class UniquenessChecker {
  private static readonly SIMILARITY_THRESHOLD = 0.8;
  private static readonly FINGERPRINT_LENGTH = 64;

  /**
   * Check content uniqueness against known content
   */
  static checkUniqueness(
    content: string,
    existingContent: { title: string; content: string; url?: string }[] = []
  ): UniquenessResult {
    const fingerprint = this.generateFingerprint(content);
    const similarContent: SimilarContentMatch[] = [];
    
    let totalSimilarity = 0;
    let exactMatches = 0;

    existingContent.forEach(existing => {
      const similarity = this.calculateSimilarity(content, existing.content);
      
      if (similarity > 0.3) { // Only include meaningful similarities
        const matchType: SimilarContentMatch['matchType'] = 
          similarity >= 0.9 ? 'exact' :
          similarity >= 0.7 ? 'near-duplicate' : 'similar-structure';
          
        similarContent.push({
          title: existing.title,
          url: existing.url,
          similarity,
          matchType
        });
        
        if (similarity >= this.SIMILARITY_THRESHOLD) {
          exactMatches++;
        }
      }
      
      totalSimilarity += similarity;
    });

    const avgSimilarity = existingContent.length > 0 ? totalSimilarity / existingContent.length : 0;
    const uniquenessScore = Math.max(0, (1 - avgSimilarity) * 100);
    const duplicatePercentage = (exactMatches / Math.max(existingContent.length, 1)) * 100;

    return {
      uniquenessScore: Math.round(uniquenessScore),
      similarContent: similarContent.sort((a, b) => b.similarity - a.similarity),
      fingerprint,
      duplicatePercentage: Math.round(duplicatePercentage)
    };
  }

  /**
   * Generate content fingerprint for quick comparison
   */
  static generateFingerprint(content: string): string {
    // Extract significant words and create hash
    const significantWords = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 50);
    
    const fingerprint = significantWords.join('').substring(0, this.FINGERPRINT_LENGTH);
    return this.simpleHash(fingerprint);
  }

  private static calculateSimilarity(content1: string, content2: string): number {
    const words1 = this.extractSignificantWords(content1);
    const words2 = this.extractSignificantWords(content2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(word => set2.has(word)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  private static extractSignificantWords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

// ============================================================================
// MULTI-LANGUAGE CONTENT HANDLING
// ============================================================================

export class LanguageProcessor {
  private static readonly LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
    en: [/\b(the|and|for|are|but|not|you|all|can|her|was|one|our|out)\b/gi],
    es: [/\b(el|la|los|las|y|para|son|pero|no|tu|todos|puede|su|fue|uno|nuestro)\b/gi],
    fr: [/\b(le|la|les|et|pour|sont|mais|non|vous|tous|peut|son|était|un|notre)\b/gi],
    de: [/\b(der|die|das|und|für|sind|aber|nicht|sie|alle|kann|ihr|war|ein|unser)\b/gi],
    it: [/\b(il|la|i|le|e|per|sono|ma|non|voi|tutti|può|suo|era|uno|nostro)\b/gi]
  };

  private static readonly COMMON_WORDS: Record<string, string[]> = {
    en: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was'],
    es: ['el', 'la', 'los', 'las', 'y', 'para', 'son', 'pero', 'no', 'tu', 'todos'],
    fr: ['le', 'la', 'les', 'et', 'pour', 'sont', 'mais', 'non', 'vous', 'tous'],
    de: ['der', 'die', 'das', 'und', 'für', 'sind', 'aber', 'nicht', 'sie', 'alle'],
    it: ['il', 'la', 'i', 'le', 'e', 'per', 'sono', 'ma', 'non', 'voi', 'tutti']
  };

  /**
   * Detect the primary language of content
   */
  static detectLanguage(content: string): LanguageDetectionResult {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const languageScores: Record<string, number> = {};
    
    // Calculate scores for each language
    Object.entries(this.LANGUAGE_PATTERNS).forEach(([lang, patterns]) => {
      let score = 0;
      patterns.forEach(pattern => {
        const matches = content.match(pattern) || [];
        score += matches.length;
      });
      languageScores[lang] = score / words.length;
    });

    // Find primary and alternative languages
    const sortedLanguages = Object.entries(languageScores)
      .sort(([,a], [,b]) => b - a)
      .map(([lang, score]) => ({ language: lang, confidence: score }));

    const primaryLang = sortedLanguages[0];
    const alternatives = sortedLanguages.slice(1, 3).filter(l => l.confidence > 0.01);
    
    // Check if content is multi-language
    const isMultiLanguage = sortedLanguages.length > 1 && 
                           sortedLanguages[1].confidence > primaryLang.confidence * 0.3;

    return {
      primaryLanguage: primaryLang?.language || 'unknown',
      confidence: Math.min(primaryLang?.confidence || 0, 1),
      alternativeLanguages: alternatives,
      isMultiLanguage
    };
  }

  /**
   * Process content for multiple languages
   */
  static processMultiLanguageContent(content: string): {
    sections: { language: string; content: string; confidence: number }[];
    overallLanguage: LanguageDetectionResult;
  } {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sections = paragraphs.map(paragraph => {
      const detection = this.detectLanguage(paragraph);
      return {
        language: detection.primaryLanguage,
        content: paragraph,
        confidence: detection.confidence
      };
    });

    const overallLanguage = this.detectLanguage(content);

    return {
      sections,
      overallLanguage
    };
  }

  /**
   * Suggest content translations for different languages
   */
  static suggestTranslations(content: string, targetLanguages: string[]): {
    language: string;
    priority: number;
    estimatedWords: number;
  }[] {
    const detection = this.detectLanguage(content);
    const wordCount = content.split(/\s+/).length;
    
    return targetLanguages
      .filter(lang => lang !== detection.primaryLanguage)
      .map(language => ({
        language,
        priority: this.calculateTranslationPriority(language, detection.primaryLanguage),
        estimatedWords: Math.round(wordCount * this.getLanguageExpansionFactor(language))
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  private static calculateTranslationPriority(targetLang: string, _sourceLang: string): number {
    // Simple priority based on language popularity and similarity
    const priorities: Record<string, number> = {
      en: 10, es: 8, fr: 7, de: 6, it: 5, pt: 4, zh: 9, ja: 5, ko: 4, ar: 6
    };

    // Tiny bonus if target is same as detected source language (ensures parameter isn't unused and models intent)
    const similarityBonus = targetLang === _sourceLang ? 1 : 0;
    return (priorities[targetLang] || 1) + similarityBonus;
  }

  private static getLanguageExpansionFactor(language: string): number {
    // Different languages have different text expansion rates
    const expansionFactors: Record<string, number> = {
      en: 1.0, es: 1.2, fr: 1.15, de: 1.3, it: 1.1, pt: 1.2, zh: 0.8, ja: 0.9, ko: 0.95, ar: 1.1
    };
    
    return expansionFactors[language] || 1.1;
  }
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

const contentUtilities = {
  ImageOptimizer,
  SEOAnalyzer,
  UniquenessChecker,
  LanguageProcessor
};

export default contentUtilities;