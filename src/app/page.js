"use client";

import axios from "axios";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvents,
    ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

const icon = L.icon({ iconUrl: "/images/marker-icon.png" });

function DetectClick({ setCoordinate }) {
    useMapEvents({
        click: (e) => {
            setCoordinate([e.latlng.lat, e.latlng.lng]);
        },
    });
}

export default function Home() {
    const [coordinate, setCoordinate] = useState([null, null]);

    useEffect(() => {
        console.log(coordinate);
        if (typeof coordinate[0] === "number") {
            console.log("before");
            axios
                .get(
                    `https://isitwater-com.p.rapidapi.com/?latitude=${coordinate[0]}&longitude=${coordinate[1]}`,
                    {
                        headers: {
                            "x-rapidapi-key":
                                "1ca6713b92mshe945944449df0d5p115855jsn8f911baafb57",
                            "x-rapidapi-host": "isitwater-com.p.rapidapi.com",
                        },
                    }
                )
                .then((res) => {
                    console.log("done");
                    const isWater = res.data.water;

                    if (isWater) {
                        alert("that is on water");
                    } else {
                        alert("Not on water!!!");
                    }
                });
        }
    }, [coordinate]);
    return (
        <div className="w-screen h-screen">
            <div className="text-white title text-[6vw] w-[60vw] absolute z-[100000]">
                Plastic Tracker
            </div>
            <div className="w-[40vw] h-[40vh] bg-black p-[1vw] z-[1000] fixed">
                <div className="text-white top-[8vw] absolute fade-in text-[1.5vw] w-[35vw]">
                    This is a free tool to see where your plastic goes! Click on
                    the map to see where a piece of plastic will end up after 1
                    month.
                </div>
            </div>

            <MapContainer
                center={[0, 0]}
                zoom={1}
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
                    <Marker position={coordinate} icon={icon}>
                        <Popup>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
