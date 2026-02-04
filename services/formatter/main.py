#!/usr/bin/env python3
"""
Formatter Service
Formats research papers in LaTeX, Markdown, and HTML+CSS, and compiles to PDF
"""

import json
import os
import pika
import logging
from jinja2 import Template
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@localhost:5672')
QUEUE_NAME = os.getenv('RABBITMQ_QUEUE_FORMATTER', 'formatter_queue')
RESULT_QUEUE = os.getenv('RABBITMQ_QUEUE_RESULT', 'formatter_results')

class PaperFormatter:
    """Formats research papers in various formats"""
    
    LATEX_TEMPLATE = r"""
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{cite}

\title{{{title}}}
\author{{{authors}}}
\date{{{date}}}

\begin{document}

\maketitle

\begin{abstract}
{{abstract}}
\end{abstract}

\keywords{{{keywords}}}

\section{Introduction}
{{introduction}}

\section{Literature Review}
{{literature_review}}

\section{Methodology}
{{methodology}}

\section{Results}
{{results}}

\section{Discussion}
{{discussion}}

\section{Conclusion}
{{conclusion}}

\section{References}
\begin{thebibliography}{99}
{{references}}
\end{thebibliography}

{% if appendices %}
\section{Appendices}
{{appendices}}
{% endif %}

\end{document}
    """
    
    MARKDOWN_TEMPLATE = """# {{title}}

**Authors:** {{authors}}  
**Date:** {{date}}

## Abstract

{{abstract}}

## Keywords

{{keywords}}

## 1. Introduction

{{introduction}}

## 2. Literature Review

{{literature_review}}

## 3. Methodology

{{methodology}}

## 4. Results

{{results}}

## 5. Discussion

{{discussion}}

## 6. Conclusion

{{conclusion}}

## References

{{references}}

{% if appendices %}
## Appendices

{{appendices}}
{% endif %}
"""
    
    HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <style>
        body {{
            font-family: 'Times New Roman', serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }}
        h1 {{ color: #333; }}
        h2 {{ color: #555; margin-top: 30px; }}
        .abstract {{
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #333;
            margin: 20px 0;
        }}
        .keywords {{ font-style: italic; margin: 10px 0; }}
        .references {{ margin-top: 30px; }}
    </style>
</head>
<body>
    <h1>{{title}}</h1>
    <p><strong>Authors:</strong> {{authors}}</p>
    <p><strong>Date:</strong> {{date}}</p>
    
    <div class="abstract">
        <h2>Abstract</h2>
        <p>{{abstract}}</p>
    </div>
    
    <p class="keywords"><strong>Keywords:</strong> {{keywords}}</p>
    
    <h2>1. Introduction</h2>
    <div>{{introduction}}</div>
    
    <h2>2. Literature Review</h2>
    <div>{{literature_review}}</div>
    
    <h2>3. Methodology</h2>
    <div>{{methodology}}</div>
    
    <h2>4. Results</h2>
    <div>{{results}}</div>
    
    <h2>5. Discussion</h2>
    <div>{{discussion}}</div>
    
    <h2>6. Conclusion</h2>
    <div>{{conclusion}}</div>
    
    <div class="references">
        <h2>References</h2>
        <div>{{references}}</div>
    </div>
    
    {% if appendices %}
    <h2>Appendices</h2>
    <div>{{appendices}}</div>
    {% endif %}
</body>
</html>
"""
    
    def format_latex(self, paper_data: Dict[str, Any]) -> str:
        """Format paper as LaTeX"""
        template = Template(self.LATEX_TEMPLATE)
        return template.render(**paper_data)
    
    def format_markdown(self, paper_data: Dict[str, Any]) -> str:
        """Format paper as Markdown"""
        template = Template(self.MARKDOWN_TEMPLATE)
        return template.render(**paper_data)
    
    def format_html(self, paper_data: Dict[str, Any]) -> str:
        """Format paper as HTML"""
        template = Template(self.HTML_TEMPLATE)
        return template.render(**paper_data)
    
    def format(self, paper_data: Dict[str, Any], format_type: str) -> str:
        """Format paper in specified format"""
        if format_type == 'latex':
            return self.format_latex(paper_data)
        elif format_type == 'markdown':
            return self.format_markdown(paper_data)
        elif format_type == 'html':
            return self.format_html(paper_data)
        else:
            raise ValueError(f"Unsupported format: {format_type}")
    
    def compile_to_pdf(self, content: str, format_type: str, output_path: str) -> bool:
        """Compile content to PDF"""
        try:
            import pypandoc
            
            if format_type == 'latex':
                # For LaTeX, use pdflatex directly
                import subprocess
                with open('/tmp/paper.tex', 'w') as f:
                    f.write(content)
                result = subprocess.run(
                    ['pdflatex', '-output-directory', '/tmp', '/tmp/paper.tex'],
                    capture_output=True,
                    timeout=30
                )
                if result.returncode == 0:
                    import shutil
                    shutil.move('/tmp/paper.pdf', output_path)
                    return True
            else:
                # For Markdown/HTML, use pandoc
                pypandoc.convert_text(
                    content,
                    'pdf',
                    format=format_type,
                    outputfile=output_path,
                    extra_args=['--pdf-engine=pdflatex']
                )
                return True
        except Exception as e:
            logger.error(f"Error compiling to PDF: {e}")
            return False

def process_message(ch, method, properties, body):
    """Process messages from RabbitMQ"""
    try:
        message = json.loads(body)
        logger.info(f"Received message: {message}")
        
        paper_data = message.get('paper_data')
        format_type = message.get('format', 'markdown')
        agent_id = message.get('agent_id')
        compile_pdf = message.get('compile_pdf', False)
        
        formatter = PaperFormatter()
        formatted_content = formatter.format(paper_data, format_type)
        
        result = {
            'agent_id': agent_id,
            'format': format_type,
            'content': formatted_content,
        }
        
        if compile_pdf:
            output_path = f'/tmp/paper_{agent_id}.pdf'
            if formatter.compile_to_pdf(formatted_content, format_type, output_path):
                result['pdf_path'] = output_path
        
        # Send results back
        channel.basic_publish(
            exchange='',
            routing_key=RESULT_QUEUE,
            body=json.dumps(result),
        )
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Formatted paper in {format_type} format")
        
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
    
    logger.info('Formatter service started. Waiting for messages...')
    channel.start_consuming()
