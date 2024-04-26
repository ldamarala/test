from loguru import logger


def setup_logging():
    logger.add("app.log", rotation="500 MB", compression="zip", backtrace=True, diagnose=True)
