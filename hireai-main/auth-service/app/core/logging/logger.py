import sys
from loguru import logger

from app.core.config import settings

logger.remove()
logger.add(sys.stdout, colorize=True, format=settings.LOG_FORMAT, level=settings.LOG_LEVEL)
