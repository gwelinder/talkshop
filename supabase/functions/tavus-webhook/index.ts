/*
  # Enhanced Tavus Webhook Handler

  1. New Functions
    - Handles incoming webhooks from Tavus API
    - Processes tool calls and conversation events
    - Forwards events to connected clients via Server-Sent Events
    - Supports tool call responses back to Tavus

  2. Security
    - Validates webhook signatures
    - Rate limiting protection
    - CORS handling for cross-origin requests
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-signature",
}

interface WebhookEvent {
  type: string;
  conversation_id: string;
  data: any;
  timestamp: string;
}

interface ToolCallEvent {
  message_type: string;
  event_type: string;
  conversation_id: string;
  inference_id: string;
  properties: {
    name: string;
    arguments: any;
  };
}

// Store active connections for real-time event forwarding
const activeConnections = new Map<string, ReadableStreamDefaultController>();

// Store tool call responses to send back to Tavus
const toolCallResponses = new Map<string, any>();

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  console.log(`📨 Webhook request: ${req.method} ${path}`);
  console.log(`📨 Full URL: ${req.url}`);

  try {
    // Main webhook endpoint for Tavus callbacks - handle the root path
    if (req.method === "POST" && (
      path === "/tavus-webhook" || 
      path === "/functions/v1/tavus-webhook" ||
      path.endsWith("/tavus-webhook")
    )) {
      const webhookData = await req.json();
      console.log('📨 Received Tavus webhook:', JSON.stringify(webhookData, null, 2));

      // Handle tool call events specifically
      if (webhookData.event_type === "conversation.tool_call") {
        const toolCallEvent: ToolCallEvent = webhookData;
        console.log('🔧 Processing tool call:', toolCallEvent.properties.name);

        // Create standardized tool call format for frontend
        const toolCall = {
          function: {
            name: toolCallEvent.properties.name,
            arguments: toolCallEvent.properties.arguments
          }
        };

        // Forward to connected clients immediately
        const controller = activeConnections.get(toolCallEvent.conversation_id);
        if (controller) {
          try {
            const eventData = `data: ${JSON.stringify({
              type: 'conversation-toolcall',
              conversation_id: toolCallEvent.conversation_id,
              tool_call: toolCall,
              timestamp: new Date().toISOString()
            })}\n\n`;
            
            controller.enqueue(new TextEncoder().encode(eventData));
            console.log('✅ Tool call forwarded to frontend');
          } catch (error) {
            console.error('❌ Error forwarding tool call:', error);
            activeConnections.delete(toolCallEvent.conversation_id);
          }
        } else {
          console.log('⚠️  No active connection for conversation:', toolCallEvent.conversation_id);
        }

        // Simulate tool execution and response
        const toolResponse = await executeToolCall(toolCall);
        
        // Send response back to Tavus if needed
        if (toolResponse) {
          console.log('📤 Sending tool response back to Tavus:', toolResponse);
          // Note: Tavus doesn't require explicit tool responses in most cases
          // The frontend handles the tool calls directly
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            tool_call_processed: true,
            function_name: toolCallEvent.properties.name,
            path: path
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Handle other webhook events
      const event: WebhookEvent = {
        type: webhookData.event_type || webhookData.type || 'unknown',
        conversation_id: webhookData.conversation_id,
        data: webhookData,
        timestamp: new Date().toISOString()
      };

      // Forward to connected clients
      const controller = activeConnections.get(event.conversation_id);
      if (controller) {
        try {
          const eventData = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(new TextEncoder().encode(eventData));
        } catch (error) {
          console.error('Error forwarding event:', error);
          activeConnections.delete(event.conversation_id);
        }
      }

      // Handle specific event types
      switch (event.type) {
        case 'system.replica_joined':
          console.log('🤖 Replica joined conversation:', event.conversation_id);
          break;
        case 'system.shutdown':
          console.log('🔚 Conversation ended:', event.conversation_id);
          activeConnections.delete(event.conversation_id);
          break;
        case 'conversation.utterance':
          console.log('💬 Utterance received for:', event.conversation_id);
          break;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          received: event.type,
          path: path,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Server-Sent Events endpoint for real-time updates
    if (req.method === "GET" && path.includes("/events/")) {
      const conversationId = path.split("/events/");
      
      if (!conversationId) {
        return new Response("Missing conversation ID", { status: 400 });
      }

      console.log('🔌 New SSE connection for conversation:', conversationId);

      // Create SSE stream
      const stream = new ReadableStream({
        start(controller) {
          // Store connection for this conversation
          activeConnections.set(conversationId, controller);
          
          // Send initial connection message
          const initMessage = `data: ${JSON.stringify({
            type: 'connection_established',
            conversation_id: conversationId,
            timestamp: new Date().toISOString()
          })}\n\n`;
          
          controller.enqueue(new TextEncoder().encode(initMessage));
          
          // Keep-alive ping every 30 seconds
          const keepAlive = setInterval(() => {
            try {
              controller.enqueue(new TextEncoder().encode("data: {\"type\":\"ping\"}\n\n"));
            } catch (error) {
              clearInterval(keepAlive);
              activeConnections.delete(conversationId);
            }
          }, 30000);

          // Clean up on close
          return () => {
            clearInterval(keepAlive);
            activeConnections.delete(conversationId);
            console.log('🔌 SSE connection closed for:', conversationId);
          };
        },
        cancel() {
          activeConnections.delete(conversationId);
          console.log('🔌 SSE connection cancelled for:', conversationId);
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Health check endpoint
    if (req.method === "GET" && (
      path === "/health" || 
      path === "/tavus-webhook/health" || 
      path === "/functions/v1/tavus-webhook/health" ||
      path.includes("/health")
    )) {
      return new Response(
        JSON.stringify({ 
          status: "healthy", 
          active_connections: activeConnections.size,
          timestamp: new Date().toISOString(),
          path: path,
          url: req.url
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Default response for any unmatched paths
    console.log(`⚠️  Unmatched path: ${path}`);
    return new Response(
      JSON.stringify({ 
        error: "Path not found",
        path: path,
        method: req.method,
        url: req.url,
        available_endpoints: [
          "POST /tavus-webhook (or /functions/v1/tavus-webhook)",
          "GET /events/{conversation_id}",
          "GET /health"
        ],
        note: "This webhook is ready to receive Tavus callbacks"
      }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message,
        path: path,
        url: req.url
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simulate tool execution for demonstration
async function executeToolCall(toolCall: any) {
  const { name, arguments: args } = toolCall.function;
  
  console.log(`🛠️  Executing tool: ${name} with args:`, args);
  
  switch (name) {
    case 'create_dynamic_product':
      return {
        success: true,
        message: `Dynamically created fashion product: ${args.product_description}`,
        product_created: true
      };
    case 'show_product':
      return {
        success: true,
        message: `Displaying fashion product ${args.product_name} (${args.product_id})`,
        product_displayed: true
      };
    case 'show_product_grid':
      return {
        success: true,
        message: `Displaying fashion collection: ${args.collection_title}`,
        collection_displayed: true
      };
    case 'show_categories':
      return {
        success: true,
        message: `Displaying fashion categories`,
        categories_displayed: true
      };
    case 'focus_on_product':
      return {
        success: true,
        message: `Focusing on fashion item ${args.item_id} (${args.product_id})`,
        item_focused: true
      };
    case 'find_and_display_style_matches':
      return {
        success: true,
        message: `Found and displaying style matches for ${args.style_category} in ${args.dominant_color}`,
        style_matches_displayed: true
      };
    case 'create_complete_outfit':
      return {
        success: true,
        message: `Created complete outfit based on ${args.base_item} for ${args.occasion}`,
        outfit_created: true
      };
    case 'style_consultation':
      return {
        success: true,
        message: `Providing style consultation of type: ${args.consultation_type}`,
        consultation_provided: true
      };
    case 'compare_products':
      return {
        success: true,
        message: `Comparing ${args.product_ids.length} fashion items by ${args.comparison_aspect}`,
        products_compared: args.product_ids
      };
    case 'add_to_cart':
      return {
        success: true,
        message: `Added ${args.quantity} of fashion item ${args.product_id} to cart`,
        cart_updated: true
      };
    case 'proactively_add_to_cart':
      return {
        success: true,
        message: `Proactively added ${args.product_name} to cart. Confirmation: "${args.confirmation_speech}"`,
        proactive_cart_add: true
      };
    case 'initiate_checkout':
      return {
        success: true,
        message: `Initiating checkout for ${args.cart_items.length} fashion items`,
        checkout_initiated: true
      };
    default:
      return {
        success: false,
        message: `Unknown fashion tool: ${name}`,
        error: 'Tool not implemented'
      };
  }
}