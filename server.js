const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Google Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Lead Magnet AI Endpoint
app.post('/api/generate-demo', async (req, res) => {
    try {
        const { name, whatsapp, businessDescription } = req.body;

        if (!businessDescription) {
            return res.status(400).json({ error: 'La descripción del negocio es requerida.' });
        }

        console.log(`Nuevo lead: ${name} - ${whatsapp}`);
        console.log(`Generando página para: ${businessDescription}`);

        // Define the prompt to generate the HTML
        const prompt = `Actúa como un desarrollador web experto.
Genera una landing page de UNA SOLA PÁGINA (archivo HTML completo con CSS incrustado dentro de <style>) basada en la siguiente descripción del negocio del cliente:

"${businessDescription}"

Requisitos estrictos:
1. Usa colores modernos, profesionales y neutros.
2. Diseño limpio y minimalista.
3. Secciones sugeridas: Hero (título fuerte), Servicios/Acerca de, y Contacto.
4. El HTML debe ser responsive.
5. NO incluyas explicaciones, markdown de bloque de código, ni texto adicional. Solo devuelve el código HTML puro que comienza con <!DOCTYPE html>.`;

        // Call Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 2000,
            }
        });

        let generatedHtml = response.text;
        
        // Clean up markdown code blocks if the model included them
        if (generatedHtml.startsWith('```html')) {
            generatedHtml = generatedHtml.replace(/^```html\n/, '').replace(/\n```$/, '');
        } else if (generatedHtml.startsWith('```')) {
            generatedHtml = generatedHtml.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        res.json({ success: true, html: generatedHtml });
    } catch (error) {
        console.error('Error al generar la página:', error);
        res.status(500).json({ error: 'Error interno al generar la página de prueba.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Servidor de Deiny Page corriendo en http://localhost:${port}`);
});
