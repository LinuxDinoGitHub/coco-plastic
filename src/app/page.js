"use client";

import axios from "axios";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { split } from "postcss/lib/list";
import { useEffect, useState } from "react";

const MapWithNoSSR = dynamic(() => import("./map"), {
    ssr: false,
});

const realdata = require("/model/formatted.json");

function findLeastLossPair(data, target) {
    const [x, y] = target;
    let minLoss = Infinity; // Initialize minimum loss with infinity
    let bestPair = null;
    for (const [pair,_] of Object.entries(data)) {
        const [a, b] = pair.split(",");
        const loss = Math.abs(parseInt(a) - x) + Math.abs(parseInt(b) - y);
        if (loss < minLoss) {
            minLoss = loss;
            bestPair = [a,b];
        }
    };
    return bestPair;
}

let knMultiplier = 1/60;
function nextCoordinate(coords, time){
    console.log(coords)
    let newcoords = findLeastLossPair(realdata,[parseInt(coords[0]),parseInt(coords[1])]);
    console.log(newcoords)
    let info = realdata[newcoords.join(",")][time]
    let newlong = parseInt(info[0]) * knMultiplier * Math.cos(Math.abs(180-parseInt(info[1]))) + newcoords[0];
    let newlat = parseInt(info[0]) * knMultiplier * Math.sin(Math.abs(180-parseInt(info[1]))) + newcoords[1];
    return findLeastLossPair(realdata,[newlong,newlat]);
}

function tomorrow(time){
    const date = new Date(time);
    return date.getDate() + 1;
}

export default function Home() {
    const [coordinate, setCoordinate] = useState([null, null]);
    const [answerCoords, setAnswerCoords] = useState([null, null]);
    const [time, setTime] = useState("2024-11-01");

    useEffect(() => {
        if (coordinate[0] !== null) {
            /* axios
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
                    axios
                        .get(
                            `https://api.opencagedata.com/geocode/v1/json?q=${coordinate[0]}%2C${coordinate[1]}&key=f7263551ec984098b10cd12af7b5eef5`
                        )
                        .then((res2) => {
                            console.log(res2);
                            const isHK =
                                res2.data.results[0].components[
                                    "ISO_3166-2"
                                ][0] === "CN-HK";
                    const isWater = res.data.water;
                    if (isWater && isHK) {
                        alert("that is on water and in hk");
                                // determine the coords, and do setAnswerCoords([latitude, longitude])
                    } else {
                                alert("Not on water or not in HK!!!");
                    }
                    
                        });
                }); */
            setAnswerCoords(nextCoordinate(answerCoords,time));
            setTime(tomorrow(time));
            console.log(answerCoords);
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

            <MapWithNoSSR
                coordinate={coordinate}
                answerCoords={answerCoords}
                setCoordinate={setCoordinate}
            />
        </div>
    );
}
