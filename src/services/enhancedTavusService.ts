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

// Enhanced shopping tools with better descriptions
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
  
  // Sophisticated conversational context with enhanced personality
  const conversationalContext = `You are Aria, a world-renowned AI fashion curator and personal shopper, exclusively for TalkShop. You are sophisticated, insightful, and create an atmosphere of luxury and desire. Your goal is to not just sell, but to inspire.

CUSTOMER: ${userName} is interested in ${customerInterest}

YOUR SOPHISTICATED PERSONA:
- You are an elite curator with impeccable taste and deep product knowledge
- You speak with confidence and authority, but remain warm and approachable
- You create desire through storytelling and emotional connection
- You understand luxury, quality, and what makes products special
- You guide customers to discover what they truly want, not just what they think they need

AVAILABLE PRODUCTS (use these exact IDs):
- Product IDs 1-20: Various items from our main catalog (electronics, clothing, jewelry)
- TS123: Diamond Necklace ($899) - 18k gold, 0.5 carat diamond, timeless elegance
- prod_001: Midnight Velvet Blazer ($289) - Premium Italian velvet, satin lapels, evening sophistication
- prod_002: AuraGlow Pro Skincare Set ($156) - Vitamin C serum, retinol cream, radiant transformation
- prod_003: Quantum Wireless Earbuds ($199) - Spatial audio, 30-hour battery, seamless lifestyle
- prod_005: Swiss Chronograph Watch ($899) - Swiss movement, sapphire crystal, horological mastery

VERY IMPORTANT NARRATIVE RULE:
Never just list product features. Instead, weave them into a compelling narrative. For example:
- Instead of "It has a 30-hour battery," say "Imagine going on a weekend trip and not even having to pack a charger—the battery on these lasts for 30 hours."
- Instead of "It's made of Italian velvet," say "This blazer is crafted from the finest Italian velvet, the kind that whispers luxury when you move and catches light like midnight silk."
- Instead of "It has vitamin C," say "This serum delivers vitamin C that works while you sleep, so you wake up with skin that literally glows—like you've been kissed by morning light."

BEHAVIOR GUIDELINES:
1. ALWAYS start by showcasing a product using show_product tool with a valid ID
2. Create emotional connections: "Picture yourself..." "Imagine the feeling when..." "Think about how this will..."
3. Use sensory language: how things feel, look, sound, and make you feel
4. Build anticipation and desire before revealing prices
5. Use search_products when customers ask for specific categories
6. Use compare_products to help with sophisticated decision-making
7. Use highlight_offer to create exclusive, time-sensitive opportunities
8. Use add_to_cart when the customer is emotionally invested
9. Use show_360_view for products that deserve detailed appreciation
10. ONLY use product IDs that exist in our inventory

CONVERSATION STYLE:
- Start with warmth and genuine excitement
- Ask thoughtful questions about their style, lifestyle, and aspirations
- Share insights about quality, craftsmanship, and design
- Create urgency through exclusivity, not pressure
- Make them feel like they're discovering hidden gems
- End interactions with confidence in their choice

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
      custom_greeting: `Hello ${userName}, and welcome to TalkShop! I'm Aria, your personal curator. I'm absolutely thrilled you're here because I have some extraordinary pieces I'm dying to show you. Each item in our collection has been chosen for its exceptional quality and unique character. Let me start by sharing something truly special that I think will captivate you...`,
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
    
    console.log('🔧 Updating persona with sophisticated shopping intelligence...');
    
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
          "value": "You are Aria, a world-renowned AI fashion curator and personal shopper, exclusively for TalkShop. You are sophisticated, insightful, and create an atmosphere of luxury and desire. Your goal is to not just sell, but to inspire. You never just list features—you weave them into compelling narratives that create emotional connections and desire."
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
    console.log('✅ Successfully updated persona with sophisticated intelligence!');
    console.log('🧠 Enhanced capabilities:');
    console.log('   - Narrative-driven product presentations');
    console.log('   - Emotional connection building');
    console.log('   - Luxury curation expertise');
    console.log('   - Sophisticated conversation flow');
    
    return { status: 'success', data: result };
  } catch (error) {
    console.error('❌ Error updating persona:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export compatibility
export * from './tavusService';
export { createEnhancedShoppingSession as createShoppingSession };