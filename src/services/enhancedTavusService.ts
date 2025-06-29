// Enhanced Tavus Service with state-aware AI and perception capabilities
import { Product } from './productService';

// Get API key from environment variables
const getTavusApiKey = (): string => {
  const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
  if (!apiKey || apiKey === 'demo-tavus-key') {
    console.warn('Using demo mode - set VITE_TAVUS_API_KEY environment variable for production');
    return 'demo-tavus-key';
  }
  return apiKey;
};

// Get the webhook URL for our built-in webhook system
const getWebhookUrl = () => {
  const customWebhook = import.meta.env.VITE_WEBHOOK_URL;
  if (customWebhook) {
    return customWebhook;
  }
  
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
  return `${baseUrl}/functions/v1/tavus-webhook`;
};

// Enhanced shopping tools with state awareness and interactive grid
const createShoppingTools = () => {
  return [
    {
      "type": "function",
      "function": {
        "name": "show_product",
        "description": "Display a specific product when discussing it. Use ONLY these valid product IDs: 1-20 (from API), TS123 (Diamond Necklace), prod_001 (Velvet Blazer), prod_002 (Skincare Set), prod_003 (Wireless Earbuds), prod_005 (Swiss Watch).",
        "parameters": {
          "type": "object",
          "properties": {
            "product_id": {
              "type": "string",
              "description": "The product ID to display - must be a valid ID from the available inventory"
            },
            "product_name": {
              "type": "string", 
              "description": "The name of the product being showcased"
            },
            "highlight_features": {
              "type": "array",
              "description": "Key features to highlight visually",
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
        "name": "find_and_display_style_matches",
        "description": "Takes style attributes as input, searches for matching products, and displays them in a grid. This is the second and final step of the style analysis flow.",
        "parameters": {
          "type": "object",
          "properties": {
            "dominant_color": { 
              "type": "string",
              "description": "The dominant color from style analysis"
            },
            "style_category": { 
              "type": "string",
              "description": "The style category from analysis"
            },
            "curation_title": { 
              "type": "string", 
              "description": "A creative title for the product grid, like 'Inspired by your Classic Blue Style'." 
            }
          },
          "required": ["dominant_color", "style_category", "curation_title"]
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
        "description": "Show multiple products side-by-side for comparison. Use valid product IDs only.",
        "parameters": {
          "type": "object",
          "properties": {
            "product_ids": {
              "type": "array",
              "description": "Array of valid product IDs to compare",
              "items": { "type": "string" }
            },
            "comparison_aspect": {
              "type": "string",
              "description": "What aspect to compare (price, features, style, quality)"
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
        "description": "Show special pricing or limited-time offers to create urgency",
        "parameters": {
          "type": "object",
          "properties": {
            "product_id": {
              "type": "string",
              "description": "The product ID with the offer"
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
};

// Enhanced conversation creation with state awareness and perception capabilities
export const createEnhancedShoppingSession = async (
  customerInterest: string = 'general shopping',
  userName: string = 'Guest',
  replicaId: string = "rb54819da0d5", // Default replica, can be overridden
  customPrompt?: string, // Optional custom system prompt
  currentShowcaseState: string = 'empty' // Current UI state
) => {
  const apiKey = getTavusApiKey();
  
  // Use the provided persona ID (constant across all hosts)
  const personaId = "pb16b649a4c0";
  
  // Use our built-in webhook URL
  const webhookUrl = getWebhookUrl();
  
  // Use custom prompt if provided, otherwise use state-aware master prompt
  const conversationalContext = customPrompt || `You are a state-aware AI curator for TalkShop. Your actions are governed by user intent and the CURRENT_UI_STATE: ${currentShowcaseState}.

**GOLDEN RULES:**
1. **ACTION-FIRST:** Always call a tool *before* you speak. Your words narrate the action.
2. **STATE AWARENESS:** If \`CURRENT_UI_STATE\` is 'analyzing_style', you MUST wait. Do not act.
3. **INTERRUPTIBILITY:** If the user interrupts you during 'analyzing_style', your immediate priority is to abandon the analysis and fulfill their new request (e.g., call \`show_categories\`).

**PERCEPTION FLOW (Shop My Style):**
This is a strict two-step process that is mostly handled for you.
1. **USER ASKS:** "Shop my style."
2. **YOU RESPOND & WAIT:** Simply say, "Of course. Let me take a look at your style..." The system will automatically trigger the \`detected_user_style\` perception tool.
3. **YOU RECEIVE & ACT:** You will receive a *new conversational turn* with a \`find_and_display_style_matches\` tool call containing the results. Your ONLY job here is to execute that tool call to search for products and then call \`show_product_grid\` to display them.

**INTERACTIVE GRID FLOW:**
When a grid is displayed, listen for user requests like "tell me about item three." Use the \`focus_on_product\` tool to highlight the corresponding item visually.

**GREETING STRATEGY:**
Start with a warm greeting and ask if they'd like a personal style analysis or prefer to browse categories. DO NOT immediately showcase any specific product. Let the user guide the conversation direction first.

**TOOL USAGE:**
- Use \`show_product_grid\` for broad requests
- Use \`show_categories\` for browsing
- Use \`focus_on_product\` for grid interactions
- Use \`find_and_display_style_matches\` when you receive style analysis results
- Use \`proactively_add_to_cart\` for strong positive sentiment
- Use \`initiate_checkout\` when ready to purchase

**PERSONA:**
You are sophisticated, insightful, and create desire through compelling narratives. You don't sell; you inspire. Your ambient intelligence and perception capabilities make every interaction feel magical and personalized.

AVAILABLE PRODUCTS (use these exact IDs):
- Product IDs 1-20: Various items from our catalog.
- TS123: Diamond Necklace ($899) - 18k gold, 0.5 carat diamond, timeless elegance
- prod_001: Midnight Velvet Blazer ($289) - Premium Italian velvet, satin lapels, evening sophistication
- prod_002: AuraGlow Pro Skincare Set ($156) - Vitamin C serum, retinol cream, radiant transformation
- prod_003: Quantum Wireless Earbuds ($199) - Spatial audio, 30-hour battery, seamless lifestyle
- prod_005: Swiss Chronograph Watch ($899) - Swiss movement, sapphire crystal, horological mastery

Remember: You're not just selling products—you're curating experiences and helping people express their best selves through state-aware, perception-driven interactions.`;
  
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replica_id: replicaId, // Use the provided replica ID
      persona_id: personaId,
      conversation_name: `${userName} - TalkShop State-Aware Experience`,
      conversational_context: conversationalContext,
      custom_greeting: `Hello! I'm your personal shopping curator, and I'm absolutely delighted to meet you. I'm here to help you discover pieces that truly speak to you and your unique style. Would you like me to analyze your personal style for tailored recommendations, or would you prefer to explore our curated categories? I'm excited to create a shopping experience that's perfectly suited to you.`,
      callback_url: webhookUrl,
      properties: {
        max_call_duration: 600,
        enable_recording: false,
        enable_closed_captions: true,
        participant_absent_timeout: 60,
        participant_left_timeout: 30
      }
    })
  };
  
  try {
    const response = await fetch('https://tavusapi.com/v2/conversations', options);
    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Enhanced persona update with master perception layer and resolver tool
export const updatePersonaWithDynamicTools = async () => {
  const apiKey = getTavusApiKey();
  
  if (apiKey === 'demo-tavus-key') {
    console.log('⚠️  Demo mode - skipping persona update');
    return { status: 'demo_mode' };
  }

  try {
    const tools = createShoppingTools();
    const personaId = "pb16b649a4c0";
    
    console.log('🔧 Updating persona with FINAL perception architecture and resolver tool...');
    
    const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
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
          "value": tools
        },
        {
          "op": "replace",
          "path": "/system_prompt",
          "value": "You are a state-aware AI curator for TalkShop with master perception capabilities. Your actions are governed by user intent and the CURRENT_UI_STATE. Follow the ACTION-FIRST golden rule: decide, execute tool, then narrate. CRITICAL GREETING STRATEGY: Start with a warm greeting and ask if they'd like style analysis or prefer to browse categories. DO NOT immediately showcase any specific product. Let the user guide the conversation direction first. STATE AWARENESS: If CURRENT_UI_STATE is 'analyzing_style', you MUST wait. Do not act. INTERRUPTIBILITY: If the user interrupts you during 'analyzing_style', your immediate priority is to abandon the analysis and fulfill their new request (e.g., call show_categories). PERCEPTION FLOW: This is a strict two-step process. 1) USER ASKS: 'Shop my style.' 2) YOU RESPOND & WAIT: Simply say, 'Of course. Let me take a look at your style...' The system will automatically trigger the detected_user_style perception tool. 3) YOU RECEIVE & ACT: You will receive a new conversational turn with a find_and_display_style_matches tool call containing the results. Your ONLY job here is to execute that tool call to search for products and then call show_product_grid to display them. INTERACTIVE GRID FLOW: When a grid is displayed, listen for user requests like 'tell me about item three.' Use the focus_on_product tool to highlight the corresponding item visually. Use dynamic presentation tools: show_product_grid for broad requests, show_categories for browsing, compare_products for comparisons. Use proactively_add_to_cart when users express strong positive sentiment without explicitly asking to buy. Use initiate_checkout when customers are ready to purchase. When users present objects to the camera, use analyze_object_in_view to identify and curate complementary products. Your ambient intelligence and perception capabilities make every interaction feel magical and personalized."
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
    console.log('✅ Successfully updated persona with FINAL state-aware perception architecture!');
    console.log('🧠 FINAL Enhanced capabilities:');
    console.log('   - 🔍 MASTER PERCEPTION LAYER: raven-0 vision model activated');
    console.log('   - 👁️ AMBIENT AWARENESS: Continuous visual analysis');
    console.log('   - 🎨 TWO-STEP STYLE ANALYSIS: detected_user_style → find_and_display_style_matches');
    console.log('   - 🛍️ OBJECT RECOGNITION: analyze_object_in_view perception tool');
    console.log('   - 🔄 STATE AWARENESS: UI state injection for contextual responses');
    console.log('   - 🚫 INTERRUPTION HANDLING: Graceful conversation pivots');
    console.log('   - 📦 REAL-WORLD INTERACTION: Object-based product recommendations');
    console.log('   - 💬 PROPER GREETING: Ask about preferences instead of immediate product showcase');
    console.log('   - 🎯 INTERACTIVE GRID: focus_on_product for voice-driven product selection');
    console.log('   - 🔧 RESOLVER TOOL: find_and_display_style_matches for seamless style flow');
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
};

// Export compatibility
export * from './tavusService';
export { createEnhancedShoppingSession as createShoppingSession };