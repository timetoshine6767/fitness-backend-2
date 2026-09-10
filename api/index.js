import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '請上傳食物圖片' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const prompt = `請分析這張食物圖片，估算其熱量與三大營養素。
請嚴格只回傳純 JSON 格式資料（不要包含任何 ```json 的 markdown 標記），格式如下：
{
  "food_name": "食物名稱",
  "estimated_weight": "預估重量（例如：250g）",
  "calories": 450,
  "protein_g": 35,
  "carbs_g": 20,
  "fat_g": 15,
  "advice": "一句簡短的健康建議"
}`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // 清理 JSON 字串
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const nutritionData = JSON.parse(cleanJson);

        return res.json({
            success: true,
            data: nutritionData
        });

    } catch (error) {
        console.error('AI 分析失敗：', error);
        return res.status(500).json({ error: '伺服器分析失敗：' + error.message });
    }
});

export default app;
