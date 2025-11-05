# AI Content Generation Service Documentation

## Overview

The AI Content Service is a comprehensive system for generating, analyzing, and optimizing news content using OpenAI's GPT-4 Turbo. It provides intelligent content creation, SEO optimization, fact-checking, plagiarism detection, and social media snippet generation.

## 🚀 Quick Start

### Basic Setup

```typescript
import { generateNewsArticle, analyzeContentQuality } from '@/lib/ai-content';

// Generate a complete article
const content = await generateNewsArticle({
  topic: 'Latest developments in artificial intelligence',
  category: 'technology',
  keywords: ['AI', 'machine learning', 'technology'],
  tone: 'professional',
  length: 'medium',
  audience: 'general'
});

// Analyze content quality
const quality = analyzeContentQuality(content.content, content.seoData);
```

### Environment Variables

Add these to your `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 📚 Core Features

### 1. Content Generation

#### Full Article Generation
```typescript
import { generateNewsArticle } from '@/lib/ai-content';

const article = await generateNewsArticle({
  topic: 'Climate change impacts on agriculture',
  category: 'science',
  keywords: ['climate change', 'agriculture', 'farming', 'environment'],
  tone: 'academic',
  length: 'long',
  audience: 'expert',
  sources: [
    { title: 'IPCC Report 2023', url: 'https://ipcc.ch/report', type: 'report' }
  ],
  customInstructions: 'Focus on recent research and data'
});

console.log(article.title);      // Generated headline
console.log(article.content);    // Full article content
console.log(article.summary);    // Article summary
console.log(article.keywords);   // Extracted keywords
console.log(article.seoData);    // SEO metadata
```

#### Headlines Only
```typescript
import { generateHeadline } from '@/lib/ai-content';

const headline = await generateHeadline(
  'Breakthrough in quantum computing',
  'technology',
  ['quantum computing', 'breakthrough', 'technology']
);
```

### 2. Content Templates

The service includes predefined templates for different news categories:

- **Breaking News**: Urgent, factual reporting
- **Technology**: Technical depth with accessibility
- **Business**: Market analysis and trends
- **Health**: Medical accuracy with accessibility
- **Sports**: Action and results focus
- **Science**: Research-based with explanations
- **Entertainment**: Engaging and trend-focused

### 3. SEO Optimization

```typescript
import { optimizeContentSEO } from '@/lib/ai-content';

const optimized = optimizeContentSEO(
  originalContent,
  ['primary keyword', 'secondary keyword'],
  'Primary Topic'
);

console.log(optimized.optimizedContent); // Content with better keyword integration
console.log(optimized.seoData.title);    // Optimized meta title
console.log(optimized.seoData.description); // Meta description
console.log(optimized.seoData.keywords); // SEO keywords
console.log(optimized.seoData.slug);     // URL slug
```

### 4. Content Quality Analysis

```typescript
import { analyzeContentQuality } from '@/lib/ai-content';

const quality = analyzeContentQuality(content, seoData);

console.log(quality.overall);         // Overall quality score (0-100)
console.log(quality.readability);     // Readability score
console.log(quality.seoOptimization); // SEO optimization score
console.log(quality.engagement);      // Engagement potential score
console.log(quality.originality);     // Originality score

// Detailed metrics
console.log(quality.details.contentLength);           // Word count
console.log(quality.details.readabilityGrade);        // Reading grade level
console.log(quality.details.fleschKincaidScore);      // FK readability score
console.log(quality.details.sentenceComplexity);      // Sentence complexity
console.log(quality.details.passiveVoicePercentage);  // Passive voice usage
console.log(quality.details.paragraphCount);          // Number of paragraphs
console.log(quality.details.averageWordsPerSentence); // Avg words per sentence
```

### 5. Plagiarism Detection

```typescript
import { checkContentPlagiarism } from '@/lib/ai-content';

const plagiarismResult = await checkContentPlagiarism(content);

console.log(plagiarismResult.originalityScore);  // 0-100 originality score
console.log(plagiarismResult.overallVerdict);    // 'original', 'minor_issues', 'major_issues'

// Check for matches
plagiarismResult.matchedSources.forEach(match => {
  console.log(match.source);          // Source of potential match
  console.log(match.matchPercentage); // Percentage of similarity
  console.log(match.matchedText);     // The matching text snippet
});
```

### 6. Fact Checking

```typescript
import { factCheckContent } from '@/lib/ai-content';

const factChecks = await factCheckContent(content);

factChecks.forEach(check => {
  console.log(check.claim);       // The factual claim
  console.log(check.verdict);     // 'verified', 'disputed', 'unverified', 'unclear'
  console.log(check.confidence);  // Confidence level (0-1)
  console.log(check.explanation); // Explanation of the verdict
  console.log(check.sources);     // Supporting sources
});
```

### 7. Social Media Generation

```typescript
import { generateSocialSnippets } from '@/lib/ai-content';

const article = {
  title: 'Breaking News Title',
  summary: 'Article summary...',
  category: { name: 'technology' }
};

const snippets = await generateSocialSnippets(article, fullContent);

// Twitter
console.log(snippets.twitter.text);     // Tweet text (under 280 chars)
console.log(snippets.twitter.hashtags); // Relevant hashtags

// Facebook
console.log(snippets.facebook.headline);    // Engaging headline
console.log(snippets.facebook.description); // Longer description
console.log(snippets.facebook.callToAction); // Call to action

// LinkedIn
console.log(snippets.linkedin.headline); // Professional headline
console.log(snippets.linkedin.summary);  // Professional summary

// Instagram
console.log(snippets.instagram.caption);  // Visual-focused caption
console.log(snippets.instagram.hashtags); // Instagram hashtags
console.log(snippets.instagram.hooks);    // Engagement hooks
```

## 🎛️ Configuration Options

### Content Generation Parameters

#### Tone Options
- `professional`: Business and formal contexts
- `casual`: Relaxed, conversational style
- `academic`: Scholarly and research-focused
- `conversational`: Friendly and approachable
- `authoritative`: Expert and confident
- `neutral`: Balanced and objective

#### Length Options
- `short`: 200-400 words
- `medium`: 400-800 words
- `long`: 800-1200 words
- `extensive`: 1200+ words

#### Audience Options
- `general`: General public
- `expert`: Industry professionals
- `beginner`: Newcomers to the topic
- `business`: Business professionals
- `academic`: Researchers and scholars

#### Categories
- `breaking_news`: Urgent news updates
- `technology`: Tech and innovation
- `business`: Market and finance
- `health`: Medical and wellness
- `sports`: Sports and athletics
- `science`: Research and discovery
- `entertainment`: Media and culture

## 🔧 Advanced Usage

### Custom Content Templates

```typescript
import { AIContentService } from '@/lib/ai-content';

const customTemplate = {
  structure: "Lead paragraph, supporting details, expert quotes, conclusion",
  tone: "investigative",
  focusAreas: ["data analysis", "expert opinions", "future implications"],
  requiredElements: ["statistics", "quotes", "call to action"]
};

const service = new AIContentService();
// Use custom template in generation...
```

### Batch Processing

```typescript
const topics = [
  'AI in healthcare',
  'Renewable energy trends', 
  'Space exploration updates'
];

const articles = await Promise.all(
  topics.map(topic => generateNewsArticle({
    topic,
    category: 'science',
    keywords: [topic.toLowerCase()],
    tone: 'professional',
    length: 'medium',
    audience: 'general'
  }))
);
```

### Error Handling

```typescript
import { AIContentError } from '@/lib/ai-content';

try {
  const content = await generateNewsArticle(request);
} catch (error) {
  if (error instanceof AIContentError) {
    console.log('AI Error:', error.message);
    console.log('Error Code:', error.code);
    
    switch (error.code) {
      case 'VALIDATION_ERROR':
        // Handle validation issues
        break;
      case 'OPENAI_ERROR':
        // Handle OpenAI API issues
        break;
      case 'CONTENT_GENERATION_ERROR':
        // Handle content generation issues
        break;
    }
  }
}
```

## 📊 Performance Considerations

### Rate Limiting
The service includes built-in rate limiting to respect OpenAI's API limits:
- Automatic retry with exponential backoff
- Request queuing for high-volume usage
- Error handling for rate limit exceeded

### Caching
Consider implementing caching for:
- Generated content (avoid regenerating identical requests)
- Quality analysis results
- Plagiarism check results
- SEO optimization suggestions

### Cost Optimization
- Use appropriate content lengths to minimize token usage
- Cache results when possible
- Batch similar requests
- Monitor API usage and costs

## 🧪 Testing

### Unit Testing Example

```typescript
import { analyzeContentQuality, generateHeadline } from '@/lib/ai-content';

describe('AI Content Service', () => {
  test('analyzes content quality correctly', () => {
    const content = 'This is a well-written article with good structure.';
    const quality = analyzeContentQuality(content);
    
    expect(quality.overall).toBeGreaterThan(0);
    expect(quality.readability).toBeDefined();
    expect(quality.details.contentLength).toBe(9);
  });

  test('generates headlines', async () => {
    const headline = await generateHeadline(
      'Test topic',
      'technology',
      ['test']
    );
    
    expect(headline).toBeTruthy();
    expect(typeof headline).toBe('string');
  });
});
```

### Integration Testing

```typescript
// Test full workflow
const article = await generateNewsArticle({
  topic: 'Test Article Generation',
  category: 'technology',
  keywords: ['test', 'article'],
  tone: 'professional',
  length: 'short',
  audience: 'general'
});

const quality = analyzeContentQuality(article.content, article.seoData);
const social = await generateSocialSnippets(
  { title: article.title, summary: article.summary, category: { name: 'technology' } },
  article.content
);

expect(quality.overall).toBeGreaterThan(50);
expect(social.twitter.text.length).toBeLessThanOrEqual(280);
```

## 🔒 Security Considerations

### API Key Management
- Store OpenAI API keys securely in environment variables
- Rotate keys regularly
- Monitor API usage for unusual patterns
- Implement proper access controls

### Content Validation
- Always validate generated content before publishing
- Implement human review for sensitive topics
- Use fact-checking for critical information
- Monitor for bias and inappropriate content

### Data Privacy
- Don't send sensitive information to OpenAI
- Implement proper data retention policies
- Consider local processing for sensitive content
- Follow GDPR and other privacy regulations

## 🚀 Deployment

### Production Checklist

1. **Environment Setup**
   - [ ] Set `OPENAI_API_KEY` in production environment
   - [ ] Configure proper error logging
   - [ ] Set up monitoring and alerts
   - [ ] Implement rate limiting

2. **Performance Optimization**
   - [ ] Enable content caching
   - [ ] Implement request queuing
   - [ ] Set up CDN for static content
   - [ ] Monitor API costs and usage

3. **Quality Assurance**
   - [ ] Test all content generation scenarios
   - [ ] Validate SEO optimization results
   - [ ] Verify social media snippet generation
   - [ ] Test error handling and recovery

4. **Monitoring**
   - [ ] Set up API usage monitoring
   - [ ] Track content quality metrics
   - [ ] Monitor error rates and types
   - [ ] Alert on unusual patterns or failures

## 📈 Roadmap

### Planned Features
- Custom AI model training for domain-specific content
- Multi-language content generation
- Real-time fact-checking integration
- Advanced plagiarism detection with external APIs
- Content personalization based on user preferences
- A/B testing for generated content variations

### Integration Opportunities
- WordPress plugin for automatic content generation
- Slack/Discord bots for quick content creation
- Browser extension for content analysis
- Mobile app for on-the-go content generation

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run tests: `npm test`
5. Start development server: `npm run dev`

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Document all public APIs
- Use proper error handling
- Implement proper logging

## 📄 License

This AI Content Service is part of the news website project and follows the same licensing terms.

---

*For more examples and detailed API documentation, see the demo component at `src/components/ui/AIContentDemo.tsx`*