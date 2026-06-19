"""Launch all three SWRMZ Band agents. They connect to Band and coordinate
through a shared room. Start a chat at app.band.ai, add the three agents, then:

    @Analyst scan /absolute/path/to/repo

and watch them hand off Analyst → Fixer → Reviewer through Band.
"""
import asyncio
import logging

from dotenv import load_dotenv

from agents import build_agent

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("swrmz")


async def main() -> None:
    load_dotenv()
    agents = [build_agent("analyst"), build_agent("fixer"), build_agent("reviewer")]
    log.info("Starting %d SWRMZ agents — coordinating through Band…", len(agents))
    # Each agent.run() connects via WebSocket and listens for @mentions.
    await asyncio.gather(*(a.run() for a in agents))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("Shutting down agents.")
