export interface ColorSwatch {
  name: string;
  hex: string;
  family:
    | 'brown'
    | 'orange'
    | 'red'
    | 'pink'
    | 'purple'
    | 'blue'
    | 'green'
    | 'yellow'
    | 'neutral'
    | 'metallic';
  familyLabel: string;
  keywords: string[];
  textDark?: boolean;
}

export const COLOR_FAMILIES = [
  { id: 'all', label: 'All Colors' },
  { id: 'brown', label: 'Browns, Tans & Khakis' },
  { id: 'orange', label: 'Rust, Oranges & Corals' },
  { id: 'red', label: 'Maroons, Reds & Burgundies' },
  { id: 'pink', label: 'Pinks, Magentas & Roses' },
  { id: 'purple', label: 'Purples, Violets & Lavenders' },
  { id: 'blue', label: 'Blues, Navies & Teals' },
  { id: 'green', label: 'Greens, Olives & Mints' },
  { id: 'yellow', label: 'Yellows, Mustards & Golds' },
  { id: 'neutral', label: 'Blacks, Greys, Whites & Creams' },
  { id: 'metallic', label: 'Golds, Silvers & Bronzes' },
] as const;

export const FASHION_COLORS: ColorSwatch[] = [
  // ================= BROWNS, TANS & KHAKIS =================
  { name: 'Brown', hex: '#593822', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'true brown', 'classic brown', 'dark brown', 'chocolate'] },
  { name: 'Dark Brown', hex: '#3B2219', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'dark brown', 'deep brown', 'coffee', 'espresso'] },
  { name: 'Chocolate Brown', hex: '#4A2E18', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'chocolate', 'cocoa', 'rich brown'] },
  { name: 'Espresso Coffee', hex: '#2B1B17', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'espresso', 'coffee', 'black brown', 'mocha'] },
  { name: 'Chestnut Brown', hex: '#7B3F00', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'chestnut', 'red brown', 'warm brown'] },
  { name: 'Coffee Brown', hex: '#4B3621', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'coffee', 'cafe', 'deep'] },
  { name: 'Mocha Brown', hex: '#6F4E37', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'mocha', 'latte', 'warm'] },
  { name: 'Warm Camel', hex: '#C19A6B', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'camel', 'tan', 'coat', 'neutral'], textDark: true },
  { name: 'Tan', hex: '#D2B48C', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'tan', 'leather', 'neutral', 'light brown'], textDark: true },
  { name: 'Caramel Tan', hex: '#AF6E4D', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'caramel', 'toffee', 'rich tan', 'amber'] },
  { name: 'Cognac Leather', hex: '#9A463D', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'cognac', 'leather', 'reddish brown', 'boot'] },
  { name: 'Beige / Sand', hex: '#E1C699', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'beige', 'sand', 'cream', 'neutral', 'nude'], textDark: true },
  { name: 'Khaki Stone', hex: '#C3B091', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'khaki', 'safari', 'stone', 'chino', 'pants'], textDark: true },
  { name: 'Warm Taupe', hex: '#8B8589', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'taupe', 'grey brown', 'muted'] },
  { name: 'Walnut Brown', hex: '#5C4033', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'walnut', 'wood', 'natural'] },
  { name: 'Nude / Biscuit', hex: '#E3C1B4', family: 'brown', familyLabel: 'Browns', keywords: ['brown', 'nude', 'biscuit', 'skin', 'neutral'], textDark: true },

  // ================= RUST, ORANGES & CORALS =================
  { name: 'Rust', hex: '#B7410E', family: 'orange', familyLabel: 'Oranges', keywords: ['rust', 'orange', 'earthy', 'autumn', 'terracotta'] },
  { name: 'Rust Orange', hex: '#C45508', family: 'orange', familyLabel: 'Oranges', keywords: ['rust orange', 'rust', 'orange', 'burnt orange', 'warm'] },
  { name: 'Burnt Orange', hex: '#CC5500', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'burnt orange', 'autumn', 'deep orange'] },
  { name: 'Terracotta', hex: '#C85A32', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'terracotta', 'clay', 'earthy', 'brick orange'] },
  { name: 'Brick Rust', hex: '#A5382B', family: 'orange', familyLabel: 'Oranges', keywords: ['rust', 'brick', 'red orange', 'warm'] },
  { name: 'Bright Orange', hex: '#FF8C00', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'bright orange', 'tangerine', 'citrus'], textDark: true },
  { name: 'True Orange', hex: '#FF6600', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'primary orange', 'vibrant'], textDark: true },
  { name: 'Tangerine', hex: '#F28500', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'tangerine', 'mandarin', 'summer'], textDark: true },
  { name: 'Warm Ochre', hex: '#CC7722', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'ochre', 'mustard', 'amber', 'turmeric'], textDark: true },
  { name: 'Amber Glow', hex: '#FFBF00', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'amber', 'golden orange', 'warm'], textDark: true },
  { name: 'Peach', hex: '#FFE5B4', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'peach', 'pastel', 'soft', 'summer'], textDark: true },
  { name: 'Apricot', hex: '#FBCEB1', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'apricot', 'warm light', 'pastel'], textDark: true },
  { name: 'Coral', hex: '#FF7F50', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'coral', 'tropical', 'warm pink orange'], textDark: true },
  { name: 'Papaya Orange', hex: '#FF6F59', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'papaya', 'coral', 'fresh'], textDark: true },
  { name: 'Copper Orange', hex: '#CB6D51', family: 'orange', familyLabel: 'Oranges', keywords: ['orange', 'copper', 'metallic orange', 'shimmer'] },

  // ================= MAROONS, REDS & BURGUNDIES =================
  { name: 'Maroon', hex: '#800000', family: 'red', familyLabel: 'Reds', keywords: ['maroon', 'red', 'dark red', 'traditional', 'bridal', 'sindoor'] },
  { name: 'Rich Maroon', hex: '#6B0000', family: 'red', familyLabel: 'Reds', keywords: ['maroon', 'rich maroon', 'deep red', 'festive', 'traditional'] },
  { name: 'Deep Burgundy', hex: '#58111A', family: 'red', familyLabel: 'Reds', keywords: ['burgundy', 'wine', 'dark red', 'bordeaux', 'cabernet'] },
  { name: 'Wine Red', hex: '#722F37', family: 'red', familyLabel: 'Reds', keywords: ['wine', 'red wine', 'burgundy', 'dark red', 'berry'] },
  { name: 'Oxblood / Garnet', hex: '#4A0E17', family: 'red', familyLabel: 'Reds', keywords: ['oxblood', 'garnet', 'dark maroon', 'formal'] },
  { name: 'Crimson Red', hex: '#DC143C', family: 'red', familyLabel: 'Reds', keywords: ['crimson', 'red', 'deep red', 'festive', 'blood red'] },
  { name: 'Classic Ruby Red', hex: '#E50914', family: 'red', familyLabel: 'Reds', keywords: ['red', 'ruby', 'true red', 'classic red', 'primary'] },
  { name: 'Scarlet Red', hex: '#FF2400', family: 'red', familyLabel: 'Reds', keywords: ['scarlet', 'red', 'bright red', 'fiery', 'bold'] },
  { name: 'Cherry Red', hex: '#D2042D', family: 'red', familyLabel: 'Reds', keywords: ['cherry', 'red', 'party red', 'vibrant red'] },
  { name: 'Vermilion Red', hex: '#E34234', family: 'red', familyLabel: 'Reds', keywords: ['vermilion', 'red', 'sindoor', 'traditional orange red'] },
  { name: 'Brick Red', hex: '#B22222', family: 'red', familyLabel: 'Reds', keywords: ['brick red', 'firebrick', 'earthy red', 'rust red'] },
  { name: 'Rosewood Red', hex: '#65000B', family: 'red', familyLabel: 'Reds', keywords: ['rosewood', 'maroon', 'deep brown red', 'wood'] },

  // ================= PINKS, MAGENTAS & ROSES =================
  { name: 'Pink', hex: '#FFC0CB', family: 'pink', familyLabel: 'Pinks', keywords: ['pink', 'true pink', 'classic pink', 'soft'], textDark: true },
  { name: 'Hot Pink', hex: '#FF1493', family: 'pink', familyLabel: 'Pinks', keywords: ['pink', 'hot pink', 'neon pink', 'bright'] },
  { name: 'Fuchsia', hex: '#FF00FF', family: 'pink', familyLabel: 'Pinks', keywords: ['fuchsia', 'magenta', 'pink', 'vibrant', 'party'] },
  { name: 'Rani Pink', hex: '#E4007C', family: 'pink', familyLabel: 'Pinks', keywords: ['rani pink', 'fuchsia', 'indian pink', 'festive pink', 'bridal'] },
  { name: 'Baby Pink / Pastel Pink', hex: '#FFD1DC', family: 'pink', familyLabel: 'Pinks', keywords: ['pink', 'baby pink', 'pastel pink', 'blush', 'soft'], textDark: true },
  { name: 'Blush Pink', hex: '#F4C2C2', family: 'pink', familyLabel: 'Pinks', keywords: ['pink', 'blush', 'pastel', 'neutral pink'], textDark: true },
  { name: 'Dusty Rose', hex: '#DCAE96', family: 'pink', familyLabel: 'Pinks', keywords: ['pink', 'rose', 'dusty rose', 'vintage pink', 'nude pink'], textDark: true },
  { name: 'Old Rose', hex: '#C08081', family: 'pink', familyLabel: 'Pinks', keywords: ['rose', 'old rose', 'vintage', 'muted pink'] },
  { name: 'Bubblegum Pink', hex: '#FF69B4', family: 'pink', familyLabel: 'Pinks', keywords: ['bubblegum', 'pink', 'playful', 'bright'], textDark: true },
  { name: 'Coral Pink', hex: '#F88379', family: 'pink', familyLabel: 'Pinks', keywords: ['coral pink', 'pink', 'warm pink', 'summer'], textDark: true },
  { name: 'Magenta Pink', hex: '#D946EF', family: 'pink', familyLabel: 'Pinks', keywords: ['magenta', 'pink', 'purple pink', 'festive'] },
  { name: 'Rose Gold', hex: '#B76E79', family: 'pink', familyLabel: 'Pinks', keywords: ['rose gold', 'pink', 'metallic pink', 'glam'] },
  { name: 'Salmon Pink', hex: '#FA8072', family: 'pink', familyLabel: 'Pinks', keywords: ['salmon', 'pink', 'coral', 'warm'], textDark: true },

  // ================= PURPLES, VIOLETS & LAVENDERS =================
  { name: 'Purple', hex: '#800080', family: 'purple', familyLabel: 'Purples', keywords: ['purple', 'true purple', 'classic purple'] },
  { name: 'Royal Purple', hex: '#7851A9', family: 'purple', familyLabel: 'Purples', keywords: ['purple', 'royal purple', 'regal', 'violet'] },
  { name: 'Deep Violet', hex: '#8A2BE2', family: 'purple', familyLabel: 'Purples', keywords: ['purple', 'violet', 'electric purple', 'bright'] },
  { name: 'Lavender', hex: '#E6E6FA', family: 'purple', familyLabel: 'Purples', keywords: ['lavender', 'purple', 'pastel purple', 'soft', 'light'], textDark: true },
  { name: 'Lavender Mist', hex: '#E0D0F5', family: 'purple', familyLabel: 'Purples', keywords: ['lavender', 'purple', 'pale', 'lilac'], textDark: true },
  { name: 'Soft Lilac', hex: '#C8A2C8', family: 'purple', familyLabel: 'Purples', keywords: ['lilac', 'purple', 'spring', 'floral', 'pastel'], textDark: true },
  { name: 'Rich Plum', hex: '#5C1349', family: 'purple', familyLabel: 'Purples', keywords: ['plum', 'purple', 'dark purple', 'berry', 'evening'] },
  { name: 'Eggplant / Aubergine', hex: '#3D0735', family: 'purple', familyLabel: 'Purples', keywords: ['aubergine', 'eggplant', 'dark purple', 'deep violet', 'baingan'] },
  { name: 'Amethyst', hex: '#9966CC', family: 'purple', familyLabel: 'Purples', keywords: ['amethyst', 'purple', 'jewel', 'bright violet'] },
  { name: 'Mauve', hex: '#E0B0FF', family: 'purple', familyLabel: 'Purples', keywords: ['mauve', 'purple', 'dusty purple', 'vintage'], textDark: true },
  { name: 'Orchid', hex: '#DA70D6', family: 'purple', familyLabel: 'Purples', keywords: ['orchid', 'purple', 'magenta purple', 'bright'], textDark: true },
  { name: 'Grape Wine', hex: '#6F2DA8', family: 'purple', familyLabel: 'Purples', keywords: ['grape', 'wine', 'purple', 'festive'] },
  { name: 'Indigo Purple', hex: '#4B0082', family: 'purple', familyLabel: 'Purples', keywords: ['indigo', 'purple', 'dark violet', 'midnight'] },

  // ================= BLUES, NAVIES & TEALS =================
  { name: 'Blue', hex: '#0000FF', family: 'blue', familyLabel: 'Blues', keywords: ['blue', 'true blue', 'primary blue'] },
  { name: 'Navy Blue', hex: '#000080', family: 'blue', familyLabel: 'Blues', keywords: ['navy', 'navy blue', 'dark blue', 'classic', 'formal'] },
  { name: 'Midnight Navy', hex: '#00204A', family: 'blue', familyLabel: 'Blues', keywords: ['navy', 'midnight', 'blue', 'deep blue', 'tuxedo'] },
  { name: 'Royal Blue', hex: '#4169E1', family: 'blue', familyLabel: 'Blues', keywords: ['royal blue', 'blue', 'vibrant', 'rich', 'cobalt'] },
  { name: 'Classic True Blue', hex: '#1E6091', family: 'blue', familyLabel: 'Blues', keywords: ['blue', 'classic blue', 'denim'] },
  { name: 'Sky Blue', hex: '#87CEEB', family: 'blue', familyLabel: 'Blues', keywords: ['sky blue', 'blue', 'light blue', 'summer', 'day'], textDark: true },
  { name: 'Powder Blue / Baby Blue', hex: '#B0E0E6', family: 'blue', familyLabel: 'Blues', keywords: ['powder blue', 'baby blue', 'blue', 'pastel', 'soft'], textDark: true },
  { name: 'Denim Blue', hex: '#2A52BE', family: 'blue', familyLabel: 'Blues', keywords: ['denim', 'blue', 'jeans', 'indigo', 'casual'] },
  { name: 'Indigo', hex: '#3F51B5', family: 'blue', familyLabel: 'Blues', keywords: ['indigo', 'blue', 'deep denim', 'traditional'] },
  { name: 'Teal', hex: '#008080', family: 'blue', familyLabel: 'Blues', keywords: ['teal', 'blue green', 'ocean', 'peacock'] },
  { name: 'Dark Teal / Peacock Blue', hex: '#004C54', family: 'blue', familyLabel: 'Blues', keywords: ['teal', 'peacock', 'dark blue green', 'jewel'] },
  { name: 'Turquoise / Cyan', hex: '#40E0D0', family: 'blue', familyLabel: 'Blues', keywords: ['turquoise', 'cyan', 'aqua', 'caribbean', 'blue'], textDark: true },
  { name: 'Aqua Blue', hex: '#00FFFF', family: 'blue', familyLabel: 'Blues', keywords: ['aqua', 'cyan', 'bright blue', 'electric'], textDark: true },
  { name: 'Electric Cobalt', hex: '#0047AB', family: 'blue', familyLabel: 'Blues', keywords: ['cobalt', 'blue', 'electric blue', 'bright'] },
  { name: 'Ice Blue', hex: '#E0F2FE', family: 'blue', familyLabel: 'Blues', keywords: ['ice blue', 'pale blue', 'frost', 'pastel'], textDark: true },
  { name: 'Steel Blue', hex: '#4682B4', family: 'blue', familyLabel: 'Blues', keywords: ['steel blue', 'slate blue', 'cool blue'] },

  // ================= GREENS, OLIVES & MINTS =================
  { name: 'Green', hex: '#008000', family: 'green', familyLabel: 'Greens', keywords: ['green', 'true green', 'classic green'] },
  { name: 'Emerald Green', hex: '#004B23', family: 'green', familyLabel: 'Greens', keywords: ['emerald', 'green', 'jewel', 'rich green', 'bottle green', 'panna'] },
  { name: 'Bottle Green', hex: '#097969', family: 'green', familyLabel: 'Greens', keywords: ['bottle green', 'deep green', 'traditional green', 'silk'] },
  { name: 'Forest Green', hex: '#228B22', family: 'green', familyLabel: 'Greens', keywords: ['forest green', 'pine green', 'nature', 'dark green'] },
  { name: 'Dark Hunter Green', hex: '#1C3F2A', family: 'green', familyLabel: 'Greens', keywords: ['hunter green', 'dark green', 'deep'] },
  { name: 'Olive Green', hex: '#556B2F', family: 'green', familyLabel: 'Greens', keywords: ['olive', 'olive green', 'drab', 'army', 'earthy green'] },
  { name: 'Military Army Green', hex: '#4B5320', family: 'green', familyLabel: 'Greens', keywords: ['army green', 'military green', 'camo', 'khaki green'] },
  { name: 'Sage Green', hex: '#87A96B', family: 'green', familyLabel: 'Greens', keywords: ['sage', 'sage green', 'earthy', 'soft green', 'eucalyptus'], textDark: true },
  { name: 'Mint Green', hex: '#98FF98', family: 'green', familyLabel: 'Greens', keywords: ['mint', 'mint green', 'pastel green', 'fresh', 'pista'], textDark: true },
  { name: 'Pistachio Green (Pista)', hex: '#93C572', family: 'green', familyLabel: 'Greens', keywords: ['pistachio', 'pista', 'green', 'traditional light green', 'pastel'], textDark: true },
  { name: 'Seafoam Green', hex: '#93E9BE', family: 'green', familyLabel: 'Greens', keywords: ['seafoam', 'green', 'pastel', 'ocean green'], textDark: true },
  { name: 'Lime Green', hex: '#32CD32', family: 'green', familyLabel: 'Greens', keywords: ['lime', 'lime green', 'bright green', 'electric'], textDark: true },
  { name: 'Neon Green', hex: '#39FF14', family: 'green', familyLabel: 'Greens', keywords: ['neon green', 'fluorescent', 'sporty', 'high vis'], textDark: true },
  { name: 'Khaki Green', hex: '#8A865D', family: 'green', familyLabel: 'Greens', keywords: ['khaki green', 'olive', 'safari'], textDark: true },
  { name: 'Jade Green', hex: '#00A86B', family: 'green', familyLabel: 'Greens', keywords: ['jade', 'green', 'jewel', 'bright green'] },

  // ================= YELLOWS, MUSTARDS & GOLDS =================
  { name: 'Yellow', hex: '#FFFF00', family: 'yellow', familyLabel: 'Yellows', keywords: ['yellow', 'true yellow', 'primary yellow'], textDark: true },
  { name: 'Bright Sunshine Yellow', hex: '#FFEB3B', family: 'yellow', familyLabel: 'Yellows', keywords: ['yellow', 'sunshine', 'bright yellow', 'canary'], textDark: true },
  { name: 'Lemon Yellow', hex: '#FFF44F', family: 'yellow', familyLabel: 'Yellows', keywords: ['lemon', 'yellow', 'citrus', 'light yellow'], textDark: true },
  { name: 'Mustard', hex: '#E1AD01', family: 'yellow', familyLabel: 'Yellows', keywords: ['mustard', 'yellow', 'mustard yellow', 'warm yellow', 'autumn'], textDark: true },
  { name: 'Mustard Gold', hex: '#D4AF37', family: 'yellow', familyLabel: 'Yellows', keywords: ['mustard', 'gold', 'mustard gold', 'haldi', 'warm'], textDark: true },
  { name: 'Butter / Pastel Yellow', hex: '#FFFDD0', family: 'yellow', familyLabel: 'Yellows', keywords: ['butter', 'yellow', 'cream', 'pastel yellow', 'soft'], textDark: true },
  { name: 'Marigold Yellow (Haldi)', hex: '#EAA221', family: 'yellow', familyLabel: 'Yellows', keywords: ['marigold', 'haldi', 'yellow', 'deep yellow', 'festive', 'traditional'], textDark: true },
  { name: 'Goldenrod Amber', hex: '#DAA520', family: 'yellow', familyLabel: 'Yellows', keywords: ['goldenrod', 'amber', 'golden yellow', 'warm'], textDark: true },
  { name: 'Neon Yellow', hex: '#CCFF00', family: 'yellow', familyLabel: 'Yellows', keywords: ['neon yellow', 'fluorescent', 'sporty'], textDark: true },
  { name: 'Chartreuse', hex: '#DFFF00', family: 'yellow', familyLabel: 'Yellows', keywords: ['chartreuse', 'yellow green', 'lime yellow'], textDark: true },

  // ================= BLACKS, GREYS, WHITES & CREAMS =================
  { name: 'Black', hex: '#000000', family: 'neutral', familyLabel: 'Neutrals', keywords: ['black', 'true black', 'classic black', 'jet black', 'noir'] },
  { name: 'Pitch Black / Jet Black', hex: '#1A1A1A', family: 'neutral', familyLabel: 'Neutrals', keywords: ['black', 'pitch black', 'noir', 'charcoal black'] },
  { name: 'Charcoal Grey', hex: '#36454F', family: 'neutral', familyLabel: 'Neutrals', keywords: ['charcoal', 'grey', 'gray', 'dark grey', 'anthracite'] },
  { name: 'Slate Grey / Steel', hex: '#708090', family: 'neutral', familyLabel: 'Neutrals', keywords: ['slate', 'grey', 'gray', 'steel grey', 'cool grey'] },
  { name: 'Grey', hex: '#808080', family: 'neutral', familyLabel: 'Neutrals', keywords: ['grey', 'gray', 'medium grey', 'classic grey'] },
  { name: 'Light Heather Grey', hex: '#D3D3D3', family: 'neutral', familyLabel: 'Neutrals', keywords: ['grey', 'gray', 'light grey', 'heather', 'silver grey'], textDark: true },
  { name: 'Silver Grey', hex: '#C0C0C0', family: 'neutral', familyLabel: 'Neutrals', keywords: ['silver', 'grey', 'light grey'], textDark: true },
  { name: 'White', hex: '#FFFFFF', family: 'neutral', familyLabel: 'Neutrals', keywords: ['white', 'pure white', 'clean', 'crisp'], textDark: true },
  { name: 'Off White', hex: '#FAF9F6', family: 'neutral', familyLabel: 'Neutrals', keywords: ['off white', 'white', 'soft white'], textDark: true },
  { name: 'Cream / Ivory', hex: '#FFF8DC', family: 'neutral', familyLabel: 'Neutrals', keywords: ['cream', 'ivory', 'off white', 'vanilla', 'silk'], textDark: true },
  { name: 'Soft Ecru / Linen', hex: '#FDFBF7', family: 'neutral', familyLabel: 'Neutrals', keywords: ['ecru', 'linen', 'cream', 'ivory', 'natural'], textDark: true },

  // ================= METALLICS & SHIMMERS =================
  { name: 'Metallic Antique Gold', hex: '#D4AF37', family: 'metallic', familyLabel: 'Metallics', keywords: ['gold', 'metallic gold', 'shimmer', 'zari', 'festive gold'], textDark: true },
  { name: 'Bright Yellow Gold', hex: '#FFD700', family: 'metallic', familyLabel: 'Metallics', keywords: ['gold', 'bright gold', 'shiny gold', 'jewelry'], textDark: true },
  { name: 'Metallic Silver', hex: '#E5E4E2', family: 'metallic', familyLabel: 'Metallics', keywords: ['silver', 'metallic silver', 'chrome', 'shimmer', 'glitter'], textDark: true },
  { name: 'Antique Bronze', hex: '#CD7F32', family: 'metallic', familyLabel: 'Metallics', keywords: ['bronze', 'metallic bronze', 'copper', 'antique'] },
  { name: 'Copper Rust Shimmer', hex: '#B87333', family: 'metallic', familyLabel: 'Metallics', keywords: ['copper', 'shimmer', 'metallic rust', 'metallic orange'] },
  { name: 'Rose Gold Metallic', hex: '#ECC5C0', family: 'metallic', familyLabel: 'Metallics', keywords: ['rose gold', 'metallic', 'pink gold', 'shimmer'], textDark: true },
];

export interface HarmonyPreset {
  id: string;
  name: string;
  description: string;
  top: ColorSwatch;
  bottom: ColorSwatch;
  accent: ColorSwatch;
  mood: 'Casual' | 'Formal' | 'Festive / Party' | 'Summer / Beach' | 'Smart Casual';
  contrastLevel: 'High Contrast' | 'Harmonious Balanced' | 'Subtle Monotone';
  stylingTip: string;
}

export const COLOR_HARMONY_PRESETS: HarmonyPreset[] = [
  {
    id: 'rust-sage',
    name: 'Rust Orange & Sage Green',
    description: 'Rich earthy warmth paired with organic sage foliage for an effortless botanical harmony.',
    top: FASHION_COLORS.find(c => c.name === 'Rust Orange') || FASHION_COLORS[17],
    bottom: FASHION_COLORS.find(c => c.name === 'Sage Green') || FASHION_COLORS[62],
    accent: FASHION_COLORS.find(c => c.name === 'Soft Ecru / Linen') || FASHION_COLORS[83],
    mood: 'Casual',
    contrastLevel: 'Harmonious Balanced',
    stylingTip: 'Works exceptionally well in linen shirts, knit sweaters, and relaxed cotton trousers.',
  },
  {
    id: 'maroon-cream',
    name: 'Rich Maroon & Soft Cream',
    description: 'Regal, high-contrast palette popular in evening formal wear, winter galas, and heritage celebrations.',
    top: FASHION_COLORS.find(c => c.name === 'Rich Maroon') || FASHION_COLORS[32],
    bottom: FASHION_COLORS.find(c => c.name === 'Cream / Ivory') || FASHION_COLORS[82],
    accent: FASHION_COLORS.find(c => c.name === 'Metallic Antique Gold') || FASHION_COLORS[84],
    mood: 'Festive / Party',
    contrastLevel: 'High Contrast',
    stylingTip: 'Let antique gold jewellery or cufflinks provide shimmering accent contrast.',
  },
  {
    id: 'brown-camel',
    name: 'Chocolate Brown & Warm Camel',
    description: 'Understated luxury tonal layering with timeless heritage sophistication.',
    top: FASHION_COLORS.find(c => c.name === 'Chocolate Brown') || FASHION_COLORS[2],
    bottom: FASHION_COLORS.find(c => c.name === 'Warm Camel') || FASHION_COLORS[7],
    accent: FASHION_COLORS.find(c => c.name === 'White') || FASHION_COLORS[80],
    mood: 'Smart Casual',
    contrastLevel: 'Harmonious Balanced',
    stylingTip: 'Add crisp white sneakers or an ecru crewneck underlayer to brighten the palette.',
  },
  {
    id: 'mustard-navy',
    name: 'Mustard Gold & Midnight Navy',
    description: 'A timeless high-contrast pairing that brings intellectual warmth and punchy balance.',
    top: FASHION_COLORS.find(c => c.name === 'Mustard Gold') || FASHION_COLORS[69],
    bottom: FASHION_COLORS.find(c => c.name === 'Midnight Navy') || FASHION_COLORS[46],
    accent: FASHION_COLORS.find(c => c.name === 'Soft Ecru / Linen') || FASHION_COLORS[83],
    mood: 'Smart Casual',
    contrastLevel: 'High Contrast',
    stylingTip: 'Pair with tan leather shoes or an ecru watch band for elevated effortless sophistication.',
  },
  {
    id: 'purple-gold',
    name: 'Royal Purple & Metallic Antique Gold',
    description: 'Regal, high-luxury aesthetic popular in festive celebrations and formal galas.',
    top: FASHION_COLORS.find(c => c.name === 'Royal Purple') || FASHION_COLORS[37],
    bottom: FASHION_COLORS.find(c => c.name === 'Black') || FASHION_COLORS[74],
    accent: FASHION_COLORS.find(c => c.name === 'Metallic Antique Gold') || FASHION_COLORS[84],
    mood: 'Festive / Party',
    contrastLevel: 'High Contrast',
    stylingTip: 'Let the gold shine via earrings, cuff links, or embroidered border trims.',
  },
  {
    id: 'lavender-powderblue',
    name: 'Lavender Mist & Powder Blue',
    description: 'Gentle pastel dreaminess perfect for daytime brunches, spring garden outings, or vacations.',
    top: FASHION_COLORS.find(c => c.name === 'Lavender Mist') || FASHION_COLORS[39],
    bottom: FASHION_COLORS.find(c => c.name === 'Powder Blue / Baby Blue') || FASHION_COLORS[49],
    accent: FASHION_COLORS.find(c => c.name === 'White') || FASHION_COLORS[80],
    mood: 'Summer / Beach',
    contrastLevel: 'Harmonious Balanced',
    stylingTip: 'Keep accessories clean in sterling silver or mother-of-pearl.',
  },
  {
    id: 'emerald-blush',
    name: 'Emerald Green & Dusty Rose',
    description: 'Romantic botanical contrast combining deep jewel lushness with gentle pastel warmth.',
    top: FASHION_COLORS.find(c => c.name === 'Emerald Green') || FASHION_COLORS[55],
    bottom: FASHION_COLORS.find(c => c.name === 'Dusty Rose') || FASHION_COLORS[25],
    accent: FASHION_COLORS.find(c => c.name === 'Beige / Sand') || FASHION_COLORS[11],
    mood: 'Festive / Party',
    contrastLevel: 'High Contrast',
    stylingTip: 'Gold metallic accents or antique jewellery complement this palette exceptionally well.',
  },
  {
    id: 'royal-blue-white',
    name: 'Royal Blue & Crisp White',
    description: 'Striking nautical and contemporary high-energy contrast with crisp clarity.',
    top: FASHION_COLORS.find(c => c.name === 'Royal Blue') || FASHION_COLORS[47],
    bottom: FASHION_COLORS.find(c => c.name === 'White') || FASHION_COLORS[80],
    accent: FASHION_COLORS.find(c => c.name === 'Bright Sunshine Yellow') || FASHION_COLORS[66],
    mood: 'Smart Casual',
    contrastLevel: 'High Contrast',
    stylingTip: 'Add a small yellow or red accent piece to create visual drama.',
  },
  {
    id: 'burgundy-cream',
    name: 'Deep Burgundy & Soft Ecru',
    description: 'Regal and luxurious contrast with high visual impact without being overwhelming.',
    top: FASHION_COLORS.find(c => c.name === 'Deep Burgundy') || FASHION_COLORS[33],
    bottom: FASHION_COLORS.find(c => c.name === 'Soft Ecru / Linen') || FASHION_COLORS[83],
    accent: FASHION_COLORS.find(c => c.name === 'Warm Camel') || FASHION_COLORS[7],
    mood: 'Formal',
    contrastLevel: 'High Contrast',
    stylingTip: 'Ideal for evening dinners, receptions, and key presentations where authority and style meet.',
  },
  {
    id: 'monochrome-black-white',
    name: 'Pitch Black & Crisp White',
    description: 'The ultimate timeless high-contrast binary that never goes out of fashion across eras.',
    top: FASHION_COLORS.find(c => c.name === 'Pitch Black / Jet Black') || FASHION_COLORS[75],
    bottom: FASHION_COLORS.find(c => c.name === 'White') || FASHION_COLORS[80],
    accent: FASHION_COLORS.find(c => c.name === 'Classic Ruby Red') || FASHION_COLORS[36],
    mood: 'Formal',
    contrastLevel: 'High Contrast',
    stylingTip: 'Add a subtle pop of ruby or emerald via scarf, lip color, or pocket square for character.',
  },
];

export function searchFashionColors(query: string, familyId: string = 'all'): ColorSwatch[] {
  let list = FASHION_COLORS;
  if (familyId !== 'all') {
    list = list.filter(c => c.family === familyId);
  }
  if (!query.trim()) return list;

  const q = query.toLowerCase().trim();
  return list.filter(c => {
    const matchName = c.name.toLowerCase().includes(q);
    const matchFamily = c.familyLabel.toLowerCase().includes(q) || c.family.toLowerCase().includes(q);
    const matchKeywords = c.keywords.some(k => k.toLowerCase().includes(q));
    const matchHex = c.hex.toLowerCase().includes(q);
    return matchName || matchFamily || matchKeywords || matchHex;
  });
}
