import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually since we're in Node.js
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('⚠️  No .env file found or error reading it');
    return {};
  }
}

const envVars = loadEnvFile();
const TAVUS_API_KEY = envVars.VITE_TAVUS_API_KEY || process.env.VITE_TAVUS_API_KEY;
const PERSONA_ID = "pb16b649a4c0";

console.log('🔍 Environment check:');
console.log(`   .env file loaded: ${Object.keys(envVars).length > 0 ? 'Yes' : 'No'}`);
console.log(`   API key found: ${TAVUS_API_KEY ? 'Yes (' + TAVUS_API_KEY.slice(0, 8) + '...)' : 'No'}`);
console.log(`   Is demo mode: ${!TAVUS_API_KEY || TAVUS_API_KEY === 'demo-tavus-key' ? 'Yes' : 'No'}`);

// Define fashion-focused tools
const shoppingTools = [
  {
    "type": "function",
    "function": {
      "name": "create_dynamic_product",
      "description": "Create and display a dynamic fashion product based on style analysis or user preferences. Use this when you want to suggest a specific item that complements the user's style.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_description": {
            "type": "string",
            "description": "Detailed description of the fashion item (e.g., 'denim cowboy jacket', 'floral summer dress', 'leather ankle boots')"
          },
          "style_reasoning": {
            "type": "string",
            "description": "Explanation of why this item complements the user's style"
          },
          "occasion": {
            "type": "string",
            "description": "Suggested occasion for wearing this item"
          },
          "price_range": {
            "type": "string",
            "enum": ["budget", "mid-range", "premium", "luxury"],
            "description": "Price category for the item"
          }
        },
        "required": ["product_description", "style_reasoning"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "show_product",
      "description": "Display a specific product when discussing it. Use this for existing products or after creating dynamic products.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID to display"
          },
          "product_name": {
            "type": "string", 
            "description": "The name of the product being showcased"
          },
          "highlight_features": {
            "type": "array",
            "description": "Key fashion features to highlight (e.g., 'Premium fabric', 'Flattering fit', 'Versatile styling')",
            "items": { "type": "string" }
          },
          "styling_tips": {
            "type": "array",
            "description": "Styling suggestions for this item",
            "items": { "type": "string" }
          }
        },
        "required": ["product_id", "product_name", "highlight_features"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "show_product_grid",
      "description": "Display a curated collection of fashion items. Use this when showing multiple style options or creating a complete look.",
      "parameters": {
        "type": "object",
        "properties": {
          "products": {
            "type": "array",
            "description": "Array of fashion products to display",
            "items": { "type": "object" }
          },
          "collection_title": {
            "type": "string",
            "description": "Title for the fashion collection (e.g., 'Your Personalized Style Collection', 'Perfect for Date Night')"
          },
          "style_narrative": {
            "type": "string",
            "description": "Story about why these pieces work together"
          }
        },
        "required": ["products", "collection_title"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "show_categories",
      "description": "Display fashion categories when user wants to browse. Focus on style-based categories.",
      "parameters": { "type": "object", "properties": {} }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "focus_on_product",
      "description": "Highlight a specific item when user shows interest in a particular piece from a collection.",
      "parameters": {
        "type": "object",
        "properties": {
          "item_id": {
            "type": "string",
            "description": "The item identifier from the grid"
          },
          "product_id": {
            "type": "string",
            "description": "The actual product ID to focus on"
          },
          "styling_context": {
            "type": "string",
            "description": "How this piece fits into their overall style"
          }
        },
        "required": ["item_id", "product_id"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "find_and_display_style_matches",
      "description": "Create a personalized fashion collection based on style analysis. This is the core tool for style-based recommendations.",
      "parameters": {
        "type": "object",
        "properties": {
          "dominant_color": { 
            "type": "string",
            "description": "Primary color from the user's current style"
          },
          "style_category": { 
            "type": "string",
            "description": "Overall style aesthetic (e.g., 'casual chic', 'business professional', 'bohemian', 'minimalist')"
          },
          "curation_title": { 
            "type": "string", 
            "description": "Personalized title for the style collection"
          },
          "style_personality": {
            "type": "string",
            "description": "User's fashion personality based on analysis"
          }
        },
        "required": ["dominant_color", "style_category", "curation_title"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "create_complete_outfit",
      "description": "Design a complete outfit based on a single piece or style preference.",
      "parameters": {
        "type": "object",
        "properties": {
          "base_item": {
            "type": "string",
            "description": "The starting piece for the outfit"
          },
          "occasion": {
            "type": "string",
            "description": "Event or setting for the outfit"
          },
          "style_preference": {
            "type": "string",
            "description": "Desired aesthetic for the complete look"
          },
          "budget_range": {
            "type": "string",
            "description": "Budget consideration for the outfit"
          }
        },
        "required": ["base_item", "occasion", "style_preference"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "style_consultation",
      "description": "Provide personalized style advice and recommendations based on user's preferences, body type, or lifestyle.",
      "parameters": {
        "type": "object",
        "properties": {
          "consultation_type": {
            "type": "string",
            "enum": ["color_analysis", "body_type", "lifestyle", "occasion_dressing", "wardrobe_essentials"],
            "description": "Type of style consultation to provide"
          },
          "user_preferences": {
            "type": "string",
            "description": "User's stated preferences or concerns"
          },
          "recommendations": {
            "type": "array",
            "description": "Specific style recommendations",
            "items": { "type": "string" }
          }
        },
        "required": ["consultation_type", "recommendations"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "compare_products",
      "description": "Compare fashion items to help with decision making.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_ids": {
            "type": "array",
            "description": "Array of product IDs to compare",
            "items": { "type": "string" }
          },
          "comparison_aspect": {
            "type": "string",
            "description": "What to compare (style, versatility, value, quality)"
          },
          "recommendation": {
            "type": "string",
            "description": "Your recommendation based on the comparison"
          }
        },
        "required": ["product_ids", "comparison_aspect"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "add_to_cart", 
      "description": "Add a fashion item to the customer's cart when they're ready to purchase",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID to add to cart"
          },
          "quantity": {
            "type": "number",
            "description": "Quantity to add (default: 1)"
          },
          "size": {
            "type": "string",
            "description": "Selected size for the item"
          },
          "color": {
            "type": "string",
            "description": "Selected color for the item"
          }
        },
        "required": ["product_id", "quantity"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "proactively_add_to_cart",
      "description": "Add items to cart when user expresses strong positive sentiment about a fashion piece.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": { "type": "string" },
          "product_name": { "type": "string" },
          "confirmation_speech": {
            "type": "string",
            "description": "Stylish confirmation message"
          },
          "styling_note": {
            "type": "string",
            "description": "Quick styling tip for the added item"
          }
        },
        "required": ["product_id", "product_name", "confirmation_speech"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "initiate_checkout",
      "description": "Start the checkout process when customer is ready to purchase their curated items.",
      "parameters": {
        "type": "object",
        "properties": {
          "cart_items": {
            "type": "array",
            "description": "Summary of fashion items in cart",
            "items": { "type": "string" }
          },
          "styling_summary": {
            "type": "string",
            "description": "Summary of the complete look they're purchasing"
          }
        },
        "required": ["cart_items"]
      }
    }
  }
];

async function updatePersonaTools() {
  if (!TAVUS_API_KEY || TAVUS_API_KEY === 'demo-tavus-key') {
    console.log('⚠️  Demo mode detected - skipping persona tool setup');
    console.log('   Set VITE_TAVUS_API_KEY in your .env file for production use');
    console.log('   Current API key:', TAVUS_API_KEY || 'undefined');
    return;
  }

  try {
    console.log('🔧 Updating persona with fashion-focused tools...');
    console.log(`   Persona ID: ${PERSONA_ID}`);
    console.log(`   API Key: ${TAVUS_API_KEY.slice(0, 8)}...`);
    
    const response = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY
      },
      body: JSON.stringify([
        // Remove perception layer from here as it's handled by enhancedTavusService.ts
        // Remove system_prompt from here as it's handled by enhancedTavusService.ts
        {
          "op": "replace",
          "path": "/layers/llm/tools",
          "value": shoppingTools
        }
      ])
    });

    if (response.status === 304) {
      console.log('✅ Persona is already up-to-date');
      return { status: 'not_modified' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to update persona: ${response.status} ${response.statusText}`, errorText);
      return { status: 'error', message: `${response.status} ${response.statusText}` };
    }

    const result = await response.json();
    console.log('✅ Successfully updated persona with fashion-focused tools!');
    console.log('👗 Fashion-focused capabilities:');
    console.log('   - 🎨 DYNAMIC PRODUCT CREATION: Unlimited fashion catalog');
    console.log('   - 👔 PERSONAL STYLING: Complete outfit curation');
    console.log('   - 🔍 STYLE ANALYSIS: Visual style assessment');
    console.log('   - 💡 FASHION CONSULTATION: Expert style advice');
    console.log('   - 🛍️ PERSONALIZED SHOPPING: Curated recommendations');
    console.log('   - 👗 COMPLETE LOOKS: Outfit coordination');
    console.log('   - 🎯 OCCASION DRESSING: Event-specific styling');
    console.log('   - 💎 QUALITY FOCUS: Premium fashion emphasis');
    
    return { status: 'success', data: result };
  } catch (error) {
    console.error('❌ Error updating persona:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run the setup
updatePersonaTools()
  .then(() => {
    console.log('🎉 Fashion Persona setup complete! Your AI agent now has fashion-focused capabilities.');
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });

export { updatePersonaTools, shoppingTools };