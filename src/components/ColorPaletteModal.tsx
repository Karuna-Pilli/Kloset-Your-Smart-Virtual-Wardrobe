import React, { useState, useMemo } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Check,
  RefreshCw,
  Sliders,
  Shirt,
  Layers,
  ArrowRight,
  Info,
  Bookmark,
  Share2,
  Copy,
  Zap,
  Eye,
  Shuffle,
  ThumbsUp,
  Search,
  Pipette,
} from 'lucide-react';
import { WardrobeItem } from '../types';
import {
  ColorSwatch,
  COLOR_FAMILIES,
  FASHION_COLORS,
  COLOR_HARMONY_PRESETS,
  HarmonyPreset,
  searchFashionColors,
} from '../data/fashionColors';

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: WardrobeItem[];
}

// Helper to calculate luminance for contrast calculation
function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(1));
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  isOpen,
  onClose,
  items = [],
}) => {
  const [topColor, setTopColor] = useState<ColorSwatch>(
    () => FASHION_COLORS.find(c => c.name === 'Midnight Navy') || FASHION_COLORS[46]
  );
  const [bottomColor, setBottomColor] = useState<ColorSwatch>(
    () => FASHION_COLORS.find(c => c.name === 'Mustard Gold') || FASHION_COLORS[69]
  );
  const [accentColor, setAccentColor] = useState<ColorSwatch>(
    () => FASHION_COLORS.find(c => c.name === 'Soft Ecru / Linen') || FASHION_COLORS[83]
  );
  const [activeSlot, setActiveSlot] = useState<'top' | 'bottom' | 'accent'>('top');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedNote, setCopiedNote] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<
    Array<{ id: string; name: string; topHex: string; bottomHex: string; accentHex: string }>
  >([]);

  if (!isOpen) return null;

  const contrastScore = calculateContrastRatio(topColor.hex, bottomColor.hex);

  const getContrastAssessment = (ratio: number) => {
    if (ratio >= 6.0) {
      return {
        label: 'High Dramatic Contrast',
        badge: 'bg-indigo-100 text-indigo-900 border-indigo-200',
        desc: 'Sharp, distinct boundary between top and bottom. Draws immediate visual attention, elongates proportions, and looks striking in photography.',
      };
    } else if (ratio >= 3.0) {
      return {
        label: 'Balanced Harmonious Contrast',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        desc: 'Ideal everyday sweet spot. Flattering and comfortable to the eye with clear distinction without being harsh.',
      };
    } else {
      return {
        label: 'Subtle Tonal Monochromatic',
        badge: 'bg-amber-100 text-amber-900 border-amber-200',
        desc: 'Sleek, continuous vertical line. Excellent for streamlined aesthetic; elevate with contrasting accessories or textured fabric weave.',
      };
    }
  };

  const assessment = getContrastAssessment(contrastScore);

  const filteredSwatches = searchFashionColors(searchQuery, selectedFamily);

  const handleSelectSwatch = (swatch: ColorSwatch) => {
    if (activeSlot === 'top') {
      setTopColor(swatch);
    } else if (activeSlot === 'bottom') {
      setBottomColor(swatch);
    } else {
      setAccentColor(swatch);
    }
  };

  const handleCustomHexChange = (hex: string) => {
    const customSwatch: ColorSwatch = {
      name: `Custom ${hex.toUpperCase()}`,
      hex,
      family: 'neutral',
      familyLabel: 'Custom',
      keywords: ['custom', hex],
      textDark: getLuminance(hex) > 0.5,
    };
    handleSelectSwatch(customSwatch);
  };

  const handleApplyPreset = (preset: HarmonyPreset) => {
    setTopColor(preset.top);
    setBottomColor(preset.bottom);
    setAccentColor(preset.accent);
  };

  const handleSwapTopBottom = () => {
    const temp = topColor;
    setTopColor(bottomColor);
    setBottomColor(temp);
  };

  const handleRandomize = () => {
    const randomPreset = COLOR_HARMONY_PRESETS[Math.floor(Math.random() * COLOR_HARMONY_PRESETS.length)];
    handleApplyPreset(randomPreset);
  };

  const handleSavePalette = () => {
    const newEntry = {
      id: Date.now().toString(),
      name: `${topColor.name} & ${bottomColor.name}`,
      topHex: topColor.hex,
      bottomHex: bottomColor.hex,
      accentHex: accentColor.hex,
    };
    setSavedPalettes((prev) => [newEntry, ...prev]);
  };

  const handleCopyCodes = () => {
    const text = `Outfit Contrast Match:\n- Top: ${topColor.name} (${topColor.hex})\n- Bottom: ${bottomColor.name} (${bottomColor.hex})\n- Accent: ${accentColor.name} (${accentColor.hex})\n- Contrast Ratio: ${contrastScore}:1 (${assessment.label})`;
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  const currentSlotColor = activeSlot === 'top' ? topColor : activeSlot === 'bottom' ? bottomColor : accentColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2
                className="text-lg font-bold tracking-tight text-white font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Color Palette & Contrast Styling Studio
              </h2>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Explore full-spectrum colors (Yellow, Blue, Purple, Emerald, Lavender, Gold, etc.) and search to test optical contrast.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-50/50 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Visual Outfit Simulator Mannequin */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-800" />
                  <span>Interactive Look Preview</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSwapTopBottom}
                    className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-stone-200 cursor-pointer"
                    title="Invert Top & Bottom Colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Invert</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-stone-200 cursor-pointer"
                    title="Surprise me with a curated palette"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Surprise</span>
                  </button>
                </div>
              </div>

              {/* Outfit Silhouette Preview Box */}
              <div className="relative rounded-2xl p-6 bg-gradient-to-b from-stone-100 to-stone-200/70 border border-stone-200/80 flex flex-col items-center justify-center min-h-[300px] overflow-hidden shadow-inner">
                {/* Accent Background Ring */}
                <div
                  className="absolute w-44 h-44 rounded-full blur-2xl opacity-30 transition-all duration-700 pointer-events-none"
                  style={{ backgroundColor: accentColor.hex }}
                />

                {/* Mannequin Garment Silhouette */}
                <div className="w-48 space-y-2 relative z-10">
                  {/* Top Garment (Shirt / Kurta / Blazer) */}
                  <div
                    onClick={() => setActiveSlot('top')}
                    style={{ backgroundColor: topColor.hex }}
                    className={`h-24 rounded-2xl shadow-md border-2 transition-all duration-300 p-3 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                      activeSlot === 'top' ? 'ring-3 ring-amber-600 border-white scale-102' : 'border-stone-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md backdrop-blur-xs font-bold text-[10px] ${
                          topColor.textDark ? 'text-stone-900 bg-black/10' : 'text-white bg-white/20'
                        }`}
                      >
                        Top / Shirt
                      </span>
                      {activeSlot === 'top' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold drop-shadow-xs block line-clamp-1 ${
                          topColor.textDark ? 'text-stone-900' : 'text-white'
                        }`}
                      >
                        {topColor.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono opacity-80 ${
                          topColor.textDark ? 'text-stone-800' : 'text-stone-200'
                        }`}
                      >
                        {topColor.hex}
                      </span>
                    </div>
                  </div>

                  {/* Belt / Accent Divider */}
                  <div
                    onClick={() => setActiveSlot('accent')}
                    style={{ backgroundColor: accentColor.hex }}
                    className={`h-3.5 rounded-md shadow-xs border transition-all cursor-pointer flex items-center justify-center ${
                      activeSlot === 'accent' ? 'ring-2 ring-amber-600 border-white' : 'border-stone-900/10'
                    }`}
                    title={`Accent / Belt / Scarf: ${accentColor.name}`}
                  >
                    <span
                      className={`text-[8px] font-extrabold uppercase tracking-widest ${
                        accentColor.textDark ? 'text-stone-900' : 'text-white'
                      }`}
                    >
                      Accent / Jewelry
                    </span>
                  </div>

                  {/* Bottom Garment (Trousers / Skirt / Saree) */}
                  <div
                    onClick={() => setActiveSlot('bottom')}
                    style={{ backgroundColor: bottomColor.hex }}
                    className={`h-28 rounded-2xl shadow-md border-2 transition-all duration-300 p-3 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                      activeSlot === 'bottom' ? 'ring-3 ring-amber-600 border-white scale-102' : 'border-stone-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md backdrop-blur-xs font-bold text-[10px] ${
                          bottomColor.textDark ? 'text-stone-900 bg-black/10' : 'text-white bg-white/20'
                        }`}
                      >
                        Bottom / Pants
                      </span>
                      {activeSlot === 'bottom' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold drop-shadow-xs block line-clamp-1 ${
                          bottomColor.textDark ? 'text-stone-900' : 'text-white'
                        }`}
                      >
                        {bottomColor.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono opacity-80 ${
                          bottomColor.textDark ? 'text-stone-800' : 'text-stone-200'
                        }`}
                      >
                        {bottomColor.hex}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contrast Score Meter */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">Contrast Ratio:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-stone-900">{contrastScore}:1</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${assessment.badge}`}>
                      {assessment.label}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">{assessment.desc}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSavePalette}
                  className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Pair</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCodes}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-stone-200 cursor-pointer"
                  title="Copy Hex & Color Details"
                >
                  {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNote ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Full Palette Search, Swatches & Presets */}
            <div className="lg:col-span-7 space-y-5">
              {/* Slot Switcher Pills & Search Header */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs font-bold text-stone-800">
                    Currently Selected Slot:{' '}
                    <strong className="text-amber-900 uppercase font-black tracking-wide">
                      {activeSlot} Garment
                    </strong>
                  </span>
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveSlot('top')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeSlot === 'top' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlot('bottom')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeSlot === 'bottom' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Bottom
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlot('accent')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeSlot === 'accent' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Accent
                    </button>
                  </div>
                </div>

                {/* SEARCH INPUT BAR */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search color name (e.g. Yellow, Royal Blue, Lavender, Purple, Emerald, Gold)..."
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-amber-700 rounded-xl text-xs outline-none text-stone-900 placeholder:text-stone-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Color Family Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {COLOR_FAMILIES.map((fam) => (
                    <button
                      key={fam.id}
                      type="button"
                      onClick={() => setSelectedFamily(fam.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedFamily === fam.id
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {fam.label}
                    </button>
                  ))}
                </div>

                {/* Color Swatch Grid */}
                <div className="max-h-60 overflow-y-auto pr-1">
                  {filteredSwatches.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">
                      No colors found matching &ldquo;{searchQuery}&rdquo;. Try another shade name or use the Custom Color Picker below.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {filteredSwatches.map((swatch) => {
                        const isSelected =
                          (activeSlot === 'top' && topColor.hex.toLowerCase() === swatch.hex.toLowerCase()) ||
                          (activeSlot === 'bottom' && bottomColor.hex.toLowerCase() === swatch.hex.toLowerCase()) ||
                          (activeSlot === 'accent' && accentColor.hex.toLowerCase() === swatch.hex.toLowerCase());

                        return (
                          <button
                            key={swatch.name + swatch.hex}
                            type="button"
                            onClick={() => handleSelectSwatch(swatch)}
                            className={`group relative p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'border-amber-600 ring-2 ring-amber-600 bg-amber-50/60 shadow-xs'
                                : 'border-stone-200 hover:border-amber-300 hover:shadow-2xs bg-white'
                            }`}
                            title={`${swatch.name} (${swatch.hex}) - ${swatch.familyLabel}`}
                          >
                            <div
                              className="w-full aspect-square rounded-lg shadow-2xs border border-stone-900/10 flex items-center justify-center transition-transform group-hover:scale-105"
                              style={{ backgroundColor: swatch.hex }}
                            >
                              {isSelected && (
                                <Check
                                  className={`w-4 h-4 drop-shadow-md stroke-[3] ${
                                    swatch.textDark ? 'text-stone-900' : 'text-white'
                                  }`}
                                />
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-stone-800 line-clamp-1 w-full leading-tight">
                              {swatch.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Color Eyedropper / Hex Input Bar */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={currentSlotColor.hex}
                        onChange={(e) => handleCustomHexChange(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer overflow-hidden opacity-0 absolute inset-0"
                        title="Pick custom color"
                      />
                      <div
                        className="w-8 h-8 rounded-lg border border-stone-300 shadow-2xs flex items-center justify-center cursor-pointer pointer-events-none"
                        style={{ backgroundColor: currentSlotColor.hex }}
                      >
                        <Pipette
                          className={`w-4 h-4 ${
                            currentSlotColor.textDark ? 'text-stone-900' : 'text-white'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">
                        Custom Color Picker
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Pick any custom hex shade for {activeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentSlotColor.hex}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                          handleCustomHexChange(val);
                        }
                      }}
                      placeholder="#000000"
                      className="w-24 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-800 text-center outline-none focus:border-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Master Stylist Harmonious Presets */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Master Stylist Contrast Presets</span>
                  </span>
                  <span className="text-[11px] text-stone-400">Click to apply instant palette</span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {COLOR_HARMONY_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3 bg-stone-50 hover:bg-amber-50/40 rounded-xl border border-stone-200/80 hover:border-amber-400/60 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Dual Swatch Preview Badge */}
                        <div className="flex items-center -space-x-2 shrink-0">
                          <div
                            className="w-7 h-7 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: preset.top.hex }}
                            title={`Top: ${preset.top.name}`}
                          />
                          <div
                            className="w-7 h-7 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: preset.bottom.hex }}
                            title={`Bottom: ${preset.bottom.name}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-stone-900 group-hover:text-amber-900">
                              {preset.name}
                            </h4>
                            <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded text-[9px] font-bold">
                              {preset.mood}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {preset.stylingTip}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100/80 px-2 py-0.8 rounded-lg shrink-0 group-hover:bg-amber-900 group-hover:text-white transition-colors">
                        Apply
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Palettes Section if any */}
              {savedPalettes.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-stone-800">Your Saved Color Combinations</h4>
                  <div className="flex flex-wrap gap-2">
                    {savedPalettes.map((saved) => (
                      <div
                        key={saved.id}
                        onClick={() => {
                          setTopColor({
                            name: 'Saved Top',
                            hex: saved.topHex,
                            family: 'neutral',
                            familyLabel: 'Saved',
                            keywords: ['saved'],
                          });
                          setBottomColor({
                            name: 'Saved Bottom',
                            hex: saved.bottomHex,
                            family: 'neutral',
                            familyLabel: 'Saved',
                            keywords: ['saved'],
                          });
                          setAccentColor({
                            name: 'Saved Accent',
                            hex: saved.accentHex,
                            family: 'neutral',
                            familyLabel: 'Saved',
                            keywords: ['saved'],
                          });
                        }}
                        className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2 text-xs font-semibold hover:border-amber-600 cursor-pointer"
                      >
                        <div className="flex items-center -space-x-1.5">
                          <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: saved.topHex }} />
                          <span className="w-4 h-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: saved.bottomHex }} />
                        </div>
                        <span className="text-stone-800">{saved.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-800" />
            <span>Use this tool before buying or styling outfits to test visual balance.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
