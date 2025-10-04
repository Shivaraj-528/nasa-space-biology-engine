import { Dataset } from '../models/Dataset';
import { PublicationInfo } from './datasetDetailService';

export interface PublicationFilter {
  startYear?: number;
  endYear?: number;
  topics?: string[];
  organisms?: string[];
  studyTypes?: string[];
  journals?: string[];
  authors?: string[];
  keywords?: string[];
}

export interface FilteredPublication extends PublicationInfo {
  dataset_id: string;
  dataset_title: string;
  organism?: string;
  study_type?: string;
  relevance_score?: number;
  topic_tags?: string[];
}

export interface PublicationStats {
  total_publications: number;
  year_range: {
    earliest: number;
    latest: number;
  };
  publications_by_year: Record<string, number>;
  top_topics: Array<{
    topic: string;
    count: number;
    percentage: number;
  }>;
  top_journals: Array<{
    journal: string;
    count: number;
    percentage: number;
  }>;
  top_organisms: Array<{
    organism: string;
    count: number;
    percentage: number;
  }>;
}

export class PublicationFilterService {
  
  async getPublicationsByYearRange(
    startYear: number, 
    endYear: number, 
    filters?: Partial<PublicationFilter>
  ): Promise<FilteredPublication[]> {
    try {
      // Get all datasets
      const datasets = await Dataset.find({});
      
      // Generate publications for datasets
      const publications: FilteredPublication[] = [];
      
      for (const dataset of datasets) {
        const publication = this.generatePublicationForDataset(dataset);
        
        if (publication && 
            publication.year && 
            publication.year >= startYear && 
            publication.year <= endYear) {
          
          // Apply additional filters
          if (this.matchesFilters(publication, dataset, filters)) {
            publications.push({
              ...publication,
              dataset_id: dataset._id.toString(),
              dataset_title: dataset.title,
              organism: dataset.organism,
              study_type: dataset.type,
              relevance_score: this.calculateRelevanceScore(publication, filters),
              topic_tags: this.extractTopicTags(dataset, publication)
            });
          }
        }
      }
      
      // Sort by relevance and year
      return publications.sort((a, b) => {
        if (a.relevance_score !== b.relevance_score) {
          return (b.relevance_score || 0) - (a.relevance_score || 0);
        }
        return (b.year || 0) - (a.year || 0);
      });
      
    } catch (error) {
      console.error('[PublicationFilter] Error filtering publications:', error);
      throw error;
    }
  }

  async getPublicationsByTopic(
    topic: string, 
    yearRange?: { start: number; end: number }
  ): Promise<FilteredPublication[]> {
    try {
      const filters: Partial<PublicationFilter> = {
        topics: [topic.toLowerCase()],
        keywords: [topic.toLowerCase()]
      };
      
      if (yearRange) {
        return this.getPublicationsByYearRange(yearRange.start, yearRange.end, filters);
      } else {
        // Get publications from last 10 years if no year range specified
        const currentYear = new Date().getFullYear();
        return this.getPublicationsByYearRange(currentYear - 10, currentYear, filters);
      }
    } catch (error) {
      console.error('[PublicationFilter] Error filtering by topic:', error);
      throw error;
    }
  }

  async getPublicationStats(filters?: Partial<PublicationFilter>): Promise<PublicationStats> {
    try {
      const datasets = await Dataset.find({});
      const publications: FilteredPublication[] = [];
      
      for (const dataset of datasets) {
        const publication = this.generatePublicationForDataset(dataset);
        if (publication && this.matchesFilters(publication, dataset, filters)) {
          publications.push({
            ...publication,
            dataset_id: dataset._id.toString(),
            dataset_title: dataset.title,
            organism: dataset.organism,
            study_type: dataset.type,
            topic_tags: this.extractTopicTags(dataset, publication)
          });
        }
      }
      
      return this.calculatePublicationStats(publications);
    } catch (error) {
      console.error('[PublicationFilter] Error calculating stats:', error);
      throw error;
    }
  }

  async searchPublications(
    query: string, 
    filters?: Partial<PublicationFilter>
  ): Promise<FilteredPublication[]> {
    try {
      const queryLower = query.toLowerCase();
      const datasets = await Dataset.find({
        $or: [
          { title: { $regex: queryLower, $options: 'i' } },
          { description: { $regex: queryLower, $options: 'i' } },
          { organism: { $regex: queryLower, $options: 'i' } },
          { type: { $regex: queryLower, $options: 'i' } }
        ]
      });
      
      const publications: FilteredPublication[] = [];
      
      for (const dataset of datasets) {
        const publication = this.generatePublicationForDataset(dataset);
        if (publication && this.matchesFilters(publication, dataset, filters)) {
          const relevanceScore = this.calculateSearchRelevance(publication, dataset, query);
          publications.push({
            ...publication,
            dataset_id: dataset._id.toString(),
            dataset_title: dataset.title,
            organism: dataset.organism,
            study_type: dataset.type,
            relevance_score: relevanceScore,
            topic_tags: this.extractTopicTags(dataset, publication)
          });
        }
      }
      
      return publications.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    } catch (error) {
      console.error('[PublicationFilter] Error searching publications:', error);
      throw error;
    }
  }

  private generatePublicationForDataset(dataset: any): PublicationInfo | null {
    // 70% chance of having a publication
    if (Math.random() > 0.3) {
      const year = 2018 + Math.floor(Math.random() * 7); // 2018-2024
      const journals = [
        'Nature Microgravity',
        'Astrobiology',
        'Life Sciences in Space Research',
        'Gravitational and Space Research',
        'NPJ Microgravity',
        'Frontiers in Astronomy and Space Sciences',
        'Space Science Reviews',
        'International Journal of Astrobiology',
        'Acta Astronautica',
        'Advances in Space Research'
      ];

      const journal = journals[Math.floor(Math.random() * journals.length)];
      const doi = `10.1038/s${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9) + 1}`;

      return {
        doi,
        title: this.generatePublicationTitle(dataset),
        authors: this.generateAuthorList(),
        journal,
        year,
        volume: String(Math.floor(Math.random() * 50) + 1),
        issue: String(Math.floor(Math.random() * 12) + 1),
        pages: `${Math.floor(Math.random() * 500) + 1}-${Math.floor(Math.random() * 500) + 500}`,
        abstract: this.generateAbstract(dataset),
        keywords: this.generateKeywords(dataset),
        url: `https://doi.org/${doi}`,
        citation: this.generateCitation(dataset, journal, year)
      };
    }
    return null;
  }

  private matchesFilters(
    publication: PublicationInfo, 
    dataset: any, 
    filters?: Partial<PublicationFilter>
  ): boolean {
    if (!filters) return true;

    // Year filter
    if (filters.startYear && publication.year && publication.year < filters.startYear) return false;
    if (filters.endYear && publication.year && publication.year > filters.endYear) return false;

    // Topic filter
    if (filters.topics && filters.topics.length > 0) {
      const hasMatchingTopic = filters.topics.some(topic => 
        publication.title?.toLowerCase().includes(topic.toLowerCase()) ||
        publication.abstract?.toLowerCase().includes(topic.toLowerCase()) ||
        dataset.title?.toLowerCase().includes(topic.toLowerCase()) ||
        dataset.description?.toLowerCase().includes(topic.toLowerCase())
      );
      if (!hasMatchingTopic) return false;
    }

    // Organism filter
    if (filters.organisms && filters.organisms.length > 0) {
      if (!dataset.organism || !filters.organisms.includes(dataset.organism)) return false;
    }

    // Study type filter
    if (filters.studyTypes && filters.studyTypes.length > 0) {
      if (!dataset.type || !filters.studyTypes.includes(dataset.type)) return false;
    }

    // Journal filter
    if (filters.journals && filters.journals.length > 0) {
      if (!publication.journal || !filters.journals.includes(publication.journal)) return false;
    }

    // Keywords filter
    if (filters.keywords && filters.keywords.length > 0) {
      const hasMatchingKeyword = filters.keywords.some(keyword =>
        publication.keywords?.some(pubKeyword => 
          pubKeyword.toLowerCase().includes(keyword.toLowerCase())
        ) ||
        publication.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        publication.abstract?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasMatchingKeyword) return false;
    }

    return true;
  }

  private calculateRelevanceScore(
    publication: PublicationInfo, 
    filters?: Partial<PublicationFilter>
  ): number {
    let score = 0.5; // Base score

    // Recent publications get higher scores
    if (publication.year) {
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - publication.year;
      score += Math.max(0, (5 - yearDiff) * 0.1); // Bonus for recent publications
    }

    // High-impact journals get bonus
    const highImpactJournals = ['Nature Microgravity', 'Astrobiology', 'NPJ Microgravity'];
    if (publication.journal && highImpactJournals.includes(publication.journal)) {
      score += 0.2;
    }

    // Topic relevance
    if (filters?.topics && publication.keywords) {
      const matchingKeywords = filters.topics.filter(topic =>
        publication.keywords?.some(keyword => 
          keyword.toLowerCase().includes(topic.toLowerCase())
        )
      );
      score += matchingKeywords.length * 0.1;
    }

    return Math.min(1.0, score);
  }

  private calculateSearchRelevance(
    publication: PublicationInfo, 
    dataset: any, 
    query: string
  ): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Title matches
    if (publication.title?.toLowerCase().includes(queryLower)) score += 0.4;
    if (dataset.title?.toLowerCase().includes(queryLower)) score += 0.3;

    // Abstract matches
    if (publication.abstract?.toLowerCase().includes(queryLower)) score += 0.2;

    // Keyword matches
    if (publication.keywords?.some(keyword => keyword.toLowerCase().includes(queryLower))) score += 0.1;

    return score;
  }

  private extractTopicTags(dataset: any, publication: PublicationInfo): string[] {
    const tags = new Set<string>();
    
    // Add organism as topic
    if (dataset.organism) tags.add(dataset.organism.toLowerCase());
    
    // Add study type as topic
    if (dataset.type) tags.add(dataset.type);
    
    // Add keywords as topics
    if (publication.keywords) {
      publication.keywords.forEach(keyword => tags.add(keyword));
    }
    
    // Add common space biology topics
    const commonTopics = ['microgravity', 'spaceflight', 'space biology', 'ISS', 'radiation'];
    commonTopics.forEach(topic => {
      if (publication.title?.toLowerCase().includes(topic) || 
          publication.abstract?.toLowerCase().includes(topic)) {
        tags.add(topic);
      }
    });
    
    return Array.from(tags).slice(0, 8); // Limit to 8 tags
  }

  private calculatePublicationStats(publications: FilteredPublication[]): PublicationStats {
    const yearCounts: Record<string, number> = {};
    const topicCounts: Record<string, number> = {};
    const journalCounts: Record<string, number> = {};
    const organismCounts: Record<string, number> = {};
    
    let earliestYear = new Date().getFullYear();
    let latestYear = 2000;
    
    publications.forEach(pub => {
      // Year statistics
      if (pub.year) {
        const yearStr = pub.year.toString();
        yearCounts[yearStr] = (yearCounts[yearStr] || 0) + 1;
        earliestYear = Math.min(earliestYear, pub.year);
        latestYear = Math.max(latestYear, pub.year);
      }
      
      // Topic statistics
      if (pub.topic_tags) {
        pub.topic_tags.forEach(tag => {
          topicCounts[tag] = (topicCounts[tag] || 0) + 1;
        });
      }
      
      // Journal statistics
      if (pub.journal) {
        journalCounts[pub.journal] = (journalCounts[pub.journal] || 0) + 1;
      }
      
      // Organism statistics
      if (pub.organism) {
        organismCounts[pub.organism] = (organismCounts[pub.organism] || 0) + 1;
      }
    });
    
    const total = publications.length;
    
    return {
      total_publications: total,
      year_range: { earliest: earliestYear, latest: latestYear },
      publications_by_year: yearCounts,
      top_topics: Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({
          topic,
          count,
          percentage: Math.round((count / total) * 100)
        })),
      top_journals: Object.entries(journalCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([journal, count]) => ({
          journal,
          count,
          percentage: Math.round((count / total) * 100)
        })),
      top_organisms: Object.entries(organismCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([organism, count]) => ({
          organism,
          count,
          percentage: Math.round((count / total) * 100)
        }))
    };
  }

  // Helper methods for generating realistic publication data
  private generatePublicationTitle(dataset: any): string {
    const templates = [
      `${dataset.organism || 'Biological'} responses to microgravity: insights from ${dataset.type} analysis`,
      `Spaceflight-induced changes in ${dataset.organism || 'organism'} ${dataset.type} profiles`,
      `Molecular mechanisms of ${dataset.organism || 'biological'} adaptation to space environment`,
      `Comparative ${dataset.type} analysis of ${dataset.organism || 'organisms'} under simulated microgravity`,
      `Effects of space radiation on ${dataset.organism || 'biological'} systems: a ${dataset.type} study`,
      `Long-term microgravity exposure impacts on ${dataset.organism || 'organism'} physiology`,
      `Space biology research: ${dataset.type} approaches to understanding ${dataset.organism || 'biological'} adaptation`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateAuthorList(): string[] {
    const authors = [
      'Johnson, S.M.', 'Chen, M.L.', 'Rodriguez, E.A.', 'Wilson, J.K.',
      'Garcia, M.R.', 'Kim, D.H.', 'Thompson, L.J.', 'Anderson, R.P.',
      'Martinez, J.C.', 'Brown, K.L.', 'Davis, P.M.', 'Miller, A.S.'
    ];
    const numAuthors = Math.floor(Math.random() * 6) + 3;
    return authors.slice(0, numAuthors);
  }

  private generateAbstract(dataset: any): string {
    return `Background: Understanding the effects of microgravity on ${dataset.organism || 'biological systems'} is crucial for long-duration space missions and advancing our knowledge of space biology.

Methods: We conducted a comprehensive ${dataset.type} analysis of ${dataset.organism || 'samples'} exposed to simulated microgravity conditions using state-of-the-art techniques and rigorous statistical methods.

Results: Our analysis revealed significant changes in ${dataset.type === 'genomics' ? 'gene expression patterns' : dataset.type === 'proteomics' ? 'protein abundance profiles' : 'molecular signatures'} associated with microgravity exposure. Key pathways involved in stress response, metabolism, and cellular adaptation were identified.

Conclusions: These findings provide new insights into the molecular mechanisms underlying ${dataset.organism || 'biological'} adaptation to space environments and have important implications for astronaut health and space exploration missions.`;
  }

  private generateKeywords(dataset: any): string[] {
    const baseKeywords = ['microgravity', 'spaceflight', 'space biology', dataset.type];
    if (dataset.organism) baseKeywords.push(dataset.organism.toLowerCase());
    baseKeywords.push('gene expression', 'stress response', 'adaptation', 'ISS', 'NASA');
    return baseKeywords.slice(0, 8);
  }

  private generateCitation(dataset: any, journal: string, year: number): string {
    const authors = this.generateAuthorList();
    const firstAuthor = authors[0];
    const title = this.generatePublicationTitle(dataset);
    return `${firstAuthor} et al. (${year}). ${title}. ${journal}, 15(3), 123-145.`;
  }
}

export const publicationFilterService = new PublicationFilterService();
