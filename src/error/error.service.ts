import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as path from 'path';

@Injectable()
export class errorService {
    private translations: Record<string, any> = {};
    private readonly logger = new Logger(errorService.name); 

    constructor() {
        this.loadTranslations();
    }

    private loadTranslations(lang: string = 'en') {
        try {
            const filePath = path.join(__dirname, `err.json`); 
            const fileContent = readFileSync(filePath, 'utf-8');
            this.translations[lang] = JSON.parse(fileContent);
        } catch (error) {
            this.logger.error(`Error loading ${lang} translations:`, error);
            
            
            this.translations[lang] = {
                "DEFAULT_ERROR": "An unknown error occurred."
            };
        }
    }

    get(key: string, lang: string = 'en'): string {
        return this.translations[lang]?.[key] || this.translations['en']?.["DEFAULT_ERROR"] || key;
    }
}
