#!/usr/bin/env python3
"""
Research Paper Fetcher Service
Fetches papers from arXiv, Semantic Scholar, and other free sources
"""

import json
import os
import pika
import requests
import logging
import arxiv
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@localhost:5672')
QUEUE_NAME = os.getenv('RABBITMQ_QUEUE_PAPER_FETCHER', 'paper_fetcher_queue')
RESULT_QUEUE = os.getenv('RABBITMQ_QUEUE_RESULT', 'paper_fetcher_results')

class PaperFetcher:
    """Fetches research papers from various sources"""
    
    def fetch_arxiv(self, keywords: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Fetch papers from arXiv"""
        try:
            search = arxiv.Search(
                query=keywords,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.Relevance
            )
            
            results = []
            for paper in search.results():
                # Download PDF
                pdf_url = paper.pdf_url
                pdf_response = requests.get(pdf_url, timeout=30)
                
                results.append({
                    'title': paper.title,
                    'authors': [author.name for author in paper.authors],
                    'abstract': paper.summary,
                    'published': paper.published.isoformat(),
                    'pdf_url': pdf_url,
                    'pdf_content': pdf_response.content if pdf_response.status_code == 200 else None,
                    'arxiv_id': paper.entry_id.split('/')[-1],
                    'source': 'arxiv',
                })
            
            return results
        except Exception as e:
            logger.error(f"Error fetching from arXiv: {e}")
            return []
    
    def fetch_semantic_scholar(self, keywords: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Fetch papers from Semantic Scholar API"""
        try:
            # Semantic Scholar API (free tier)
            url = "https://api.semanticscholar.org/graph/v1/paper/search"
            params = {
                'query': keywords,
                'limit': max_results,
                'fields': 'title,authors,abstract,year,openAccessPdf'
            }
            
            response = requests.get(url, params=params, timeout=30)
            if response.status_code != 200:
                logger.error(f"Semantic Scholar API error: {response.status_code}")
                return []
            
            data = response.json()
            results = []
            
            for paper in data.get('data', []):
                pdf_url = None
                if paper.get('openAccessPdf'):
                    pdf_url = paper['openAccessPdf'].get('url')
                
                results.append({
                    'title': paper.get('title', ''),
                    'authors': [author.get('name', '') for author in paper.get('authors', [])],
                    'abstract': paper.get('abstract', ''),
                    'year': paper.get('year'),
                    'pdf_url': pdf_url,
                    'source': 'semantic_scholar',
                })
            
            return results
        except Exception as e:
            logger.error(f"Error fetching from Semantic Scholar: {e}")
            return []
    
    def fetch_papers(self, keywords: str, max_papers: int = 10, sources: List[str] = None) -> List[Dict[str, Any]]:
        """Fetch papers from multiple sources"""
        if sources is None:
            sources = ['arxiv', 'semantic_scholar']
        
        all_results = []
        papers_per_source = max_papers // len(sources) if sources else max_papers
        
        if 'arxiv' in sources:
            arxiv_results = self.fetch_arxiv(keywords, papers_per_source)
            all_results.extend(arxiv_results)
        
        if 'semantic_scholar' in sources:
            scholar_results = self.fetch_semantic_scholar(keywords, papers_per_source)
            all_results.extend(scholar_results)
        
        return all_results[:max_papers]

def process_message(ch, method, properties, body):
    """Process messages from RabbitMQ"""
    try:
        message = json.loads(body)
        logger.info(f"Received message: {message}")
        
        keywords = message.get('keywords')
        max_papers = message.get('max_papers', 10)
        sources = message.get('sources', ['arxiv', 'semantic_scholar'])
        agent_id = message.get('agent_id')
        
        fetcher = PaperFetcher()
        results = fetcher.fetch_papers(keywords, max_papers, sources)
        
        # Send results back
        result_message = {
            'agent_id': agent_id,
            'source_type': 'research_paper',
            'keywords': keywords,
            'papers': results,
        }
        
        channel.basic_publish(
            exchange='',
            routing_key=RESULT_QUEUE,
            body=json.dumps(result_message),
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Fetched {len(results)} papers")
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

if __name__ == '__main__':
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.queue_declare(queue=RESULT_QUEUE, durable=True)
    
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_message)
    
    logger.info('Paper fetcher service started. Waiting for messages...')
    channel.start_consuming()
