'use client';

import React, { useState, useCallback } from 'react';
import { 
  ReadingTimeCalculator,
  TextSummarizer,
  KeywordExtractor,
  ContentSanitizer,

  type ReadingTimeResult,
  type TextSummaryResult,
  type KeywordExtractionResult,
  type ContentSanitationResult
} from '@/lib/content';

import {
  ImageOptimizer,
  SEOAnalyzer,
  UniquenessChecker,
  LanguageProcessor,
  type SEOScoreResult,
  type UniquenessResult,
  type LanguageDetectionResult,
  type ImageOptimizationSuggestion
} from '@/lib/content-advanced';

// ============================================================================
// CONTENT PROCESSING DEMO COMPONENT
// ============================================================================

export function ContentProcessingDemo() {
  // State management
  const [inputContent, setInputContent] = useState(`
    Artificial intelligence is revolutionizing the way we work and live. From machine learning algorithms that can predict consumer behavior to natural language processing systems that can understand human speech, AI is becoming increasingly sophisticated.

    In the healthcare sector, AI is being used to diagnose diseases more accurately and develop personalized treatment plans. Companies are investing billions of dollars in AI research and development, recognizing its potential to transform entire industries.

    However, with great power comes great responsibility. As AI systems become more advanced, we must consider the ethical implications of their use. Privacy concerns, job displacement, and algorithmic bias are just some of the challenges we face in this new era of artificial intelligence.

    The future of AI is bright, but it requires careful consideration and responsible development to ensure that its benefits are shared by all members of society.
  `);

  const [results, setResults] = useState<{
    readingTime?: ReadingTimeResult;
    summary?: TextSummaryResult;
    keywords?: KeywordExtractionResult;
    sanitization?: ContentSanitationResult;
    seoScore?: SEOScoreResult;
    uniqueness?: UniquenessResult;
    language?: LanguageDetectionResult;
    images?: ImageOptimizationSuggestion[];
  }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'seo' | 'security'>('basic');

  // Sample title and meta description for SEO analysis
  const [seoTitle, setSeoTitle] = useState('AI Revolution: Transforming Industries with Artificial Intelligence');
  const [seoMetaDesc, setSeoMetaDesc] = useState('Discover how artificial intelligence is revolutionizing healthcare, business, and society. Learn about AI benefits, challenges, and ethical considerations.');
  const [seoKeywords, setSeoKeywords] = useState('artificial intelligence, AI, machine learning, healthcare, technology');

  // Process content with all available tools
  const processAllContent = useCallback(async () => {
    if (!inputContent.trim()) {
      setError('Please enter some content to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Basic content analysis
      const readingTime = ReadingTimeCalculator.calculateReadingTime(inputContent);
      const summary = TextSummarizer.summarizeText(inputContent);
      const keywords = KeywordExtractor.extractKeywords(inputContent);
      const sanitization = ContentSanitizer.sanitizeContent(inputContent, {
        removeComments: true,
        preserveFormatting: true
      });

      // Advanced analysis
      const keywordList = seoKeywords.split(',').map(k => k.trim());
      const seoScore = SEOAnalyzer.calculateSEOScore(
        inputContent, 
        seoTitle, 
        seoMetaDesc, 
        keywordList
      );

      const uniqueness = UniquenessChecker.checkUniqueness(inputContent, [
        { title: 'Sample Article 1', content: 'Some sample content about technology...' },
        { title: 'Sample Article 2', content: 'Another article about artificial intelligence...' }
      ]);

      const language = LanguageProcessor.detectLanguage(inputContent);
      const images = ImageOptimizer.analyzeImages(inputContent);

      setResults({
        readingTime,
        summary,
        keywords,
        sanitization,
        seoScore,
        uniqueness,
        language,
        images
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [inputContent, seoTitle, seoMetaDesc, seoKeywords]);

  // Individual processing functions
  const processReadingTime = () => {
    try {
      const readingTime = ReadingTimeCalculator.calculateReadingTime(inputContent);
      setResults(prev => ({ ...prev, readingTime }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reading time calculation failed');
    }
  };

  const processSummary = () => {
    try {
      const summary = TextSummarizer.summarizeText(inputContent);
      setResults(prev => ({ ...prev, summary }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text summarization failed');
    }
  };

  const processKeywords = () => {
    try {
      const keywords = KeywordExtractor.extractKeywords(inputContent);
      setResults(prev => ({ ...prev, keywords }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Keyword extraction failed');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📝 Content Processing Studio
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive content analysis and optimization toolkit
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'basic', label: 'Basic Analysis', icon: '📊' },
          { key: 'advanced', label: 'Advanced Features', icon: '🔬' },
          { key: 'seo', label: 'SEO Analysis', icon: '🎯' },
          { key: 'security', label: 'Security & Quality', icon: '🛡️' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content to Analyze
        </label>
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Paste your content here for analysis..."
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Words: {inputContent.trim().split(/\s+/).length} | Characters: {inputContent.length}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={processAllContent}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '🔄 Processing...' : '🚀 Analyze All'}
        </button>

        <button
          onClick={processReadingTime}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          ⏱️ Reading Time
        </button>

        <button
          onClick={processSummary}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          📋 Summarize
        </button>

        <button
          onClick={processKeywords}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          🏷️ Keywords
        </button>
      </div>

      {/* Basic Analysis Tab */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reading Time */}
          {results.readingTime && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⏱️ Reading Time
              </h3>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {results.readingTime.minutes}m {results.readingTime.seconds}s
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Words: {results.readingTime.words}</div>
                  <div>Speed: {results.readingTime.estimatedReadingSpeed} WPM</div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {results.summary && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Content Summary
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-gray-700 rounded border">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {results.summary.summary}
                  </p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Compression: {results.summary.compressionRatio.toFixed(1)}%</span>
                  <span>Confidence: {(results.summary.confidenceScore * 100).toFixed(0)}%</span>
                </div>
                {results.summary.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Points:
                    </h4>
                    <ul className="space-y-1">
                      {results.summary.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Keywords */}
          {results.keywords && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏷️ Extracted Keywords
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total Words: {results.keywords.totalWords}</span>
                  <span>Unique Words: {results.keywords.uniqueWords}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.keywords.slice(0, 20).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                                 text-sm rounded-full border border-blue-200 dark:border-blue-700"
                      title={`Frequency: ${keyword.frequency}, Relevance: ${keyword.relevanceScore.toFixed(2)}`}
                    >
                      {keyword.word} ({keyword.frequency})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Features Tab */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Detection */}
          {results.language && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🌍 Language Detection
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.language.primaryLanguage.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({(results.language.confidence * 100).toFixed(1)}% confidence)
                  </span>
                </div>
                {results.language.alternativeLanguages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alternative Languages:
                    </p>
                    {results.language.alternativeLanguages.map((alt, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {alt.language}: {(alt.confidence * 100).toFixed(1)}%
                      </div>
                    ))}
                  </div>
                )}
                {results.language.isMultiLanguage && (
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠️ Multi-language content detected
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Uniqueness */}
          {results.uniqueness && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔍 Content Uniqueness
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(results.uniqueness.uniquenessScore)}`}>
                    {results.uniqueness.uniquenessScore}%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Unique
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Fingerprint: <code className="text-xs">{results.uniqueness.fingerprint}</code>
                </div>
                {results.uniqueness.duplicatePercentage > 0 && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {results.uniqueness.duplicatePercentage}% potential duplication
                  </div>
                )}
                {results.uniqueness.similarContent.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Similar Content:
                    </p>
                    {results.uniqueness.similarContent.slice(0, 3).map((match, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {match.title}: {(match.similarity * 100).toFixed(1)}% similar
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO Analysis Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {/* SEO Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label 
                htmlFor="seo-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                SEO Title
              </label>
              <input
                id="seo-title"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter SEO title (30-60 characters)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {seoTitle.length} characters (optimal: 30-60)
              </div>
            </div>

            <div>
              <label 
                htmlFor="seo-meta-desc"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Meta Description
              </label>
              <textarea
                id="seo-meta-desc"
                value={seoMetaDesc}
                onChange={(e) => setSeoMetaDesc(e.target.value)}
                rows={2}
                placeholder="Enter meta description (120-160 characters)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {seoMetaDesc.length} characters (optimal: 120-160)
              </div>
            </div>

            <div className="md:col-span-2">
              <label 
                htmlFor="seo-keywords"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                SEO Keywords (comma-separated)
              </label>
              <input
                id="seo-keywords"
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="Enter SEO keywords separated by commas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* SEO Score Results */}
          {results.seoScore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎯 SEO Score Analysis
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`text-4xl font-bold ${getScoreColor(results.seoScore.overallScore)}`}>
                    {results.seoScore.overallScore}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Overall SEO Score
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(results.seoScore.breakdown).map(([key, score]) => (
                    <div key={key} className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {Math.round(score)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {results.seoScore.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                      💡 Recommendations:
                    </h4>
                    <ul className="space-y-1">
                      {results.seoScore.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security & Quality Tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Content Sanitization */}
          {results.sanitization && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🛡️ Content Security
              </h3>
              <div className="space-y-3">
                <div className={`text-lg font-bold ${results.sanitization.isClean ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {results.sanitization.isClean ? '✅ Clean' : '⚠️ Issues Found'}
                </div>
                
                {results.sanitization.removedElements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                      Removed Elements ({results.sanitization.removedElements.length}):
                    </p>
                    {results.sanitization.removedElements.slice(0, 5).map((element, index) => (
                      <div key={index} className="text-xs text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {element.length > 50 ? element.substring(0, 50) + '...' : element}
                      </div>
                    ))}
                  </div>
                )}

                {results.sanitization.warnings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      Security Warnings:
                    </p>
                    {results.sanitization.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Analysis */}
          {results.images && results.images.length > 0 && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🖼️ Image Optimization
              </h3>
              <div className="space-y-4">
                {results.images.map((img, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded border">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {img.originalUrl.split('/').pop()}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div>Potential savings: {img.sizeReduction}%</div>
                      <div>Suggested formats: {img.suggestedFormats.join(', ')}</div>
                      <div>Alt text: &ldquo;{img.altTextSuggestion}&rdquo;</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">Processing content...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentProcessingDemo;