'use client';

import React, { useState, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Save, Sparkles } from 'lucide-react';

const selector = (state: any) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
});

interface MapCanvasProps {
    mapId: string;
    initialData?: {
        nodes: any[];
        edges: any[];
    };
}

function MapCanvasContent({ mapId, initialData }: MapCanvasProps) {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges } = useStore(selector);
    const { setCenter, getNodes } = useReactFlow();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Initialize with data from DB or empty state
    useEffect(() => {
        setIsMounted(true);
        if (initialData) {
            setNodes(initialData.nodes || []);
            setEdges(initialData.edges || []);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [initialData, setNodes, setEdges]);

    const handleChat = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
        const currentPrompt = prompt;
        setPrompt(''); // Clear input early

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    mapId: mapId
                }),
            });

            const response = await res.json();
            const { intent, data } = response;

            if (data.responseText) {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: data.responseText
                }]);
            }

            if (intent === "MIND_MAP" || intent === "STORE_MEMORY") {
                if (data.nodes && data.nodes.length > 0) {
                    // Merge new nodes (simple append for now, relying on unique IDs)
                    // In a real app, we might check for duplicates
                    const newNodes = data.nodes.filter((n: any) => !nodes.some((en: any) => en.id === n.id));
                    const newEdges = data.edges.filter((e: any) => !edges.some((ee: any) => ee.id === e.id));

                    setNodes([...nodes, ...newNodes]);
                    setEdges([...edges, ...newEdges]);
                }
            }

            // Monitor Functionality: Zoom to centerNodeId
            if (data.centerNodeId) {
                // We need to wait for state update to render nodes before we can center?
                // Or we can just center on the coordinates if we have them in data.nodes
                // If the node is existing, we need to find it.

                setTimeout(() => {
                    const targetNode = data.nodes?.find((n: any) => n.id === data.centerNodeId)
                        || getNodes().find(n => n.id === data.centerNodeId);

                    if (targetNode) {
                        setCenter(targetNode.position.x, targetNode.position.y, { zoom: 1.5, duration: 1000 });
                    }
                }, 100); // Small delay to allow React Flow to update
            }

        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/save-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: mapId,
                    mapData: { nodes, edges },
                    concept: chatHistory.length > 0
                        ? chatHistory[chatHistory.length - 2]?.content || "Mind Map"
                        : "Mind Map",
                }),
            });

            const data = await res.json();

            if (data.success) {
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: '✓ Mind map saved successfully!'
                }]);
            }
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: '✗ Failed to save. Please try again.'
            }]);
        } finally {
            setSaving(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    };

    if (!isMounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="ml-3 text-gray-600">Loading Canvas...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Chat Interface - Left Side */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        MindGen Assistant
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">Your Second Brain</p>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-gray-400 mt-8">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Start by describing what you want to map</p>
                            <p className="text-xs mt-2">Example: "AI and Machine Learning concepts"</p>
                        </div>
                    )}

                    {chatHistory.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2 mb-3">
                        <Input
                            key={mapId}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question or describe a memory..."
                            className="flex-1"
                            disabled={loading}
                        />
                        <Button
                            onClick={handleChat}
                            disabled={loading || !prompt.trim()}
                            size="icon"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving || nodes.length === 0}
                        variant="outline"
                        className="w-full"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Mind Map
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Mind Map Canvas - Right Side */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>

                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-gray-300">
                            <div className="text-6xl mb-4">🧠</div>
                            <p className="text-lg font-medium">Your mind map will appear here</p>
                            <p className="text-sm mt-2">Use the chat to generate nodes</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MapCanvas(props: MapCanvasProps) {
    return (
        <ReactFlowProvider>
            <MapCanvasContent {...props} />
        </ReactFlowProvider>
    );
}
