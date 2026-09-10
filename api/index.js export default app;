import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '請上傳食物圖片' });
        }

        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: imageBase64
                    }
                },
                {
                    text: '請分析圖片中的食物，估算其熱量與三大營養成分，並用繁體中文回覆。'
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        food_name: { type: Type.STRING, description: '食物名稱' },
                        estimated_weight: { type: Type.STRING, description: '預估重量（如：200g）' },
                        calories: { type: Type.NUMBER, description: '熱量 (kcal)' },
                        protein_g: { type: Type.NUMBER, description: '蛋白質 (g)' },
                        carbs_g: { type: Type.NUMBER, description: '碳水化合物 (g)' },
                        fat_g: { type: Type.NUMBER, description: '脂肪 (g)' },
                        advice: { type: Type.STRING, description: '飲食或健身建議' }
                    },
                    required: ['food_name', 'estimated_weight', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'advice']
                }
            }
        });

        const nutritionData = JSON.parse(response.text);
        
        return res.json({
            success: true,
            data: nutritionData
        });

    } catch (error) {
        console.error('AI 分析失敗：', error);
        return res.status(500).json({ error: '伺服器分析失敗，請稍後再試' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
