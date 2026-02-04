import { Injectable } from '@nestjs/common';
import { PaperSection } from '../../../../shared/types';

export interface PromptContext {
  agentId: string;
  purpose?: string;
  keywords?: string[];
  retrievedContent?: string[];
  existingSections?: Record<string, string>;
}

@Injectable()
export class PromptTemplatesService {
  private templates: Record<PaperSection, (context: PromptContext) => string> = {
    [PaperSection.TITLE]: (context) => `
Generate a clear, specific, and informative research paper title based on the following context:

Purpose: ${context.purpose || 'Not specified'}
Keywords: ${context.keywords?.join(', ') || 'Not specified'}
Retrieved Content Summary: ${this.summarizeContent(context.retrievedContent)}

Requirements:
- The title should be clear and specific
- It should tell the reader exactly what the study is about
- Keep it concise (typically 10-15 words)
- Avoid vague or overly general terms

Generate only the title, nothing else.
    `.trim(),

    [PaperSection.ABSTRACT]: (context) => `
Generate a comprehensive abstract for a research paper based on the following context:

Purpose: ${context.purpose || 'Not specified'}
Keywords: ${context.keywords?.join(', ') || 'Not specified'}
Title: ${context.existingSections?.title || 'Not available'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- The abstract should be 150-250 words
- Include: purpose, methods, key results, and conclusion
- Write in a clear, concise manner
- Should be self-contained and understandable without reading the full paper

Generate a well-structured abstract.
    `.trim(),

    [PaperSection.KEYWORDS]: (context) => `
Generate 4-6 important keywords for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Abstract: ${context.existingSections?.abstract || 'Not available'}
Purpose: ${context.purpose || 'Not specified'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Select 4-6 important terms related to the study
- These should help others find the paper in databases
- Use standard terminology from the field
- Include both general and specific terms

Generate only the keywords, separated by commas.
    `.trim(),

    [PaperSection.INTRODUCTION]: (context) => `
Generate an introduction section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Purpose: ${context.purpose || 'Not specified'}
Keywords: ${context.keywords?.join(', ') || 'Not specified'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Provide background of the topic
- Explain why the research is important
- State the research problem or question
- Present objectives or hypotheses
- Should flow logically and engage the reader
- Typically 2-3 paragraphs

Generate a comprehensive introduction section.
    `.trim(),

    [PaperSection.LITERATURE_REVIEW]: (context) => `
Generate a literature review section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Introduction: ${context.existingSections?.introduction || 'Not available'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Summarize what previous researchers have done
- Identify gaps in existing research
- Explain how your study fits in
- Organize by themes or chronologically
- Cite relevant sources from the retrieved content
- Should demonstrate understanding of the field

Generate a comprehensive literature review section with proper citations.
    `.trim(),

    [PaperSection.METHODOLOGY]: (context) => `
Generate a methodology section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Purpose: ${context.purpose || 'Not specified'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Describe how the research was conducted
- Include: study design, data collection, tools, sample, and procedures
- Should be detailed enough to replicate the study
- Use clear, precise language
- Organize logically (design, participants, materials, procedure)

Generate a comprehensive methodology section.
    `.trim(),

    [PaperSection.RESULTS]: (context) => `
Generate a results section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Methodology: ${context.existingSections?.methodology || 'Not available'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Present what was found (data, tables, figures, statistics)
- No interpretation here—just facts
- Organize results logically
- Use tables and figures where appropriate
- Report statistical findings clearly
- Should be objective and data-driven

Generate a comprehensive results section with appropriate data presentation.
    `.trim(),

    [PaperSection.DISCUSSION]: (context) => `
Generate a discussion section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Results: ${context.existingSections?.results || 'Not available'}
Literature Review: ${context.existingSections?.literature_review || 'Not available'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Interpret the results
- Explain what the findings mean
- Compare with previous studies
- Discuss implications of the results
- Address limitations
- Should connect results to broader context

Generate a comprehensive discussion section.
    `.trim(),

    [PaperSection.CONCLUSION]: (context) => `
Generate a conclusion section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Abstract: ${context.existingSections?.abstract || 'Not available'}
Discussion: ${context.existingSections?.discussion || 'Not available'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Summarize key findings
- Emphasize the importance of the study
- Discuss limitations
- Suggest directions for future research
- Should be concise and impactful
- Should tie back to the introduction

Generate a comprehensive conclusion section.
    `.trim(),

    [PaperSection.REFERENCES]: (context) => `
Generate a references section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
All Sections: ${JSON.stringify(context.existingSections)}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- List all sources cited in the paper
- Use APA format (or specify if different)
- Include: authors, year, title, journal/book, pages, DOI
- Should be alphabetically ordered
- Follow consistent citation style

Generate a properly formatted references section in APA style.
    `.trim(),

    [PaperSection.APPENDICES]: (context) => `
Generate appendices section for a research paper based on the following context:

Title: ${context.existingSections?.title || 'Not available'}
Methodology: ${context.existingSections?.methodology || 'Not available'}
Retrieved Content: ${this.formatRetrievedContent(context.retrievedContent)}

Requirements:
- Include extra material like questionnaires, raw data, or detailed calculations
- Only include if necessary
- Should supplement but not replace main content
- Label clearly (Appendix A, B, etc.)

Generate appendices if relevant, otherwise indicate that no appendices are needed.
    `.trim(),
  };

  generatePrompt(section: PaperSection, context: PromptContext): string {
    const template = this.templates[section];
    if (!template) {
      throw new Error(`No template found for section: ${section}`);
    }
    return template(context);
  }

  private formatRetrievedContent(content?: string[]): string {
    if (!content || content.length === 0) {
      return 'No retrieved content available.';
    }
    return content
      .slice(0, 10) // Limit to first 10 chunks
      .map((chunk, index) => `[Source ${index + 1}]\n${chunk.substring(0, 500)}...`)
      .join('\n\n');
  }

  private summarizeContent(content?: string[]): string {
    if (!content || content.length === 0) {
      return 'No content available.';
    }
    const totalLength = content.reduce((sum, chunk) => sum + chunk.length, 0);
    return `Retrieved ${content.length} content chunks (total ${totalLength} characters) covering relevant topics.`;
  }
}
