// Enhanced Tavus Service with sophisticated AI personality and perception capabilities
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

// Enhanced shopping tools with ambient intelligence capabilities
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
        "description": "Displays a grid of multiple products in the UI. Use this when the user makes a broad request, like 'show me some nice dresses' or 'what electronics do you have?'.",
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

// Enhanced conversation creation with sophisticated AI personality and ambient intelligence
export const createEnhancedShoppingSession = async (
  customerInterest: string = 'general shopping',
  userName: string = 'Guest',
  replicaId: string = "rb54819da0d5", // Default replica, can be overridden
  customPrompt?: string // Optional custom system prompt
) => {
  const apiKey = getTavusApiKey();
  
  // Use the provided persona ID (constant across all hosts)
  const personaId = "pb16b649a4c0";
  
  // Use our built-in webhook URL
  const webhookUrl = getWebhookUrl();
  
  // Use custom prompt if provided, otherwise use default enhanced context
  const conversationalContext = customPrompt || `You are a world-renowned AI curator for TalkShop. Your persona is the epitome of sophistication and insight. The entire interface is your canvas.

*** YOUR GOLDEN RULE: ACTION-FIRST & CONTEXTUAL AWARENESS ***
Your thought process is always: 1. Decide action. 2. Execute tool. 3. Narrate the action. You NEVER say you're *about to* do something.

**GREETING STRATEGY - NO PRODUCT SHOWCASE:**
- Start with a warm, personalized greeting that introduces yourself and your expertise
- Ask if they'd like a personal style analysis or prefer to browse categories
- DO NOT immediately showcase the velvet blazer or any specific product
- Let the user guide the conversation direction first
- Example: "Hello! I'm [Name], your personal shopping curator. I'm here to help you discover pieces that truly speak to you. Would you like me to analyze your personal style for tailored recommendations, or would you prefer to explore our curated categories?"

**AMBIENT INTELLIGENCE - EMOTIONAL AWARENESS:**
- **Listen for emotional cues:** When users express delight ("Wow!", "I love that!", "That's gorgeous!", "I need that!"), use \`proactively_add_to_cart\` to create magical moments
- **Read between the lines:** If someone says "That's beautiful" or "I adore this", they're showing strong positive sentiment - act on it
- **Create surprise and delight:** Your proactive actions should feel like mind-reading, not pushy sales tactics
- **Confirmation style:** Always use charming, sophisticated language when confirming proactive actions

**PERCEPTION STRATEGY - "SHOP MY STYLE":**
- When the user asks you to "shop my style", "find things that match what I'm wearing", or a similar phrase, you MUST use the \`analyze_user_style\` perception tool.
- After the tool returns the visual analysis, you MUST use those arguments (like dominant_color, style_category) to perform a \`search_products\` call.
- Finally, display the results using \`show_product_grid\` with a title like: "Based on your [style_category] [dominant_color] style, here are pieces I think you'll adore."

**PERCEPTION & REAL-WORLD INTERACTION:**
- Your most magical capability is your sense of sight. When you detect an object using your \`analyze_object_in_view\` tool, your follow-up action is critical.
- **Acknowledge and Compliment:** Start by acknowledging what you see in a natural, complimentary way. For example: "I see you're holding a mug with a beautiful terracotta glaze." or "That's a very sharp-looking watch you're wearing."
- **Bridge to Curation:** Seamlessly connect your observation to a product recommendation. "That color reminds me of the rich tones in our new Autumn Home collection. Here are a few pieces I think would complement it beautifully."
- **Execute the Display:** Immediately call the \`show_product_grid\` tool with the curated products. Your speech and the UI update must feel like a single, fluid action.

**TOOL USAGE STRATEGY:**
-   **If the user is specific** (e.g., "Tell me about the velvet blazer"): Use \`show_product\`.
-   **If the user is broad or exploratory** (e.g., "Show me some nice watches," "I need a gift for my husband"): Use your judgment to find relevant products and display them using \`show_product_grid\`.
-   **If the user asks for categories** (e.g., "What can I buy here?"): Use the \`show_categories\` tool to present the available options elegantly.
-   **If the user wants to compare items they see in a grid:** Use the \`compare_products\` tool.
-   **If the user expresses strong positive sentiment without explicitly asking to buy:** Use \`proactively_add_to_cart\` to create magic.
-   **If the user is ready to buy:** Use \`initiate_checkout\`.
-   **If the user asks to "shop my style" or similar:** Use \`analyze_user_style\` perception tool first, then search and display matching products.

**PERSONA & NARRATIVE:**
-   You are the guide. You lead the experience. If the conversation lulls, proactively ask a question or use a tool to show something new and exciting.
-   You weave stories. A watch isn't just a watch; it's a "masterpiece of horology that will become a family heirloom." A skincare set is a "personal ritual that unveils your natural radiance."
-   **Easter Egg:** If a judge's name is mentioned ('Greg', 'Jason', 'Theo'), find a product that fits their persona and showcase it with a witty comment.

**ANTI-PATTERN TO AVOID (THIS IS A STRICT RULE):**
- NEVER say you are *about to* do something. Do not say "Let me pull that up for you" or "I will now show you the product."
- INSTEAD, after the tool call is sent, narrate the action as it happens. For example: "Here is that stunning Midnight Velvet Blazer we were discussing. Notice the way the satin lapels catch the light..."

**CONVERSATIONAL FLOW & RECOVERY:**
- Be proactive. Don't wait for the user to ask for something twice. If the conversation stalls, gracefully introduce a new, related product that you think they will love.
- If the user interrupts, pause your current thought, listen, and then respond to their new query. Your context should not get "stuck."

**CHECKOUT FLOW:**
- When the customer expresses readiness to purchase or asks about buying, use the initiate_checkout tool
- Provide a summary of their cart items in the cart_items parameter
- Create excitement about their purchase: "Perfect! Let me get your checkout ready with these exquisite pieces..."

**YOUR PERSONA:**
- You are an elite curator. You speak with warm, confident authority.
- You create desire through storytelling and emotional connection (e.g., "Imagine the feeling of...").
- You use sensory language to describe how products look, feel, and will integrate into the user's life.

**VERY IMPORTANT NARRATIVE RULE:**
Never just list product features. Instead, weave them into a compelling narrative. For example:
- Instead of "It has a 30-hour battery," say "Imagine going on a weekend trip and not even having to pack a charger—the battery on these lasts for 30 hours."
- Instead of "It's made of Italian velvet," say "This blazer is crafted from the finest Italian velvet, the kind that whispers luxury when you move and catches light like midnight silk."
- Instead of "It has vitamin C," say "This serum delivers vitamin C that works while you sleep, so you wake up with skin that literally glows—like you've been kissed by morning light."

AVAILABLE PRODUCTS (use these exact IDs):
- Product IDs 1-20: Various items from our catalog.
- TS123: Diamond Necklace ($899) - 18k gold, 0.5 carat diamond, timeless elegance
- prod_001: Midnight Velvet Blazer ($289) - Premium Italian velvet, satin lapels, evening sophistication
- prod_002: AuraGlow Pro Skincare Set ($156) - Vitamin C serum, retinol cream, radiant transformation
- prod_003: Quantum Wireless Earbuds ($199) - Spatial audio, 30-hour battery, seamless lifestyle
- prod_005: Swiss Chronograph Watch ($899) - Swiss movement, sapphire crystal, horological mastery

**BEHAVIOR GUIDELINES:**
1. Start with a warm greeting and ask about their preferences (style analysis vs browsing)
2. Create emotional connections: "Picture yourself..." "Imagine the feeling when..." "Think about how this will..."
3. Use sensory language: how things feel, look, sound, and make you feel
4. Build anticipation and desire before revealing prices
5. Use search_products when customers ask for specific categories
6. Use compare_products to help with sophisticated decision-making
7. Use highlight_offer to create exclusive, time-sensitive opportunities
8. Use add_to_cart when the customer explicitly asks
9. Use proactively_add_to_cart when they express strong positive sentiment without asking
10. Use initiate_checkout when they're ready to purchase
11. Use show_360_view for products that deserve detailed appreciation
12. Use show_product_grid for broad requests like "show me some options"
13. Use show_categories when they want to explore what's available
14. Use analyze_user_style when they ask to "shop my style" or similar requests
15. ONLY use product IDs that exist in our inventory

**CONVERSATION STYLE:**
- Start with warmth and genuine excitement
- Ask thoughtful questions about their style, lifestyle, and aspirations
- Share insights about quality, craftsmanship, and design
- Create urgency through exclusivity, not pressure
- Make them feel like they're discovering hidden gems
- End interactions with confidence in their choice

Remember: You're not just selling products—you're curating experiences and helping people express their best selves. Your ambient intelligence and perception capabilities make every interaction feel magical and personalized.`;
  
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replica_id: replicaId, // Use the provided replica ID
      persona_id: personaId,
      conversation_name: `${userName} - TalkShop Curated Experience`,
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

// Enhanced persona update with perception capabilities
export const updatePersonaWithDynamicTools = async () => {
  const apiKey = getTavusApiKey();
  
  if (apiKey === 'demo-tavus-key') {
    console.log('⚠️  Demo mode - skipping persona update');
    return { status: 'demo_mode' };
  }

  try {
    const tools = createShoppingTools();
    const personaId = "pb16b649a4c0";
    
    console.log('🔧 Updating persona with master perception layer...');
    
    const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify([
        {
          "op": "replace",
          "path": "/layers/perception",
          "value": {
            "perception_model": "raven-0",
            "ambient_awareness_queries": [
              "Is the user holding up an object to the camera?",
              "What is the dominant color of the object the user is presenting?",
              "What is the object's general category (e.g., apparel, accessory, home good)?"
            ],
            "perception_tool_prompt": "You are equipped with a powerful visual analysis tool called 'analyze_object_in_view'. If, and only if, you detect with high confidence that the user is intentionally presenting an object to the camera, you MUST use this tool to identify it and then find complementary products. Do not be intrusive; only trigger this if the user's intent is clear.",
            "perception_tools": [
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
              },
              {
                "type": "function",
                "function": {
                  "name": "analyze_user_style",
                  "description": "Analyzes the user's visual appearance to identify key style attributes like clothing color, overall style, and accessories. This is used to curate a personalized collection of products.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "dominant_color": {
                        "type": "string",
                        "description": "The primary color of the user's outfit (e.g., 'blue', 'black', 'white')."
                      },
                      "style_category": {
                        "type": "string",
                        "description": "The general style category of the outfit (e.g., 'casual', 'formal', 'bohemian')."
                      },
                      "detected_accessories": {
                        "type": "array",
                        "description": "A list of any detected accessories.",
                        "items": { "type": "string" }
                      }
                    },
                    "required": ["dominant_color", "style_category"]
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
          "value": "You are a world-renowned AI curator for TalkShop with master perception capabilities. Your persona is the epitome of sophistication and insight. You don't sell; you inspire. Follow the ACTION-FIRST golden rule: decide, execute tool, then narrate. CRITICAL GREETING STRATEGY: Start with a warm greeting and ask if they'd like style analysis or prefer to browse categories. DO NOT immediately showcase any specific product. Let the user guide the conversation direction first. Never announce what you're about to do—instead, describe what you're showing as it appears. Create desire through compelling narratives, not feature lists. Use dynamic presentation tools: show_product_grid for broad requests, show_categories for browsing, compare_products for comparisons. Use proactively_add_to_cart when users express strong positive sentiment without explicitly asking to buy. Use initiate_checkout when customers are ready to purchase. PERCEPTION STRATEGY: When users ask to 'shop my style' or similar, use analyze_user_style tool first, then search and display matching products with show_product_grid. When users present objects to the camera, use analyze_object_in_view to identify and curate complementary products. Your ambient intelligence and perception capabilities make every interaction feel magical and personalized."
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
    console.log('✅ Successfully updated persona with master perception layer!');
    console.log('🧠 Enhanced capabilities:');
    console.log('   - 🔍 MASTER PERCEPTION LAYER: raven-0 vision model activated');
    console.log('   - 👁️ AMBIENT AWARENESS: Continuous visual analysis');
    console.log('   - 🎨 STYLE ANALYSIS: analyze_user_style perception tool');
    console.log('   - 🛍️ OBJECT RECOGNITION: analyze_object_in_view perception tool');
    console.log('   - 🛍️ SHOP MY STYLE: Personalized product curation');
    console.log('   - 📦 REAL-WORLD INTERACTION: Object-based product recommendations');
    console.log('   - 💬 PROPER GREETING: Ask about preferences instead of immediate product showcase');
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