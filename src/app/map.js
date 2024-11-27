import React from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
    ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

const iconStart = L.icon({
    iconUrl: "/marker-icon.webp",
    iconAnchor: [20, 30],
    iconSize: new L.Point(30, 30),
});
const iconEnd = L.icon({
    iconUrl: "/final.webp",
    iconAnchor: [20, 30],
    iconSize: new L.Point(30, 30),
});

function DetectClick({ setCoordinate }) {
    useMapEvents({
        click: (e) => {
            setCoordinate([e.latlng.lat, e.latlng.lng]);
        },
    });
}

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng]);
    }, [lat, lng]);
    return null;
};

const Map = ({ coordinate, setCoordinate, answerCoords }) => {
    return (
        <MapContainer
            center={[22.370056, 114.1535941]}
            zoom={10.5}
            className="w-screen h-screen fade-in"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            <DetectClick setCoordinate={setCoordinate} />
            {typeof coordinate[0] === "number" && (
                <Marker position={coordinate} icon={iconStart}>
                    <Popup>Plastic starts here</Popup>
                </Marker>
            )}
            {typeof answerCoords[0] === "number" && (
                <Marker position={answerCoords} icon={iconEnd}>
                    <Popup>Plastic ends here</Popup>
                </Marker>
            )}
            <RecenterAutomatically
                lat={
                    typeof answerCoords[0] === "number"
                        ? answerCoords[0]
                        : 22.370056
                }
                lng={
                    typeof answerCoords[1] === "number"
                        ? answerCoords[1]
                        : 114.1535941
                }
            />
        </MapContainer>
    );
};

export default Map;
