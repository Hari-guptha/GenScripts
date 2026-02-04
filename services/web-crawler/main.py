#!/usr/bin/env python3
"""
Web Crawler Service
Crawls websites based on keywords and sends results to RabbitMQ
"""

import json
import os
import pika
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@localhost:5672')
QUEUE_NAME = os.getenv('RABBITMQ_QUEUE_WEB_CRAWLER', 'web_crawler_queue')
RESULT_QUEUE = os.getenv('RABBITMQ_QUEUE_RESULT', 'web_crawler_results')

class WebCrawler:
    def __init__(self):
        self.visited_urls = set()
        self.max_sites = 10
        self.max_depth = 2
        
    def search_keywords(self, keywords: str, max_results: int = 10) -> list:
        """Search for URLs based on keywords using DuckDuckGo or similar"""
        # Simple implementation - in production, use proper search API
        # For now, we'll use a placeholder that returns example URLs
        logger.info(f"Searching for keywords: {keywords}")
        
        # In production, integrate with search API (DuckDuckGo, Bing, etc.)
        # For now, return example URLs
        return [
            f"https://example.com/search?q={keywords.replace(' ', '+')}",
        ]
    
    def crawl_url(self, url: str, depth: int = 0) -> dict:
        """Crawl a single URL and extract content"""
        if url in self.visited_urls or depth > self.max_depth:
            return None
            
        self.visited_urls.add(url)
        
        try:
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract text
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            # Extract title
            title = soup.find('title')
            title_text = title.get_text() if title else url
            
            return {
                'url': url,
                'title': title_text,
                'content': text[:5000],  # Limit content size
                'depth': depth,
            }
        except Exception as e:
            logger.error(f"Error crawling {url}: {e}")
            return None
    
    def crawl_keywords(self, keywords: str, max_sites: int = 10) -> list:
        """Crawl websites based on keywords"""
        self.max_sites = max_sites
        results = []
        
        # Get URLs from search
        urls = self.search_keywords(keywords, max_sites)
        
        for url in urls[:max_sites]:
            if len(results) >= max_sites:
                break
                
            result = self.crawl_url(url)
            if result:
                results.append(result)
        
        return results

def process_message(ch, method, properties, body):
    """Process messages from RabbitMQ"""
    try:
        message = json.loads(body)
        logger.info(f"Received message: {message}")
        
        keywords = message.get('keywords')
        max_sites = message.get('max_sites', 10)
        agent_id = message.get('agent_id')
        
        crawler = WebCrawler()
        results = crawler.crawl_keywords(keywords, max_sites)
        
        # Send results back
        result_message = {
            'agent_id': agent_id,
            'source_type': 'web_crawler',
            'results': results,
        }
        
        channel.basic_publish(
            exchange='',
            routing_key=RESULT_QUEUE,
            body=json.dumps(result_message),
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Processed and sent {len(results)} results")
        
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
    
    logger.info('Web crawler service started. Waiting for messages...')
    channel.start_consuming()
