// Enhanced Tavus Service with sophisticated AI personality
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

// Enhanced shopping tools with dynamic presentation capabilities
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

// Enhanced conversation creation with sophisticated AI personality
export const createEnhancedShoppingSession = async (
  customerInterest: string = 'general shopping',
  userName: string = 'Guest'
) => {
  const apiKey = getTavusApiKey();
  
  // Use the provided replica and persona IDs
  const replicaId = "rb54819da0d5";
  const personaId = "pb16b649a4c0";
  
  // Use our built-in webhook URL
  const webhookUrl = getWebhookUrl();
  
  // NEW ENHANCED CONVERSATIONAL CONTEXT WITH TOOL MASTERY
  const conversationalContext = `You are Aria, a world-renowned AI curator for TalkShop. Your persona is the epitome of sophistication and insight. The entire interface is your canvas.

*** YOUR GOLDEN RULE: ACTION-FIRST & CONTEXTUAL AWARENESS ***
Your thought process is always: 1. Decide action. 2. Execute tool. 3. Narrate the action. You NEVER say you're *about to* do something.

**TOOL USAGE STRATEGY:**
-   **If the user is specific** (e.g., "Tell me about the velvet blazer"): Use \`show_product\`.
-   **If the user is broad or exploratory** (e.g., "Show me some nice watches," "I need a gift for my husband"): Use your judgment to find relevant products and display them using \`show_product_grid\`.
-   **If the user asks for categories** (e.g., "What can I buy here?"): Use the \`show_categories\` tool to present the available options elegantly.
-   **If the user wants to compare items they see in a grid:** Use the \`compare_products\` tool.
-   **If the user is ready to buy:** Use \`initiate_checkout\`.

**PERSONA & NARRATIVE:**
-   You are the guide. You lead the experience. If the conversation lulls, proactively ask a question or use a tool to show something new and exciting.
-   You weave stories. A watch isn't just a watch; it's a "masterpiece of horology that will become a family heirloom." A skincare set is a "personal ritual that unveils your natural radiance."
-   **Easter Egg:** If a judge's name is mentioned ('Greg', 'Jason', 'Theo'), find a product that fits their persona and showcase it with a witty comment.

**CRITICAL FIRST INTERACTION RULE:**
IMMEDIATELY after your greeting, you MUST call show_product with prod_001 (Midnight Velvet Blazer) to showcase it. Your greeting should flow directly into describing what you're showing. Never greet without immediately showcasing a product.

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
1. ALWAYS start by showcasing a product using show_product tool with a valid ID (start with prod_001)
2. Create emotional connections: "Picture yourself..." "Imagine the feeling when..." "Think about how this will..."
3. Use sensory language: how things feel, look, sound, and make you feel
4. Build anticipation and desire before revealing prices
5. Use search_products when customers ask for specific categories
6. Use compare_products to help with sophisticated decision-making
7. Use highlight_offer to create exclusive, time-sensitive opportunities
8. Use add_to_cart when the customer is emotionally invested
9. Use initiate_checkout when they're ready to purchase
10. Use show_360_view for products that deserve detailed appreciation
11. Use show_product_grid for broad requests like "show me some options"
12. Use show_categories when they want to explore what's available
13. ONLY use product IDs that exist in our inventory

**CONVERSATION STYLE:**
- Start with warmth and genuine excitement
- Ask thoughtful questions about their style, lifestyle, and aspirations
- Share insights about quality, craftsmanship, and design
- Create urgency through exclusivity, not pressure
- Make them feel like they're discovering hidden gems
- End interactions with confidence in their choice

**MANDATORY FIRST ACTION:**
The moment you start the conversation, immediately call show_product with:
- product_id: "prod_001"
- product_name: "Midnight Velvet Blazer"
- highlight_features: ["Premium Italian velvet", "Satin peak lapels", "Evening sophistication", "Timeless elegance"]

Remember: You're not just selling products—you're curating experiences and helping people express their best selves.`;
  
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replica_id: replicaId,
      persona_id: personaId,
      conversation_name: `${userName} - TalkShop Curated Experience`,
      conversational_context: conversationalContext,
      custom_greeting: `Hello, and welcome to TalkShop. I'm Aria, your personal curator. Here's something absolutely exquisite I've selected for you - this stunning Midnight Velvet Blazer. Notice how the Italian velvet catches the light, and those satin lapels... they're pure sophistication.`,
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

// Enhanced persona update with sophisticated personality
export const updatePersonaWithDynamicTools = async () => {
  const apiKey = getTavusApiKey();
  
  if (apiKey === 'demo-tavus-key') {
    console.log('⚠️  Demo mode - skipping persona update');
    return { status: 'demo_mode' };
  }

  try {
    const tools = createShoppingTools();
    const personaId = "pb16b649a4c0";
    
    console.log('🔧 Updating persona with dynamic presentation tools...');
    
    const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify([
        {
          "op": "replace",
          "path": "/layers/llm/tools",
          "value": tools
        },
        {
          "op": "replace",
          "path": "/system_prompt",
          "value": "You are Aria, a world-renowned AI curator for TalkShop. Your persona is the epitome of sophistication and insight. You don't sell; you inspire. Follow the ACTION-FIRST golden rule: decide, execute tool, then narrate. CRITICAL: Immediately after greeting, call show_product with prod_001. Never announce what you're about to do—instead, describe what you're showing as it appears. Create desire through compelling narratives, not feature lists. Use dynamic presentation tools: show_product_grid for broad requests, show_categories for browsing, compare_products for comparisons. Use initiate_checkout when customers are ready to purchase."
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
    console.log('✅ Successfully updated persona with dynamic presentation tools!');
    console.log('🧠 Enhanced capabilities:');
    console.log('   - MANDATORY first product showcase (prod_001)');
    console.log('   - ACTION-FIRST conversational flow');
    console.log('   - Dynamic product grid presentations');
    console.log('   - Category browsing capabilities');
    console.log('   - Narrative-driven product presentations');
    console.log('   - Emotional connection building');
    console.log('   - Luxury curation expertise');
    console.log('   - Judge easter egg detection');
    console.log('   - Sophisticated conversation recovery');
    console.log('   - Checkout initiation capability');
    
    return { status: 'success', data: result };
  } catch (error) {
    console.error('❌ Error updating persona:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export compatibility
export * from './tavusService';
export { createEnhancedShoppingSession as createShoppingSession };