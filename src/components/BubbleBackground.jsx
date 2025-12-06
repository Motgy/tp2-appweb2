
import React, { useMemo } from 'react';
import '../BubbleCircles.css'; 

const BubbleBackground = () => {
  const bubbles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 25; i++) {
      const size = Math.random() * 80 + 40 + 'px';
   
      const left = Math.random() * 100 + '%';
      
      const drift = (Math.random() - 0.5) * 100 + 'px';
     
      const scale = Math.random() * 0.5 + 0.8;


      const duration = Math.random() * 10 + 8 + 's'; 
      
      const delay = Math.random() * 5 + 's';

      items.push(
        <div
          key={i}
          className="soap-bubble"
          style={{
            width: size,
            height: size,
            left: left,
            animationDuration: duration,
            animationDelay: delay,
            '--drift': drift,
            '--scale': scale,
          }}
        ></div>
      );
    }
    return items;
  }, []);

  return <div className="bubbles-container">{bubbles}</div>;
};

export default BubbleBackground;