// ============================================================================
// INTEGRATED NEWS & AI CONTENT EXAMPLE
// ============================================================================
// This file demonstrates how to use both the News API layer and AI Content 
// service together to create a comprehensive news content workflow

import { NewsService } from '@/lib/api';
import { 
  generateNewsArticle, 
  generateSocialSnippets, 
  analyzeContentQuality,
  checkContentPlagiarism,
  factCheckContent,
  optimizeContentSEO 
} from '@/lib/ai-content';
import type { NewsArticle } from '@/types';

// ============================================================================
// COMPREHENSIVE WORKFLOW EXAMPLE
// ============================================================================

/**
 * Complete workflow: Fetch trending news, generate AI content, and optimize
 */
export async function completeNewsWorkflow() {
  console.log('🚀 Starting comprehensive news workflow...');
  
  try {
    // Step 1: Initialize services
    const newsService = new NewsService();
    
    // Step 2: Fetch trending topics from real news sources
    console.log('📰 Fetching trending news...');
    const trendingNews = await newsService.searchNews({
      query: 'technology',
      language: 'en',
      pageSize: 5,
      sortBy: 'popularity'
    });
    
    if (trendingNews.length === 0) {
      throw new Error('No trending news found');
    }
    
    // Step 3: Select a trending topic for AI content generation
    const selectedArticle = trendingNews[0];
    console.log(`📝 Selected topic: ${selectedArticle.title}`);
    
    // Step 4: Generate AI content based on trending topic
    console.log('🤖 Generating AI content...');
    const aiContent = await generateNewsArticle({
      topic: selectedArticle.title,
      category: 'technology',
      keywords: extractKeywordsFromTitle(selectedArticle.title),
      tone: 'professional',
      length: 'medium',
      audience: 'general',
      sources: [],
      customInstructions: 'Expand on this topic with additional context and analysis'
    });
    
    // Step 5: Analyze and optimize the generated content
    console.log('📊 Analyzing content quality...');
    const qualityAnalysis = analyzeContentQuality(aiContent.content, aiContent.seoData);
    
    // Step 6: Optimize for SEO if quality is below threshold
    let optimizedContent = aiContent;
    if (qualityAnalysis.seoOptimization < 80) {
      console.log('🔍 Optimizing SEO...');
      const seoOptimized = optimizeContentSEO(
        aiContent.content, 
        aiContent.keywords, 
        aiContent.title
      );
      optimizedContent = {
        ...aiContent,
        content: seoOptimized.optimizedContent,
        seoData: { ...aiContent.seoData, ...seoOptimized.seoData }
      };
    }
    
    // Step 7: Check content quality and authenticity
    console.log('🔍 Performing quality checks...');
    const [plagiarismCheck, factCheck] = await Promise.all([
      checkContentPlagiarism(optimizedContent.content),
      factCheckContent(optimizedContent.content)
    ]);
    
    // Step 8: Generate social media content
    console.log('📱 Creating social media snippets...');
    const socialSnippets = await generateSocialSnippets(
      {
        title: optimizedContent.title,
        summary: optimizedContent.summary,
        category: { name: 'technology', slug: 'technology', id: '1' }
      },
      optimizedContent.content
    );
    
    // Step 9: Compile comprehensive result
    const result = {
      originalNews: selectedArticle,
      aiGeneratedContent: optimizedContent,
      qualityMetrics: {
        overall: qualityAnalysis.overall,
        readability: qualityAnalysis.readability,
        seoScore: qualityAnalysis.seoOptimization,
        originality: plagiarismCheck.originalityScore
      },
      factCheckResults: factCheck,
      socialMediaContent: socialSnippets,
      processingTime: Date.now()
    };
    
    console.log('✅ Workflow completed successfully!');
    console.log(`📊 Quality Score: ${result.qualityMetrics.overall}%`);
    console.log(`🎯 SEO Score: ${result.qualityMetrics.seoScore}%`);
    console.log(`✨ Originality: ${result.qualityMetrics.originality}%`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    throw error;
  }
}

// ============================================================================
// CONTENT ENHANCEMENT WORKFLOW
// ============================================================================

/**
 * Enhance existing news articles with AI-generated analysis and insights
 */
export async function enhanceExistingArticle(articleId: string) {
  console.log(`🔄 Enhancing article: ${articleId}`);
  
  try {
    // For demo purposes, create a mock article (in real app, fetch from database)
    const originalArticle: NewsArticle = {
      id: articleId,
      title: 'Sample Article Title',
      content: 'Sample article content...',
      summary: 'Sample summary',
      author: { id: '1', name: 'Author Name', email: 'author@example.com' },
      publishDate: new Date(),
      category: { id: '1', name: 'Technology', slug: 'technology' },
      tags: ['tech', 'AI'],
      slug: 'sample-article',
      language: 'en',
      seoData: { 
        metaTitle: 'Sample', 
        metaDescription: 'Sample', 
        keywords: ['sample'],
        canonicalUrl: 'https://example.com',
        openGraph: {
          title: 'Sample',
          description: 'Sample',
          image: 'https://example.com/image.jpg',
          url: 'https://example.com',
          type: 'article',
          siteName: 'Sample Site',
          locale: 'en_US'
        },
        twitterCard: {
          card: 'summary',
          title: 'Sample',
          description: 'Sample',
          image: 'https://example.com/image.jpg'
        }
      },
      readingTime: 5,
      source: { id: '1', name: 'Sample Source', url: 'https://example.com' },
      status: 'published'
    };
    
    // Generate additional insights and analysis
    const enhancement = await generateNewsArticle({
      topic: `Analysis and insights on: ${originalArticle.title}`,
      category: originalArticle.category?.name || 'general',
      keywords: extractKeywordsFromContent(originalArticle.content || ''),
      tone: 'academic',
      length: 'medium',
      audience: 'expert',
      customInstructions: `
        Provide expert analysis, context, and insights for this news story.
        Include potential implications, expert perspectives, and related developments.
        Do not repeat the original content but add valuable commentary.
      `
    });
    
    // Create enhanced version
    return {
      original: originalArticle,
      aiEnhancement: enhancement,
      combinedContent: combineArticleContent(originalArticle, enhancement),
      socialSnippets: await generateSocialSnippets(originalArticle, enhancement.content)
    };
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    throw error;
  }
}

// ============================================================================
// BATCH CONTENT GENERATION
// ============================================================================

/**
 * Generate multiple articles based on trending topics
 */
export async function generateTrendingContentBatch(categories: string[] = ['technology', 'business', 'science']) {
  console.log('🔄 Generating batch content for trending topics...');
  
  const newsService = new NewsService();
  const results = [];
  
  for (const category of categories) {
    try {
      console.log(`📰 Processing category: ${category}`);
      
      // Get trending topics for category
      const headlines = await newsService.searchNews({
        query: category,
        pageSize: 3,
        sortBy: 'popularity'
      });
      
      // Generate AI content for each trending topic
      for (const headline of headlines) {
        const aiContent = await generateNewsArticle({
          topic: headline.title,
          category,
          keywords: extractKeywordsFromTitle(headline.title),
          tone: 'professional',
          length: 'short',
          audience: 'general'
        });
        
        results.push({
          category,
          originalHeadline: headline.title,
          aiContent,
          generatedAt: new Date().toISOString()
        });
        
        // Rate limiting: wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to process category ${category}:`, error);
    }
  }
  
  console.log(`✅ Generated ${results.length} articles`);
  return results;
}

// ============================================================================
// CONTENT QUALITY MONITORING
// ============================================================================

/**
 * Monitor and analyze content quality across multiple articles
 */
export async function monitorContentQuality(articles: string[]) {
  console.log('📊 Monitoring content quality...');
  
  const qualityReports = [];
  
  for (const content of articles) {
    const quality = analyzeContentQuality(content);
    const plagiarism = await checkContentPlagiarism(content);
    const factChecks = await factCheckContent(content);
    
    qualityReports.push({
      content: content.substring(0, 100) + '...',
      metrics: {
        overall: quality.overall,
        readability: quality.readability,
        seoScore: quality.seoOptimization,
        engagement: quality.engagement,
        originality: plagiarism.originalityScore
      },
      issues: {
        factCheckIssues: factChecks.filter(f => f.verdict !== 'verified').length,
        plagiarismIssues: plagiarism.matchedSources.length,
        qualityIssues: quality.overall < 70 ? ['Low overall quality'] : []
      }
    });
  }
  
  // Generate summary report
  const summary = {
    totalArticles: qualityReports.length,
    averageQuality: qualityReports.reduce((sum, r) => sum + r.metrics.overall, 0) / qualityReports.length,
    highQualityArticles: qualityReports.filter(r => r.metrics.overall >= 80).length,
    articlesWithIssues: qualityReports.filter(r => 
      r.issues.factCheckIssues > 0 || 
      r.issues.plagiarismIssues > 0 || 
      r.issues.qualityIssues.length > 0
    ).length
  };
  
  console.log(`📈 Quality Summary:`);
  console.log(`  - Average Quality: ${summary.averageQuality.toFixed(1)}%`);
  console.log(`  - High Quality Articles: ${summary.highQualityArticles}/${summary.totalArticles}`);
  console.log(`  - Articles with Issues: ${summary.articlesWithIssues}/${summary.totalArticles}`);
  
  return { summary, reports: qualityReports };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract keywords from article title
 */
function extractKeywordsFromTitle(title: string): string[] {
  // Simple keyword extraction - remove common words and split
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5);
}

/**
 * Extract keywords from article content
 */
function extractKeywordsFromContent(content: string): string[] {
  // Simple frequency-based keyword extraction
  const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    if (!/^(the|and|for|are|but|not|you|all|can|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|way|who|boy|did|man|men|she|use|her|now|oil|sit|ten|win|yes)$/.test(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
}

/**
 * Combine original article with AI enhancement
 */
function combineArticleContent(original: NewsArticle, enhancement: { content: string }): string {
  return `
# ${original.title}

${original.content}

---

## Expert Analysis & Insights

${enhancement.content}

---

*This article combines original reporting with AI-generated analysis and insights.*
  `.trim();
}

// ============================================================================
// EXAMPLE USAGE FUNCTIONS
// ============================================================================

/**
 * Example: Quick content generation from trending topic
 */
export async function quickContentGeneration(topic: string, category = 'technology') {
  const content = await generateNewsArticle({
    topic,
    category,
    keywords: extractKeywordsFromTitle(topic),
    tone: 'professional',
    length: 'medium',
    audience: 'general'
  });
  
  const quality = analyzeContentQuality(content.content, content.seoData);
  
  return {
    content,
    qualityScore: quality.overall,
    recommendation: quality.overall >= 80 ? 'Ready to publish' : 'Needs improvement'
  };
}

/**
 * Example: Full content pipeline with all features
 */
export async function fullContentPipeline(topic: string) {
  console.log('🔄 Running full content pipeline...');
  
  // Generate content
  const content = await generateNewsArticle({
    topic,
    category: 'technology',
    keywords: extractKeywordsFromTitle(topic),
    tone: 'professional',
    length: 'long',
    audience: 'general'
  });
  
  // Analyze and optimize
  const quality = analyzeContentQuality(content.content, content.seoData);
  const plagiarism = await checkContentPlagiarism(content.content);
  const factCheck = await factCheckContent(content.content);
  
  // Generate social content
  const social = await generateSocialSnippets(
    {
      title: content.title,
      summary: content.summary,
      category: { name: 'technology', slug: 'technology', id: '1' }
    },
    content.content
  );
  
  return {
    article: content,
    quality: {
      score: quality.overall,
      readability: quality.readability,
      seo: quality.seoOptimization,
      originality: plagiarism.originalityScore
    },
    verification: {
      factChecks: factCheck,
      plagiarismMatches: plagiarism.matchedSources
    },
    socialMedia: social,
    status: quality.overall >= 80 ? 'approved' : 'needs_review'
  };
}

const integrationExamples = {
  completeNewsWorkflow,
  enhanceExistingArticle,
  generateTrendingContentBatch,
  monitorContentQuality,
  quickContentGeneration,
  fullContentPipeline
};

export default integrationExamples;