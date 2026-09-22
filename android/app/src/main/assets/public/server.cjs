var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasGeminiKey: !!process.env.GEMINI_API_KEY });
});
app.post("/api/gemini/suggest-outfit", async (req, res) => {
  try {
    const { occasion, weather, items, notes, personName, styleType } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Falling back to local smart styling algorithm."
      });
    }
    const itemsSummary = (items || []).map((it) => ({
      id: it.id,
      name: it.name || "Unnamed Item",
      category: it.category,
      section: it.sectionName,
      subSection: it.subSectionName,
      color: it.color,
      brand: it.brand,
      condition: it.condition,
      wearCount: it.wearCount,
      lastWornDate: it.lastWornDate,
      location: it.location
    }));
    const stylePreferenceNote = styleType === "FEMALE" ? "The user prefers FEMALE / Women's styling (focus on feminine silhouettes, dresses, blouses, jewelry, sarees, heels, handbag coordination, and flattering cuts)." : styleType === "MALE" ? "The user prefers MALE / Men's styling (focus on tailored shirts, blazers, trousers, outerwear, loafers/sneakers, watches, and sharp structured cuts)." : "The user prefers Versatile / Unisex styling.";
    const prompt = `You are a world-class personal fashion stylist and wardrobe consultant.
The user is picking an outfit from their virtual wardrobe for:
- Person: ${personName || "User"}
- Styling Preference: ${stylePreferenceNote}
- Occasion: ${occasion || "Casual day"}
- Weather/Temperature: ${weather || "Mild"}
- Additional Notes/Mood: ${notes || "Comfortable and stylish"}

Here is the current catalog of wardrobe items owned by the user:
${JSON.stringify(itemsSummary, null, 2)}

Please analyze this wardrobe according to the user's styling preference (${styleType || "FEMALE"}) and formulate 2-3 distinct outfit combinations.
For each outfit, pick exact item IDs from the list provided (e.g. top, bottom/dress, layer/jacket, footwear, accessories).
Explain why the colors, textures, occasion appropriateness, and weather compatibility work well together, and provide styling tips (e.g. how to tuck, accessorize, or layer).

Respond ONLY with valid JSON conforming to this structure:
{
  "suggestions": [
    {
      "outfitTitle": "string (e.g., Casual Friday Smart Chic)",
      "vibe": "string",
      "selectedItemIds": ["id1", "id2", "..."],
      "whyItWorks": "string",
      "stylingTips": "string",
      "colorHarmony": "string"
    }
  ],
  "generalWardrobeAdvice": "string"
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/gemini/suggest-outfit:", error);
    return res.status(500).json({ error: error.message || "Failed to generate outfit suggestions" });
  }
});
app.post("/api/gemini/ai-sections", async (req, res) => {
  try {
    const { prompt: userPrompt, isFamily } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }
    const systemPrompt = `You are a closet organization expert.
The user wants to generate wardrobe sections and sub-sections for their ${isFamily ? "family wardrobe (up to 15 sections)" : "individual wardrobe (up to 10 sections)"}.
User request / context: "${userPrompt}"

Generate realistic, helpful sections and appropriate sub-sections.
For example:
- Section: "Winter Wear" -> Sub-sections: ["Sweaters & Cardigans", "Shawls & Scarves", "Jackets & Coats", "Thermal Wear", "Beanies & Gloves"]
- Section: "Workwear / Office" -> Sub-sections: ["Formal Shirts", "Trousers & Chinos", "Blazers", "Formal Dresses", "Work Shoes"]

Respond ONLY in valid JSON matching this schema:
{
  "sections": [
    {
      "name": "string (section name)",
      "description": "string",
      "iconName": "string (one of: Shirt, Sparkles, Briefcase, Snowflake, Sun, Compass, Luggage, Gem, Footprints, Heart, Package, Layers, Watch, Shield)",
      "subSections": ["string", "string", "string"]
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/gemini/ai-sections:", error);
    return res.status(500).json({ error: error.message || "Failed to generate sections" });
  }
});
app.post("/api/gemini/analyze-item", async (req, res) => {
  try {
    const { base64Image, mimeType = "image/jpeg", userHint = "" } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key not configured." });
    }
    const parts = [];
    if (base64Image) {
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64
        }
      });
    }
    parts.push({
      text: `Analyze this clothing/accessory item. ${userHint ? `User notes: "${userHint}"` : ""}
Extract and guess the key wardrobe attributes.
Return ONLY JSON in this format:
{
  "suggestedName": "string (e.g. Navy Blue Wool Cardigan or Floral Summer Maxi Dress)",
  "category": "string (e.g. Top, Bottom, Dress, Outerwear, Footwear, Bag, Accessory, Jewelry, Traditional)",
  "color": "string (primary color or color scheme)",
  "suggestedSection": "string (e.g. Winter Wear, Regular Wear, Office Wear, Party Wear)",
  "suggestedSubSection": "string (e.g. Sweaters, T-Shirts, Blazers)",
  "condition": "New" | "Good" | "Vintage" | "Needs Repair" | "Old",
  "careAdvice": "string (e.g. Dry Clean Only, Machine Wash Cold)",
  "tags": ["string", "string"],
  "stylingTip": "string"
}`
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/gemini/analyze-item:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze item" });
  }
});
app.post("/api/gemini/parse-voice-note", async (req, res) => {
  try {
    const { transcript } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key not configured." });
    }
    const prompt = `A user spoke a voice note regarding an item in their wardrobe:
"${transcript}"

Extract actionable information:
- Action type (e.g., "Laundry Reminder", "Repair / Alteration", "Lend to Friend", "Wear on Upcoming Event", "Packing Note", "General Note")
- Summary title
- Reminder description
- Suggested date/time offset (e.g., "in 2 days", "next weekend", or null if not mentioned)

Return JSON:
{
  "actionType": "string",
  "title": "string",
  "reminderText": "string",
  "priority": "Low" | "Medium" | "High"
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/gemini/parse-voice-note:", error);
    return res.status(500).json({ error: error.message || "Failed to parse voice note" });
  }
});
app.post("/api/gemini/stylist-chat", async (req, res) => {
  try {
    const { messages, items = [], styleType = "FEMALE", personName = "User" } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }
    const itemsCatalog = items.slice(0, 50).map((it) => ({
      id: it.id,
      name: it.name || it.category,
      category: it.category,
      color: it.color,
      section: it.sectionName,
      subSection: it.subSectionName,
      brand: it.brand,
      condition: it.condition
    }));
    const stylePersona = styleType === "FEMALE" ? "Female / Women's styling (silhouettes, dresses, tops, jewelry, sarees, lehengas, heels, chic bags, layers)." : styleType === "MALE" ? "Male / Men's styling (tailored cuts, shirts, blazers, trousers, boots, sneakers, watches, accessories)." : "Versatile / Unisex styling.";
    const systemInstruction = `You are "The Wardrobe" AI Personal Stylist & Fashion Advisor.
You are chatting with ${personName}.
Styling Preference: ${stylePersona}

Here is the current catalog of clothing items the user owns in their closet:
${JSON.stringify(itemsCatalog, null, 2)}

Your responsibilities:
1. Answer ANY fashion, outfit matching, color theory, packing, occasion wear, care, or styling questions with warmth, sophistication, and practical expertise.
2. Ground your recommendations directly in the user's uploaded wardrobe items whenever possible. If they ask how to style a piece or what to wear, refer to the specific pieces and colors they already own.
3. Suggest complementary items, shoes, jewelry, or layers to complete the look.
4. If they ask about packing for travel or an event, construct a mini capsule list from their closet.
5. Keep your tone encouraging, articulate, chic, and concise. Format with readable bullet points and bold highlights.`;
    const contents = [];
    const history = Array.isArray(messages) ? messages : [];
    if (history.length === 0) {
      return res.json({ reply: "Hello! I am your personal AI Stylist. How can I help you style your wardrobe today?" });
    }
    for (let i = 0; i < history.length; i++) {
      const msg = history[i];
      contents.push({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content || msg.text || "" }]
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction
      }
    });
    const reply = response.text || "I could not process that request. Please try asking again!";
    return res.json({ reply });
  } catch (error) {
    console.error("Error in /api/gemini/stylist-chat:", error);
    return res.status(500).json({ error: error.message || "Failed to chat with AI Stylist" });
  }
});
app.post("/api/gemini/wardrobe-gap-analysis", async (req, res) => {
  try {
    const { items = [], styleType = "FEMALE", personName = "User" } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }
    const itemsSummary = items.map((it) => ({
      id: it.id,
      name: it.name || it.category,
      category: it.category,
      color: it.color,
      section: it.sectionName,
      subSection: it.subSectionName,
      wearCount: it.wearCount || 0,
      condition: it.condition
    }));
    const prompt = `You are a master wardrobe architect and capsule stylist.
Analyze the user's entire wardrobe catalog (${itemsSummary.length} pieces) for ${personName} with style persona: ${styleType}.

User's items:
${JSON.stringify(itemsSummary, null, 2)}

Analyze:
1. Wardrobe balance: Proportion of tops, bottoms, dresses/ethnic, outerwear, footwear, accessories.
2. Versatility score (1-100) based on how easily these pieces mix-and-match.
3. Identify 3 to 4 specific "Missing Capsule Staples" that would unlock 10+ new outfits if added.
4. Color palette strengths and missing base neutral or accent shades.
5. Actionable advice on getting the most out of their current pieces.

Respond ONLY with valid JSON matching this schema:
{
  "versatilityScore": number,
  "summary": "string",
  "categoryBalance": [
    {
      "category": "string",
      "count": number,
      "status": "Balanced" | "Needs Core Staples" | "Over-represented" | "Missing"
    }
  ],
  "missingStaples": [
    {
      "pieceName": "string",
      "category": "string",
      "suggestedColor": "string",
      "whyNeeded": "string",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "colorPaletteAdvice": "string",
  "capsuleTips": [
    "string",
    "string",
    "string"
  ]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error in /api/gemini/wardrobe-gap-analysis:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze wardrobe gaps" });
  }
});
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(import_path.default.join(process.cwd(), "public", "manifest.json"));
});
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(import_path.default.join(process.cwd(), "public", "sw.js"));
});
app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Wardrobe server running on http://localhost:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
