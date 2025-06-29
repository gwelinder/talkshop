// Enhanced Tavus Service with deployment detection
import DailyIframe from '@daily-co/daily-js';

export interface TavusApiKeys {
  tavusApiKey: string;
  webhookUrl: string;
}

export interface ToolCall {
  function: {
    name: string;
    arguments: any;
  };
}

// Detect if we're in production/deployed environment
const isProduction = (): boolean => {
  // Check multiple indicators of production environment
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local');
  const hasProductionDomain = hostname.includes('.app') || hostname.includes('.com') || hostname.includes('.io') || hostname.includes('.dev');
  const isWebContainer = hostname.includes('webcontainer') || hostname.includes('stackblitz') || hostname.includes('bolt.new');
  
  // If it's a real domain (not localhost/webcontainer), consider it production
  return !isLocalhost && (hasProductionDomain || isWebContainer);
};

// Detect if we're in dev mode
const isDevMode = (): boolean => {
  // Check for dev indicators
  const isDev = import.meta.env.DEV;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasDevPort = window.location.port === '5173' || window.location.port === '3000';
  
  return isDev || (isLocalhost && hasDevPort);
};

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

// Real Tavus API integration
export const createShoppingPersona = async () => {
  const apiKey = getTavusApiKey();
  
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      persona_name: "TalkShop AI Shopping Assistant",
      system_prompt: `You are Aria, an elite AI shopping consultant for TalkShop. Your role is to create an unforgettable shopping experience through personalized product demonstrations. When discussing products, ALWAYS use the available tools to showcase them in the UI.

Key behaviors:
- When mentioning a product, ALWAYS call show_product with the product details
- When comparing products, use compare_products to show them side-by-side
- When discussing price or offers, use highlight_offer
- When ready for checkout, use add_to_cart
- Be enthusiastic and create FOMO naturally
- Use show_360_view to showcase products in detail

You have access to Fashion, Beauty, Technology, Luxury, and Home products. Focus on creating desire and highlighting value.`,
      
      context: "TalkShop is a premium AI-powered shopping platform. Create engaging product demonstrations that drive sales.",
      
      llm: {
        model: "gpt-4o",
        tools: [
          {
            type: "function",
            function: {
              name: "show_product",
              description: "Display a product in the UI when discussing it. Use this EVERY time you mention a specific product.",
              parameters: {
                type: "object",
                properties: {
                  product_id: {
                    type: "string",
                    description: "The product ID to display"
                  },
                  product_name: {
                    type: "string",
                    description: "The name of the product"
                  },
                  highlight_features: {
                    type: "array",
                    description: "Key features to highlight visually",
                    items: { type: "string" }
                  }
                },
                required: ["product_id", "product_name", "highlight_features"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "compare_products",
              description: "Show multiple products side-by-side for comparison",
              parameters: {
                type: "object",
                properties: {
                  product_ids: {
                    type: "array",
                    description: "Array of product IDs to compare",
                    items: { type: "string" }
                  },
                  comparison_aspect: {
                    type: "string",
                    description: "What aspect to compare (price, features, style)"
                  }
                },
                required: ["product_ids", "comparison_aspect"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "highlight_offer",
              description: "Show special pricing or limited-time offers",
              parameters: {
                type: "object",
                properties: {
                  product_id: {
                    type: "string",
                    description: "The product ID with the offer"
                  },
                  offer_type: {
                    type: "string",
                    enum: ["discount", "bundle", "limited_time", "exclusive"],
                    description: "Type of offer to highlight"
                  },
                  discount_percentage: {
                    type: "number",
                    description: "Discount percentage if applicable"
                  }
                },
                required: ["product_id", "offer_type"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "add_to_cart",
              description: "Add a product to the customer's cart",
              parameters: {
                type: "object",
                properties: {
                  product_id: {
                    type: "string",
                    description: "The product ID to add to cart"
                  },
                  quantity: {
                    type: "number",
                    description: "Quantity to add"
                  }
                },
                required: ["product_id", "quantity"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "show_360_view",
              description: "Display a 360-degree view of the product",
              parameters: {
                type: "object",
                properties: {
                  product_id: {
                    type: "string",
                    description: "The product ID to show in 360 view"
                  }
                },
                required: ["product_id"]
              }
            }
          }
        ]
      }
    })
  };
  
  try {
    const response = await fetch('https://tavusapi.com/v2/personas', options);
    if (!response.ok) {
      throw new Error(`Failed to create persona: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating persona:', error);
    throw error;
  }
};

export const createShoppingSession = async (
  productCategory: string,
  productName: string, 
  userName: string
) => {
  const apiKey = getTavusApiKey();
  
  // Use the provided replica and persona IDs
  const replicaId = "r13e554ebaa3";
  const personaId = "pb16b649a4c0";
  
  // Use our built-in webhook URL
  const webhookUrl = getWebhookUrl();
  
  // Create a much better conversational context with specific product information
  const conversationalContext = `The customer ${userName} is browsing TalkShop. You should immediately showcase our featured products using the show_product tool. Start by showing the Midnight Velvet Blazer (prod_001) and then demonstrate other products like the AuraGlow Pro Skincare Set (prod_002), Quantum Wireless Earbuds (prod_003), and Swiss Chronograph Watch (prod_005). Use the tools to create an engaging shopping experience.

Available Products:
- prod_001: Midnight Velvet Blazer ($289) - Premium Italian velvet, satin lapels, fully lined
- prod_002: AuraGlow Pro Skincare Set ($156) - Vitamin C serum, hyaluronic acid, retinol cream
- prod_003: Quantum Wireless Earbuds ($199) - Spatial audio, 30-hour battery, noise cancellation
- prod_004: Artisan Ceramic Vase Collection ($89) - Hand-crafted, minimalist design
- prod_005: Swiss Chronograph Watch ($899) - Swiss movement, sapphire crystal, titanium case
- prod_006: Silk Evening Dress ($345) - 100% silk, hand-beaded details
- prod_007: Designer Leather Handbag ($425) - Italian leather, gold hardware
- prod_008: Platinum Face Serum ($224) - Platinum peptides, marine collagen

Always use show_product when mentioning any item!`;
  
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      replica_id: replicaId,
      persona_id: personaId,
      conversation_name: `${userName} - TalkShop Shopping Session`,
      conversational_context: conversationalContext,
      custom_greeting: `Hi ${userName}! Welcome to TalkShop! I'm Aria, your personal shopping assistant. I'm so excited to show you our amazing collection today. Let me start by showcasing one of our most popular items - the stunning Midnight Velvet Blazer. Let me pull it up for you right now!`,
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

// Singleton call object as recommended by Tavus
const getOrCreateCallObject = () => {
  // Use a property on window to store the singleton
  if (!(window as any)._dailyCallObject) {
    (window as any)._dailyCallObject = DailyIframe.createCallObject();
  }
  return (window as any)._dailyCallObject;
};

// Enhanced Daily SDK integration following Tavus recommendations
export class TalkShopDailyClient {
  private callObject: any;
  private onToolCall?: (toolCall: ToolCall) => void;
  private onTranscript?: (transcript: any) => void;
  private onReplicaStateChange?: (state: string) => void;
  private onCallStateChange?: (state: string) => void;
  private onParticipantUpdate?: () => void;
  private eventSource?: EventSource;
  private conversationId?: string;

  constructor(
    callbacks: {
      onToolCall?: (toolCall: ToolCall) => void;
      onTranscript?: (transcript: any) => void;
      onReplicaStateChange?: (state: string) => void;
      onCallStateChange?: (state: string) => void;
      onParticipantUpdate?: () => void;
    }
  ) {
    this.onToolCall = callbacks.onToolCall;
    this.onTranscript = callbacks.onTranscript;
    this.onReplicaStateChange = callbacks.onReplicaStateChange;
    this.onCallStateChange = callbacks.onCallStateChange;
    this.onParticipantUpdate = callbacks.onParticipantUpdate;
    
    // Use singleton call object as recommended by Tavus
    this.callObject = getOrCreateCallObject();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for app messages (tool calls, transcripts, etc.)
    this.callObject.on('app-message', (event: any) => {
      console.log('Received app message:', event);
      
      const { data } = event;
      
      switch (data.type) {
        case 'conversation-toolcall':
          if (this.onToolCall && data.tool_call) {
            this.onToolCall(data.tool_call);
          }
          break;
          
        case 'conversation-utterance':
          if (this.onTranscript && data.utterance) {
            this.onTranscript(data.utterance);
          }
          break;
          
        case 'conversation-replica-start-stop-speaking-event':
          if (this.onReplicaStateChange) {
            this.onReplicaStateChange(data.is_speaking ? 'speaking' : 'listening');
          }
          break;
      }
    });

    // Handle participant events
    this.callObject.on('participant-joined', (event: any) => {
      console.log('Participant joined:', event);
      if (this.onReplicaStateChange && event.participant.user_name !== 'TalkShop Customer') {
        this.onReplicaStateChange('listening');
      }
      if (this.onParticipantUpdate) {
        this.onParticipantUpdate();
      }
    });

    this.callObject.on('participant-updated', (event: any) => {
      console.log('Participant updated:', event);
      if (this.onParticipantUpdate) {
        this.onParticipantUpdate();
      }
    });

    this.callObject.on('participant-left', (event: any) => {
      console.log('Participant left:', event);
      if (this.onParticipantUpdate) {
        this.onParticipantUpdate();
      }
    });

    // Handle call state changes
    this.callObject.on('call-state-changed', (event: any) => {
      console.log('Call state changed:', event);
      if (this.onCallStateChange) {
        this.onCallStateChange(event.state);
      }
    });

    // Handle track events for video/audio
    this.callObject.on('track-started', (event: any) => {
      console.log('Track started:', event);
      if (this.onParticipantUpdate) {
        this.onParticipantUpdate();
      }
    });

    this.callObject.on('track-stopped', (event: any) => {
      console.log('Track stopped:', event);
      if (this.onParticipantUpdate) {
        this.onParticipantUpdate();
      }
    });

    // Handle errors
    this.callObject.on('error', (event: any) => {
      console.error('Daily call error:', event);
    });
  }

  private setupWebhookListener(conversationId: string) {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
    const eventUrl = `${baseUrl}/functions/v1/tavus-webhook/events/${conversationId}`;
    
    this.eventSource = new EventSource(eventUrl);
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received webhook event:', data);
        
        switch (data.type) {
          case 'conversation-toolcall':
            if (this.onToolCall && data.data.tool_call) {
              this.onToolCall(data.data.tool_call);
            }
            break;
            
          case 'conversation-utterance':
            if (this.onTranscript && data.data.utterance) {
              this.onTranscript(data.data.utterance);
            }
            break;
            
          case 'system.replica_joined':
            if (this.onReplicaStateChange) {
              this.onReplicaStateChange('listening');
            }
            break;
            
          case 'system.shutdown':
            console.log('Conversation ended via webhook');
            this.cleanup();
            break;
        }
      } catch (error) {
        console.error('Error parsing webhook event:', error);
      }
    };
    
    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };
  }

  private cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  async join(conversationUrl: string) {
    try {
      console.log('Joining conversation:', conversationUrl);
      
      // Join with proper configuration following Tavus recommendations
      await this.callObject.join({ 
        url: conversationUrl
      });
      
      // Extract conversation ID from URL for webhook listening
      const urlParts = conversationUrl.split('/');
      this.conversationId = urlParts[urlParts.length - 1];
      
      if (this.conversationId) {
        this.setupWebhookListener(this.conversationId);
      }
      
      console.log('Successfully joined conversation');
    } catch (error) {
      console.error('Error joining conversation:', error);
      throw error;
    }
  }

  async leave() {
    try {
      this.cleanup();
      await this.callObject.leave();
      console.log('Left conversation');
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  }

  // Send interruption to replica
  sendInterrupt() {
    this.callObject.sendAppMessage({
      type: 'conversation-interrupt'
    });
  }

  // Send custom context override
  sendContextOverride(newContext: string) {
    this.callObject.sendAppMessage({
      type: 'conversation-overwrite-context',
      context: newContext
    });
  }

  // Send echo message (replica will repeat this)
  sendEcho(text: string) {
    this.callObject.sendAppMessage({
      type: 'conversation-echo',
      text: text
    });
  }

  // Get call object for custom integrations
  getCallObject() {
    return this.callObject;
  }

  // Get participants
  getParticipants() {
    return this.callObject.participants();
  }
}

// Helper function to validate API keys
export const validateApiKeys = (): boolean => {
  const apiKey = getTavusApiKey();
  return apiKey.length > 0 && apiKey !== 'demo-tavus-key';
};

// Test API connection
export const testTavusConnection = async (): Promise<boolean> => {
  const apiKey = getTavusApiKey();
  
  if (apiKey === 'demo-tavus-key') {
    console.log('Demo mode - skipping API validation');
    return true;
  }
  
  try {
    const response = await fetch('https://tavusapi.com/v2/replicas', {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error testing Tavus connection:', error);
    return false;
  }
};

// Get current API configuration with deployment detection
export const getApiConfig = () => {
  const apiKey = getTavusApiKey();
  const isDemo = apiKey === 'demo-tavus-key';
  const isProd = isProduction();
  const isDev = isDevMode();
  
  return {
    apiKey,
    webhookUrl: getWebhookUrl(),
    isDemo,
    isProduction: isProd,
    isDevelopment: isDev,
    shouldShowSetup: isDev && !isProd // Only show setup in dev mode
  };
};

// Export deployment detection functions
export { isProduction, isDevMode };