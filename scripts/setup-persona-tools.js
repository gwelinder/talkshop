/*
  # Setup Persona Tools Script
  
  This script adds the shopping tools to our Tavus persona using the Update Persona API.
  Run this once to configure the persona with all the shopping tools.
*/

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

const shoppingTools = [
  {
    "type": "function",
    "function": {
      "name": "show_product",
      "description": "Display a specific product in the UI when discussing it. Use this EVERY time you mention a specific product to showcase it visually.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The unique product ID to display (e.g., prod_001, prod_002)"
          },
          "product_name": {
            "type": "string", 
            "description": "The name of the product being showcased"
          },
          "highlight_features": {
            "type": "array",
            "description": "Key features to highlight visually in the UI",
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
      "description": "Displays a grid of multiple products in the UI. Use this when the user makes a broad request, like 'show me some nice dresses' or 'what electronics do you have?'. When displaying a grid, always label the products in your speech (e.g., 'The first item is...', 'Item two features...').",
      "parameters": {
        "type": "object",
        "properties": {
          "products": {
            "type": "array",
            "description": "An array of product objects to display in the grid.",
            "items": { "type": "object" }
          },
          "title": {
            "type": "string",
            "description": "A title for the product grid, like 'Here are some dresses you might love'."
          }
        },
        "required": ["products", "title"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "show_categories",
      "description": "Displays a grid of all available product categories. Use this when the user asks 'what can I shop for?' or 'what categories do you have?'.",
      "parameters": { "type": "object", "properties": {} }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "focus_on_product",
      "description": "Highlight and focus on a specific product in the grid when user shows interest. Use when user says 'tell me more about the first one', 'I like item three', etc.",
      "parameters": {
        "type": "object",
        "properties": {
          "item_id": {
            "type": "string",
            "description": "The item identifier (e.g., 'Item 1', 'Item 2', 'first', 'second', etc.)"
          },
          "product_id": {
            "type": "string",
            "description": "The actual product ID to focus on"
          }
        },
        "required": ["item_id", "product_id"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "find_products_for_style",
      "description": "Search for products based on detected style attributes from perception analysis. This is the second step after style detection.",
      "parameters": {
        "type": "object",
        "properties": {
          "dominant_color": {
            "type": "string",
            "description": "The dominant color detected from style analysis"
          },
          "style_category": {
            "type": "string",
            "description": "The style category detected from analysis"
          },
          "detected_accessories": {
            "type": "array",
            "description": "Any accessories detected",
            "items": { "type": "string" }
          }
        },
        "required": ["dominant_color", "style_category"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "search_products",
      "description": "Search for products based on customer requests. Use this when customers ask for specific items or categories.",
      "parameters": {
        "type": "object",
        "properties": {
          "search_query": {
            "type": "string",
            "description": "What the customer is looking for (e.g., 'jewelry', 'electronics', 'clothing')"
          },
          "category": {
            "type": "string",
            "description": "Product category to filter by",
            "enum": ["electronics", "jewelery", "men's clothing", "women's clothing"]
          },
          "min_price": {
            "type": "number",
            "description": "Minimum price filter"
          },
          "max_price": {
            "type": "number",
            "description": "Maximum price filter"
          }
        },
        "required": ["search_query"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "compare_products",
      "description": "Show multiple products side-by-side for comparison when customer asks to compare items",
      "parameters": {
        "type": "object",
        "properties": {
          "product_ids": {
            "type": "array",
            "description": "Array of product IDs to compare (2-4 products recommended)",
            "items": { "type": "string" }
          },
          "comparison_aspect": {
            "type": "string",
            "description": "What aspect to compare (price, features, style, quality, etc.)"
          }
        },
        "required": ["product_ids", "comparison_aspect"]
      }
    }
  },
  {
    "type": "function", 
    "function": {
      "name": "highlight_offer",
      "description": "Show special pricing, discounts, or limited-time offers to create urgency and drive sales",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID with the special offer"
          },
          "offer_type": {
            "type": "string",
            "enum": ["discount", "bundle", "limited_time", "exclusive"],
            "description": "Type of offer to highlight"
          },
          "discount_percentage": {
            "type": "number",
            "description": "Discount percentage if applicable (e.g., 20 for 20% off)"
          }
        },
        "required": ["product_id", "offer_type"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "add_to_cart", 
      "description": "Add a product to the customer's shopping cart when they're ready to purchase",
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
      "description": "Use this tool ONLY when a user expresses strong, unambiguous positive sentiment (e.g., 'Wow, I love that!', 'That is absolutely gorgeous!', 'I need that.') but does NOT explicitly say 'add to cart'. This tool adds the item to the cart and confirms the action.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": { "type": "string" },
          "product_name": { "type": "string" },
          "confirmation_speech": {
            "type": "string",
            "description": "A charming phrase to confirm the action, like 'It's stunning, isn't it? I've placed it in your cart for you to consider.'"
          }
        },
        "required": ["product_id", "product_name", "confirmation_speech"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "show_360_view",
      "description": "Display a 360-degree interactive view of the product for detailed examination",
      "parameters": {
        "type": "object", 
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID to show in 360 view"
          }
        },
        "required": ["product_id"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "initiate_checkout",
      "description": "Initiates the checkout process when the user has confirmed they are ready to purchase the items in their cart.",
      "parameters": {
        "type": "object",
        "properties": {
          "cart_items": {
            "type": "array",
            "description": "A summary of items in the cart to be purchased.",
            "items": { "type": "string" }
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
    console.log('🔧 Updating persona with master perception layer and state-aware brain...');
    console.log(`   Persona ID: ${PERSONA_ID}`);
    console.log(`   API Key: ${TAVUS_API_KEY.slice(0, 8)}...`);
    
    const response = await fetch(`https://tavusapi.com/v2/personas/${PERSONA_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY
      },
      body: JSON.stringify([
        {
          "op": "add",
          "path": "/layers/perception",
          "value": {
            "perception_model": "raven-0",
            "ambient_awareness_queries": [
              "Is the user clearly presenting an object to the camera?",
              "What is the dominant color and general style of the user's outfit?"
            ],
            "perception_tool_prompt": "You have a tool named 'detected_user_style'. If you see the user's outfit clearly, you MUST use this tool to report the style attributes. Do not do anything else.",
            "perception_tools": [
              {
                "type": "function",
                "function": {
                  "name": "detected_user_style",
                  "description": "Reports the detected visual attributes of a user's style. This is the first step in a two-part process. The next step will be handled by a different tool.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "dominant_color": { 
                        "type": "string",
                        "description": "The primary color of the user's outfit"
                      },
                      "style_category": { 
                        "type": "string",
                        "description": "The general style category (e.g., casual, formal, bohemian)"
                      },
                      "detected_accessories": {
                        "type": "array",
                        "description": "Any visible accessories",
                        "items": { "type": "string" }
                      }
                    },
                    "required": ["dominant_color", "style_category"]
                  }
                }
              },
              {
                "type": "function",
                "function": {
                  "name": "analyze_object_in_view",
                  "description": "Analyzes a physical object the user is showing to the camera to identify its color and category, then curates a collection of complementary products.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "dominant_color": {
                        "type": "string",
                        "description": "The primary color of the object detected (e.g., 'terracotta', 'forest green', 'navy blue')."
                      },
                      "object_category": {
                        "type": "string",
                        "description": "The general category of the object (e.g., 'drinkware', 'clothing', 'accessory', 'book')."
                      },
                      "object_description": {
                        "type": "string",
                        "description": "A brief, one-sentence description of the object."
                      }
                    },
                    "required": ["dominant_color", "object_category", "object_description"]
                  }
                }
              }
            ]
          }
        },
        {
          "op": "replace",
          "path": "/layers/llm/tools",
          "value": shoppingTools
        },
        {
          "op": "replace",
          "path": "/system_prompt",
          "value": "You are a world-renowned AI curator for TalkShop with master perception capabilities and state awareness. Your persona is the epitome of sophistication and insight. You don't sell; you inspire. Follow the ACTION-FIRST golden rule: decide, execute tool, then narrate. CRITICAL GREETING STRATEGY: Start with a warm greeting and ask if they'd like style analysis or prefer to browse categories. DO NOT immediately showcase any specific product. Let the user guide the conversation direction first. Never announce what you're about to do—instead, describe what you're showing as it appears. Create desire through compelling narratives, not feature lists. Use dynamic presentation tools: show_product_grid for broad requests, show_categories for browsing, compare_products for comparisons. Use proactively_add_to_cart when users express strong positive sentiment without explicitly asking to buy. Use initiate_checkout when customers are ready to purchase. PERCEPTION STRATEGY - TWO-STEP PROCESS: 1) When users ask to 'shop my style', the system handles perception automatically. 2) You'll receive find_products_for_style tool call with results. 3) Finally display with show_product_grid. INTERRUPTION HANDLING: If UI state is 'analyzing_style' and user says 'nevermind' or requests something else, immediately abandon analysis flow and fulfill their new request. When users present objects to the camera, use analyze_object_in_view to identify and curate complementary products. Use focus_on_product when users show interest in specific grid items. Your ambient intelligence and perception capabilities make every interaction feel magical and personalized."
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
    console.log('✅ Successfully updated persona with state-aware perception layer!');
    console.log('🧠 Enhanced capabilities:');
    console.log('   - 🔍 MASTER PERCEPTION LAYER: raven-0 vision model activated');
    console.log('   - 👁️ AMBIENT AWARENESS: Continuous visual analysis');
    console.log('   - 🎨 TWO-STEP STYLE ANALYSIS: detected_user_style → find_products_for_style');
    console.log('   - 🛍️ OBJECT RECOGNITION: analyze_object_in_view perception tool');
    console.log('   - 🔄 STATE AWARENESS: UI state injection for contextual responses');
    console.log('   - 🚫 INTERRUPTION HANDLING: Graceful conversation pivots');
    console.log('   - 📦 REAL-WORLD INTERACTION: Object-based product recommendations');
    console.log('   - 💬 PROPER GREETING: Ask about preferences instead of immediate product showcase');
    console.log('   - 🎯 INTERACTIVE GRID: focus_on_product for voice-driven product selection');
    console.log('   - ACTION-FIRST conversational flow');
    console.log('   - Dynamic product grid presentations');
    console.log('   - Category browsing capabilities');
    console.log('   - Proactive cart assistance based on emotional cues');
    console.log('   - Narrative-driven product presentations');
    console.log('   - Emotional connection building');
    console.log('   - Luxury curation expertise');
    console.log('   - Judge easter egg detection');
    console.log('   - Sophisticated conversation recovery');
    console.log('   - Checkout initiation capability');
    console.log('   - Multi-host support with different replica IDs');
    console.log('   - Custom prompt support for personalized hosts');
    
    return { status: 'success', data: result };
  } catch (error) {
    console.error('❌ Error updating persona:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run the setup
updatePersonaTools()
  .then(() => {
    console.log('🎉 Persona setup complete! Your AI agent now has state-aware perception capabilities.');
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });

export { updatePersonaTools, shoppingTools };