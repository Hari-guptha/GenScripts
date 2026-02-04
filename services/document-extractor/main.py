#!/usr/bin/env python3
"""
Document Extractor Service
Extracts content from PDF, DOCX, and DOC files using multiple strategies
"""

import json
import os
import pika
import logging
from pathlib import Path
from typing import Dict, List, Any
import fitz  # PyMuPDF
from docx import Document
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@localhost:5672')
QUEUE_NAME = os.getenv('RABBITMQ_QUEUE_DOCUMENT_EXTRACTOR', 'document_extractor_queue')
RESULT_QUEUE = os.getenv('RABBITMQ_QUEUE_RESULT', 'document_extractor_results')

class DocumentExtractor:
    """Multi-strategy document extractor inspired by RAGFlow"""
    
    def extract_pdf(self, file_path: str, strategy: str = 'layout') -> Dict[str, Any]:
        """Extract content from PDF using different strategies"""
        doc = fitz.open(file_path)
        result = {
            'text': '',
            'metadata': {},
            'pages': [],
            'tables': [],
            'images': [],
        }
        
        # Extract metadata
        metadata = doc.metadata
        result['metadata'] = {
            'title': metadata.get('title', ''),
            'author': metadata.get('author', ''),
            'subject': metadata.get('subject', ''),
            'pages': len(doc),
        }
        
        # Extract text from each page
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            if strategy == 'layout':
                # Layout-based extraction
                blocks = page.get_text("blocks")
                page_text = page.get_text()
            else:
                # Simple text extraction
                page_text = page.get_text()
            
            result['pages'].append({
                'page_number': page_num + 1,
                'text': page_text,
            })
            result['text'] += page_text + '\n'
            
            # Extract tables (basic implementation)
            tables = page.find_tables()
            for table in tables:
                result['tables'].append({
                    'page': page_num + 1,
                    'data': table.extract(),
                })
        
        doc.close()
        return result
    
    def extract_docx(self, file_path: str) -> Dict[str, Any]:
        """Extract content from DOCX file"""
        doc = Document(file_path)
        result = {
            'text': '',
            'metadata': {},
            'paragraphs': [],
            'tables': [],
        }
        
        # Extract metadata
        core_props = doc.core_properties
        result['metadata'] = {
            'title': core_props.title or '',
            'author': core_props.author or '',
            'subject': core_props.subject or '',
        }
        
        # Extract paragraphs
        for para in doc.paragraphs:
            if para.text.strip():
                result['paragraphs'].append(para.text)
                result['text'] += para.text + '\n'
        
        # Extract tables
        for table in doc.tables:
            table_data = []
            for row in table.rows:
                row_data = [cell.text for cell in row.cells]
                table_data.append(row_data)
            result['tables'].append(table_data)
        
        return result
    
    def extract_doc(self, file_path: str) -> Dict[str, Any]:
        """Extract content from DOC file (legacy format)"""
        # DOC files require additional libraries like python-docx2txt or antiword
        # For now, return a placeholder
        return {
            'text': 'DOC file extraction requires additional setup',
            'metadata': {},
            'error': 'DOC format not fully supported yet',
        }
    
    def extract(self, file_path: str, file_type: str, strategy: str = 'layout') -> Dict[str, Any]:
        """Extract content based on file type"""
        file_type_lower = file_type.lower()
        
        if file_type_lower == 'pdf':
            return self.extract_pdf(file_path, strategy)
        elif file_type_lower in ['docx', 'doc']:
            if file_type_lower == 'docx':
                return self.extract_docx(file_path)
            else:
                return self.extract_doc(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks with overlap"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        
        return chunks

def process_message(ch, method, properties, body):
    """Process messages from RabbitMQ"""
    try:
        message = json.loads(body)
        logger.info(f"Received message: {message}")
        
        file_path = message.get('file_path')
        file_type = message.get('file_type')
        strategy = message.get('strategy', 'layout')
        agent_id = message.get('agent_id')
        
        if not file_path or not os.path.exists(file_path):
            raise ValueError(f"File not found: {file_path}")
        
        extractor = DocumentExtractor()
        result = extractor.extract(file_path, file_type, strategy)
        
        # Chunk the text
        chunks = extractor.chunk_text(result['text'])
        result['chunks'] = chunks
        
        # Send results back
        result_message = {
            'agent_id': agent_id,
            'source_type': 'file_upload',
            'file_path': file_path,
            'file_type': file_type,
            'extraction_result': result,
        }
        
        channel.basic_publish(
            exchange='',
            routing_key=RESULT_QUEUE,
            body=json.dumps(result_message),
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Extracted content from {file_path}")
        
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
    
    logger.info('Document extractor service started. Waiting for messages...')
    channel.start_consuming()
