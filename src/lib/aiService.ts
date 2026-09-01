import { AIConfig } from '../types'

export interface AIQuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export class AIService {
  /**
   * Strip HTML tags to extract readable plain text from note content
   */
  private static extractPlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Test connection to configured AI provider
   */
  static async testConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
    if (!config || config.provider === 'off') {
      return { success: false, message: 'La IA se encuentra desactivada.' }
    }

    try {
      if (config.provider === 'gemini') {
        if (!config.geminiApiKey?.trim()) {
          return { success: false, message: 'Falta ingresar la API Key de Google Gemini.' }
        }
        const model = config.geminiModel || 'gemini-2.0-flash'
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey.trim()}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responde solo "OK"' }] }],
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          return { success: false, message: err.error?.message || `Error HTTP ${res.status}` }
        }
        return { success: true, message: `Conexión exitosa con Google Gemini (${model})` }
      }

      if (config.provider === 'openai') {
        if (!config.openaiApiKey?.trim()) {
          return { success: false, message: 'Falta ingresar la API Key de OpenAI.' }
        }
        const baseUrl = config.openaiBaseUrl?.trim() || 'https://api.openai.com/v1'
        const model = config.openaiModel || 'gpt-4o-mini'
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.openaiApiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Responde solo "OK"' }],
            max_tokens: 10,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          return { success: false, message: err.error?.message || `Error HTTP ${res.status}` }
        }
        return { success: true, message: `Conexión exitosa con OpenAI (${model})` }
      }

      if (config.provider === 'ollama') {
        const endpoint = (config.ollamaEndpoint?.trim() || 'http://localhost:11434').replace(/\/$/, '')
        const models = await this.getOllamaModels(endpoint)
        const names = models.map((m) => m.name)
        return {
          success: true,
          message: `Servidor Ollama conectado. Modelos detectados: ${names.slice(0, 4).join(', ') || 'Ninguno descargado'}`,
        }
      }

      return { success: false, message: 'Proveedor de IA no reconocido.' }
    } catch (e: any) {
      return { success: false, message: `Error de conexión: ${e.message || 'Verifica tu red o servidor'}` }
    }
  }

  /**
   * Fetch all locally downloaded and installed models from Ollama
   */
  static async getOllamaModels(
    endpoint = 'http://localhost:11434'
  ): Promise<Array<{ name: string; size?: number; modifiedAt?: string }>> {
    const cleanEndpoint = endpoint.trim().replace(/\/$/, '')
    try {
      const res = await fetch(`${cleanEndpoint}/api/tags`, { method: 'GET' })
      if (!res.ok) {
        throw new Error(`Error ${res.status}: Servidor Ollama no respondió`)
      }
      const data = await res.json()
      if (Array.isArray(data.models)) {
        return data.models.map((m: any) => ({
          name: m.name,
          size: m.size,
          modifiedAt: m.modified_at,
        }))
      }
      return []
    } catch (err: any) {
      throw new Error(err.message || 'No se pudo conectar al servidor Ollama local.')
    }
  }

  /**
   * Generate an intelligent summary of a note
   */
  static async generateSummary(
    noteContent: string,
    noteTitle: string,
    config: AIConfig
  ): Promise<string> {
    const plainText = this.extractPlainText(noteContent)
    if (!plainText || plainText.length < 20) {
      throw new Error('El apunte contiene muy poco texto para generar un resumen significativo.')
    }

    if (!config || config.provider === 'off') {
      throw new Error('Debes configurar un proveedor de IA (Gemini, OpenAI u Ollama) en Ajustes (⚙️).')
    }

    const systemPrompt = `Eres Sumire AI, un tutor y asistente académico universitario de alto nivel.
Tu tarea es analizar el apunte de clase titulado "${noteTitle}" y generar un resumen estructurado, elegante y pedagógico en formato Markdown en español.

INSTRUCCIÓN ESTRICTA: NO incluyas saludos ni frases de presentación como "Hola, soy Sumire AI...". Comienza DIRECTAMENTE con el contenido.

Formato requerido:
### 📌 Idea Principal
Una síntesis precisa de 1 o 2 oraciones del concepto central.

### 🔑 Puntos Clave y Definiciones
* **[Concepto Clave]:** Explicación clara y concisa.
* **[Regla o Fórmula]:** Detalle técnico o paso crucial.
* **[Impacto]:** Por qué ocurre o cómo se calcula.

### 💡 Aplicación Práctica y Tips de Examen
Breve recomendación de cómo se evalúa este tema o su utilidad en la vida real.`

    const userPrompt = `Aquí está el contenido del apunte:\n\n${plainText.slice(0, 12000)}`

    // 1. Google Gemini API
    if (config.provider === 'gemini') {
      if (!config.geminiApiKey?.trim()) {
        throw new Error('Ingresa tu API Key de Google Gemini en Ajustes (⚙️).')
      }
      const model = config.geminiModel || 'gemini-2.0-flash'
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey.trim()}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Error en Google Gemini (${res.status})`)
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error('Gemini no devolvió ninguna respuesta.')
      return text.trim()
    }

    // 2. OpenAI / DeepSeek / Compatible API
    if (config.provider === 'openai') {
      if (!config.openaiApiKey?.trim()) {
        throw new Error('Ingresa tu API Key de OpenAI en Ajustes (⚙️).')
      }
      const baseUrl = config.openaiBaseUrl?.trim() || 'https://api.openai.com/v1'
      const model = config.openaiModel || 'gpt-4o-mini'

      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.openaiApiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: 1000,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Error en OpenAI (${res.status})`)
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content
      if (!text) throw new Error('OpenAI no devolvió ninguna respuesta.')
      return text.trim()
    }

    // 3. Ollama Local
    if (config.provider === 'ollama') {
      const endpoint = (config.ollamaEndpoint?.trim() || 'http://localhost:11434').replace(/\/$/, '')
      const model = config.ollamaModel || 'gemma4-e2b-it'

      const res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          system: systemPrompt,
          prompt: userPrompt,
          stream: false,
          options: {
            temperature: 0.4,
          },
        }),
      })

      if (!res.ok) {
        throw new Error('No se pudo comunicar con el servidor Ollama local. Asegúrate de tener Ollama encendido.')
      }

      const data = await res.json()
      if (!data.response) throw new Error('Ollama no devolvió texto de respuesta.')
      return data.response.trim()
    }

    throw new Error('Proveedor de IA no configurado.')
  }
}
