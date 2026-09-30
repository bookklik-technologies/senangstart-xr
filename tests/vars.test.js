/**
 * @jest-environment jsdom
 */

describe('vars.js utility functions', () => {
  beforeAll(() => {
    global.AFRAME = {get THREE() { return global.THREE; }};
    require('../src/scripts/vars.js');
  });
  afterAll(() => { delete global.AFRAME; });

  describe('getUniqueId', () => {
    test('returns a string with the given prefix', () => {
      const id = window.SXR.getUniqueId('test');
      expect(typeof id).toBe('string');
      expect(id.startsWith('test_')).toBe(true);
    });

    test('generates unique values on successive calls', () => {
      const id1 = window.SXR.getUniqueId('test');
      const id2 = window.SXR.getUniqueId('test');
      expect(id1).not.toBe(id2);
    });
  });

  describe('getTextWidth', () => {
    test('returns a number', () => {
      const width = window.SXR.getTextWidth('Hello', '16px Arial');
      expect(typeof width).toBe('number');
    });
  });

  describe('colors', () => {
    test('contains known color keys', () => {
      expect(window.SXR.colors).toBeDefined();
      expect(window.SXR.colors.primary).toBe('#2563EB');
      expect(window.SXR.colors.darkBase).toBe('#1B1B1F');
      expect(window.SXR.colors.darkDeeper).toBe('#161618');
      expect(window.SXR.colors.darkCard).toBe('#202127');
      expect(window.SXR.colors.secondary).toBe('#0EA5E9');
      expect(window.SXR.colors.background).toBe('#161618');
      expect(window.SXR.colors.surface).toBe('#202127');
      expect(window.SXR.colors.onSurface).toBe('#F1F5F9');
      expect(window.SXR.colors.border).toBe('#1B1B1F');
      expect(window.SXR.colors.neutral).toBe('#1B1B1F');
    });
  });

  describe('fonts', () => {
    test('uses Outfit as the default text font', () => {
      expect(window.SXR.fonts).toBeDefined();
      expect(window.SXR.fonts.default).toBe('Outfit-Regular.ttf');
    });

    test('normalizes text rendering font values for canvas output', () => {
      expect(window.SXR.normalizeFontSize(0.2)).toBe(0.2);
      expect(window.SXR.normalizeFontSize('0.18')).toBe(0.18);
      expect(window.SXR.normalizeFontSize(-1)).toBe(0.2);
      expect(window.SXR.normalizeFontSize(0)).toBe(0.2);
      expect(window.SXR.getCanvasFontFamily('Outfit-Regular.ttf')).toContain('Arial');
    });

    test('keeps the requested font size when text already fits', () => {
      const originalCreateElement = document.createElement.bind(document);
      let textCanvas;
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
        const element = originalCreateElement(tagName, options);
        if (tagName === 'canvas') textCanvas = element;
        if (tagName === 'a-entity') element.setObject3D = jest.fn();
        return element;
      });

      global.THREE = {
        CanvasTexture: jest.fn(),
        MeshBasicMaterial: jest.fn(),
        PlaneGeometry: jest.fn(),
        Mesh: jest.fn(),
        LinearFilter: 'LinearFilter',
        DoubleSide: 'DoubleSide',
      };

      window.SXR.createTextEntity({
        value: 'Visible text',
        width: 2,
        height: 1,
        fontSize: 0.2,
      });

      // default pixel ratio is 128: a 1-unit-tall box maps to a 128px canvas,
      // so a 0.2-unit font renders at ~26px and must not be downscaled
      expect(textCanvas.height).toBe(128);
      expect(parseInt(textCanvas.getContext('2d').font.match(/(\d+)px/)[1], 10)).toBe(26);

      createElementSpy.mockRestore();
      delete global.THREE;
    });
  });
});

describe('icon mapping', () => {
  beforeAll(() => {
    require('../src/scripts/vars.js');
  });

  test('SXR.icons contains known icon entries', () => {
    expect(window.SXR.icons).toBeDefined();
    expect(typeof window.SXR.icons).toBe('object');
    expect(window.SXR.icons.check).toContain('<svg');
    expect(window.SXR.icons['arrow-right']).toContain('<svg');
  });

  test('SXR.getIconSvg returns colored SenangStart SVG markup', () => {
    const svg = window.SXR.getIconSvg('check', '#2563EB', 3);

    expect(svg).toContain('<svg');
    expect(svg).toContain('#2563EB');
    expect(svg).toContain('stroke-width="3"');
  });

  test('SXR.getIconDataUrl returns encoded SVG data URL', () => {
    const dataUrl = window.SXR.getIconDataUrl('check', '#F1F5F9');

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(decodeURIComponent(dataUrl)).toContain('<svg');
  });

  test('SXR.getIconSvg returns empty string for unknown icon', () => {
    expect(window.SXR.getIconSvg('nonexistent-icon')).toBe('');
  });
});
