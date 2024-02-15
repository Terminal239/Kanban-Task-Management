const generateID = (decimalPlaces: number): number => {
  return +(Math.random() * Math.pow(10, decimalPlaces)).toFixed(0);
};

const generateHex = () => {
  const red = +(Math.random() * 255).toFixed(0);
  const green = +(Math.random() * 255).toFixed(0);
  const blue = +(Math.random() * 255).toFixed(0);

  return `rgb(${red},${green},${blue})`;
};

export { generateID, generateHex };
