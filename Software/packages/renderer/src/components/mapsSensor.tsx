import React, { useRef, useEffect, useState } from 'react';

export function Mapsensor(){
    return (
        <div 
            className="relative h-full w-full"
            style={{
                backgroundImage: "url('/tunelTest.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            {/* Cards flotando encima */}
            <div className="absolute top-10 left-10 bg-white shadow-lg p-4 rounded">
                Card 1
            </div>
            <div className="absolute bottom-10 right-10 bg-white shadow-lg p-4 rounded">
                Card 2
            </div>
        </div>

    );
}