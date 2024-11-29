"use client";

import { Slider } from "@mui/material";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { split } from "postcss/lib/list";
import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";

const MapWithNoSSR = dynamic(() => import("./map"), {
    ssr: false,
});

const realdata = require("/model/formatted.json");

function findLeastLossPair(data, target) {
    const [x, y] = target;
    let minLoss = Infinity; // Initialize minimum loss with infinity
    let bestPair = null;
    let secondBestPair = null; // Second pair to simulate randomness and increase system entropy
    for (const [pair, _] of Object.entries(data)) {
        const [a, b] = pair.split(",");
        const loss = Math.abs(parseFloat(a) - x) + Math.abs(parseFloat(b) - y);
        if (loss < minLoss) {
            minLoss = loss;
            secondBestPair = bestPair;
            bestPair = [a, b];
        }
    }
    if(Math.random() < 0.6){
        return bestPair;
    }
    else{
        return secondBestPair;
    }
    
}

let knMultiplier = 1/60; // 1/60 conversion rate from knots to longitudinal length (1 minute or something like that)
function nextCoordinate(coords, time) {
    let newcoords = findLeastLossPair(realdata, [
        parseFloat(coords[0]),
        parseFloat(coords[1]),
    ]);
    let info = realdata[newcoords.join(",")][time];
    let newlong =
        parseFloat(info[0]) *
            knMultiplier *
            Math.cos(Math.abs(180 - parseFloat(info[1]))) +
        parseFloat(newcoords[0]);
    let newlat =
        parseFloat(info[0]) *
            knMultiplier *
            Math.sin(Math.abs(180 - parseFloat(info[1]))) +
        parseFloat(newcoords[1]);
    // supposed to have findLeastLossPair(realdata,
    return [newlong, newlat];
}

function tomorrow(time) {
    let date = new Date(time);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
}

export default function Home() {
    const [coordinate, setCoordinate] = useState([null, null]);
    const [answerCoords, setAnswerCoords] = useState([[null, null]]);
    const [time, setTime] = useState("2024-11-01");
    const [howManyDays, setDays] = useState(10);

    useEffect(() => {
        if (coordinate[0] !== null) {
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
                    axios
                        .get(
                            `https://api.opencagedata.com/geocode/v1/json?q=${coordinate[0]}%2C${coordinate[1]}&key=f7263551ec984098b10cd12af7b5eef5`
                        )
                        .then((res2) => {
                            const isHK =
                                res2.data.results[0].components[
                                    "ISO_3166-2"
                                ][0] === "CN-HK";
                            const isWater = res.data.water;
                            if (isWater && isHK) {
                                // determine the coords, and do setAnswerCoords([latitude, longitude])
                                const finalArr = [coordinate];
                                for (let i = 0; i < 30; i++) {
                                    finalArr.push(
                                        nextCoordinate(
                                            finalArr[finalArr.length - 1],
                                            time
                                        ).map((curr) => parseFloat(curr))
                                    );
                                    setTime(tomorrow(time));
                                }
                                console.log(finalArr)
                                setAnswerCoords(finalArr);
                            } else {
                                alert("Not on water or not in HK!!!");
                            }
                        });
                });
        }
    }, [coordinate]);
    if (typeof window !== "undefined") {
        return (
            <div className="w-screen h-screen">
                <div className="text-white title text-[6vw] w-[60vw] absolute z-[100000]">
                    Plastic Tracker
                </div>
                <div className="w-[40vw] h-[40vh] bg-black p-[1vw] z-[1000] fixed">
                    <div className="text-white top-[8vw] absolute fade-in text-[1.5vw] w-[35vw]">
                    This is a free tool to see where your plastic goes! 
                    Click on the map to see where a piece of plastic will end up. 
                    You can adjust the amount of time with the slider below.
                    </div>
                </div>

                <MapWithNoSSR
                    coordinate={coordinate}
                    answerCoords={
                        answerCoords[0][0]
                            ? answerCoords[howManyDays]
                            : [null, null]
                    }
                    setCoordinate={setCoordinate}
                >
                    <Polyline pathOptions={{color: 'lime'}} positions={answerCoords} />
                </MapWithNoSSR>
                <div className="absolute bottom-[5vh] min-width-[50vw] left-0 right-0 ms-auto me-auto w-fit bg-black fade-in p-[2vw]">
                    <div className="text-[1.5vw] font-bold ">
                        Turn this slider to change the time!
                    </div>
                    <Slider
                        sx={{
                            width: window.innerWidth * 0.5,
                        }}
                        value={howManyDays}
                        onChange={(e, newValue) => {
                            setDays(newValue);
                        }}
                        min={1}
                        max={30}
                        valueLabelDisplay="auto"
                        step={1}
                    />
                </div>
            </div>
        );
    }
}
