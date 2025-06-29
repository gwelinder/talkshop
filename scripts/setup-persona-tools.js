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
    console.log('🔧 Updating persona with shopping tools...');
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
          "op": "replace",
          "path": "/layers/llm/tools",
          "value": shoppingTools
        }
      ])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update persona: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Successfully updated persona with shopping tools!');
    console.log('📋 Tools added:');
    shoppingTools.forEach(tool => {
      console.log(`   - ${tool.function.name}: ${tool.function.description}`);
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error updating persona tools:', error);
    throw error;
  }
}

// Run the setup
updatePersonaTools()
  .then(() => {
    console.log('🎉 Persona setup complete! Your AI agent now has shopping tools including checkout.');
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });

export { updatePersonaTools, shoppingTools };