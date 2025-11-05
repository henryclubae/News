'use client';

import React, { useState, useCallback } from 'react';
import { 
  generateNewsArticle, 
  generateHeadline, 
  generateSocialSnippets,
  analyzeContentQuality,
  checkContentPlagiarism,
  factCheckContent,
  optimizeContentSEO,
  AIContentError,
  CONTENT_TEMPLATES
} from '@/lib/ai-content';
import type { 
  ContentGenerationRequest, 
  GeneratedContent, 
  ContentQualityScore,
  SocialSnippets,
  PlagiarismResult,
  FactCheckResult,
  ContentTone,
  ContentLength,
  ContentAudience
} from '@/lib/ai-content';
import type { NewsArticle } from '@/types';

// ============================================================================
// AI CONTENT DEMO COMPONENT
// ============================================================================

export function AIContentDemo() {
  // State management
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [qualityScore, setQualityScore] = useState<ContentQualityScore | null>(null);
  const [socialSnippets, setSocialSnippets] = useState<SocialSnippets | null>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [factCheckResults, setFactCheckResults] = useState<FactCheckResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze' | 'social' | 'quality'>('generate');

  // Form state
  const [formData, setFormData] = useState<ContentGenerationRequest>({
    topic: 'Latest developments in artificial intelligence',
    category: 'technology',
    keywords: ['AI', 'artificial intelligence', 'machine learning', 'technology'],
    tone: 'professional' as ContentTone,
    length: 'medium' as ContentLength,
    audience: 'general' as ContentAudience,
    sources: [],
    customInstructions: ''
  });

  const [customContent, setCustomContent] = useState('');

  // Available options
  const categories = Object.keys(CONTENT_TEMPLATES);
  const tones: ContentTone[] = ['professional', 'casual', 'academic', 'conversational', 'authoritative', 'neutral'];
  const lengths: ContentLength[] = ['short', 'medium', 'long', 'extensive'];
  const audiences: ContentAudience[] = ['general', 'expert', 'beginner', 'business', 'academic'];

  // Handle form changes
  const handleFormChange = (field: keyof ContentGenerationRequest, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({ ...prev, keywords }));
  };

  // Generate article content
  const handleGenerateArticle = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const content = await generateNewsArticle(formData);
      setGeneratedContent(content);
      
      // Auto-analyze quality
      const quality = analyzeContentQuality(content.content, content.seoData);
      setQualityScore(quality);
      
    } catch (err) {
      const errorMessage = err instanceof AIContentError 
        ? `AI Error: ${err.message} (${err.code})`
        : `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error('Error generating article:', err);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Generate headline only
  const handleGenerateHeadline = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const headline = await generateHeadline(formData.topic, formData.category, formData.keywords);
      setGeneratedContent(prev => prev ? { ...prev, title: headline } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate headline');
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Generate social media snippets
  const handleGenerateSocial = useCallback(async () => {
    if (!generatedContent && !customContent) {
      setError('Please generate content first or provide custom content');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const content = generatedContent?.content || customContent;
      const article: Partial<NewsArticle> = {
        title: generatedContent?.title || 'Sample Article',
        summary: generatedContent?.summary || content.substring(0, 200),
        category: { name: formData.category, slug: formData.category, id: '1' }
      };
      
      const snippets = await generateSocialSnippets(article, content);
      setSocialSnippets(snippets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate social snippets');
    } finally {
      setLoading(false);
    }
  }, [generatedContent, customContent, formData.category]);

  // Check plagiarism
  const handleCheckPlagiarism = useCallback(async () => {
    const content = generatedContent?.content || customContent;
    if (!content) {
      setError('Please provide content to check');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await checkContentPlagiarism(content);
      setPlagiarismResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check plagiarism');
    } finally {
      setLoading(false);
    }
  }, [generatedContent, customContent]);

  // Fact check content
  const handleFactCheck = useCallback(async () => {
    const content = generatedContent?.content || customContent;
    if (!content) {
      setError('Please provide content to fact-check');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const results = await factCheckContent(content);
      setFactCheckResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fact-check content');
    } finally {
      setLoading(false);
    }
  }, [generatedContent, customContent]);

  // Optimize for SEO
  const handleSEOOptimize = useCallback(() => {
    const content = generatedContent?.content || customContent;
    if (!content) {
      setError('Please provide content to optimize');
      return;
    }

    try {
      const optimized = optimizeContentSEO(content, formData.keywords, formData.topic);
      setGeneratedContent(prev => prev ? {
        ...prev,
        content: optimized.optimizedContent,
        seoData: { ...prev.seoData, ...optimized.seoData }
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize content');
    }
  }, [generatedContent, customContent, formData]);

  // Get quality score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 AI Content Generation Studio
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate, analyze, and optimize news content with advanced AI capabilities
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'generate', label: 'Generate Content', icon: '✨' },
          { key: 'analyze', label: 'Analyze Quality', icon: '📊' },
          { key: 'social', label: 'Social Media', icon: '📱' },
          { key: 'quality', label: 'Quality Check', icon: '🔍' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'generate' | 'analyze' | 'social' | 'quality')}
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

      {/* Content Generation Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Generation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic/Subject
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => handleFormChange('topic', e.target.value)}
                placeholder="Enter the main topic or subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                title="Select content category"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.keywords.join(', ')}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tone
              </label>
              <select
                value={formData.tone}
                onChange={(e) => handleFormChange('tone', e.target.value)}
                title="Select content tone"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tones.map(tone => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length
              </label>
              <select
                value={formData.length}
                onChange={(e) => handleFormChange('length', e.target.value)}
                title="Select content length"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lengths.map(length => (
                  <option key={length} value={length}>
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={formData.audience}
                onChange={(e) => handleFormChange('audience', e.target.value)}
                title="Select target audience"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {audiences.map(audience => (
                  <option key={audience} value={audience}>
                    {audience.charAt(0).toUpperCase() + audience.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={formData.customInstructions}
                onChange={(e) => handleFormChange('customInstructions', e.target.value)}
                placeholder="Any specific instructions for content generation..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateArticle}
              disabled={loading || !formData.topic}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors font-medium"
            >
              {loading ? '🔄 Generating...' : '✨ Generate Full Article'}
            </button>

            <button
              onClick={handleGenerateHeadline}
              disabled={loading || !formData.topic}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors font-medium"
            >
              📰 Generate Headline Only
            </button>

            <button
              onClick={handleSEOOptimize}
              disabled={loading || !generatedContent}
              className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors font-medium"
            >
              🔍 Optimize SEO
            </button>
          </div>

          {/* Generated Content Display */}
          {generatedContent && (
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {generatedContent.title}
                </h2>
                
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {generatedContent.content}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    📝 Summary
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    {generatedContent.summary}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Keywords:</span>
                  {generatedContent.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                                 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quality Analysis Tab */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => {
                const content = generatedContent?.content || customContent;
                if (content) {
                  const quality = analyzeContentQuality(content, generatedContent?.seoData);
                  setQualityScore(quality);
                }
              }}
              disabled={loading || (!generatedContent && !customContent)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📊 Analyze Quality
            </button>

            <button
              onClick={handleCheckPlagiarism}
              disabled={loading || (!generatedContent && !customContent)}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔍 Check Plagiarism
            </button>

            <button
              onClick={handleFactCheck}
              disabled={loading || (!generatedContent && !customContent)}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✅ Fact Check
            </button>
          </div>

          {/* Custom Content Input for Analysis */}
          {!generatedContent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Content for Analysis
              </label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Paste your content here for analysis..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Quality Score Display */}
          {qualityScore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Quality Scores
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Overall</span>
                    <span className={`font-bold ${getScoreColor(qualityScore.overall)}`}>
                      {qualityScore.overall}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Readability</span>
                    <span className={`font-bold ${getScoreColor(qualityScore.readability)}`}>
                      {qualityScore.readability}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SEO Optimization</span>
                    <span className={`font-bold ${getScoreColor(qualityScore.seoOptimization)}`}>
                      {qualityScore.seoOptimization}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className={`font-bold ${getScoreColor(qualityScore.engagement)}`}>
                      {qualityScore.engagement}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Originality</span>
                    <span className={`font-bold ${getScoreColor(qualityScore.originality)}`}>
                      {qualityScore.originality}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📋 Content Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Length</span>
                    <span className="text-gray-900 dark:text-white">
                      {qualityScore.details.contentLength} words
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paragraphs</span>
                    <span className="text-gray-900 dark:text-white">
                      {qualityScore.details.paragraphCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Words/Sentence</span>
                    <span className="text-gray-900 dark:text-white">
                      {qualityScore.details.averageWordsPerSentence}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reading Grade</span>
                    <span className="text-gray-900 dark:text-white text-xs">
                      {qualityScore.details.readabilityGrade}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📈 Readability Metrics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Flesch-Kincaid</span>
                    <span className="text-gray-900 dark:text-white">
                      {qualityScore.details.fleschKincaidScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Complexity</span>
                    <span className="text-gray-900 dark:text-white">
                      {qualityScore.details.sentenceComplexity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Passive Voice</span>
                    <span className="text-gray-900 dark:text-white">
                      {qualityScore.details.passiveVoicePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plagiarism Results */}
          {plagiarismResult && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔍 Plagiarism Check Results
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-2xl font-bold ${getScoreColor(plagiarismResult.originalityScore)}`}>
                  {plagiarismResult.originalityScore}%
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Originality Score
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {plagiarismResult.overallVerdict.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {plagiarismResult.matchedSources.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Potential Matches:
                  </h4>
                  {plagiarismResult.matchedSources.map((match, index) => (
                    <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md mb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-yellow-800 dark:text-yellow-300">
                            {match.source}
                          </div>
                          <div className="text-sm text-yellow-700 dark:text-yellow-400">
                            {match.matchedText}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-300">
                          {match.matchPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fact Check Results */}
          {factCheckResults && factCheckResults.length > 0 && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ✅ Fact Check Results
              </h3>
              <div className="space-y-4">
                {factCheckResults.map((result, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        result.verdict === 'verified' ? 'bg-green-500' :
                        result.verdict === 'disputed' ? 'bg-red-500' :
                        result.verdict === 'unverified' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {result.claim}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {result.explanation}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                          <span className="capitalize">Status: {result.verdict}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <button
            onClick={handleGenerateSocial}
            disabled={loading || (!generatedContent && !customContent)}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📱 Generate Social Media Snippets
          </button>

          {socialSnippets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter */}
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                  🐦 Twitter
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                    <p className="text-gray-900 dark:text-white text-sm">
                      {socialSnippets.twitter.text}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {socialSnippets.twitter.hashtags.map((hashtag, index) => (
                      <span key={index} className="text-blue-500 text-xs">
                        #{hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Facebook */}
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                  📘 Facebook
                </h3>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">
                    {socialSnippets.facebook.headline}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {socialSnippets.facebook.description}
                  </p>
                  {socialSnippets.facebook.callToAction && (
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {socialSnippets.facebook.callToAction}
                    </p>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                  💼 LinkedIn
                </h3>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">
                    {socialSnippets.linkedin.headline}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {socialSnippets.linkedin.summary}
                  </p>
                </div>
              </div>

              {/* Instagram */}
              <div className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-700">
                <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-300 mb-4">
                  📸 Instagram
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {socialSnippets.instagram.caption}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {socialSnippets.instagram.hashtags.map((hashtag, index) => (
                      <span key={index} className="text-pink-500 text-xs">
                        #{hashtag}
                      </span>
                    ))}
                  </div>
                  {socialSnippets.instagram.hooks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-pink-700 dark:text-pink-300 mb-1">
                        Engagement Hooks:
                      </p>
                      {socialSnippets.instagram.hooks.map((hook, index) => (
                        <p key={index} className="text-xs text-pink-600 dark:text-pink-400">
                          • {hook}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quality Check Tab */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Content Quality Overview
            </h3>
            
            {generatedContent || qualityScore ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(qualityScore?.overall || 0)}`}>
                    {qualityScore?.overall || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Overall Quality
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(plagiarismResult?.originalityScore || 100)}`}>
                    {plagiarismResult?.originalityScore || 100}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Originality
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {factCheckResults?.filter(f => f.verdict === 'verified').length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Verified Claims
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Generate content or paste content for analysis to see quality metrics
                </p>
              </div>
            )}
          </div>

          {/* Quality Recommendations */}
          {qualityScore && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-4">
                💡 Improvement Recommendations
              </h3>
              <ul className="space-y-2 text-sm">
                {qualityScore.readability < 70 && (
                  <li className="text-yellow-800 dark:text-yellow-200">
                    • Improve readability by shortening sentences and using simpler words
                  </li>
                )}
                {qualityScore.seoOptimization < 80 && (
                  <li className="text-yellow-800 dark:text-yellow-200">
                    • Optimize SEO by better keyword integration and meta descriptions
                  </li>
                )}
                {qualityScore.engagement < 70 && (
                  <li className="text-yellow-800 dark:text-yellow-200">
                    • Increase engagement with more questions, examples, and storytelling elements
                  </li>
                )}
                {qualityScore.details.passiveVoicePercentage > 20 && (
                  <li className="text-yellow-800 dark:text-yellow-200">
                    • Reduce passive voice usage for more direct, engaging writing
                  </li>
                )}
              </ul>
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
              <span className="text-gray-700 dark:text-gray-300">Processing with AI...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIContentDemo;