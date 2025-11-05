// ============================================================================
// COMPREHENSIVE AI CONTENT SERVICE
// ============================================================================

import { NewsArticle, SEOData, Category } from '@/types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

// OpenAI Configuration
interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

// Content Generation Types
interface ContentGenerationRequest {
  topic: string;
  category: string;
  keywords: string[];
  tone: ContentTone;
  length: ContentLength;
  audience: ContentAudience;
  sources?: string[];
  customInstructions?: string;
}

interface GeneratedContent {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  seoData: SEOData;
  socialSnippets: SocialSnippets;
  qualityScore: ContentQualityScore;
  factCheckResults?: FactCheckResult[];
}

// Content Templates
interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  structure: string[];
  prompts: TemplatePrompts;
  seoKeywords: string[];
}

interface TemplatePrompts {
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
  summary: string;
}

// Content Quality Scoring
interface ContentQualityScore {
  overall: number; // 0-100
  readability: number;
  seoOptimization: number;
  factualAccuracy: number;
  engagement: number;
  originality: number;
  details: QualityScoreDetails;
}

interface QualityScoreDetails {
  readabilityGrade: string;
  sentenceComplexity: string;
  keywordDensity: number;
  contentLength: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  passiveVoicePercentage: number;
  fleschKincaidScore: number;
}

// Social Media Snippets
interface SocialSnippets {
  twitter: TwitterSnippet;
  facebook: FacebookSnippet;
  linkedin: LinkedInSnippet;
  instagram: InstagramSnippet;
}

interface TwitterSnippet {
  text: string; // Max 280 characters
  hashtags: string[];
  mentions?: string[];
}

interface FacebookSnippet {
  headline: string;
  description: string;
  callToAction?: string;
}

interface LinkedInSnippet {
  headline: string;
  summary: string;
  professionalTone: boolean;
}

interface InstagramSnippet {
  caption: string;
  hashtags: string[];
  hooks: string[];
}

// Fact Checking
interface FactCheckResult {
  claim: string;
  confidence: number; // 0-1
  sources: FactCheckSource[];
  verdict: 'verified' | 'disputed' | 'unverified' | 'false';
  explanation: string;
}

interface FactCheckSource {
  url: string;
  title: string;
  reliability: number; // 0-1
  datePublished?: Date;
}

// Plagiarism Detection
interface PlagiarismResult {
  originalityScore: number; // 0-100
  matchedSources: PlagiarismMatch[];
  overallVerdict: 'original' | 'moderate' | 'high_similarity' | 'plagiarized';
}

interface PlagiarismMatch {
  source: string;
  matchPercentage: number;
  matchedText: string;
  sourceUrl?: string;
}

// Enums
type ContentTone = 'professional' | 'casual' | 'academic' | 'conversational' | 'authoritative' | 'neutral';
type ContentLength = 'short' | 'medium' | 'long' | 'extensive';
type ContentAudience = 'general' | 'expert' | 'beginner' | 'business' | 'academic';

// ============================================================================
// ERROR HANDLING
// ============================================================================

class AIContentError extends Error {
  public code: string;
  public status: number;
  public details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AIContentError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static openAIError(message: string, details?: Record<string, unknown>): AIContentError {
    return new AIContentError(message, 'OPENAI_API_ERROR', 502, details);
  }

  static contentGenerationError(message: string): AIContentError {
    return new AIContentError(message, 'CONTENT_GENERATION_ERROR', 400);
  }

  static factCheckError(message: string): AIContentError {
    return new AIContentError(message, 'FACT_CHECK_ERROR', 503);
  }

  static plagiarismCheckError(message: string): AIContentError {
    return new AIContentError(message, 'PLAGIARISM_CHECK_ERROR', 503);
  }
}

// ============================================================================
// CONTENT TEMPLATES
// ============================================================================

const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  breaking_news: {
    id: 'breaking_news',
    name: 'Breaking News',
    category: 'news',
    structure: ['headline', 'lead', 'body_paragraphs', 'background', 'implications', 'quotes'],
    prompts: {
      title: 'Create an urgent, attention-grabbing headline for breaking news about: {topic}',
      introduction: 'Write a compelling lead paragraph that summarizes the key facts of this breaking news story',
      body: 'Develop the story with detailed information, background context, and expert analysis',
      conclusion: 'Conclude with the broader implications and what readers should know going forward',
      summary: 'Create a concise 2-3 sentence summary of the key points'
    },
    seoKeywords: ['breaking news', 'latest', 'urgent', 'developing story', 'update']
  },

  technology: {
    id: 'technology',
    name: 'Technology News',
    category: 'technology',
    structure: ['headline', 'overview', 'technical_details', 'market_impact', 'expert_opinions', 'future_outlook'],
    prompts: {
      title: 'Create an informative tech headline about: {topic}',
      introduction: 'Explain the technology development in accessible terms for general audiences',
      body: 'Provide technical details, market analysis, and industry expert perspectives',
      conclusion: 'Discuss future implications and what this means for consumers/industry',
      summary: 'Summarize the key technological advancement and its significance'
    },
    seoKeywords: ['technology', 'innovation', 'digital', 'tech news', 'startup', 'AI', 'software']
  },

  business: {
    id: 'business',
    name: 'Business News',
    category: 'business',
    structure: ['headline', 'key_facts', 'financial_impact', 'market_analysis', 'stakeholder_reactions', 'outlook'],
    prompts: {
      title: 'Create a professional business headline about: {topic}',
      introduction: 'Present the key business facts and financial implications upfront',
      body: 'Analyze market impact, stakeholder reactions, and competitive landscape',
      conclusion: 'Provide expert outlook and potential future scenarios',
      summary: 'Summarize the business development and its market significance'
    },
    seoKeywords: ['business', 'finance', 'market', 'economy', 'corporate', 'earnings', 'investment']
  },

  health: {
    id: 'health',
    name: 'Health & Medicine',
    category: 'health',
    structure: ['headline', 'key_findings', 'scientific_background', 'expert_analysis', 'practical_implications', 'recommendations'],
    prompts: {
      title: 'Create an informative health headline about: {topic}',
      introduction: 'Present key health findings or developments clearly and accurately',
      body: 'Explain scientific background, research methodology, and expert analysis',
      conclusion: 'Discuss practical implications for readers and actionable recommendations',
      summary: 'Summarize the health development and its importance for public health'
    },
    seoKeywords: ['health', 'medicine', 'medical research', 'healthcare', 'wellness', 'study', 'treatment']
  },

  sports: {
    id: 'sports',
    name: 'Sports News',
    category: 'sports',
    structure: ['headline', 'game_summary', 'key_performances', 'statistics', 'quotes', 'season_context'],
    prompts: {
      title: 'Create an exciting sports headline about: {topic}',
      introduction: 'Capture the excitement and key moments of the sporting event',
      body: 'Detail key performances, statistics, player quotes, and game analysis',
      conclusion: 'Put the result in context of the season/tournament and future implications',
      summary: 'Summarize the key sporting event and standout performances'
    },
    seoKeywords: ['sports', 'game', 'match', 'championship', 'tournament', 'score', 'athlete']
  },

  science: {
    id: 'science',
    name: 'Science News',
    category: 'science',
    structure: ['headline', 'discovery_summary', 'methodology', 'significance', 'expert_commentary', 'future_research'],
    prompts: {
      title: 'Create an engaging science headline about: {topic}',
      introduction: 'Explain the scientific discovery or development in accessible language',
      body: 'Detail the research methodology, findings, and scientific significance',
      conclusion: 'Discuss broader implications and future research directions',
      summary: 'Summarize the scientific advancement and its potential impact'
    },
    seoKeywords: ['science', 'research', 'study', 'discovery', 'breakthrough', 'scientist', 'innovation']
  },

  entertainment: {
    id: 'entertainment',
    name: 'Entertainment News',
    category: 'entertainment',
    structure: ['headline', 'story_overview', 'celebrity_details', 'industry_context', 'fan_reactions', 'cultural_impact'],
    prompts: {
      title: 'Create an engaging entertainment headline about: {topic}',
      introduction: 'Hook readers with the most interesting aspect of the entertainment story',
      body: 'Provide celebrity details, industry context, and fan/public reactions',
      conclusion: 'Discuss cultural impact and what this means for the entertainment industry',
      summary: 'Summarize the entertainment news and its significance to pop culture'
    },
    seoKeywords: ['entertainment', 'celebrity', 'movie', 'music', 'TV show', 'Hollywood', 'pop culture']
  }
};

// ============================================================================
// OPENAI CLIENT
// ============================================================================

class OpenAIClient {
  private config: OpenAIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 60000
    };
  }

  async generateContent(prompt: string, options?: Partial<OpenAIConfig>): Promise<string> {
    const requestConfig = { ...this.config, ...options };

    if (!requestConfig.apiKey) {
      throw AIContentError.openAIError('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${requestConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: requestConfig.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional journalist and content creator. Generate high-quality, accurate, and engaging news content.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: requestConfig.maxTokens,
          temperature: requestConfig.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw AIContentError.openAIError(
          `OpenAI API error: ${response.statusText}`,
          errorData
        );
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw AIContentError.openAIError('Invalid response format from OpenAI API');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof AIContentError) {
        throw error;
      }
      
      throw AIContentError.openAIError(
        `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateJSON(prompt: string, schema: string): Promise<unknown> {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON that matches this schema:\n${schema}\n\nJSON Response:`;
    
    const content = await this.generateContent(jsonPrompt, {
      temperature: 0.3 // Lower temperature for more structured output
    });

    try {
      return JSON.parse(content);
    } catch {
      throw AIContentError.contentGenerationError('Failed to parse generated JSON content');
    }
  }
}

// ============================================================================
// SEO OPTIMIZATION SERVICE
// ============================================================================

class SEOOptimizer {
  static optimizeContent(content: string, keywords: string[], targetKeyword: string): {
    optimizedContent: string;
    seoData: Partial<SEOData>;
    optimization: SEOOptimizationReport;
  } {
    const optimization = this.analyzeSEO(content, keywords, targetKeyword);
    const optimizedContent = this.applySEOOptimizations(content, keywords, targetKeyword, optimization);
    const seoData = this.generateSEOMetadata(optimizedContent, keywords, targetKeyword);

    return {
      optimizedContent,
      seoData,
      optimization
    };
  }

  private static analyzeSEO(content: string, keywords: string[], targetKeyword: string): SEOOptimizationReport {
    const wordCount = content.split(/\s+/).length;
    const targetKeywordCount = (content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
    const keywordDensity = (targetKeywordCount / wordCount) * 100;

    return {
      wordCount,
      targetKeywordCount,
      keywordDensity,
      hasTargetInTitle: false, // Will be updated when title is available
      hasTargetInFirstParagraph: this.getFirstParagraph(content).toLowerCase().includes(targetKeyword.toLowerCase()),
      keywordDistribution: this.analyzeKeywordDistribution(content, keywords),
      readabilityScore: this.calculateReadabilityScore(content),
      recommendations: this.generateSEORecommendations(keywordDensity, wordCount, targetKeywordCount)
    };
  }

  private static applySEOOptimizations(content: string, keywords: string[], targetKeyword: string, optimization: SEOOptimizationReport): string {
    let optimizedContent = content;

    // Ensure target keyword appears in first paragraph if missing
    if (!optimization.hasTargetInFirstParagraph && optimization.targetKeywordCount === 0) {
      const paragraphs = content.split('\n\n');
      if (paragraphs.length > 0) {
        paragraphs[0] = this.naturallyIntegrateKeyword(paragraphs[0], targetKeyword);
        optimizedContent = paragraphs.join('\n\n');
      }
    }

    // Add semantic keywords throughout content
    optimizedContent = this.integrateSemanticKeywords(optimizedContent, keywords);

    return optimizedContent;
  }

  private static naturallyIntegrateKeyword(paragraph: string, keyword: string): string {
    // Simple integration - in a real implementation, this would be more sophisticated
    if (paragraph.length > 50 && !paragraph.toLowerCase().includes(keyword.toLowerCase())) {
      const sentences = paragraph.split('. ');
      if (sentences.length > 1) {
        sentences[1] = `${keyword} ${sentences[1].charAt(0).toLowerCase()}${sentences[1].slice(1)}`;
        return sentences.join('. ');
      }
    }
    return paragraph;
  }

  private static integrateSemanticKeywords(content: string, keywords: string[]): string {
    // In a real implementation, this would use NLP to naturally integrate keywords
    // For now, we'll add keywords naturally at the end if they're not present
    const lowerContent = content.toLowerCase();
    const missingKeywords = keywords.filter(keyword => 
      !lowerContent.includes(keyword.toLowerCase())
    );
    
    if (missingKeywords.length > 0) {
      const keywordSentence = `This article covers topics related to ${missingKeywords.join(', ')}.`;
      return content + '\n\n' + keywordSentence;
    }
    
    return content;
  }

  private static generateSEOMetadata(content: string, keywords: string[], targetKeyword: string): Partial<SEOData> {
    const title = this.extractTitle(content) || `${targetKeyword} - Latest News and Updates`;
    const description = this.generateMetaDescription(content, targetKeyword);

    return {
      metaTitle: title,
      metaDescription: description,
      keywords: [targetKeyword, ...keywords],
      canonicalUrl: '',
      openGraph: {
        title,
        description,
        image: '',
        url: '',
        type: 'article',
        siteName: 'News Website',
        locale: 'en_US'
      },
      twitterCard: {
        card: 'summary_large_image',
        title,
        description,
        image: ''
      }
    };
  }

  private static extractTitle(content: string): string | null {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.length < 100) {
        return trimmed;
      }
    }
    return null;
  }

  private static generateMetaDescription(content: string, targetKeyword: string): string {
    const firstParagraph = this.getFirstParagraph(content);
    let description = firstParagraph.substring(0, 147) + '...';
    
    if (!description.toLowerCase().includes(targetKeyword.toLowerCase())) {
      description = `${targetKeyword}: ${description}`;
    }
    
    return description.substring(0, 160);
  }

  private static getFirstParagraph(content: string): string {
    const paragraphs = content.split('\n\n');
    return paragraphs.find(p => p.trim().length > 50) || paragraphs[0] || '';
  }

  private static analyzeKeywordDistribution(content: string, keywords: string[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    const contentLower = content.toLowerCase();

    keywords.forEach(keyword => {
      const matches = contentLower.match(new RegExp(keyword.toLowerCase(), 'g'));
      distribution[keyword] = matches ? matches.length : 0;
    });

    return distribution;
  }

  private static calculateReadabilityScore(content: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }

  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  }

  private static generateSEORecommendations(keywordDensity: number, wordCount: number, targetKeywordCount: number): string[] {
    const recommendations: string[] = [];

    if (keywordDensity < 0.5) {
      recommendations.push('Consider increasing target keyword usage (current density is low)');
    } else if (keywordDensity > 3) {
      recommendations.push('Reduce target keyword usage to avoid keyword stuffing');
    }

    if (wordCount < 300) {
      recommendations.push('Consider expanding content length for better SEO performance');
    }

    if (targetKeywordCount === 0) {
      recommendations.push('Target keyword not found in content - ensure natural integration');
    }

    return recommendations;
  }
}

interface SEOOptimizationReport {
  wordCount: number;
  targetKeywordCount: number;
  keywordDensity: number;
  hasTargetInTitle: boolean;
  hasTargetInFirstParagraph: boolean;
  keywordDistribution: Record<string, number>;
  readabilityScore: number;
  recommendations: string[];
}

// ============================================================================
// FACT CHECKING SERVICE
// ============================================================================

class FactCheckingService {
  private static readonly FACT_CHECK_SOURCES = [
    'https://www.factcheck.org',
    'https://www.snopes.com',
    'https://www.politifact.com',
    'https://www.reuters.com/fact-check',
    'https://apnews.com/hub/ap-fact-check'
  ];

  static async checkFacts(content: string, claims: string[]): Promise<FactCheckResult[]> {
    try {
      const results: FactCheckResult[] = [];

      for (const claim of claims) {
        const result = await this.checkSingleFact(claim);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw AIContentError.factCheckError(
        `Fact checking failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static async checkSingleFact(claim: string): Promise<FactCheckResult> {
    // In a real implementation, this would integrate with fact-checking APIs
    // For now, we'll simulate the fact-checking process

    const confidence = this.calculateClaimConfidence(claim);
    const sources = await this.findRelevantSources(claim);
    const verdict = this.determineVerdict(confidence, sources);

    return {
      claim,
      confidence,
      sources,
      verdict,
      explanation: this.generateExplanation(claim, verdict, confidence)
    };
  }

  private static calculateClaimConfidence(claim: string): number {
    // Simulate confidence calculation based on claim characteristics
    let confidence = 0.5;

    // Check for specific indicators
    if (claim.includes('study shows') || claim.includes('research indicates')) {
      confidence += 0.2;
    }

    if (claim.includes('according to') || claim.includes('reports indicate')) {
      confidence += 0.1;
    }

    // Check for uncertainty indicators
    if (claim.includes('might') || claim.includes('could') || claim.includes('possibly')) {
      confidence -= 0.1;
    }

    // Check for absolute statements
    if (claim.includes('always') || claim.includes('never') || claim.includes('all')) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private static async findRelevantSources(claim: string): Promise<FactCheckSource[]> {
    // Simulate finding relevant sources
    // In a real implementation, this would search fact-checking databases
    
    const mockSources: FactCheckSource[] = [
      {
        url: 'https://www.factcheck.org/example',
        title: `Fact Check: ${claim.substring(0, 50)}...`,
        reliability: 0.9,
        datePublished: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        url: 'https://www.reuters.com/fact-check/example',
        title: `Reuters Fact Check: Related Information`,
        reliability: 0.95,
        datePublished: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    ];

    return mockSources;
  }

  private static determineVerdict(confidence: number, sources: FactCheckSource[]): FactCheckResult['verdict'] {
    const avgReliability = sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;

    if (confidence > 0.8 && avgReliability > 0.8) {
      return 'verified';
    } else if (confidence < 0.3 || avgReliability < 0.5) {
      return 'disputed';
    } else if (confidence < 0.5) {
      return 'unverified';
    }

    return 'verified';
  }

  private static generateExplanation(claim: string, verdict: FactCheckResult['verdict'], confidence: number): string {
    const confidenceText = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'moderate' : 'low';
    
    switch (verdict) {
      case 'verified':
        return `This claim has been verified with ${confidenceText} confidence based on reliable sources.`;
      case 'disputed':
        return `This claim is disputed by reliable sources and has ${confidenceText} confidence.`;
      case 'unverified':
        return `This claim could not be verified from available sources (${confidenceText} confidence).`;
      case 'false':
        return `This claim has been determined to be false based on fact-checking sources.`;
      default:
        return `Fact-check status unclear for this claim.`;
    }
  }

  static extractClaims(content: string): string[] {
    // Extract factual claims from content
    // This is a simplified implementation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    return sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return (
        lowerSentence.includes('study') ||
        lowerSentence.includes('research') ||
        lowerSentence.includes('report') ||
        lowerSentence.includes('according to') ||
        lowerSentence.includes('data shows') ||
        lowerSentence.includes('statistics') ||
        /\d+%/.test(sentence) ||
        /\$[\d,]+/.test(sentence)
      );
    }).slice(0, 5); // Limit to 5 most important claims
  }
}

// ============================================================================
// PLAGIARISM DETECTION SERVICE
// ============================================================================

class PlagiarismDetector {
  static async checkPlagiarism(content: string): Promise<PlagiarismResult> {
    try {
      // In a real implementation, this would integrate with plagiarism detection APIs
      // like Copyscape, Turnitin API, or similar services
      
      const matches = await this.findSimilarContent(content);
      const originalityScore = this.calculateOriginalityScore(matches);
      const verdict = this.determineVerdict(originalityScore, matches);

      return {
        originalityScore,
        matchedSources: matches,
        overallVerdict: verdict
      };
    } catch (error) {
      throw AIContentError.plagiarismCheckError(
        `Plagiarism check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private static async findSimilarContent(content: string): Promise<PlagiarismMatch[]> {
    // Simulate plagiarism detection
    // In reality, this would search against web content, academic papers, etc.
    
    const contentHash = this.generateContentHash(content);
    const simulatedMatches: PlagiarismMatch[] = [];
    
    // Use content hash for tracking (could be used for caching results)
    console.log(`Checking plagiarism for content hash: ${contentHash}`);

    // Simulate some matches based on content characteristics
    if (content.length > 500) {
      if (Math.random() > 0.8) {
        simulatedMatches.push({
          source: 'Example News Website',
          matchPercentage: Math.random() * 15 + 5, // 5-20%
          matchedText: content.substring(0, 100) + '...',
          sourceUrl: 'https://example-news.com/article'
        });
      }

      if (Math.random() > 0.9) {
        simulatedMatches.push({
          source: 'Academic Paper Database',
          matchPercentage: Math.random() * 10 + 3, // 3-13%
          matchedText: content.substring(100, 200) + '...',
          sourceUrl: 'https://academic-source.edu/paper'
        });
      }
    }

    return simulatedMatches;
  }

  private static generateContentHash(content: string): string {
    // Simple hash generation for content fingerprinting
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private static calculateOriginalityScore(matches: PlagiarismMatch[]): number {
    if (matches.length === 0) return 100;

    const totalMatchPercentage = matches.reduce((sum, match) => sum + match.matchPercentage, 0);
    const maxSingleMatch = Math.max(...matches.map(match => match.matchPercentage));

    // Weighted calculation considering both total matches and highest single match
    const originalityScore = 100 - (totalMatchPercentage * 0.7 + maxSingleMatch * 0.3);
    
    return Math.max(0, Math.min(100, originalityScore));
  }

  private static determineVerdict(originalityScore: number, matches: PlagiarismMatch[]): PlagiarismResult['overallVerdict'] {
    const maxMatch = matches.length > 0 ? Math.max(...matches.map(m => m.matchPercentage)) : 0;

    if (originalityScore >= 85 && maxMatch < 10) {
      return 'original';
    } else if (originalityScore >= 70 && maxMatch < 20) {
      return 'moderate';
    } else if (originalityScore >= 50) {
      return 'high_similarity';
    } else {
      return 'plagiarized';
    }
  }
}

// ============================================================================
// CONTENT QUALITY ANALYZER
// ============================================================================

class ContentQualityAnalyzer {
  static analyzeQuality(content: string, seoData?: Partial<SEOData>): ContentQualityScore {
    const readability = this.analyzeReadability(content);
    const seoOptimization = this.analyzeSEOOptimization(content, seoData);
    const engagement = this.analyzeEngagement(content);
    const originality = this.analyzeOriginality(content);

    // Simulate factual accuracy (in real implementation, this would use fact-checking results)
    const factualAccuracy = 85;

    const overall = (readability + seoOptimization + factualAccuracy + engagement + originality) / 5;

    return {
      overall: Math.round(overall),
      readability: Math.round(readability),
      seoOptimization: Math.round(seoOptimization),
      factualAccuracy: Math.round(factualAccuracy),
      engagement: Math.round(engagement),
      originality: Math.round(originality),
      details: this.generateQualityDetails(content)
    };
  }

  private static analyzeReadability(content: string): number {
    const details = this.generateQualityDetails(content);
    const fleschScore = details.fleschKincaidScore;

    // Convert Flesch-Kincaid score to 0-100 scale
    if (fleschScore >= 90) return 100;
    if (fleschScore >= 80) return 90;
    if (fleschScore >= 70) return 80;
    if (fleschScore >= 60) return 70;
    if (fleschScore >= 50) return 60;
    if (fleschScore >= 30) return 50;
    return 30;
  }

  private static analyzeSEOOptimization(content: string, seoData?: Partial<SEOData>): number {
    let score = 50;

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 2000) {
      score += 20;
    } else if (wordCount >= 200) {
      score += 10;
    }

    // Check for SEO elements
    if (seoData?.metaTitle && seoData.metaTitle.length >= 30 && seoData.metaTitle.length <= 60) {
      score += 15;
    }

    if (seoData?.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private static analyzeEngagement(content: string): number {
    let score = 50;

    // Check for engaging elements
    const questionMarks = (content.match(/\?/g) || []).length;
    const exclamationMarks = (content.match(/!/g) || []).length;
    
    if (questionMarks > 0 && questionMarks < 5) score += 10;
    if (exclamationMarks > 0 && exclamationMarks < 3) score += 5;

    // Check for storytelling elements
    if (content.includes('story') || content.includes('example') || content.includes('case')) {
      score += 15;
    }

    // Check paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length >= 3 && paragraphs.length <= 8) {
      score += 20;
    }

    return Math.min(100, score);
  }

  private static analyzeOriginality(content: string): number {
    // Simulate originality analysis
    // In real implementation, this would consider plagiarism results
    let score = 80;

    // Check for clichés and common phrases
    const commonPhrases = ['in conclusion', 'it is important to note', 'first and foremost', 'last but not least'];
    const clicheCount = commonPhrases.reduce((count, phrase) => {
      return count + (content.toLowerCase().includes(phrase) ? 1 : 0);
    }, 0);

    score -= clicheCount * 5;

    // Check for unique expressions and varied vocabulary
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const vocabularyDiversity = uniqueWords.size / words.length;

    if (vocabularyDiversity > 0.6) score += 10;
    else if (vocabularyDiversity < 0.4) score -= 10;

    return Math.max(30, Math.min(100, score));
  }

  private static generateQualityDetails(content: string): QualityScoreDetails {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    const averageWordsPerSentence = words.length / sentences.length || 0;
    const passiveVoiceCount = this.countPassiveVoice(content);
    const passiveVoicePercentage = (passiveVoiceCount / sentences.length) * 100 || 0;

    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    const avgSentenceLength = words.length / sentences.length || 0;
    const avgSyllablesPerWord = syllables / words.length || 0;

    const fleschKincaidScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    return {
      readabilityGrade: this.getReadabilityGrade(fleschKincaidScore),
      sentenceComplexity: this.getSentenceComplexity(averageWordsPerSentence),
      keywordDensity: 0, // Would be calculated based on target keywords
      contentLength: words.length,
      paragraphCount: paragraphs.length,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      passiveVoicePercentage: Math.round(passiveVoicePercentage * 10) / 10,
      fleschKincaidScore: Math.round(fleschKincaidScore * 10) / 10
    };
  }

  private static countPassiveVoice(content: string): number {
    const passiveIndicators = ['was', 'were', 'been', 'being', 'is being', 'are being', 'has been', 'have been', 'had been', 'will be', 'would be'];
    let count = 0;
    
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      passiveIndicators.forEach(indicator => {
        if (sentence.toLowerCase().includes(indicator)) {
          count++;
        }
      });
    });
    
    return count;
  }

  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    if (word.endsWith('e')) count--;
    return Math.max(1, count);
  }

  private static getReadabilityGrade(fleschScore: number): string {
    if (fleschScore >= 90) return 'Very Easy (5th grade)';
    if (fleschScore >= 80) return 'Easy (6th grade)';
    if (fleschScore >= 70) return 'Fairly Easy (7th grade)';
    if (fleschScore >= 60) return 'Standard (8th-9th grade)';
    if (fleschScore >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (fleschScore >= 30) return 'Difficult (College level)';
    return 'Very Difficult (Graduate level)';
  }

  private static getSentenceComplexity(avgWords: number): string {
    if (avgWords <= 14) return 'Simple';
    if (avgWords <= 18) return 'Moderate';
    if (avgWords <= 22) return 'Complex';
    return 'Very Complex';
  }
}

// ============================================================================
// SOCIAL MEDIA CONTENT GENERATOR
// ============================================================================

class SocialMediaGenerator {
  private openAIClient: OpenAIClient;

  constructor(openAIClient: OpenAIClient) {
    this.openAIClient = openAIClient;
  }

  async generateSocialSnippets(article: Partial<NewsArticle>, content: string): Promise<SocialSnippets> {
    try {
      const [twitter, facebook, linkedin, instagram] = await Promise.all([
        this.generateTwitterSnippet(article, content),
        this.generateFacebookSnippet(article, content),
        this.generateLinkedInSnippet(article, content),
        this.generateInstagramSnippet(article, content)
      ]);

      return { twitter, facebook, linkedin, instagram };
    } catch (error) {
      throw AIContentError.contentGenerationError(
        `Failed to generate social media snippets: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async generateTwitterSnippet(article: Partial<NewsArticle>, content: string): Promise<TwitterSnippet> {
    const prompt = `Create a Twitter post (max 280 characters) for this article:
    Title: ${article.title || 'Breaking News'}
    Summary: ${content.substring(0, 200)}
    
    Requirements:
    - Engaging and concise
    - Include relevant hashtags
    - Stay under 280 characters
    - Professional tone`;

    const response = await this.openAIClient.generateContent(prompt, { maxTokens: 150 });
    
    // Parse the response to extract text and hashtags
    const lines = response.split('\n').filter(line => line.trim());
    const mainText = lines[0] || response;
    const hashtags = this.extractHashtags(response);

    return {
      text: mainText.substring(0, 280),
      hashtags,
      mentions: []
    };
  }

  private async generateFacebookSnippet(article: Partial<NewsArticle>, content: string): Promise<FacebookSnippet> {
    const prompt = `Create a Facebook post for this article:
    Title: ${article.title || 'Latest News'}
    Content: ${content.substring(0, 300)}
    
    Requirements:
    - Engaging headline
    - Compelling description (2-3 sentences)
    - Call to action
    - Facebook-appropriate tone`;

    const response = await this.openAIClient.generateContent(prompt, { maxTokens: 200 });
    
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      headline: lines[0] || article.title || 'Breaking News',
      description: lines.slice(1, -1).join(' ') || content.substring(0, 150),
      callToAction: lines[lines.length - 1]?.includes('Read') || lines[lines.length - 1]?.includes('Learn') 
        ? lines[lines.length - 1] 
        : 'Read more for full details.'
    };
  }

  private async generateLinkedInSnippet(article: Partial<NewsArticle>, content: string): Promise<LinkedInSnippet> {
    const prompt = `Create a LinkedIn post for this article:
    Title: ${article.title || 'Industry Update'}
    Content: ${content.substring(0, 400)}
    
    Requirements:
    - Professional headline
    - Business-focused summary
    - Industry insights angle
    - LinkedIn professional tone`;

    const response = await this.openAIClient.generateContent(prompt, { maxTokens: 250 });
    
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      headline: lines[0] || article.title || 'Industry News Update',
      summary: lines.slice(1).join('\n') || content.substring(0, 200),
      professionalTone: true
    };
  }

  private async generateInstagramSnippet(article: Partial<NewsArticle>, content: string): Promise<InstagramSnippet> {
    const prompt = `Create an Instagram post for this article:
    Title: ${article.title || 'Latest Update'}
    Content: ${content.substring(0, 300)}
    
    Requirements:
    - Visual-friendly caption
    - Engaging hooks
    - Relevant hashtags
    - Instagram tone and style`;

    const response = await this.openAIClient.generateContent(prompt, { maxTokens: 200 });
    
    const hashtags = this.extractHashtags(response);
    const hooks = this.extractHooks(response);
    
    return {
      caption: response.replace(/#\w+/g, '').trim(),
      hashtags,
      hooks
    };
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#\w+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  private extractHooks(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences
      .filter(sentence => 
        sentence.includes('Did you know') ||
        sentence.includes('Breaking:') ||
        sentence.includes('JUST IN:') ||
        sentence.includes('🚨') ||
        sentence.length < 50
      )
      .slice(0, 3);
  }
}

// ============================================================================
// MAIN AI CONTENT SERVICE
// ============================================================================

export class AIContentService {
  private openAIClient: OpenAIClient;
  private socialMediaGenerator: SocialMediaGenerator;

  constructor() {
    this.openAIClient = new OpenAIClient();
    this.socialMediaGenerator = new SocialMediaGenerator(this.openAIClient);
  }

  /**
   * Generate comprehensive content for a news article
   */
  async generateArticle(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      // Get appropriate template
      const template = CONTENT_TEMPLATES[request.category] || CONTENT_TEMPLATES.breaking_news;
      
      // Generate main content
      const content = await this.generateMainContent(request, template);
      
      // Generate title and summary
      const title = await this.generateTitle(request, template);
      const summary = await this.generateSummary(content, request);
      
      // SEO optimization
      const seoOptimization = SEOOptimizer.optimizeContent(content, request.keywords, request.topic);
      
      // Generate social media snippets
      const socialSnippets = await this.socialMediaGenerator.generateSocialSnippets(
        { title, summary, category: { name: request.category } as Category },
        content
      );
      
      // Quality analysis
      const qualityScore = ContentQualityAnalyzer.analyzeQuality(content, seoOptimization.seoData);
      
      // Fact checking (optional)
      let factCheckResults: FactCheckResult[] | undefined;
      if (request.category === 'science' || request.category === 'health' || request.category === 'business') {
        const claims = FactCheckingService.extractClaims(content);
        if (claims.length > 0) {
          factCheckResults = await FactCheckingService.checkFacts(content, claims);
        }
      }

      return {
        title,
        content: seoOptimization.optimizedContent,
        summary,
        keywords: request.keywords,
        seoData: seoOptimization.seoData as SEOData,
        socialSnippets,
        qualityScore,
        factCheckResults
      };
    } catch (error) {
      if (error instanceof AIContentError) {
        throw error;
      }
      
      throw AIContentError.contentGenerationError(
        `Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate just a title for given parameters
   */
  async generateTitle(request: ContentGenerationRequest, template?: ContentTemplate): Promise<string> {
    const activeTemplate = template || CONTENT_TEMPLATES[request.category] || CONTENT_TEMPLATES.breaking_news;
    
    const prompt = `${activeTemplate.prompts.title.replace('{topic}', request.topic)}
    
    Additional context:
    - Category: ${request.category}
    - Tone: ${request.tone}
    - Audience: ${request.audience}
    - Keywords to include: ${request.keywords.join(', ')}
    
    Generate a compelling, SEO-optimized headline that is:
    - 50-60 characters long
    - Includes primary keyword naturally
    - Engaging and click-worthy
    - Appropriate for the category and tone`;

    return this.openAIClient.generateContent(prompt, { maxTokens: 100 });
  }

  /**
   * Generate main article content
   */
  private async generateMainContent(request: ContentGenerationRequest, template: ContentTemplate): Promise<string> {
    const lengthGuidance = this.getLengthGuidance(request.length);
    const toneGuidance = this.getToneGuidance(request.tone);
    const audienceGuidance = this.getAudienceGuidance(request.audience);

    const prompt = `Write a comprehensive ${request.category} article about: ${request.topic}

    Content Structure (follow this structure):
    ${template.structure.map((section, index) => `${index + 1}. ${section.replace(/_/g, ' ')}`).join('\n')}

    Requirements:
    - Length: ${lengthGuidance}
    - Tone: ${toneGuidance}
    - Audience: ${audienceGuidance}
    - Keywords to naturally integrate: ${request.keywords.join(', ')}
    - Category-specific focus: ${request.category}
    
    ${request.sources ? `Reference these sources: ${request.sources.join(', ')}` : ''}
    ${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}
    
    Template prompts for each section:
    - Introduction: ${template.prompts.introduction}
    - Body: ${template.prompts.body}
    - Conclusion: ${template.prompts.conclusion}
    
    Generate engaging, accurate, and well-structured content that follows journalism best practices.`;

    return this.openAIClient.generateContent(prompt, {
      maxTokens: this.getMaxTokensForLength(request.length),
      temperature: 0.7
    });
  }

  /**
   * Generate article summary
   */
  async generateSummary(content: string, request: ContentGenerationRequest): Promise<string> {
    const prompt = `Create a compelling summary for this article:

    ${content.substring(0, 1000)}...

    Requirements:
    - 2-3 sentences maximum
    - Capture key points
    - Engaging for ${request.audience} audience
    - Include primary topic: ${request.topic}
    - Maintain ${request.tone} tone`;

    return this.openAIClient.generateContent(prompt, { maxTokens: 150 });
  }

  /**
   * Check content for plagiarism
   */
  async checkPlagiarism(content: string): Promise<PlagiarismResult> {
    return PlagiarismDetector.checkPlagiarism(content);
  }

  /**
   * Analyze content quality
   */
  analyzeContentQuality(content: string, seoData?: Partial<SEOData>): ContentQualityScore {
    return ContentQualityAnalyzer.analyzeQuality(content, seoData);
  }

  /**
   * Generate social media content
   */
  async generateSocialContent(article: Partial<NewsArticle>, content: string): Promise<SocialSnippets> {
    return this.socialMediaGenerator.generateSocialSnippets(article, content);
  }

  /**
   * Perform fact checking
   */
  async factCheck(content: string, claims?: string[]): Promise<FactCheckResult[]> {
    const claimsToCheck = claims || FactCheckingService.extractClaims(content);
    return FactCheckingService.checkFacts(content, claimsToCheck);
  }

  /**
   * Optimize content for SEO
   */
  optimizeForSEO(content: string, keywords: string[], targetKeyword: string) {
    return SEOOptimizer.optimizeContent(content, keywords, targetKeyword);
  }

  // Helper methods
  private getLengthGuidance(length: ContentLength): string {
    switch (length) {
      case 'short': return '300-500 words';
      case 'medium': return '500-800 words';
      case 'long': return '800-1200 words';
      case 'extensive': return '1200+ words';
      default: return '500-800 words';
    }
  }

  private getToneGuidance(tone: ContentTone): string {
    switch (tone) {
      case 'professional': return 'Formal, objective, and authoritative';
      case 'casual': return 'Relaxed, conversational, and approachable';
      case 'academic': return 'Scholarly, detailed, and research-focused';
      case 'conversational': return 'Friendly, engaging, and personal';
      case 'authoritative': return 'Expert, confident, and definitive';
      case 'neutral': return 'Balanced, factual, and unbiased';
      default: return 'Professional and informative';
    }
  }

  private getAudienceGuidance(audience: ContentAudience): string {
    switch (audience) {
      case 'general': return 'General public with varied knowledge levels';
      case 'expert': return 'Industry professionals and specialists';
      case 'beginner': return 'Newcomers who need background context';
      case 'business': return 'Business professionals and decision-makers';
      case 'academic': return 'Researchers and academic professionals';
      default: return 'General informed readership';
    }
  }

  private getMaxTokensForLength(length: ContentLength): number {
    switch (length) {
      case 'short': return 800;
      case 'medium': return 1200;
      case 'long': return 1800;
      case 'extensive': return 2500;
      default: return 1200;
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Global service instance
const aiContentService = new AIContentService();

/**
 * Generate a complete news article with AI
 */
export async function generateNewsArticle(request: ContentGenerationRequest): Promise<GeneratedContent> {
  return aiContentService.generateArticle(request);
}

/**
 * Generate just a headline
 */
export async function generateHeadline(topic: string, category: string, keywords: string[]): Promise<string> {
  return aiContentService.generateTitle({
    topic,
    category,
    keywords,
    tone: 'professional',
    length: 'medium',
    audience: 'general'
  });
}

/**
 * Generate social media snippets for existing content
 */
export async function generateSocialSnippets(article: Partial<NewsArticle>, content: string): Promise<SocialSnippets> {
  return aiContentService.generateSocialContent(article, content);
}

/**
 * Check content quality
 */
export function analyzeContentQuality(content: string, seoData?: Partial<SEOData>): ContentQualityScore {
  return aiContentService.analyzeContentQuality(content, seoData);
}

/**
 * Check for plagiarism
 */
export async function checkContentPlagiarism(content: string): Promise<PlagiarismResult> {
  return aiContentService.checkPlagiarism(content);
}

/**
 * Perform fact checking
 */
export async function factCheckContent(content: string, claims?: string[]): Promise<FactCheckResult[]> {
  return aiContentService.factCheck(content, claims);
}

/**
 * Optimize content for SEO
 */
export function optimizeContentSEO(content: string, keywords: string[], targetKeyword: string) {
  return aiContentService.optimizeForSEO(content, keywords, targetKeyword);
}

// Export the service instance and types
export { aiContentService, AIContentError, CONTENT_TEMPLATES };
export type {
  ContentGenerationRequest,
  GeneratedContent,
  ContentTemplate,
  ContentQualityScore,
  SocialSnippets,
  FactCheckResult,
  PlagiarismResult,
  ContentTone,
  ContentLength,
  ContentAudience
};