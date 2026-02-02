import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import * as questions from '@/lib/testQuestions';

// Determine the path to the file
const filePath = path.join(process.cwd(), 'lib/testQuestions.ts');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { type, level } = req.query;
        let data = [];

        // Map type/level to export name
        if (type === 'psikotest' && level === 'easy') data = questions.PSIKOTEST_EASY_QUESTIONS;
        else if (type === 'psikotest' && level === 'advanced') data = questions.PSIKOTEST_ADVANCED_QUESTIONS;
        else if (type === 'analogi' && level === 'easy') data = questions.ANALOGY_EASY_QUESTIONS;
        else if (type === 'analogi' && level === 'advanced') data = questions.ANALOGY_ADVANCED_QUESTIONS;
        else if (type === 'tiu' && level === 'easy') data = questions.TIU_EASY_QUESTIONS;
        else if (type === 'tiu' && level === 'advanced') data = questions.TIU_ADVANCED_QUESTIONS;
        else return res.status(400).json({ error: 'Invalid type or level' });

        return res.status(200).json(data);
    }

    if (method === 'POST') {
        const { type, level, questions: newQuestions } = req.body;

        try {
            // Read current file content to preserve imports and interface
            // But actually, simpler to just reconstruct the file since we know the structure perfectly
            // and we have all the data in the imports.

            // Re-construct the file content
            let fileContent = `export interface TestQuestion {
    id: number | string;
    category: string;
    question: string;
    answers: string[];
    correctIndex: number;
    explanation: string;
    timeLimit: number;
}

`;

            const generateSection = (name: string, data: any[]) => {
                return `export const ${name}: TestQuestion[] = ${JSON.stringify(data, null, 4)};\n\n`;
            };

            // Update the target array locally first
            let current_analogy_easy = questions.ANALOGY_EASY_QUESTIONS;
            let current_analogy_adv = questions.ANALOGY_ADVANCED_QUESTIONS;
            let current_tiu_easy = questions.TIU_EASY_QUESTIONS;
            let current_tiu_adv = questions.TIU_ADVANCED_QUESTIONS;
            let current_psiko_easy = questions.PSIKOTEST_EASY_QUESTIONS;
            let current_psiko_adv = questions.PSIKOTEST_ADVANCED_QUESTIONS;

            if (type === 'analogi' && level === 'easy') current_analogy_easy = newQuestions;
            else if (type === 'analogi' && level === 'advanced') current_analogy_adv = newQuestions;
            else if (type === 'tiu' && level === 'easy') current_tiu_easy = newQuestions;
            else if (type === 'tiu' && level === 'advanced') current_tiu_adv = newQuestions;
            else if (type === 'psikotest' && level === 'easy') current_psiko_easy = newQuestions;
            else if (type === 'psikotest' && level === 'advanced') current_psiko_adv = newQuestions;

            fileContent += generateSection('ANALOGY_EASY_QUESTIONS', current_analogy_easy);
            fileContent += generateSection('ANALOGY_ADVANCED_QUESTIONS', current_analogy_adv);
            fileContent += generateSection('TIU_EASY_QUESTIONS', current_tiu_easy);
            fileContent += generateSection('TIU_ADVANCED_QUESTIONS', current_tiu_adv);
            fileContent += generateSection('PSIKOTEST_EASY_QUESTIONS', current_psiko_easy);
            fileContent += generateSection('PSIKOTEST_ADVANCED_QUESTIONS', current_psiko_adv);

            fs.writeFileSync(filePath, fileContent, 'utf8');

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error writing file:', error);
            return res.status(500).json({ error: 'Failed to save to file' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
