import { ColorSwatch } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from '@/constants';
import { InfoModal } from '@/components/ui/InfoModal';
import { Info } from 'lucide-react';

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
    const [isErasing, setIsErasing] = useState(false);
    const [color, setColor] = useState('rgb(255, 255, 255)'); // Default white for dark mode
    const [reset, setReset] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState<GeneratedResult>();
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [undoStack, setUndoStack] = useState<ImageData[]>([]);
    const [redoStack, setRedoStack] = useState<ImageData[]>([]);
    const [infoModalOpen, setInfoModalOpen] = useState(false);

    // Define all functions first
    const renderLatexToCanvas = useCallback((expression: string, answer: string) => {
        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression((prev) => [...prev, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = isDarkMode ? 'black' : 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [isDarkMode]);

    const resetCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = isDarkMode ? 'black' : 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [isDarkMode]);

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setUndoStack((prev) => [...prev, imageData]);
                setRedoStack([]);
            }
        }
    }, []);

    const undo = useCallback(() => {
        if (undoStack.length > 0) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const lastState = undoStack[undoStack.length - 1];
                    
                    setRedoStack((prev) => [...prev, currentState]);
                    setUndoStack((prev) => prev.slice(0, -1));
                    
                    ctx.putImageData(lastState, 0, 0);
                }
            }
        }
    }, [undoStack]);

    const redo = useCallback(() => {
        if (redoStack.length > 0) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const nextState = redoStack[redoStack.length - 1];
                    
                    setUndoStack((prev) => [...prev, currentState]);
                    setRedoStack((prev) => prev.slice(0, -1));
                    
                    ctx.putImageData(nextState, 0, 0);
                }
            }
        }
    }, [redoStack]);

    const runRoute = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dict_of_vars: dictOfVars
                }
            });

            const resp = await response.data;
            resp.data.forEach((data: Response) => {
                if (data.assign === true) {
                    setDictOfVars((prev) => ({
                        ...prev,
                        [data.expr]: data.result
                    }));
                }
            });

            // Calculate center position for latex
            const ctx = canvas.getContext('2d');
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData.data[i + 3] > 0) {
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
        } catch (error) {
            console.error('Error calculating:', error);
            // Handle error appropriately
        }
    }, [dictOfVars]);

    // Then define useEffect hooks
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
            setUndoStack([]);
            setRedoStack([]);
        }
    }, [reset, resetCanvas]);

    useEffect(() => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight * 0.8;
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
                ctx.fillStyle = isDarkMode ? 'black' : 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        setColor(isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)');

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                undo();
            } else if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                redo();
            } else if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                switch (e.key) {
                    case '1':
                        setReset(true);
                        break;
                    case '2':
                        setIsErasing(!isErasing);
                        break;
                    case '3':
                        setIsDarkMode(!isDarkMode);
                        break;
                    case '4':
                        setColor(SWATCHES[0]);
                        setIsErasing(false);
                        break;
                    case '5':
                        setColor(SWATCHES[1]);
                        setIsErasing(false);
                        break;
                    case '6':
                        setColor(SWATCHES[2]);
                        setIsErasing(false);
                        break;
                    case '7':
                        setColor(SWATCHES[3]);
                        setIsErasing(false);
                        break;
                    case '8':
                        setInfoModalOpen(true);
                        break;
                    case '9':
                        runRoute();
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isErasing, isDarkMode, undo, redo, runRoute]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                saveState();
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (isErasing) {
                    ctx.strokeStyle = isDarkMode ? 'black' : 'white';
                    ctx.lineWidth = 20;
                } else {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                }
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex flex-col">
            {/* Top Toolbar */}
            <div className="h-20 flex items-center justify-between px-6 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                {/* Left Tools Group */}
                <div className="flex gap-4">
                    <div className="tool-button-container">
                        <Button
                            onClick={() => setReset(true)}
                            className='bg-gray-800 text-white tooltip hover:bg-gray-700 transition-all'
                            variant='default'
                            title="Reset Canvas (1)"
                        >
                            <span className="flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z"/>
                                    <path d="M15 9l-6 6M9 9l6 6"/>
                                </svg>
                                Reset
                                <span className="text-xs text-gray-400 mt-1">[1]</span>
                            </span>
                        </Button>
                    </div>

                    <div className="tool-button-container">
                        <Button
                            onClick={() => setIsErasing(!isErasing)}
                            className={`${isErasing ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'} text-white tooltip transition-all`}
                            variant='default'
                            title="Toggle Eraser (2)"
                        >
                            <span className="flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M20 8h-9l-7 7a3 3 0 1 0 3 3h13v-6a4 4 0 0 0-4-4z"/>
                                </svg>
                                {isErasing ? 'Drawing' : 'Eraser'}
                                <span className="text-xs text-gray-400 mt-1">[2]</span>
                            </span>
                        </Button>
                    </div>

                    <div className="tool-button-container">
                        <Button
                            onClick={() => {
                                setIsDarkMode(!isDarkMode);
                                setColor(!isDarkMode ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)');
                            }}
                            className='bg-gray-800 text-white tooltip hover:bg-gray-700 transition-all'
                            variant='default'
                            title="Toggle Dark Mode (3)"
                        >
                            <span className="flex flex-col items-center">
                                {isDarkMode ? (
                                    <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-1.293-7.293l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                                    </svg>
                                )}
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                <span className="text-xs text-gray-400 mt-1">[3]</span>
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Center Color Swatches */}
                <div className="flex gap-4 bg-gray-800/50 p-4 rounded-lg">
                    {SWATCHES.map((swatch, index) => (
                        <div key={swatch} className="color-swatch-container tooltip" title={`Color ${index + 4}`}>
                            <ColorSwatch
                                color={swatch}
                                onClick={() => {
                                    setColor(swatch);
                                    setIsErasing(false);
                                }}
                                className="transform hover:scale-110 transition-transform"
                                style={{ cursor: 'pointer', width: '32px', height: '32px' }}
                            />
                            <span className="text-xs text-gray-400 mt-1">[{index + 4}]</span>
                        </div>
                    ))}
                </div>

                {/* Right Actions Group */}
                <div className="flex gap-4">
                    <div className="tool-button-container">
                        <Button
                            onClick={() => setInfoModalOpen(true)}
                            className='bg-gray-800 text-white rounded-lg w-16 h-16 flex flex-col items-center justify-center hover:bg-gray-700 transition-all'
                            variant='default'
                            title="Help (8)"
                        >
                            <Info size={24} className="mb-1" />
                            <span className="text-xs text-gray-400">[8]</span>
                        </Button>
                    </div>

                    <div className="tool-button-container">
                        <Button
                            onClick={runRoute}
                            className='bg-blue-600 text-white hover:bg-blue-700 transition-all'
                            variant='default'
                            title="Run Calculation (9)"
                        >
                            <span className="flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Run
                                <span className="text-xs text-gray-400 mt-1">[9]</span>
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                id='canvas'
                className='flex-grow cursor-crosshair bg-gradient-to-b from-gray-900 to-black'
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                aria-label="Drawing Canvas"
                role="img"
            />

            {/* Footer */}
            <div className="h-16 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 text-white text-center py-2">
                <h1 className="text-lg font-bold">WaterPlane</h1>
                <p className="text-sm text-gray-400">[ - GDG Tech-O-Thon Project ]</p>
            </div>

            {latexExpression && latexExpression.map((latex, index) => (
                <Draggable
                    key={index}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <div className="absolute p-2 text-white rounded shadow-md">
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
            <InfoModal 
                opened={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
            />
        </div>
    );
}