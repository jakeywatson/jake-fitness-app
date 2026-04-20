const React = require('react');
const { View, Text } = require('react-native');

const Svg = ({ children, ...props }) => React.createElement(View, props, children);
const mockComponent = (name) => ({ children, ...props }) => React.createElement(View, props, children);
const mockTextComponent = (name) => ({ children, ...props }) => React.createElement(Text, props, typeof children === 'string' ? children : null);

const exports = {
  __esModule: true,
  default: Svg,
  Svg,
  Circle: mockComponent('Circle'),
  Ellipse: mockComponent('Ellipse'),
  G: mockComponent('G'),
  Text: mockTextComponent('Text'),
  TSpan: mockTextComponent('TSpan'),
  TextPath: mockTextComponent('TextPath'),
  Path: mockComponent('Path'),
  Polygon: mockComponent('Polygon'),
  Polyline: mockComponent('Polyline'),
  Line: mockComponent('Line'),
  Rect: mockComponent('Rect'),
  Use: mockComponent('Use'),
  Image: mockComponent('Image'),
  Symbol: mockComponent('Symbol'),
  Defs: mockComponent('Defs'),
  LinearGradient: mockComponent('LinearGradient'),
  RadialGradient: mockComponent('RadialGradient'),
  Stop: mockComponent('Stop'),
  ClipPath: mockComponent('ClipPath'),
  Pattern: mockComponent('Pattern'),
  Mask: mockComponent('Mask'),
};

module.exports = exports;
