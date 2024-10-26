import postmanToMarkdown from '@jatewo/postman-to-markdown';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.POSTMAN_URL;

postmanToMarkdown(url, './API_DOCUMENTAION.md');