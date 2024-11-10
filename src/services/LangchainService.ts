import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { Cell } from '../types';

interface EditDecision {
  editType: 'full' | 'single';
  cellIndex?: number;
}

export class LangchainService {
  private model: ChatOpenAI;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o',
      temperature: 0.7,
    });
  }

  async analyzeEditIntent(userMessage: string, cells: Cell[]): Promise<EditDecision> {
    const cellsDescription = cells.map((cell, index) => 
      `Cell ${index + 1}: ${cell.type.toUpperCase()} - ${cell.content.slice(0, 100)}...`
    ).join('\n');

    const response = await this.model.call([
      new SystemMessage(`You are an AI that analyzes user intentions regarding Jupyter notebook editing.
Your task is to determine if the user wants to:
1. Edit the entire notebook
2. Edit a specific cell

Respond with a JSON object in this format:
{
  "editType": "full" or "single",
  "cellIndex": number (only if editType is "single")
}`),
      new HumanMessage(`Notebook contents:
${cellsDescription}

User message: ${userMessage}

Determine if the user wants to edit the entire notebook or a specific cell.`)
    ]);

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse edit intent response:', error);
      return { editType: 'full' };
    }
  }

  async generateNotebookUpdate(
    userMessage: string,
    currentCells: Cell[],
    targetCell?: Cell
  ): Promise<any> {
    const makeAttempt = async (attempt: number): Promise<any> => {
      try {
        const response = await this.model.call([
          new SystemMessage(`You are a Jupyter notebook generator.
Your task is to generate the entire notebook according to the user's request.
- Create a well-structured notebook with logical sections.
- Include detailed markdown comments for explanations and high-quality code where applicable.
- Place all 'pip install' and 'import' statements at the beginning, well-commented.
- Distribute content across cells to avoid overloading or underloading any single cell.
${targetCell ? `Only update Cell ${targetCell.type.toUpperCase()} - ${targetCell.content.slice(0, 100)}... based on the user's request, keeping the rest of the notebook intact.` : ''}

Please ensure your response strictly follows this JSON format:

{
  "chat_answer": "Your explanation here",
  "cells": [
    {
      "type": "code" or "markdown",
      "content": "Cell content"
    }
  ]
}`),
          new HumanMessage(`Current notebook:
${JSON.stringify(currentCells, null, 2)}

User request: ${userMessage}`)
        ]);

        return JSON.parse(response.content);
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < this.maxRetries) {
          return makeAttempt(attempt + 1);
        }
        throw new Error(`Failed to generate notebook update after ${this.maxRetries} attempts`);
      }
    };

    return makeAttempt(1);
  }
}

export const createLangchainService = (apiKey: string): LangchainService => {
  return new LangchainService(apiKey);
};
