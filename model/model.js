const csv = require("csv-parser");
const fs = require("fs");
const results = [];
let sorted = {};

fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
        results.forEach((curr) => {
            const latlng = [curr.LATITUDE, curr.LONGITUDE];
            if (sorted[latlng]) {
                sorted[latlng][curr.DATE] = [
                    curr["0000-KNOT"],
                    curr["0000-DEG"],
                ];
            } else {
                sorted[latlng] = {
                    [curr.DATE]: [curr["0000-KNOT"], curr["0000-DEG"]],
                };
            }
        });
        fs.writeFile(
            "formatted.json",
            JSON.stringify(sorted),
            "utf8",
            (err) => {
                if (err) {
                    console.error(err);
                } else {
                    // file written successfully
                }
            }
        );
    });
