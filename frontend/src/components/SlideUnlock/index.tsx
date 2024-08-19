import { useState, useRef, useEffect } from 'react';
import {ArrowRightOutlined, LoadingOutlined} from '@ant-design/icons';
import './index.css';

type SlideUnlockProps = {
  onUnlock?: () => void;
};

const SlideUnlock = ({ onUnlock }: SlideUnlockProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(5);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!containerRef.current || !sliderRef.current) return;
      const maxPosition = containerRef.current.offsetWidth - sliderRef.current.offsetWidth - 5;
      if (sliderPosition >= maxPosition) {
        setIsUnlocked(true);
        setSliderPosition(maxPosition); // 将滑块固定在终点
        if (onUnlock) {
          onUnlock(); // 触发解锁后的回调
        }
      } else {
        setSliderPosition(5); // 未解锁则重置滑块位置
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [sliderPosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isUnlocked) return; // 如果已解锁，则禁止进一步操作

    const startX = e.type === 'mousedown' ? (e as React.MouseEvent<HTMLDivElement>).clientX : (e as React.TouchEvent<HTMLDivElement>).touches[0].clientX;
    const sliderLeft = sliderRef.current?.offsetLeft || 0;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const currentX = e.type === 'mousemove' ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX;
      const newPosition = currentX - startX + sliderLeft;
      if (containerRef.current && sliderRef.current) {
        const maxPosition = containerRef.current.offsetWidth - sliderRef.current.offsetWidth - 5;
        setSliderPosition(Math.max(5, Math.min(newPosition, maxPosition)));
      }
    };

    const stopMouseMove = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('mouseup', stopMouseMove, { once: true });
    document.addEventListener('touchend', stopMouseMove, { once: true });
  };

  // 将文字分解成单个字母并应用动画
  const renderText = (text: string) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="wave-text"
        style={{ animationDelay: `${index * 0.15}s` }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-16 right-1 rounded-full overflow-hidden shadow-inner"
      style={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', backgroundColor: "rgb(127,127,127)", minWidth: 200, maxWidth: 400 }}
    >
      <div
        ref={sliderRef}
        className={`absolute top-1 left-2 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer ${isUnlocked ? 'bg-gray-300' : 'bg-gray-200'}`}
        style={{ left: `${sliderPosition}px`, zIndex: 1 }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {
          isUnlocked ?
            <LoadingOutlined className={`text-2xl ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />:
            <ArrowRightOutlined className={`text-2xl ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />
        }
      </div>
      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <span className="font-semibold">
          {isUnlocked ? '请稍后' : renderText('随机选择')}
        </span>
      </div>
    </div>
  );
};

export default SlideUnlock;
