const fs = require('fs');
const code = fs.readFileSync('client/src/views/BookingView.jsx', 'utf8');

const marker1 = '{/* About Salon */}';
const marker2 = '{/* Right Column: Sticky Booking Widget';
const gridEnd = '      </div>\n\n    </div>\n  );\n};';

const pos1 = code.indexOf(marker1);
const pos2 = code.indexOf(marker2);
const posEnd = code.lastIndexOf(gridEnd);

if (pos1 !== -1 && pos2 !== -1 && posEnd !== -1) {
  const topPart = code.slice(0, pos1);
  const middlePart = code.slice(pos1, pos2); // About to end of Left Col
  const rightColPart = code.slice(pos2, posEnd); // Right col
  const bottomPart = code.slice(posEnd); // End of grid and rest
  
  const newTopPart = topPart + '        </div>\n\n';
  
  let newRightCol = rightColPart.replace(
    '<div className="lg:sticky lg:top-22.5">',
    '<div className="lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:sticky lg:top-22.5 w-full">'
  );
  
  let newMiddlePart = '        {/* Left Column Part 2 */}\n        <div className="lg:col-span-2 lg:col-start-1 space-y-8 w-full">\n          ' + middlePart;
  
  const finalCode = newTopPart + newRightCol + newMiddlePart + bottomPart;
  fs.writeFileSync('client/src/views/BookingView.jsx', finalCode);
  console.log('Success');
} else {
  console.log('Markers not found', { pos1, pos2, posEnd });
}
