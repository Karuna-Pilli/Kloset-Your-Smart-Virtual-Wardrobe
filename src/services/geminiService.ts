import { WardrobeItem, OutfitSuggestion } from '../types';

export const geminiService = {
  async generateOutfitSuggestions(
    items: WardrobeItem[],
    occasion: string,
    weather: string,
    styleGoal?: string,
    anchorItem?: WardrobeItem,
    styleType?: 'FEMALE' | 'MALE' | 'ALL'
  ): Promise<OutfitSuggestion[]> {
    const res = await this.suggestOutfits({
      occasion,
      weather,
      items,
      styleType,
      notes: styleGoal ? `${styleGoal}${anchorItem ? `. Must include anchor item: ${anchorItem.name || anchorItem.category}` : ''}` : undefined,
    });

    const suggestions = res.suggestions.map((sug) => {
      // Map selectedItemIds to actual WardrobeItem objects
      const matchedItems = (sug.selectedItemIds || [])
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean) as WardrobeItem[];

      // If anchor item specified and not present, add it
      if (anchorItem && !matchedItems.some((m) => m.id === anchorItem.id)) {
        matchedItems.unshift(anchorItem);
      }

      return {
        ...sug,
        title: sug.outfitTitle || sug.title || 'Curated Ensemble',
        description: sug.whyItWorks || sug.description || 'Harmonious combination of wardrobe staples.',
        items: matchedItems.length > 0 ? matchedItems : items.slice(0, 3),
        styleType: styleType || 'FEMALE',
      };
    });

    return suggestions;
  },

  async suggestOutfits(params: {
    occasion: string;
    weather: string;
    items: WardrobeItem[];
    notes?: string;
    personName?: string;
    styleType?: 'FEMALE' | 'MALE' | 'ALL';
  }): Promise<{ suggestions: OutfitSuggestion[]; generalWardrobeAdvice: string }> {
    try {
      const res = await fetch('/api/gemini/suggest-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Gemini API endpoint failed or unavailable, using smart local outfit pairing algorithm:', e);
      return this.localSmartSuggestOutfits(params);
    }
  },

  async generateSections(promptText: string, isFamily: boolean): Promise<any> {
    try {
      const res = await fetch('/api/gemini/ai-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, isFamily }),
      });
      if (!res.ok) throw new Error('Failed to generate sections');
      return await res.json();
    } catch (e) {
      console.warn('AI section generation fallback:', e);
      return {
        sections: [
          {
            name: `${promptText || 'Custom'} Collection`,
            description: `Curated sections based on ${promptText || 'wardrobe needs'}`,
            iconName: 'Sparkles',
            subSections: ['Primary Essentials', 'Special Occasion Pieces', 'Accessories & Layering'],
          },
        ],
      };
    }
  },

  async analyzeItem(base64Image?: string, userHint?: string): Promise<any> {
    try {
      const res = await fetch('/api/gemini/analyze-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image, userHint }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      return await res.json();
    } catch (e) {
      console.warn('AI item analysis fallback:', e);
      return {
        suggestedName: userHint ? `${userHint}` : 'Curated Wardrobe Piece',
        category: 'Top',
        color: 'Neutral',
        suggestedSection: 'Regular & Casual Wear',
        suggestedSubSection: 'T-Shirts & Tops',
        condition: 'Good',
        careAdvice: 'Gentle wash or professional dry clean.',
        tags: ['Wardrobe Essential'],
        stylingTip: 'Pair with tailored bottoms and neutral shoes for a refined minimalist look.',
      };
    }
  },

  async parseVoiceNote(transcript: string): Promise<any> {
    try {
      const res = await fetch('/api/gemini/parse-voice-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error('Voice parsing failed');
      return await res.json();
    } catch (e) {
      return {
        actionType: 'General Note',
        title: transcript.slice(0, 30) + '...',
        reminderText: transcript,
        priority: 'Medium',
      };
    }
  },

  async chatWithStylist(params: {
    messages: { role: 'user' | 'model' | 'assistant'; text: string }[];
    items: WardrobeItem[];
    styleType?: 'FEMALE' | 'MALE' | 'ALL';
    personName?: string;
  }): Promise<{ reply: string }> {
    try {
      const res = await fetch('/api/gemini/stylist-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Stylist chat API error, fallback:', e);
      return {
        reply: "I'm having trouble connecting to the styling server right now. However, I can recommend pairing your foundational neutral items with one accent color or statement accessory from your closet!",
      };
    }
  },

  async analyzeWardrobeGaps(params: {
    items: WardrobeItem[];
    styleType?: 'FEMALE' | 'MALE' | 'ALL';
    personName?: string;
  }): Promise<any> {
    try {
      const res = await fetch('/api/gemini/wardrobe-gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Wardrobe gap analysis API error, fallback:', e);
      return {
        versatilityScore: 75,
        summary: 'Your wardrobe has a solid foundation. Adding versatile neutral layers and tailored staples will maximize mix-and-match possibilities.',
        categoryBalance: [
          { category: 'Tops', count: params.items.filter(i => i.category === 'Top').length, status: 'Balanced' },
          { category: 'Bottoms', count: params.items.filter(i => i.category === 'Bottom').length, status: 'Balanced' },
          { category: 'Outerwear', count: params.items.filter(i => i.category === 'Outerwear').length, status: 'Needs Core Staples' },
          { category: 'Footwear', count: params.items.filter(i => i.category === 'Footwear').length, status: 'Balanced' },
        ],
        missingStaples: [
          {
            pieceName: 'Tailored Neutral Blazer / Structured Jacket',
            category: 'Outerwear',
            suggestedColor: 'Beige / Charcoal / Camel',
            whyNeeded: 'Instantly elevates casual tees and separates for work, dinner, or smart gatherings.',
            priority: 'High',
          },
          {
            pieceName: 'Crisp White Cotton Shirt',
            category: 'Top',
            suggestedColor: 'Pure White / Soft Ivory',
            whyNeeded: 'The ultimate timeless staple that pairs with denim, trousers, skirts, or underneath sweaters.',
            priority: 'High',
          },
        ],
        colorPaletteAdvice: 'Incorporate complementary earthy neutrals (warm sand, olive, terracotta) to bridge your bold pieces.',
        capsuleTips: [
          'Aim for a 3:1 ratio of tops to bottoms to maximize outfit diversity.',
          'Choose neutral footwear that can transition across both casual and elevated looks.',
          'Accessorize with consistent metal tones (gold or silver) to unify eclectic outfits.',
        ],
      };
    }
  },

  // Fallback intelligent outfit generator combining tops, bottoms, layers, shoes, accessories
  localSmartSuggestOutfits(params: {
    occasion: string;
    weather: string;
    items: WardrobeItem[];
    notes?: string;
  }): { suggestions: OutfitSuggestion[]; generalWardrobeAdvice: string } {
    const { items, occasion, weather } = params;
    const tops = items.filter(i => i.category === 'Top');
    const bottoms = items.filter(i => i.category === 'Bottom');
    const dresses = items.filter(i => i.category === 'Dress' || i.category === 'Traditional / Ethnic');
    const outerwear = items.filter(i => i.category === 'Outerwear');
    const footwear = items.filter(i => i.category === 'Footwear');
    const bags = items.filter(i => i.category === 'Bag');
    const accessories = items.filter(i => i.category === 'Accessory' || i.category === 'Jewelry');

    const suggestions: OutfitSuggestion[] = [];

    // Combination 1: Dress / Ethnic or Top + Bottom + Shoes + Bag
    if (dresses.length > 0) {
      const dress = dresses[0];
      const selected = [dress.id];
      if (footwear[0]) selected.push(footwear[0].id);
      if (bags[0]) selected.push(bags[0].id);
      if (accessories[0]) selected.push(accessories[0].id);
      if (outerwear[0] && (weather.toLowerCase().includes('cold') || weather.toLowerCase().includes('winter') || weather.toLowerCase().includes('mild'))) {
        selected.push(outerwear[0].id);
      }

      suggestions.push({
        id: 'sug_1',
        outfitTitle: `Refined ${occasion || 'Occasion'} Statement Look`,
        vibe: 'Sophisticated, effortlessly elevated',
        selectedItemIds: selected,
        whyItWorks: `Anchored by ${dress.name || 'the primary statement piece'}, complemented harmoniously with matching footwear and accessories for a cohesive silhouette.`,
        stylingTips: 'Keep hair polished and let the primary color tones take center stage.',
        colorHarmony: 'Rich tonal balance with complementary accents',
        occasion,
        weather,
      });
    }

    // Combination 2: Top + Bottom + Outerwear + Accessories
    if (tops.length > 0 && bottoms.length > 0) {
      const top = tops[0];
      const bottom = bottoms[0];
      const selected = [top.id, bottom.id];
      if (outerwear[0]) selected.push(outerwear[0].id);
      if (footwear[0]) selected.push(footwear[0].id);
      if (accessories[0]) selected.push(accessories[0].id);

      suggestions.push({
        id: 'sug_2',
        outfitTitle: `Contemporary Capsule for ${occasion || 'Daily Wear'}`,
        vibe: 'Clean lines, comfortable & modern',
        selectedItemIds: selected,
        whyItWorks: `Pairs the relaxed texture of ${top.name || 'the top'} with structured ${bottom.name || 'bottoms'}, creating visual proportion and versatility.`,
        stylingTips: 'Tuck the front hem slightly and add minimalist leather accents.',
        colorHarmony: 'Subtle high-contrast neutrals',
        occasion,
        weather,
      });
    }

    // Fallback if very few items
    if (suggestions.length === 0 && items.length > 0) {
      suggestions.push({
        id: 'sug_default',
        outfitTitle: 'Essential Wardrobe Pairing',
        vibe: 'Minimalist & Functional',
        selectedItemIds: items.slice(0, 3).map(i => i.id),
        whyItWorks: 'Combining your active wardrobe essentials for balanced day-to-evening wearability.',
        stylingTips: 'Layer thoughtfully according to current temperature.',
        colorHarmony: 'Balanced neutral palette',
        occasion,
        weather,
      });
    }

    return {
      suggestions,
      generalWardrobeAdvice: `For ${occasion || 'your day'}, prioritize breathable layers and versatile staples that allow easy transition from morning to evening.`,
    };
  },
};
