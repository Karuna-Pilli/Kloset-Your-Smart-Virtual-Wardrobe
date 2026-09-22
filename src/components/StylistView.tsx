import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Calendar,
  Layers,
  Sparkle,
  Shirt,
  Send,
  RefreshCw,
  BookmarkCheck,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  User,
  Settings2,
  MessageSquare,
  BarChart3,
  Bot,
  ShoppingBag,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  Tag,
  Palette,
  Flame,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import {
  WardrobeItem,
  WardrobeSection,
  OutfitSuggestion,
  FamilyMember,
  UserProfile,
} from '../types';
import { geminiService } from '../services/geminiService';
import { getActiveFashionDeals } from '../data/fashionDealsData';

interface StylistViewProps {
  items: WardrobeItem[];
  sections: WardrobeSection[];
  familyMembers: FamilyMember[];
  activePersonId: string;
  onSelectItem: (item: WardrobeItem) => void;
  preselectedItem?: WardrobeItem | null;
  profile?: UserProfile;
  onOpenStyleProfile?: () => void;
  onOpenFashionDeals?: () => void;
}

const OCCASIONS = [
  'Wedding Reception',
  'Formal Office Presentation',
  'Casual Weekend Brunch',
  'Diwali / Traditional Festive Party',
  'Romantic Dinner Date',
  'Airport / Long Travel Flight',
  'Cocktail Night Out',
  'Summer Beach Vacation',
  'Winter Mountain Getaway',
  'Art Gallery / Cultural Gathering',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const StylistView: React.FC<StylistViewProps> = ({
  items,
  sections,
  familyMembers,
  activePersonId,
  onSelectItem,
  preselectedItem,
  profile,
  onOpenStyleProfile,
  onOpenFashionDeals,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'outfits' | 'chat' | 'gaps' | 'trends'>('outfits');

  // Outfit Generator State
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [customOccasion, setCustomOccasion] = useState('');
  const [weather, setWeather] = useState('Pleasant & Sunny (24°C / 75°F)');
  const [styleGoal, setStyleGoal] = useState('Sophisticated, memorable and comfortable');
  const [specificPieceId, setSpecificPieceId] = useState<string>(preselectedItem?.id || '');
  const [activeStyleType, setActiveStyleType] = useState<'FEMALE' | 'MALE' | 'ALL'>(
    profile?.preferredStyleType || 'FEMALE'
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<OutfitSuggestion[]>([]);

  // Chat Agent State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${profile?.name || 'there'}! I am your AI Wardrobe Stylist. I have access to your virtual closet (${items.length} items logged). Ask me anything—from how to style a specific piece, to packing capsules, color matching, or outfit ideas for any upcoming event!`,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Gap Analysis State
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [isGapLoading, setIsGapLoading] = useState(false);

  // Filter items for person
  const personItems = items.filter(
    (i) => activePersonId === 'all' || i.personId === activePersonId
  );

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleGenerateOutfits = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (personItems.length === 0) {
      alert('Please upload items to your wardrobe first to generate styled looks.');
      return;
    }

    setIsLoadingAI(true);
    try {
      const activeOccasion = customOccasion.trim() || occasion;
      const results = await geminiService.generateOutfitSuggestions(
        personItems,
        activeOccasion,
        weather,
        styleGoal,
        specificPieceId ? personItems.find((p) => p.id === specificPieceId) : undefined,
        activeStyleType
      );
      setSuggestions(results);
    } catch (err) {
      console.error(err);
      alert('Failed to generate outfit combinations. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSaveOutfit = (outfit: OutfitSuggestion) => {
    if (!savedOutfits.some((s) => s.id === outfit.id)) {
      setSavedOutfits((prev) => [...prev, outfit]);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput.trim();
    if (!textToSend || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsChatLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await geminiService.chatWithStylist({
        messages: historyPayload,
        items: personItems,
        styleType: activeStyleType,
        personName: profile?.name || 'User',
      });

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          text: 'I ran into a temporary issue retrieving styling insights. Please ask again in a moment!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRunGapAnalysis = async () => {
    if (personItems.length === 0) {
      alert('Please upload items to your wardrobe first to analyze closet gaps.');
      return;
    }
    setIsGapLoading(true);
    try {
      const data = await geminiService.analyzeWardrobeGaps({
        items: personItems,
        styleType: activeStyleType,
        personName: profile?.name || 'User',
      });
      setGapAnalysis(data);
    } catch (err) {
      console.error(err);
      alert('Could not complete gap analysis. Please try again.');
    } finally {
      setIsGapLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Chic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF0EB] via-[#F6DFD7] to-[#EFAFA0]/40 text-[#5B6E48] p-6 sm:p-7 border-2 border-[#E8A892]/60 shadow-md card-hover-luxury">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#DFA995]/40 blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#D8957F] text-white border border-[#C89452] flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFF7F4] animate-pulse-subtle" /> Gemini AI Stylist & Atelier
              </span>
              <button
                type="button"
                onClick={onOpenStyleProfile}
                className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#39402D] border border-[#ECDACF] hover:border-[#C89452] shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Click to edit styling persona & preferred name"
              >
                <span>Persona:</span>
                <span className="text-[#C89452] uppercase font-extrabold">
                  {activeStyleType === 'FEMALE'
                    ? '♀ Female Styling'
                    : activeStyleType === 'MALE'
                    ? '♂ Male Styling'
                    : '⚲ Versatile Styling'}
                </span>
                <Settings2 className="w-3 h-3 text-stone-400" />
              </button>
            </div>
            <h1
              className="text-xl sm:text-2xl font-extrabold text-[#4F603D] font-serif tracking-tight mt-1.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              AI Fashion Stylist & Wardrobe Intelligence
            </h1>
            <p className="text-xs text-[#5B6E48] mt-1 max-w-xl font-medium">
              Create complete outfits, chat directly with your personal fashion advisor, or scan your closet for missing capsule staples.
            </p>
          </div>

          {/* Persona Switcher Quick Control */}
          <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-2xl border border-[#E8C8BC] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveStyleType('FEMALE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStyleType === 'FEMALE'
                  ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ♀ Female
            </button>
            <button
              type="button"
              onClick={() => setActiveStyleType('MALE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStyleType === 'MALE'
                  ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ♂ Male
            </button>
            <button
              type="button"
              onClick={() => setActiveStyleType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStyleType === 'ALL'
                  ? 'bg-[#39402D] text-[#F0CAAF] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Versatile
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 border-t border-[#E8A892]/40 pt-3 overflow-x-auto no-scrollbar scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('outfits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'outfits'
                ? 'bg-[#39402D] text-[#F0CAAF] shadow-xs'
                : 'bg-white/70 text-stone-700 hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C89452]" />
            <span>Outfit Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-[#39402D] text-[#F0CAAF] shadow-xs'
                : 'bg-white/70 text-stone-700 hover:bg-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#C89452]" />
            <span>AI Stylist Chat Agent</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#C89452] text-white">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('gaps');
              if (!gapAnalysis && !isGapLoading) {
                handleRunGapAnalysis();
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'gaps'
                ? 'bg-[#39402D] text-[#F0CAAF] shadow-xs'
                : 'bg-white/70 text-stone-700 hover:bg-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#C89452]" />
            <span>Wardrobe Gap & Capsule Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'trends'
                ? 'bg-[#39402D] text-[#F0CAAF] shadow-xs'
                : 'bg-white/70 text-stone-700 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C89452]" />
            <span>Seasonal Trends & Drops</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#D8957F] text-white">
              Hot
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: OUTFIT GENERATOR */}
      {activeTab === 'outfits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left: Input Form & Occasion Selection */}
          <div className="lg:col-span-4 space-y-4">
            <form
              onSubmit={handleGenerateOutfits}
              className="p-5 bg-white rounded-3xl border-2 border-[#E8C8BC] shadow-xs space-y-4 text-xs card-hover-luxury"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#5B6E48] uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-display">
                  <Sparkle className="w-3.5 h-3.5 text-[#C89452]" />
                  <span>Event & Styling Context</span>
                </h3>
              </div>

              {/* Select Pre-defined Occasion */}
              <div>
                <label className="block font-bold text-[#5B6E48] mb-1">Occasion / Event</label>
                <select
                  value={occasion}
                  onChange={(e) => {
                    setOccasion(e.target.value);
                    setCustomOccasion('');
                  }}
                  className="w-full p-2.5 bg-[#FAF4F0] border border-[#E8C8BC] rounded-xl outline-none focus:border-[#C89452] font-semibold text-stone-800"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Or custom occasion */}
              <div>
                <label className="block font-bold text-[#5B6E48] mb-1">
                  Or Type Custom Occasion
                </label>
                <input
                  type="text"
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  placeholder="e.g. Sangeet evening in Udaipur, board meeting..."
                  className="w-full p-2.5 bg-[#FAF4F0] border border-[#E8C8BC] rounded-xl outline-none focus:border-[#C89452] text-stone-800 font-medium"
                />
              </div>

              {/* Weather / Temperature */}
              <div>
                <label className="block font-bold text-[#5B6E48] mb-1">Expected Weather</label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="e.g. Rainy 18°C, Hot Summer 34°C, Chilly Evening"
                  className="w-full p-2.5 bg-[#FAF4F0] border border-[#E8C8BC] rounded-xl outline-none focus:border-[#C89452] text-stone-800 font-medium"
                />
              </div>

              {/* Specific Anchor Item */}
              <div>
                <label className="block font-bold text-[#5B6E48] mb-1">
                  Anchor Specific Item <span className="font-normal text-stone-400">(Optional)</span>
                </label>
                <select
                  value={specificPieceId}
                  onChange={(e) => setSpecificPieceId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF4F0] border border-[#E8C8BC] rounded-xl outline-none focus:border-[#C89452] text-stone-800 font-medium"
                >
                  <option value="">-- Mix & Match Any Pieces --</option>
                  {personItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || `${item.category} (${item.color || 'Piece'})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aesthetic Goal */}
              <div>
                <label className="block font-bold text-[#5B6E48] mb-1">Styling Vibe / Mood</label>
                <input
                  type="text"
                  value={styleGoal}
                  onChange={(e) => setStyleGoal(e.target.value)}
                  placeholder="e.g. Minimalist elegance, bold colors, relaxed chic"
                  className="w-full p-2.5 bg-[#FAF4F0] border border-[#E8C8BC] rounded-xl outline-none focus:border-[#C89452] text-stone-800 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoadingAI}
                className="w-full py-3 bg-[#D8957F] hover:bg-[#C7826C] disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 border border-[#C89452] cursor-pointer"
              >
                {isLoadingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Curating Wardrobe Outfits...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate Styled Combinations</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-4 bg-[#FAF0EB] rounded-2xl border border-[#E8C8BC] text-xs text-[#5B6E48] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-[#D8957F]">
                <Clock className="w-3.5 h-3.5 text-[#C89452]" />
                <span>Smart Event Memory</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#5B6E48]">
                The AI reviews your logged wear dates and color pairings to avoid repeating identical looks across consecutive gatherings!
              </p>
            </div>
          </div>

          {/* Right: Curated Outfits Results */}
          <div className="lg:col-span-8 space-y-4">
            {suggestions.length === 0 && !isLoadingAI ? (
              <div className="p-12 text-center bg-[#FAF4F0] rounded-3xl border-2 border-dashed border-[#E8C8BC] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F6DFD7] text-[#C89452] flex items-center justify-center mx-auto border border-[#E8C8BC]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Ready to find the perfect look for your next event
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Select your occasion on the left and click <strong>"Generate Styled Combinations"</strong>. The AI will cross-reference your uploaded pieces to create cohesive, complete looks.
                </p>
                <button
                  type="button"
                  onClick={() => handleGenerateOutfits()}
                  className="px-5 py-2.5 bg-[#5B6E48] hover:bg-[#4F603D] text-white text-xs font-bold rounded-xl shadow-xs border border-[#C89452] cursor-pointer"
                >
                  Try Instant Recommendation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#4F603D]">
                    {suggestions.length} Curated Outfit Ideas
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleGenerateOutfits()}
                    disabled={isLoadingAI}
                    className="text-xs font-bold text-[#D8957F] hover:text-[#C7826C] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
                    <span>Regenerate New Styles</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {suggestions.map((outfit, idx) => (
                    <div
                      key={outfit.id || idx}
                      className="p-5 bg-white rounded-3xl border-2 border-[#E8C8BC] shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-[#FAF0EB] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-[#D8957F] text-white border border-[#C89452] text-[10px] font-bold rounded-md uppercase">
                              Option {idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-[#4F603D]">{outfit.title}</h4>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{outfit.description}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveOutfit(outfit)}
                          className="px-3 py-1.5 bg-[#F6DFD7] hover:bg-[#F0CFC4] text-[#4F603D] rounded-xl text-xs font-bold border border-[#E8C8BC] flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#C89452]" />
                          <span>Save Look</span>
                        </button>
                      </div>

                      {/* Matched Wardrobe Items Grid */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E48] mb-2">
                          Pieces In This Outfit
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {outfit.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => onSelectItem(item)}
                              className="p-2.5 bg-[#FAF4F0] hover:bg-[#F6DFD7]/60 rounded-2xl border border-[#E8C8BC] transition-colors cursor-pointer group flex flex-col justify-between"
                            >
                              <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-1.5 border border-[#E8C8BC]/50">
                                <img
                                  src={item.images[0]}
                                  alt={item.name || 'Piece'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-[#D8957F] uppercase block">
                                  {item.category}
                                </span>
                                <div className="text-xs font-bold text-stone-900 truncate">
                                  {item.name || 'Unnamed piece'}
                                </div>
                                <div className="text-[10px] text-stone-500 truncate">
                                  📍 {item.location || 'Closet'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Styling Tip */}
                      {outfit.stylingTips && (
                        <div className="p-3 bg-[#FAF0EB] rounded-2xl border border-[#E8C8BC] text-xs text-[#5B6E48] flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-[#C89452] shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-[#4F603D]">Stylist Advice: </strong>
                            <span>{outfit.stylingTips}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI STYLIST CHAT AGENT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border-2 border-[#E8C8BC] shadow-sm overflow-hidden flex flex-col h-[650px] animate-fade-in">
          {/* Chat Header */}
          <div className="p-4 bg-[#FAF0EB] border-b border-[#E8C8BC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#39402D] text-[#F0CAAF] flex items-center justify-center border border-[#C89452] shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-stone-900">Personal AI Wardrobe Stylist</h3>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Closet-Connected
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Grounded in your <strong>{personItems.length} wardrobe items</strong> & {activeStyleType} aesthetic
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: `msg_${Date.now()}`,
                    role: 'model',
                    text: `Fresh session started! Ask me how to pair any clothes in your closet, plan travel packing, or coordinate accessories.`,
                    timestamp: new Date(),
                  },
                ]);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 font-bold px-2.5 py-1 bg-white rounded-xl border border-[#ECDACF] shadow-2xs cursor-pointer"
            >
              Clear Chat
            </button>
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="p-2.5 bg-[#FAF4F0] border-b border-[#E8C8BC]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 shrink-0 pl-1">
              Try asking:
            </span>
            {[
              'What should I wear for a semi-formal dinner tonight?',
              'How can I style my tops for a rainy day?',
              'Suggest a 3-day travel packing capsule from my closet',
              'Which accessories match my favorite statement piece?',
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isChatLoading}
                className="px-3 py-1 bg-white hover:bg-[#F6DFD7] text-stone-700 hover:text-[#39402D] rounded-full text-[11px] font-medium border border-[#E8C8BC] shrink-0 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-[#FFFDFB] to-[#FAF4F0]/40">
            {messages.map((msg) => {
              const isAI = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAI
                        ? 'bg-[#39402D] text-[#F0CAAF] border border-[#C89452]'
                        : 'bg-[#D8957F] text-white'
                    }`}
                  >
                    {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isAI
                        ? 'bg-white text-stone-800 border border-[#E8C8BC]'
                        : 'bg-[#39402D] text-[#FFF7F4]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-[9px] mt-2 font-mono ${
                        isAI ? 'text-stone-400' : 'text-[#F0CAAF]/80'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex gap-3 mr-auto max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-[#39402D] text-[#F0CAAF] flex items-center justify-center shrink-0 border border-[#C89452]">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-[#E8C8BC] text-xs text-stone-600 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C89452]" />
                  <span>Reviewing your closet catalog & crafting advice...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#E8C8BC] flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about styling, occasions, packing, or wardrobe pairings..."
              className="flex-1 px-4 py-2.5 bg-[#FAF4F0] border border-[#E8C8BC] rounded-2xl text-xs outline-none focus:border-[#C89452] text-stone-800 font-medium"
              disabled={isChatLoading}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2.5 bg-[#39402D] hover:bg-[#485339] disabled:opacity-40 text-[#F0CAAF] rounded-2xl border border-[#C89452] transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: WARDROBE GAP & CAPSULE ANALYSIS */}
      {activeTab === 'gaps' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Banner */}
          <div className="p-4 sm:p-6 bg-white rounded-3xl border-2 border-[#E8C8BC] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F6DFD7] text-[#39402D] border border-[#E8C8BC]">
                  Capsule Intelligence
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {personItems.length} Total Closet Pieces Analyzed
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#4F603D]">Wardrobe Balance & Gap Analyzer</h2>
              <p className="text-xs text-stone-600 max-w-xl">
                Discover what essential foundational pieces are missing from your closet to maximize outfit permutations and eliminate style dilemmas.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunGapAnalysis}
              disabled={isGapLoading}
              className="px-5 py-2.5 bg-[#39402D] hover:bg-[#485339] disabled:opacity-50 text-[#F0CAAF] text-xs font-bold rounded-2xl shadow-xs border border-[#C89452] flex items-center gap-2 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isGapLoading ? 'animate-spin' : ''}`} />
              <span>{isGapLoading ? 'Analyzing Closet Structure...' : 'Re-Run Gap Audit'}</span>
            </button>
          </div>

          {gapAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Score & Breakdown */}
              <div className="lg:col-span-5 space-y-4">
                {/* Score Card */}
                <div className="p-5 bg-gradient-to-br from-[#FAF0EB] to-[#F6DFD7] rounded-3xl border-2 border-[#E8C8BC] shadow-xs text-center space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B6E48]">
                    Closet Versatility Index
                  </div>
                  <div className="text-4xl font-extrabold text-[#39402D] font-serif">
                    {gapAnalysis.versatilityScore || 80}
                    <span className="text-sm font-sans font-normal text-stone-500"> / 100</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed max-w-sm mx-auto">
                    {gapAnalysis.summary}
                  </p>
                </div>

                {/* Category Balance */}
                <div className="p-5 bg-white rounded-3xl border-2 border-[#E8C8BC] shadow-xs space-y-3">
                  <h3 className="font-bold text-xs text-[#5B6E48] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#C89452]" />
                    <span>Category Distribution</span>
                  </h3>
                  <div className="space-y-2">
                    {(gapAnalysis.categoryBalance || []).map((cat: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-[#FAF4F0] rounded-xl border border-[#E8C8BC]/50 text-xs"
                      >
                        <span className="font-bold text-stone-800">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white rounded-md font-mono text-[11px] font-bold text-stone-600 border border-[#ECDACF]">
                            {cat.count} items
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              cat.status === 'Balanced'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cat.status === 'Needs Core Staples' || cat.status === 'Missing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {cat.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Palette Insights */}
                {gapAnalysis.colorPaletteAdvice && (
                  <div className="p-4 bg-[#FAF0EB] rounded-2xl border border-[#E8C8BC] text-xs text-[#5B6E48] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-[#D8957F]">
                      <Palette className="w-3.5 h-3.5 text-[#C89452]" />
                      <span>Palette Harmony Tip</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#5B6E48]">
                      {gapAnalysis.colorPaletteAdvice}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Missing Core Staples Recommendations */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 bg-white rounded-3xl border-2 border-[#E8C8BC] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-[#5B6E48] uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#C89452]" />
                      <span>Top Missing Staples (High-Impact Additions)</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {(gapAnalysis.missingStaples || []).map((staple: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#FAF4F0] rounded-2xl border border-[#E8C8BC] space-y-2 hover:border-[#C89452] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#39402D] text-[#F0CAAF] text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h4 className="font-extrabold text-sm text-stone-900">
                                {staple.pieceName}
                              </h4>
                            </div>
                            <span className="text-[10px] font-bold text-[#D8957F] uppercase mt-0.5 block pl-7">
                              {staple.category} • Suggested: {staple.suggestedColor}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0 ${
                              staple.priority === 'High'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {staple.priority} Impact
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 pl-7 leading-relaxed">
                          {staple.whyNeeded}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capsule Building Rules */}
                <div className="p-5 bg-[#FAF0EB] rounded-3xl border-2 border-[#E8C8BC] shadow-xs space-y-3">
                  <h3 className="font-bold text-xs text-[#5B6E48] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#C89452]" />
                    <span>Stylist Golden Rules for Your Capsule</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#5B6E48]">
                    {(gapAnalysis.capsuleTips || []).map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#C89452] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#FAF4F0] rounded-3xl border-2 border-dashed border-[#E8C8BC] space-y-3">
              <BarChart3 className="w-8 h-8 text-[#C89452] mx-auto opacity-70" />
              <p className="text-xs font-bold text-stone-700">Audit your closet composition</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Click below to let Gemini analyze your tops-to-bottoms ratios, color balance, and identify missing pieces.
              </p>
              <button
                type="button"
                onClick={handleRunGapAnalysis}
                disabled={isGapLoading}
                className="mt-2 px-5 py-2.5 bg-[#39402D] text-[#F0CAAF] rounded-xl text-xs font-bold shadow-xs hover:bg-[#485339] inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C89452]" />
                <span>{isGapLoading ? 'Analyzing...' : 'Run Wardrobe Gap Audit'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SEASONAL TRENDS & STYLE FORECASTING */}
      {activeTab === 'trends' && (
        <div className="space-y-6 animate-fade-in pb-12">
          {/* Editorial Trend Forecast Banner */}
          <div className="bg-gradient-to-r from-[#39402D] via-[#464F38] to-[#2B3022] text-[#FAF4F0] p-4 sm:p-7 rounded-3xl border border-[#C89452]/40 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#C89452] text-white text-[10px] font-extrabold uppercase tracking-wider">
                  2025 Seasonal Forecast
                </span>
                <span className="text-xs text-[#F0CAAF] font-medium flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#D8957F]" />
                  Curated by KLOSET AI Stylist
                </span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Seasonal Fashion Trends & Aesthetics
              </h2>
              <p className="text-xs sm:text-sm text-[#F0CAAF]/90 leading-relaxed">
                Discover the latest trending silhouettes, key color palettes, and curated fashion drops from top stores. Mix these trends with your current wardrobe pieces to elevate your daily style without overbuying.
              </p>
              {onOpenFashionDeals && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenFashionDeals}
                    className="px-4 py-2 bg-[#C89452] hover:bg-[#B88342] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Explore Daily Trending Store Drops</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Core Aesthetic Forecast Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C89452]" />
                <span>Trending Aesthetic Forecasts</span>
              </h3>
              <span className="text-xs text-stone-500 font-medium">Updated for current season</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trend 1: Warm Earth & Terracotta */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C89452] bg-[#FAF2EC] px-2.5 py-1 rounded-lg border border-[#ECDACF]">
                    Aesthetic 01
                  </span>
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    High Popularity
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    Warm Earth & Coastal Terracotta
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Unstructured linen shirts, rust relaxed trousers, and sand-toned outerwear. Pairs naturally with warm leather slip-ons and woven tote bags.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Recommended Palette
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C89452] border border-stone-300 shadow-2xs" title="#C89452 Warm Ochre" />
                    <span className="w-6 h-6 rounded-full bg-[#D8957F] border border-stone-300 shadow-2xs" title="#D8957F Terracotta" />
                    <span className="w-6 h-6 rounded-full bg-[#F0CAAF] border border-stone-300 shadow-2xs" title="#F0CAAF Sand Beige" />
                    <span className="w-6 h-6 rounded-full bg-[#5B6E48] border border-stone-300 shadow-2xs" title="#5B6E48 Olive Moss" />
                  </div>
                </div>
              </div>

              {/* Trend 2: Modern Quiet Luxury */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                    Aesthetic 02
                  </span>
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    Timeless
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    Modern Tailored Quiet Luxury
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Double-pleated wide trousers, clean monochrome silk shirts, structured blazers, and minimalist gold accent jewelry.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Recommended Palette
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1C1917] border border-stone-300 shadow-2xs" title="#1C1917 Deep Onyx" />
                    <span className="w-6 h-6 rounded-full bg-[#78716C] border border-stone-300 shadow-2xs" title="#78716C Warm Stone" />
                    <span className="w-6 h-6 rounded-full bg-[#E7E5E4] border border-stone-300 shadow-2xs" title="#E7E5E4 Bone White" />
                    <span className="w-6 h-6 rounded-full bg-[#39402D] border border-stone-300 shadow-2xs" title="#39402D Deep Forest" />
                  </div>
                </div>
              </div>

              {/* Trend 3: Contemporary Festive & Indie Fusion */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Aesthetic 03
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Festive Favorite
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    Contemporary Festive & Indie Fusion
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Short Chanderi kurtas paired with structured denim, pre-draped organza sarees, and tailored bandhgalas over crisp white trainers.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Recommended Palette
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#831843] border border-stone-300 shadow-2xs" title="Deep Berry Plum" />
                    <span className="w-6 h-6 rounded-full bg-[#B45309] border border-stone-300 shadow-2xs" title="Marigold Mustard" />
                    <span className="w-6 h-6 rounded-full bg-[#065F46] border border-stone-300 shadow-2xs" title="Emerald Green" />
                    <span className="w-6 h-6 rounded-full bg-[#F59E0B] border border-stone-300 shadow-2xs" title="Warm Gold" />
                  </div>
                </div>
              </div>

              {/* Trend 4: Elevated Athleisure & Street Minimalism */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    Aesthetic 04
                  </span>
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    Everyday Wear
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    Elevated Athleisure & Street Minimalism
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Heavyweight drop-shoulder t-shirts, tailored parachute trousers, vintage running sneakers, and sleek nylon sling bags.
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Recommended Palette
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0F172A] border border-stone-300 shadow-2xs" title="Midnight Navy" />
                    <span className="w-6 h-6 rounded-full bg-[#64748B] border border-stone-300 shadow-2xs" title="Slate Grey" />
                    <span className="w-6 h-6 rounded-full bg-[#E2E8F0] border border-stone-300 shadow-2xs" title="Cloud Mist" />
                    <span className="w-6 h-6 rounded-full bg-[#D97706] border border-stone-300 shadow-2xs" title="Amber Accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Curated Trending Partner Deals Drop */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Curated Trending Drops (Myntra, Nykaa, Amazon, Ajio)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Handpicked style picks aligned with current fashion forecasts.
                </p>
              </div>

              {onOpenFashionDeals && (
                <button
                  type="button"
                  onClick={onOpenFashionDeals}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <span>View All Deals</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getActiveFashionDeals().slice(0, 6).map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden flex flex-col hover:border-[#C89452]/50 hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-white/95 text-stone-800 border border-stone-200 shadow-2xs">
                        {deal.brand}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-600 text-white shadow-xs">
                        {deal.discountPercent}% OFF
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#C89452]">
                        {deal.category}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1 mt-0.5">
                        {deal.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {deal.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div>
                        <span className="text-sm font-extrabold text-stone-900">
                          ₹{deal.discountedPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-400 line-through ml-1.5">
                          ₹{deal.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <a
                        href={deal.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#39402D] hover:bg-[#2B3022] text-[#F0CAAF] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <span>Shop Drop</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
