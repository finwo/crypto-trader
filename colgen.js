const h_to_rgb = (h) => {
  if (h<0) return h_to_rgb(1+h);
  h = (h % 1) * 6;
  if (h < 1) return { r: 1    , g: h    , b: 0     };
  if (h < 2) return { r: 2 - h, g: 1    , b: 0     };
  if (h < 3) return { r: 0    , g: 1    , b: h - 2 };
  if (h < 4) return { r: 0    , g: 4 - h, b: 1     };
  if (h < 5) return { r: h - 4, g: 0    , b: 1     }
             return { r: 1    , g: 0    , b: 6 - h };
};

const rgb_to_y = ({r,g,b}) => {
  // return (r+g+b)/2;
  return (r*2 + g*5 + b) / 8;
};

const set_saturation = ({r,g,b}, s) => {
  const y = rgb_to_y({r,g,b});
  const i = 1-s;
  return {
    r: (i*y) + (s*r),
    g: (i*y) + (s*g),
    b: (i*y) + (s*b),
  };
};

const hsy_to_rgb = ({h,s,y}) => {
  const col = set_saturation(h_to_rgb(h), s);
  const cy  = rgb_to_y(col);
  return {
    r: Math.max(0,Math.min(Math.round(col.r * y / cy),255)),
    g: Math.max(0,Math.min(Math.round(col.g * y / cy),255)),
    b: Math.max(0,Math.min(Math.round(col.b * y / cy),255)),
  };
};

module.exports = {
  h_to_rgb,
  rgb_to_y,
  set_saturation,
  hsy_to_rgb,
  gen_colors(n, s, y) {
    return Array(n).fill(0).map((a,i) => {
      return hsy_to_rgb({h: i/n, s, y})}
    );
  },
  rgb_to_hex(arg) {
    const {r,g,b} = arg;
    return '#' +
      ('00'+r.toString(16)).substr(-2) +
      ('00'+g.toString(16)).substr(-2) +
      ('00'+b.toString(16)).substr(-2);
  },
};
