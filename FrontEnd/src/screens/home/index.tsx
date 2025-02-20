import { ColorSwatch, Modal } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Moon, Sun, Eraser, Info } from 'lucide-react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from '@/constants';
// import {LazyBrush} from 'lazy-brush';

interface GeneratedResult {
    expression: string;
    answer: string;
}

interface Response {
    expr: string;
    result: string;
    assign: boolean;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)');
    const [reset, setReset] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isErasing, setIsErasing] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState<GeneratedResult>();
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
    const [showInfo, setShowInfo] = useState(false);

    // const lazyBrush = new LazyBrush({
    //     radius: 10,
    //     enabled: true,
    //     initialPoint: { x: 0, y: 0 },
    // });

    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    // Memoize renderLatexToCanvas to avoid dependency issues
    const renderLatexToCanvas = useCallback((expression: string, answer: string) => {
        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression(prev => [...prev, latex]);

        // Clear the main canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    // Now add renderLatexToCanvas to the dependency array
    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result, renderLatexToCanvas]);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight - canvas.offsetTop;
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
            }

        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
            });
        };

        return () => {
            document.head.removeChild(script);
        };

    }, []);

    useEffect(() => {
        setColor(isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)');
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = isDarkMode ? 'white' : 'black';
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const x = e.nativeEvent.offsetX;
                const y = e.nativeEvent.offsetY;
                
                if (isErasing) {
                    // For eraser, we'll use destination-out composite operation
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, Math.PI * 2); // Create a circle for eraser
                    ctx.fill();
                } else {
                    // For drawing, use normal operation
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                }
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const x = e.nativeEvent.offsetX;
                const y = e.nativeEvent.offsetY;

                if (isErasing) {
                    // Eraser functionality
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Drawing functionality
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                // Reset composite operation to default
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    };  

    const runRoute = async () => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars
                }
            });

            const resp = await response.data;
            console.log('Response', resp);
            resp.data.forEach((data: Response) => {
                if (data.assign === true) {
                    // dict_of_vars[resp.result] = resp.answer;
                    setDictOfVars({
                        ...dictOfVars,
                        [data.expr]: data.result
                    });
                }
            });
            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            setLatexPosition({ x: centerX, y: centerY });
            resp.data.forEach((data: Response) => {
                setTimeout(() => {
                    setResult({
                        expression: data.expr,
                        answer: data.result
                    });
                }, 1000);
            });
        }
    };

    // Info modal content
    const InfoContent = () => (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">How to Use CalcCanvas</h2>
            <div className="space-y-4">
                <section>
                    <h3 className="font-semibold mb-2">Tools</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Reset (1): Clear the canvas</li>
                        <li>Eraser (2): Erase parts of your drawing</li>
                        <li>Theme (3): Toggle dark/light mode</li>
                        <li>Colors (A-L): Quick select colors using keyboard</li>
                        <li>Run (9): Process your mathematical expression</li>
                    </ul>
                </section>
                <section>
                    <h3 className="font-semibold mb-2">Drawing</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Click and drag to draw</li>
                        <li>Use the eraser tool to remove mistakes</li>
                        <li>Select different colors for better visibility</li>
                    </ul>
                </section>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Made with ❤️ by Team WaterPlane
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        GDG Tech-O-Thon Project
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Top Toolbar - Always Dark */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800 shadow-md px-4 flex items-center justify-between z-30">
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={() => setReset(true)}
                        className="tool-button text-white hover:bg-gray-700"
                        title="Reset Canvas (1)"
                    >
                        <span className="tool-number">1</span>
                        Reset
                    </Button>

                    <Button
                        onClick={() => setIsErasing(!isErasing)}
                        className={`tool-button text-white ${isErasing ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-gray-700'}`}
                        title="Toggle Eraser (2)"
                    >
                        <span className="tool-number">2</span>
                        <Eraser className="w-5 h-5" />
                    </Button>

                    <Button
                        onClick={toggleDarkMode}
                        className="tool-button text-white hover:bg-gray-700"
                        title="Toggle Theme (3)"
                    >
                        <span className="tool-number">3</span>
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                </div>

                <div className="flex items-center space-x-4">
                    {SWATCHES.map((swatch, index) => (
                        <div key={swatch} className="color-tool">
                            <span className="tool-letter">
                                {String.fromCharCode(65 + index)}
                            </span>
                            <ColorSwatch
                                color={swatch}
                                onClick={() => {
                                    setColor(swatch);
                                    setIsErasing(false);
                                }}
                                className="cursor-pointer transform hover:scale-110 transition-transform"
                                title={`Color ${String.fromCharCode(65 + index)} (Press ${String.fromCharCode(97 + index)})`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        onClick={runRoute}
                        className="tool-button text-white bg-green-600 hover:bg-green-700"
                        title="Run Calculation (9)"
                    >
                        <span className="tool-number">9</span>
                        Run
                    </Button>

                    <Button
                        onClick={() => setShowInfo(true)}
                        className="tool-button text-white hover:bg-gray-700"
                        title="How to Use"
                    >
                        <Info className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Info Modal */}
            <Modal
                opened={showInfo}
                onClose={() => setShowInfo(false)}
                title="CalcCanvas Guide"
                size="lg"
                classNames={{
                    header: 'bg-gray-800 text-white p-4',
                    body: isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
                }}
            >
                <InfoContent />
            </Modal>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                id='canvas'
                className={`absolute top-16 left-0 w-full h-[calc(100vh-7rem)] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${isErasing ? 'erasing' : ''}`}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />

            {/* Footer */}
            <footer className={`fixed bottom-0 left-0 right-0 h-12 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-up flex items-center justify-center`}>
                <p className="text-sm font-medium">Team WaterPlane</p>
                <p className="text-xs text-gray-500 ml-2">[ - GDG Tech-O-Thon Project ]</p>
            </footer>

            {/* Latex Expressions */}
            {latexExpression && latexExpression.map((latex, index) => (
                <Draggable
                    key={index}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <div className={`absolute p-2 rounded shadow-md ${isDarkMode ? 'text-white bg-gray-800' : 'text-black bg-white'}`}>
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
        </div>
    );
}
