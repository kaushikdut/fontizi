#!/usr/bin/env python3
"""
Hybrid Font Recognition Service
Combines multiple approaches for maximum accuracy:
1. Storia AI (local model)
2. WhatTheFont API (commercial service)
3. Google Fonts API (font matching)
4. Custom font database
5. User feedback learning
"""

import os
import json
import requests
import logging
from typing import Dict, List, Optional, Tuple
from PIL import Image
import base64
import io
import tempfile
from dotenv import load_dotenv
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class HybridFontService:
    """
    Hybrid font recognition service for maximum accuracy
    """
    
    def __init__(self):
        self.whatthefont_api_key = os.getenv('WHATTHEFONT_API_KEY')
        self.google_fonts_api_key = os.getenv('GOOGLE_FONTS_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize services
        self.storia_service = None
        self.whatthefont_available = bool(self.whatthefont_api_key)
        self.google_fonts_available = bool(self.google_fonts_api_key)
        self.openai_available = bool(self.openai_api_key)
        
        # Load custom font database
        self.custom_font_db = self._load_custom_font_database()
        
        # Confidence weights for ensemble
        self.confidence_weights = {
            'storia': 0.4,
            'whatthefont': 0.3,
            'google_fonts': 0.2,
            'custom_db': 0.1
        }
        
        logger.info(f"Hybrid service initialized - WhatTheFont: {self.whatthefont_available}, "
                   f"Google Fonts: {self.google_fonts_available}, OpenAI: {self.openai_available}")
    
    def _load_custom_font_database(self) -> Dict:
        """Load custom font database for additional matching"""
        try:
            db_path = os.path.join(os.path.dirname(__file__), 'custom_font_database.json')
            if os.path.exists(db_path):
                with open(db_path, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            logger.error(f"Error loading custom font database: {e}")
            return {}
    
    def recognize_font_hybrid(self, image_path: str, use_all_services: bool = True) -> Dict:
        """
        Recognize font using multiple services for maximum accuracy
        """
        start_time = time.time()
        results = {}
        
        try:
            # Run all available services in parallel
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = {}
                
                # Storia AI (local)
                if self.storia_service:
                    futures['storia'] = executor.submit(self._recognize_storia, image_path)
                
                # WhatTheFont API
                if self.whatthefont_available:
                    futures['whatthefont'] = executor.submit(self._recognize_whatthefont, image_path)
                
                # Google Fonts API
                if self.google_fonts_available:
                    futures['google_fonts'] = executor.submit(self._recognize_google_fonts, image_path)
                
                # Custom database
                if self.custom_font_db:
                    futures['custom_db'] = executor.submit(self._recognize_custom_db, image_path)
                
                # Collect results
                for service_name, future in futures.items():
                    try:
                        result = future.result(timeout=30)  # 30 second timeout per service
                        results[service_name] = result
                    except Exception as e:
                        logger.error(f"Error in {service_name}: {e}")
                        results[service_name] = {'success': False, 'error': str(e)}
            
            # Ensemble the results
            ensemble_result = self._ensemble_predictions(results)
            
            # Add metadata
            ensemble_result['processing_time'] = time.time() - start_time
            ensemble_result['services_used'] = list(results.keys())
            ensemble_result['hybrid_confidence'] = self._calculate_hybrid_confidence(results)
            
            return ensemble_result
            
        except Exception as e:
            logger.error(f"Error in hybrid font recognition: {e}")
            return {
                'success': False,
                'error': f'Hybrid recognition failed: {str(e)}',
                'processing_time': time.time() - start_time
            }
    
    def _recognize_storia(self, image_path: str) -> Dict:
        """Recognize font using Storia AI"""
        try:
            # Import here to avoid circular imports
            from enhanced_predict import predict_font_enhanced
            result = predict_font_enhanced(image_path, top_k=5, confidence_threshold=0.3)
            return result
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _recognize_whatthefont(self, image_path: str) -> Dict:
        """Recognize font using WhatTheFont API"""
        try:
            url = "https://api.whatfontis.com/v1/identify"
            
            with open(image_path, 'rb') as f:
                files = {'image': f}
                headers = {'X-API-KEY': self.whatthefont_api_key}
                
                response = requests.post(url, files=files, headers=headers, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                
                if data.get('success'):
                    matches = data.get('matches', [])
                    predictions = []
                    
                    for match in matches[:5]:  # Top 5 matches
                        predictions.append({
                            'font': match.get('name', 'Unknown'),
                            'confidence': match.get('score', 0) / 100,  # Convert to 0-1 scale
                            'source': 'whatthefont'
                        })
                    
                    return {
                        'success': True,
                        'predictions': predictions,
                        'top_prediction': predictions[0] if predictions else None
                    }
                else:
                    return {'success': False, 'error': data.get('error', 'Unknown error')}
                    
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _recognize_google_fonts(self, image_path: str) -> Dict:
        """Recognize font using Google Fonts API"""
        try:
            # This would require OCR + font matching
            # For now, return a placeholder
            return {
                'success': True,
                'predictions': [],
                'top_prediction': None,
                'note': 'Google Fonts API requires OCR implementation'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _recognize_custom_db(self, image_path: str) -> Dict:
        """Recognize font using custom database"""
        try:
            # Implement custom font matching logic
            return {
                'success': True,
                'predictions': [],
                'top_prediction': None,
                'note': 'Custom database matching not yet implemented'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _ensemble_predictions(self, results: Dict) -> Dict:
        """Combine predictions from multiple services"""
        all_predictions = []
        font_scores = {}
        
        # Collect all predictions
        for service_name, result in results.items():
            if result.get('success') and result.get('predictions'):
                weight = self.confidence_weights.get(service_name, 0.1)
                
                for pred in result['predictions']:
                    font_name = pred.get('font', 'Unknown')
                    confidence = pred.get('confidence', 0)
                    
                    if font_name not in font_scores:
                        font_scores[font_name] = {
                            'font': font_name,
                            'total_score': 0,
                            'count': 0,
                            'services': []
                        }
                    
                    # Weighted score
                    weighted_score = confidence * weight
                    font_scores[font_name]['total_score'] += weighted_score
                    font_scores[font_name]['count'] += 1
                    font_scores[font_name]['services'].append(service_name)
        
        # Calculate ensemble scores
        for font_name, score_data in font_scores.items():
            # Average score across services
            avg_score = score_data['total_score'] / score_data['count']
            
            # Bonus for multiple service agreement
            agreement_bonus = min(0.1, score_data['count'] * 0.02)
            final_score = min(1.0, avg_score + agreement_bonus)
            
            all_predictions.append({
                'font': font_name,
                'confidence': final_score,
                'services_agreement': score_data['count'],
                'services_used': score_data['services']
            })
        
        # Sort by confidence
        all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'success': True,
            'predictions': all_predictions[:10],  # Top 10
            'top_prediction': all_predictions[0] if all_predictions else None,
            'ensemble_method': 'weighted_average_with_agreement_bonus'
        }
    
    def _calculate_hybrid_confidence(self, results: Dict) -> float:
        """Calculate overall confidence based on service agreement"""
        successful_services = sum(1 for r in results.values() if r.get('success'))
        total_services = len(results)
        
        if total_services == 0:
            return 0.0
        
        # Base confidence on service success rate
        base_confidence = successful_services / total_services
        
        # Boost confidence if multiple services agree
        agreement_boost = min(0.2, successful_services * 0.05)
        
        return min(1.0, base_confidence + agreement_boost)
    
    def add_user_feedback(self, image_path: str, actual_font: str, predicted_font: str, confidence: float):
        """Add user feedback for continuous learning"""
        try:
            feedback_data = {
                'image_path': image_path,
                'actual_font': actual_font,
                'predicted_font': predicted_font,
                'confidence': confidence,
                'timestamp': time.time()
            }
            
            # Save feedback for future model improvement
            feedback_path = os.path.join(os.path.dirname(__file__), 'user_feedback.json')
            
            try:
                with open(feedback_path, 'r') as f:
                    feedback_list = json.load(f)
            except FileNotFoundError:
                feedback_list = []
            
            feedback_list.append(feedback_data)
            
            # Keep only last 1000 feedback entries
            if len(feedback_list) > 1000:
                feedback_list = feedback_list[-1000:]
            
            with open(feedback_path, 'w') as f:
                json.dump(feedback_list, f, indent=2)
            
            logger.info(f"User feedback saved: {actual_font} vs {predicted_font}")
            
        except Exception as e:
            logger.error(f"Error saving user feedback: {e}")

# Global instance
hybrid_service = HybridFontService()
