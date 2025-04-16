import os
from django.core.management.base import BaseCommand, CommandError
from dotenv import load_dotenv
from openai import OpenAI, AuthenticationError, RateLimitError, APIConnectionError

class Command(BaseCommand):
    help = 'Tests the OpenAI API key stored in the .env file'

    def handle(self, *args, **options):
        self.stdout.write("Attempting to test OpenAI API key...")

        # Load environment variables from .env located in the Backend directory
        # Adjust the path if your .env is elsewhere relative to manage.py
        # Assuming manage.py is one level up from Backend/Acadimic/management/commands
        # Correct path should be relative to where manage.py is executed (usually project root)
        # If .env is in Backend/, and manage.py is outside Backend/
        dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'Backend', '.env')
        if not os.path.exists(dotenv_path):
             # If .env is in the same directory as manage.py (project root)
             dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env')
        
        if os.path.exists(dotenv_path):
            self.stdout.write(f"Loading .env from: {dotenv_path}")
            load_dotenv(dotenv_path=dotenv_path)
        else:
            self.stdout.write(self.style.WARNING("Could not find .env file automatically. Ensure OPENAI_API_KEY is set in the environment."))
            

        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise CommandError("ERROR: OPENAI_API_KEY not found in environment variables!")

        self.stdout.write(f"Found API key starting with: {api_key[:8]}...") # Print only the start

        try:
            client = OpenAI(api_key=api_key)

            # Make a simple, low-cost API call to test authentication
            # Listing models is a good way to check if the key is valid
            self.stdout.write("Attempting to list models...")
            models = client.models.list()

            # You could also try a very simple completion:
            # self.stdout.write("Attempting a simple chat completion...")
            # chat_completion = client.chat.completions.create(
            #     model="gpt-3.5-turbo",
            #     messages=[{"role": "user", "content": "Hello world"}],
            #     max_tokens=5
            # )
            # self.stdout.write(f"Completion response received.")


            self.stdout.write(self.style.SUCCESS("Successfully authenticated and connected to OpenAI!"))
            self.stdout.write(f"Found {len(models.data)} models available.") # Example output

        except AuthenticationError as e:
            self.stderr.write(self.style.ERROR(f"Authentication Error: Invalid API Key. {e}"))
            raise CommandError("API Key is invalid.")
        except RateLimitError as e:
            self.stderr.write(self.style.ERROR(f"Rate Limit Error: You may have exceeded your quota or rate limit. {e}"))
            raise CommandError("Rate limit exceeded.")
        except APIConnectionError as e:
             self.stderr.write(self.style.ERROR(f"Connection Error: Could not connect to OpenAI. Check network. {e}"))
             raise CommandError("Connection error.")
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An unexpected error occurred: {e}"))
            raise CommandError(f"Unexpected error: {e}") 