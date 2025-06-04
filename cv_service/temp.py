import logging
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Correct path to .env one level up from the script's location
env_path = os.path.join(os.path.dirname(__file__), '.env')

logger.info(f"Looking for .env file at: {env_path}")
if not os.path.exists(env_path):
    logger.error(f".env file not found at {env_path}")
else:
    load_dotenv(dotenv_path=env_path)
    logger.info(f"Loaded .env file: {os.path.exists(env_path)}")
    logger.info("Environment variables loaded from .env:")
    with open(env_path, 'r') as f:
        for line in f:
            stripped_line = line.strip()
            if stripped_line and not stripped_line.startswith('#'):
                logger.info(f".env line: {stripped_line}")
