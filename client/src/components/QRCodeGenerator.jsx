import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
export var QRCodeGenerator = function (_a) {
    var value = _a.value, _b = _a.size, size = _b === void 0 ? 128 : _b, _c = _a.className, className = _c === void 0 ? '' : _c;
    var canvasRef = useRef(null);
    useEffect(function () {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) {
                    console.error('QR Code generation error:', error);
                }
            });
        }
    }, [value, size]);
    return (<div className={"inline-block bg-white p-1 rounded ".concat(className)}>
      <canvas ref={canvasRef} className="block" style={{ width: size, height: size }}/>
    </div>);
};
export default QRCodeGenerator;
