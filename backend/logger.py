"""Centralized logging configuration."""
import logging
import sys
from pathlib import Path

def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configure structured logging for the application."""

    # Create logger
    logger = logging.getLogger("cropsave")
    logger.setLevel(getattr(logging, log_level.upper()))

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)

    # Add handler
    logger.addHandler(console_handler)

    return logger

# Global logger instance
logger = setup_logging()
