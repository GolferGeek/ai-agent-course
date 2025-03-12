from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import WebsiteSearchTool
from crewai_tools import ScrapeWebsiteTool
from crewai_tools import ScrapeElementFromWebsiteTool
from crewai_tools import FileReadTool

@CrewBase
class BuildingRagAutomationForLanggraphDocumentationScrapingCrew():
    """BuildingRagAutomationForLanggraphDocumentationScraping crew"""

    @agent
    def doc_navigator(self) -> Agent:
        return Agent(
            config=self.agents_config['doc_navigator'],
            tools=[WebsiteSearchTool(), ScrapeWebsiteTool()],
        )

    @agent
    def content_scraper(self) -> Agent:
        return Agent(
            config=self.agents_config['content_scraper'],
            tools=[ScrapeWebsiteTool(), ScrapeElementFromWebsiteTool()],
        )

    @agent
    def content_processor(self) -> Agent:
        return Agent(
            config=self.agents_config['content_processor'],
            tools=[FileReadTool()],
        )

    @agent
    def quality_reviewer(self) -> Agent:
        return Agent(
            config=self.agents_config['quality_reviewer'],
            tools=[FileReadTool(), WebsiteSearchTool()],
        )


    @task
    def map_documentation_structure(self) -> Task:
        return Task(
            config=self.tasks_config['map_documentation_structure'],
            tools=[WebsiteSearchTool(), ScrapeWebsiteTool()],
        )

    @task
    def extract_documentation_content(self) -> Task:
        return Task(
            config=self.tasks_config['extract_documentation_content'],
            tools=[ScrapeWebsiteTool(), ScrapeElementFromWebsiteTool()],
        )

    @task
    def process_documentation(self) -> Task:
        return Task(
            config=self.tasks_config['process_documentation'],
            tools=[FileReadTool()],
        )

    @task
    def review_documentation_quality(self) -> Task:
        return Task(
            config=self.tasks_config['review_documentation_quality'],
            tools=[FileReadTool(), WebsiteSearchTool()],
        )


    @crew
    def crew(self) -> Crew:
        """Creates the BuildingRagAutomationForLanggraphDocumentationScraping crew"""
        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
        )
