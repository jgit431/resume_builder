import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './PhotoCropModal.css';

// Converts a crop area to a base64 circular-clipped image
async function getCroppedImg(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });

  const canvas  = document.createElement('canvas');
  const size    = croppedAreaPixels.width;
  canvas.width  = size;
  canvas.height = size;
  const ctx     = canvas.getContext('2d');

  // Clip to circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0, 0, size, size
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

export default function PhotoCropModal({ imageSrc, onSave, onCancel }) {
  const [crop,           setCrop]           = useState({ x: 0, y: 0 });
  const [zoom,           setZoom]           = useState(1);
  const [croppedArea,    setCroppedArea]    = useState(null);
  const [saving,         setSaving]         = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedArea) return;
    setSaving(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedArea);
      onSave(croppedImage);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={e => e.stopPropagation()}>
        <div className="crop-header">
          <h3 className="crop-title">Crop your photo</h3>
          <p className="crop-subtitle">Drag to reposition · Scroll or use the slider to zoom</p>
        </div>

        <div className="crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-footer">
          <div className="crop-zoom-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            <input
              type="range"
              className="crop-zoom-slider"
              min={1} max={3} step={0.01}
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <div className="crop-actions">
            <button className="btn-crop-cancel" onClick={onCancel}>Cancel</button>
            <button className="btn-crop-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '✓ Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
