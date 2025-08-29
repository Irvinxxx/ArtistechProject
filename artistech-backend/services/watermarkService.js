const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class WatermarkService {
  constructor() {
    this.watermarkText = 'ArtisTech';
    this.watermarkOpacity = 0.3;
    this.watermarkSize = 48;
  }

  /**
   * Add watermark to an image
   * @param {string} inputPath - Path to the original image
   * @param {string} outputPath - Path where watermarked image will be saved
   * @param {Object} options - Watermark options
   * @returns {Promise<Object>} Result object
   */
  async addWatermark(inputPath, outputPath, options = {}) {
    try {
      const {
        text = this.watermarkText,
        opacity = this.watermarkOpacity,
        fontSize = this.watermarkSize,
        position = 'bottom-right',
        color = 'rgba(255, 255, 255, 0.8)'
      } = options;

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      const { width, height } = metadata;

      // Create watermark SVG
      const watermarkSvg = this.createWatermarkSvg(text, fontSize, color, width, height, position);

      // Apply watermark
      await sharp(inputPath)
        .composite([{
          input: Buffer.from(watermarkSvg),
          gravity: this.getGravityFromPosition(position),
          blend: 'over'
        }])
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      return {
        success: true,
        originalPath: inputPath,
        watermarkedPath: outputPath,
        watermarkOptions: { text, opacity, fontSize, position, color }
      };
    } catch (error) {
      console.error(`--- Watermark Service Error ---
      Input: ${inputPath}
      Output: ${outputPath}
      Error: ${error.message}
      Stack: ${error.stack}
      -----------------------------`);
      // Re-throw the error to be caught by the calling controller
      throw new Error('Failed to process image and apply watermark.');
    }
  }

  /**
   * Create watermark SVG
   */
  createWatermarkSvg(text, fontSize, color, imageWidth, imageHeight, position) {
    const padding = 20;
    let x, y;

    // Calculate position
    switch (position) {
      case 'top-left':
        x = padding;
        y = fontSize + padding;
        break;
      case 'top-right':
        x = imageWidth - (text.length * fontSize * 0.6) - padding;
        y = fontSize + padding;
        break;
      case 'bottom-left':
        x = padding;
        y = imageHeight - padding;
        break;
      case 'bottom-right':
      default:
        x = imageWidth - (text.length * fontSize * 0.6) - padding;
        y = imageHeight - padding;
        break;
      case 'center':
        x = (imageWidth - (text.length * fontSize * 0.6)) / 2;
        y = imageHeight / 2;
        break;
    }

    return `
      <svg width="${imageWidth}" height="${imageHeight}">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
          </filter>
        </defs>
        <text 
          x="${x}" 
          y="${y}" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold"
          fill="${color}" 
          filter="url(#shadow)"
          opacity="${this.watermarkOpacity}"
        >${text}</text>
      </svg>
    `;
  }

  /**
   * Get Sharp gravity from position string
   */
  getGravityFromPosition(position) {
    switch (position) {
      case 'top-left': return 'northwest';
      case 'top-right': return 'northeast';
      case 'bottom-left': return 'southwest';
      case 'bottom-right': return 'southeast';
      case 'center': return 'center';
      default: return 'southeast';
    }
  }

  /**
   * Add multiple watermarks (tiled pattern)
   */
  async addTiledWatermark(inputPath, outputPath, options = {}) {
    try {
      const {
        text = this.watermarkText,
        opacity = 0.1,
        fontSize = 24,
        spacing = 150,
        rotation = -45
      } = options;

      const metadata = await sharp(inputPath).metadata();
      const { width, height } = metadata;

      // Create tiled watermark SVG
      const tiledSvg = this.createTiledWatermarkSvg(text, fontSize, opacity, width, height, spacing, rotation);

      await sharp(inputPath)
        .composite([{
          input: Buffer.from(tiledSvg),
          blend: 'over'
        }])
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      return {
        success: true,
        originalPath: inputPath,
        watermarkedPath: outputPath,
        watermarkType: 'tiled'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create tiled watermark SVG
   */
  createTiledWatermarkSvg(text, fontSize, opacity, width, height, spacing, rotation) {
    let watermarks = '';
    
    for (let x = 0; x < width + spacing; x += spacing) {
      for (let y = 0; y < height + spacing; y += spacing) {
        watermarks += `
          <text 
            x="${x}" 
            y="${y}" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}" 
            font-weight="bold"
            fill="white" 
            opacity="${opacity}"
            transform="rotate(${rotation} ${x} ${y})"
          >${text}</text>
        `;
      }
    }

    return `
      <svg width="${width}" height="${height}">
        ${watermarks}
      </svg>
    `;
  }

  /**
   * Create invisible watermark (steganography-like)
   */
  async addInvisibleWatermark(inputPath, outputPath, watermarkData) {
    try {
      // This is a simplified version - in production, you'd use proper steganography
      const metadata = await sharp(inputPath).metadata();
      
      // Add metadata to the image
      await sharp(inputPath)
        .withMetadata({
          exif: {
            [sharp.tags.exif.Copyright]: `ArtisTech - ${watermarkData}`,
            [sharp.tags.exif.Artist]: 'ArtisTech Platform',
            [sharp.tags.exif.Software]: 'ArtisTech Anti-Grab Protection'
          }
        })
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      return {
        success: true,
        originalPath: inputPath,
        watermarkedPath: outputPath,
        watermarkType: 'invisible',
        watermarkData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch watermark multiple images
   */
  async batchWatermark(imagePaths, outputDir, options = {}) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      const filename = path.basename(imagePath);
      const outputPath = path.join(outputDir, `watermarked_${filename}`);
      
      const result = await this.addWatermark(imagePath, outputPath, options);
      results.push({
        originalPath: imagePath,
        ...result
      });
    }
    
    return results;
  }

  /**
   * Remove watermark (for authorized users)
   */
  async removeWatermark(watermarkedPath, originalPath) {
    try {
      // In a real implementation, this would require the original image
      // For now, we'll just copy the file
      await fs.promises.copyFile(originalPath, watermarkedPath.replace('watermarked_', 'clean_'));
      
      return {
        success: true,
        cleanPath: watermarkedPath.replace('watermarked_', 'clean_')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate watermark integrity
   */
  async validateWatermark(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const hasWatermark = metadata.exif && 
                          metadata.exif.toString().includes('ArtisTech');
      
      return {
        success: true,
        hasWatermark,
        metadata: metadata.exif
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = WatermarkService;

