'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const selector = (state: any) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
});

export default function MapCanvas({ mapId }: { mapId: string }) {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges } = useStore(selector);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const res = await fetch('/api/generate-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (data.nodes) {
                // Simple merge strategy: append new nodes/edges
                // In a real app, we might want smarter layout or replacement
                setNodes([...nodes, ...data.nodes]);
                setEdges([...edges, ...data.edges]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await fetch('/api/save-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: mapId,
                    mapData: { nodes, edges },
                    concept: prompt || "Updated Mind Map", // Use last prompt as concept or default
                }),
            });
            alert('Saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save');
        }
    };

    return (
        <div className="w-full h-screen">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-center" className="bg-white p-4 rounded-lg shadow-lg flex gap-2">
                    <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="What do you want to map?"
                        className="w-64"
                    />
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Generate'}
                    </Button>
                    <Button variant="outline" onClick={handleSave}>Save</Button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
