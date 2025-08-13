// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { Vector3, Euler } from "three";

type MarkerElement = HTMLElement & {
    object3D: {
        position: Vector3;
        rotation: Euler;
    };
};

export default function CustomMarkerAR() {
    const markerRef = useRef<MarkerElement | null>(null);

    useEffect(() => {
        const markerEl = markerRef.current;
        if (markerEl) {
            const handleMarkerFound = () => {
                console.log("✅ Marker found!");
                console.log("Position:", markerEl.object3D.position);
                console.log("Rotation:", markerEl.object3D.rotation);
                console.log("Marker pixel width:", getMarkerPixelSize(markerEl), "px");
            };
            const handleMarkerLost = () => {
                console.log("❌ Marker lost!");
            };
            markerEl.addEventListener("markerFound", handleMarkerFound);
            markerEl.addEventListener("markerLost", handleMarkerLost);

            return () => {
                markerEl.removeEventListener("markerFound", handleMarkerFound);
                markerEl.removeEventListener("markerLost", handleMarkerLost);
            };
        }
    }, []);

    function getMarkerPixelSize(markerEl: MarkerElement) {
        const scene = markerEl.sceneEl.object3D;
        const camera = markerEl.sceneEl.camera;

        // Assume the marker is 1 unit wide in world coordinates
        const halfWidth = 0.5;

        // Two opposite corners in marker's local space
        const corner1 = new Vector3(-halfWidth, 0, 0);
        const corner2 = new Vector3(halfWidth, 0, 0);

        // Convert local coords → world coords
        markerEl.object3D.localToWorld(corner1);
        markerEl.object3D.localToWorld(corner2);

        // Project to normalized device coords (NDC)
        corner1.project(camera);
        corner2.project(camera);

        // Convert NDC → pixels
        const width = window.innerWidth;
        const height = window.innerHeight;
        const p1 = { x: ((corner1.x + 1) / 2) * width, y: ((-corner1.y + 1) / 2) * height };
        const p2 = { x: ((corner2.x + 1) / 2) * width, y: ((-corner2.y + 1) / 2) * height };

        // Distance in pixels
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <a-scene
                vr-mode-ui="enabled: false"
                embedded
                arjs="trackingMethod: best; sourceType: webcam;"
            >
                <a-marker
                    ref={markerRef as React.RefObject<HTMLElement>}
                    id="custom-marker"
                    type="pattern"
                    url="/qr1.patt"
                    emitevents="true"
                >
                    <a-box position="0 0.5 0" material="color: red;"></a-box>
                </a-marker>
                <a-entity camera></a-entity>
            </a-scene>
        </div>
    );
}
