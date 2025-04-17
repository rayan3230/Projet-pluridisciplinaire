import os
import json
import google.generativeai as genai
import google.api_core.exceptions
from dotenv import load_dotenv
import requests
from typing import Optional, Dict, Any

def initialize_ai():
    """Initialize the AI with API key."""
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables!")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')

def get_ai_response(model, user_input):
    """Get response from AI model."""
    prompt = f"""
    Context: You are an admin assistant for a university management system.
    Task: Interpret the user's request and provide a helpful response. Feel free to have a natural conversation.
    
    User Request: "{user_input}"
    
    Your Response: 
    """

    generation_config = genai.types.GenerationConfig(
        candidate_count=1,
        max_output_tokens=1000,  # Increased for more detailed responses
        temperature=0.7  # Slightly increased for more creative responses
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def create_base_module(name: str) -> Dict[str, Any]:
    """Create a new base module."""
    try:
        response = requests.post(
            'http://localhost:8000/api/base-modules/',
            json={'name': name}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating base module: {str(e)}")
        return None

def list_base_modules() -> Optional[list]:
    """List all base modules."""
    try:
        response = requests.get('http://localhost:8000/api/base-modules/')
        response.raise_for_status()
        data = response.json()
        print(f"Debug - API Response: {data}")  # Debug print
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error listing base modules: {str(e)}")
        return None

def handle_base_module_command(command: str, args: list) -> str:
    """Handle base module related commands."""
    if command == "create":
        if not args:
            return "Please provide a name for the base module."
        name = args[0]
        result = create_base_module(name)
        if result:
            return f"Successfully created base module: {result['name']}"
        return "Failed to create base module."
    
    elif command == "list":
        modules = list_base_modules()
        if modules is None:
            return "Failed to fetch base modules."
        if not modules:
            return "No base modules found."
        
        # Format the module list with more details
        module_list = ["Base Modules:"]
        try:
            # Handle both list and dict responses
            if isinstance(modules, dict):
                modules = [modules]
            elif isinstance(modules, list):
                pass
            else:
                return f"Unexpected response format: {type(modules)}"
            
            for i, module in enumerate(modules, 1):
                if isinstance(module, dict) and 'name' in module and 'id' in module:
                    module_list.append(f"{i}. {module['name']} (ID: {module['id']})")
                else:
                    module_list.append(f"{i}. {str(module)}")
            return "\n".join(module_list)
        except Exception as e:
            return f"Error formatting modules: {str(e)}\nRaw data: {modules}"
    
    return "Unknown base module command. Available commands: create, list"

def main():
    """Main CLI interface."""
    print("\n=== University Management AI Assistant ===")
    print("Type 'exit' or 'quit' to end the conversation")
    print("Type 'clear' to clear the screen")
    print("Type 'module create <name>' to create a base module")
    print("Type 'module list' to list all base modules")
    print("=========================================\n")

    try:
        model = initialize_ai()
        
        while True:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['exit', 'quit']:
                print("\nGoodbye! Have a great day!")
                break
            
            if user_input.lower() == 'clear':
                os.system('cls' if os.name == 'nt' else 'clear')
                continue
            
            if not user_input:
                continue

            # Handle base module commands
            if user_input.lower().startswith('module'):
                parts = user_input.split()
                if len(parts) >= 2:
                    command = parts[1]
                    args = parts[2:]
                    response = handle_base_module_command(command, args)
                    print("\nSystem: ", end='')
                    print(response)
                    continue

            print("\nAI: ", end='')
            response = get_ai_response(model, user_input)
            print(response)

    except KeyboardInterrupt:
        print("\n\nGoodbye! Have a great day!")
    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    main() 