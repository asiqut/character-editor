// src/components/CharacterPreview.js
import React, { useEffect, useRef } from 'react';

function CharacterPreview({ psdData, character }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!psdData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Временная отрисовка выбранного варианта
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText(`Выбран: ${character.ears}`, 20, 30);
    
    // Простая визуализация "ушей"
    if (character.ears === 'торчком обычные') {
      ctx.fillStyle = '#a58a67';
      // Левый ear
      ctx.beginPath();
      ctx.moveTo(100, 50);
      ctx.lineTo(80, 80);
      ctx.lineTo(100, 70);
      ctx.fill();
      // Правый ear
      ctx.beginPath();
      ctx.moveTo(200, 50);
      ctx.lineTo(220, 80);
      ctx.lineTo(200, 70);
      ctx.fill();
    }
    
  }, [psdData, character]);

  return (
    <div style={{ width: '315px', height: '315px', border: '1px solid #ddd' }}>
      <canvas 
        ref={canvasRef}
        width={315}
        height={
