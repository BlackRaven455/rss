import express, { Request, Response } from 'express';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import path from 'path';

// --- НАСТРОЙКИ ---
const PORT = 3000;
// Вставьте сюда ваш ключ или используйте process.env.GEMINI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';


const app = express();
const parser = new Parser();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));


const RSS_SOURCES: Record<string, string[]> = {
    "technology": [
        "https://www.theverge.com/rss/index.xml",
        "http://feeds.arstechnica.com/arstechnica/index"
    ],
    "science": [
        "https://www.sciencedaily.com/rss/top/science.xml",
        "https://phys.org/rss-feed/"
    ],
    "business": [
        "http://feeds.feedburner.com/TechCrunch/",
        "https://www.cnbc.com/id/10001147/device/rss/rss.html"
    ]
};

// Интерфейс новости
interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    category: string;
    tags?: string[];
}


async function generateTags(title: string): Promise<string[]> {
    try {
        const prompt = `Analyze this news headline and return exactly 3 keywords/tags as a JSON array of strings. Do not write anything else. Headline: "${title}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();


        const cleanText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Error:", error);
        return ["News", "General"];
    }
}

// --- API ENDPOINT ---
app.post('/api/news', async (req: Request, res: Response) => {
    const { categories } = req.body as { categories: string[] };

    if (!categories || categories.length === 0) {
        res.status(400).json({ error: "Выберите хотя бы одну категорию" });
        return;
    }

    let allNews: NewsItem[] = [];

    console.log(`Запрос категорий: ${categories.join(', ')}`);


    try {

        const feedPromises = categories.flatMap(cat => {
            const urls = RSS_SOURCES[cat] || [];
            return urls.map(async (url) => {
                try {
                    const feed = await parser.parseURL(url);
                    return feed.items.slice(0, 5).map(item => ({
                        title: item.title || "No title",
                        link: item.link || "#",
                        pubDate: item.pubDate || "",
                        category: cat
                    }));
                } catch (e) {
                    console.error(`Ошибка RSS ${url}:`, e);
                    return [];
                }
            });
        });

        const results = await Promise.all(feedPromises);
        allNews = results.flat();

        allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());


        const newsToProcess = allNews.slice(0, 15);


        const finalNews = await Promise.all(newsToProcess.map(async (item) => {
            const tags = await generateTags(item.title);
            return { ...item, tags };
        }));

        res.json(finalNews);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка сервера при получении новостей" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});