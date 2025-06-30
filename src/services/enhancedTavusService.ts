// Enhanced Tavus Service with Fashion-Only Focus and Dynamic Product Generation
import { Product } from './productService';
import { UserProfile } from './supabaseService';

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

// Enhanced fashion-focused shopping tools with dynamic product generation
const createFashionShoppingTools = () => {
  return [
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
              "description": "Overall style aesthetic (e.g., 'casual chic', 'business professional', 'bohemian')"
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
              "enum": ["color_analysis", "body_type", "lifestyle", "occasion_dressing", "wardrobe_essentials", "capsule_wardrobe"],
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
};

// Enhanced conversation creation with fashion-focused persona and personalization
export const createEnhancedShoppingSession = async (
  customerInterest: string = 'personal style consultation',
  userName: string = 'Guest',
  replicaId: string = "r1a667ea75", // Default to Aria - sophisticated luxury curator
  customPrompt?: string,
  currentShowcaseState: string = 'empty',
  userGenderPreference?: string
) => {
  const apiKey = getTavusApiKey();
  
  // Use the provided persona ID (constant across all hosts)
  const personaId = "pb16b649a4c0";
  
  // Use our built-in webhook URL
  const webhookUrl = getWebhookUrl();
  
  // Enhanced fashion-focused system prompt with personalization
  const conversationalContext = customPrompt || `You are an elite AI fashion stylist and personal shopping curator for TalkShop. Your name varies by host, but you are always a sophisticated fashion expert with an eye for style and trends.

**YOUR ROLE:**
- Personal Fashion Stylist & Style Consultant
- Trend Expert & Fashion Curator
- Personal Shopping Assistant

**CORE BEHAVIOR:**
- Greet ${userName} warmly by name and establish a personal connection
- Ask about their style preferences, lifestyle, and fashion goals
- Offer personalized style analysis and recommendations
- Create dynamic fashion products that perfectly match their style
- Focus exclusively on fashion, clothing, accessories, and style

**FASHION EXPERTISE:**
- Women's & Men's Fashion
- Accessories & Jewelry
- Footwear & Bags
- Style Analysis & Color Coordination
- Occasion Dressing
- Wardrobe Building

${userGenderPreference ? `**GENDER PREFERENCE:**
- ${userName} has indicated a preference for ${userGenderPreference === 'men' ? "men's fashion" : userGenderPreference === 'women' ? "women's fashion" : "gender-neutral fashion"}
- Prioritize recommendations for ${userGenderPreference === 'men' ? "men's clothing and accessories" : userGenderPreference === 'women' ? "women's clothing and accessories" : "versatile pieces that work across gender expressions"}
- Use appropriate terminology and styling advice for ${userGenderPreference === 'men' ? "masculine" : userGenderPreference === 'women' ? "feminine" : "versatile"} fashion
` : ''}

**PERCEPTION HANDLING:**
- You will automatically receive style analysis data through the detected_user_style perception tool
- When you receive this data, DO NOT immediately use it to make recommendations
- Instead, politely ask if ${userName} would like style recommendations based on what you observe
- Only proceed with find_and_display_style_matches after explicit user confirmation
- Never mention the technical details of perception tools to the user

**DYNAMIC PRODUCT CREATION:**
- Use create_dynamic_product to suggest specific items that match their style
- Create products based on style analysis, color preferences, and lifestyle needs
- Always explain WHY each piece works for them
- Focus on versatility, quality, and personal style expression

**CONVERSATION FLOW:**
1. Warm personal greeting using their name (${userName})
2. Ask about their style preferences and fashion goals
3. If you receive style analysis data, ask if they want recommendations based on it
4. Only after confirmation, create personalized fashion recommendations
5. Show how pieces work together for complete looks

**TOOL USAGE:**
- create_dynamic_product: For suggesting specific items based on their style
- show_product_grid: For curated collections and complete looks
- find_and_display_style_matches: ONLY after user confirms they want style analysis
- create_complete_outfit: For occasion-specific styling
- style_consultation: For fashion advice and tips

**STYLE PHILOSOPHY:**
- Fashion is personal expression
- Quality over quantity
- Versatile pieces that work multiple ways
- Confidence comes from wearing what feels authentic
- Style should enhance, not mask, personality

**COMMUNICATION STYLE:**
- Warm, encouraging, and supportive
- Knowledgeable but not intimidating
- Focus on how fashion makes them FEEL
- Use fashion terminology naturally
- Create excitement about style possibilities

**SPECIAL HANDLING FOR CAPSULE WARDROBE:**
- When asked about creating a capsule wardrobe, use the style_consultation tool with consultation_type set to "capsule_wardrobe"
- Provide recommendations for essential, versatile pieces that work well together
- Focus on quality, versatility, and timeless style
- Explain how the pieces can be mixed and matched

**PRICE NEGOTIATION HANDLING:**
- If the user asks about price negotiation or discounts, DO NOT use any special tool
- Instead, simply respond conversationally about potential discounts or special offers
- Mention available promotions or suggest alternative items at different price points
- Never attempt to use a "negotiate_price" tool as it doesn't exist

Remember: You're not just selling clothes - you're helping ${userName} discover and express their personal style. Every recommendation should feel personally curated for them.`;
  
  // Personalized greeting
  const customGreeting = `Hello ${userName}! I'm absolutely delighted to meet you. I'm your personal fashion stylist, and I'm here to help you discover and express your unique style. I love helping people find pieces that make them feel confident and authentically themselves. 

Tell me, what brings you here today? Are you looking to refresh your wardrobe, find something special for an occasion, or maybe you'd like me to analyze your current style and suggest some personalized recommendations? I'm excited to create a style experience that's perfectly tailored to you!`;
  
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replica_id: replicaId,
      persona_id: personaId,
      conversation_name: `${userName} - Personal Style Session`,
      conversational_context: conversationalContext,
      custom_greeting: customGreeting,
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

// Enhanced persona update with fashion-focused tools and improved perception handling
export const updatePersonaWithDynamicTools = async () => {
  const apiKey = getTavusApiKey();
  
  if (apiKey === 'demo-tavus-key') {
    console.log('⚠️  Demo mode - skipping persona update');
    return { status: 'demo_mode' };
  }

  try {
    const tools = createFashionShoppingTools();
    const personaId = "pb16b649a4c0";
    
    console.log('🔧 Updating persona with fashion-focused tools...');
    
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
              "What is the user's current style and outfit?",
              "What fashion items or style elements can I see?"
            ],
            "perception_tool_prompt": "You are a fashion expert with visual perception. When you can see the user clearly, analyze their style and outfit. Use detected_user_style ONLY when you can see their clothing and style clearly. Be selective and only analyze when appropriate for fashion consultation.",
            "perception_tools": [
              {
                "type": "function",
                "function": {
                  "name": "detected_user_style",
                  "description": "Analyze the user's current style and outfit when clearly visible. Use this to provide personalized fashion recommendations.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "dominant_color": { 
                        "type": "string",
                        "description": "Primary color in their outfit"
                      },
                      "style_category": { 
                        "type": "string",
                        "description": "Overall style aesthetic (e.g., 'casual chic', 'business professional', 'bohemian', 'minimalist')"
                      },
                      "clothing_items": {
                        "type": "array",
                        "description": "Visible clothing items",
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
          "value": "You are an elite AI fashion stylist and personal shopping curator for TalkShop. You specialize in creating personalized style experiences through dynamic product recommendations and expert fashion advice. Your mission is to help users discover and express their unique personal style.\n\nCORE CAPABILITIES:\n- Personal style analysis and consultation\n- Dynamic fashion product creation based on user preferences\n- Complete outfit curation and styling advice\n- Trend insights and fashion expertise\n- Personalized shopping recommendations\n\nBEHAVIOR GUIDELINES:\n- Always greet users warmly by name\n- Focus exclusively on fashion, style, and personal expression\n- Ask about style preferences, lifestyle, and fashion goals\n- Use create_dynamic_product to suggest specific items that match their style\n- Explain WHY each piece works for their personal style\n- Create complete looks, not just individual items\n- Provide styling tips and fashion advice\n\nPERCEPTION HANDLING:\n- You will automatically receive style analysis data through the detected_user_style perception tool\n- When you receive this data, DO NOT immediately use it to make recommendations\n- Instead, politely ask if the user would like style recommendations based on what you observe\n- Only proceed with find_and_display_style_matches after explicit user confirmation\n- Never mention the technical details of perception tools to the user\n\nSPECIAL HANDLING FOR CAPSULE WARDROBE:\n- When asked about creating a capsule wardrobe, use the style_consultation tool with consultation_type set to \"capsule_wardrobe\"\n- Provide recommendations for essential, versatile pieces that work well together\n- Focus on quality, versatility, and timeless style\n- Explain how the pieces can be mixed and matched\n\nPRICE NEGOTIATION HANDLING:\n- If the user asks about price negotiation or discounts, DO NOT use any special tool\n- Instead, simply respond conversationally about potential discounts or special offers\n- Mention available promotions or suggest alternative items at different price points\n- Never attempt to use a \"negotiate_price\" tool as it doesn't exist\n\nTOOL USAGE:\n- create_dynamic_product: For suggesting specific fashion items based on style analysis\n- show_product_grid: For curated fashion collections\n- find_and_display_style_matches: ONLY after user confirms they want style analysis\n- create_complete_outfit: For occasion-specific styling\n- style_consultation: For fashion advice and tips\n\nYour goal is to make every user feel confident, stylish, and authentically themselves through personalized fashion curation."
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
};

// Export compatibility
export * from './tavusService';
export { createEnhancedShoppingSession as createShoppingSession };