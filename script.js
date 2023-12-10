$(document).ready(function () {

    window.StaticMode = {};
    window.StaticMode.onSetup = function () {
        this.setActionableState();
        return {}
    };
    window.StaticMode.toDisplayFeatures = function (a, b, c) {
        c(b)
    };
    mapboxgl.accessToken = "pk.eyJ1IjoiamV0aGFuaXlhLTIwIiwiYSI6ImNsa3V0dHNnbjBtejMzcW5kZmtqdmtya2cifQ.yNn4vssFvTHwVDqHQkIw7A";
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [-122.0335878, 37.2639724],
        zoom: 18
    });
    $("#addbutton").hide();
    $("#editbutton").hide();
    $("#savebutton").hide();
    $(".area").hide();
    $(".map_notes").hide();
    var features, data, mapCoordinates, flag = 0,
        modes = MapboxDraw.modes;
    modes.static = StaticMode;
    var draw = new MapboxDraw({
        modes,
        styles: [{
            id: "gl-draw-line",
            type: "line",
            filter: ["all", ["==", "$type", "LineString"],
                ["!=", "mode", "static"]
            ],
            layout: {
                "line-cap": "round",
                "line-join": "round"
            },
            paint: {
                "line-color": "#D20C0C",
                "line-dasharray": [.2, 2],
                "line-width": 2
            }
        }, {
            id: "gl-draw-polygon-fill",
            type: "fill",
            filter: ["all", ["==", "$type", "Polygon"],
                ["!=", "mode", "static"]
            ],
            paint: {
                "fill-color": "#D20C0C",
                "fill-outline-color": "#D20C0C",
                "fill-opacity": .1
            }
        }, {
            id: "gl-draw-polygon-midpoint",
            type: "circle",
            filter: ["all", ["==",
                "$type", "Point"
            ],
                ["==", "meta", "midpoint"]
            ],
            paint: {
                "circle-radius": 3,
                "circle-color": "#fbb03b"
            }
        }, {
            id: "gl-draw-polygon-stroke-active",
            type: "line",
            filter: ["all", ["==", "$type", "Polygon"],
                ["!=", "mode", "static"]
            ],
            layout: {
                "line-cap": "round",
                "line-join": "round"
            },
            paint: {
                "line-color": "#D20C0C",
                "line-dasharray": [.2, 2],
                "line-width": 2
            }
        }, {
            id: "gl-draw-polygon-and-line-vertex-halo-active",
            type: "circle",
            filter: ["all", ["==", "meta", "vertex"],
                ["==", "$type", "Point"],
                ["!=", "mode", "static"]
            ],
            paint: {
                "circle-radius": 5,
                "circle-color": "#FFF"
            }
        },
        {
            id: "gl-draw-polygon-and-line-vertex-active",
            type: "circle",
            filter: ["all", ["==", "meta", "vertex"],
                ["==", "$type", "Point"],
                ["!=", "mode", "static"]
            ],
            paint: {
                "circle-radius": 3,
                "circle-color": "#D20C0C"
            }
        }
        ]
    });
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl
    });
    document.getElementById("search-box").appendChild(geocoder.onAdd(map));
    map.addControl(new mapboxgl.NavigationControl, "top-right");
    map.scrollZoom.disable();
    var map2 = new mapboxgl.Map({
        container: "map2",
        style: "mapbox://styles/mapbox/light-v10",
        center: [-122.0335878, 37.2639724],
        zoom: 18
    });
    map.on("load", function () {
        geocoder.on("result", a => {
            if (1 == flag) {
                var b = draw.getAll();

                b.features.forEach(c => {
                    map.setLayoutProperty((0).toString(), "visibility", "none")
                });
                draw.deleteAll();
                flag = 0
            }
            result = a.result;
            map.flyTo({
                center: result.center,
                zoom: 18
            })
        });
        geocoder.on("result", async a => {
            result = a.result;
            map2.flyTo({
                center: result.center,
                zoom: 18
            });
            await map2.once("idle");
            fun()
        })
    });
    async function fun() {
        features = map2.queryRenderedFeatures([$("#map2").width() / 2, $("#map2").height() / 2], {
            layers: ["building"]
        });
        0 < features.length ? ($("#editbutton").show(), $("#seePricebutton").show(), $(".roof_main_type").show(), $("#addbutton").hide(), $(".area").show(), $("#savebutton").hide(), $(".controls_map_ul").hide(), $(".map_notes").hide(), drawPolygons(features)) : ($(".area").hide(), $("#addbutton").show(), $("#savebutton").hide(), $("#editbutton").hide(), $(".controls_map_ul").hide(), $("#seePricebutton").hide(),
            $(".roof_main_type").hide())
    }

    function drawPolygons(a) {
        var b = 0,
            c = 0;
        a.forEach(d => {
            mapCoordinates = d.geometry.coordinates;
            d = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: mapCoordinates
                }
            };
            map.getLayer(b.toString()) && map.removeLayer(b.toString());
            map.getSource(b.toString()) && map.removeSource(b.toString());
            map.addSource(b.toString(), {
                type: "geojson",
                data: d
            });
            map.addLayer({
                id: b.toString(),
                type: "fill",
                source: b.toString(),
                paint: {
                    "fill-color": "#FF9933",
                    "fill-opacity": .5
                }
            });
            b++;
            c += 10.76 * turf.area(d)
        });
        $(".area").show();
        $("#areaofroof").text(Math.round(c))
    }
    var drawnPolygons = [];
    $(document).on("click", "#addbutton", () => {
        $(".map_notes").show();
        $(".map_notes").find("span").text("select the area of your roof");
        $("#addbutton").hide();
        $("#savebutton").show();
        $(".delete-polygon-icon").addClass("disable_trash_icon");
        $(".controls_map_ul").show();
        map.hasControl(draw) || map.addControl(draw, "top-left");
        draw.changeMode("draw_polygon");
        map.on("draw.create", updateArea);
        map.on("draw.delete", updateArea);
        map.on("draw.update", updateArea)
    });
    $(document).on("click", "#editbutton", function () {
        $(".map_notes").show();
        $(".map_notes").find("span").text("Select a corner to move or delete it");
        $(".controls_map_ul").show();
        $("#editbutton").hide();
        $("#savebutton").show();
        $("#seePricebutton").hide();
        $(".roof_main_type").hide();
        map.hasControl(draw) || map.addControl(draw, "top-left");
        data = draw.getAll();
        flag = 1;
        var a = 0;
        if (0 < data.features.length) data.features.forEach(b => {
            map.setLayoutProperty(a.toString(), "visibility", "none");
            draw.changeMode("simple_select", {
                featureIds: [data.features[a].id]
            });
            a++
        });
        else {
            const b = map.getSource(a.toString())._data;
            features.forEach(c => {
                draw.add(b);
                c = draw.getAll();
                draw.changeMode("simple_select", {
                    featureIds: [c.features[a].id]
                });
                map.setLayoutProperty(a.toString(), "visibility", "none");
                a++
            })
        }
        0 < draw.getSelected().features.length ? $(".delete-polygon-icon").removeClass("disable_trash_icon") : $(".delete-polygon-icon").addClass("disable_trash_icon");
        map.on("draw.create", updateArea);
        map.on("draw.delete", updateArea);
        map.on("draw.update",
            updateArea)
    });
    var clickCount = 0;
    map.on("click", function () {
        clickCount++;
        var a = draw.getSelected(),
            b = draw.getAll(),
            c = draw.getMode();
        if (0 == a.features.length && 0 < b.features.length) $(".delete-polygon-icon").addClass("disable_trash_icon"), "draw_polygon" == c && 1 <= clickCount && 3 >= clickCount ? ($(".delete-polygon-icon").removeClass("disable_trash_icon"), $(".map_notes").find("span").text("Click to continue drawing the roof")) : "draw_polygon" == c && 4 <= clickCount ? ($(".delete-polygon-icon").removeClass("disable_trash_icon"), $(".map_notes").find("span").text("Click the first point to close this shape")) :
            ($(".delete-polygon-icon").addClass("disable_trash_icon"), $(".map_notes").find("span").text("Select a roof to edit"));
        else if (0 == a.features.length && 0 == b.features.length) "draw_polygon" == c && 1 <= clickCount && 3 >= clickCount ? ($(".map_notes").find("span").text("Click to continue drawing the roof"), $(".delete-polygon-icon").removeClass("disable_trash_icon")) : "draw_polygon" == c && 4 <= clickCount && ($(".delete-polygon-icon").removeClass("disable_trash_icon"), $(".map_notes").find("span").text("Click the first point to close this shape"));
        else if (0 < a.features.length && 0 < b.features.length) {
            if ("simple_select" == c || "direct_select" == c) clickCount = 0;
            $(".map_notes").find("span").text("Select a corner to move or delete it");
            $(".delete-polygon-icon").removeClass("disable_trash_icon")
        }
    });
    $(document).on("click", "#savebutton", () => {
        $(".mapboxgl-ctrl-top-left").hide();
        $("#savebutton").hide();
        $(".area").show();
        $(".map_notes").hide();
        $(".controls_map_ul").hide();
        $("#seePricebutton").show();
        $(".roof_main_type").show();
        data = draw.getAll();
        0 < data.features.length && null != data.features[0].geometry.coordinates[0][0] ? (flag = 1, $(".area").show(), drawPolygons(data.features), map.on("draw.update", updateArea), $("#editbutton").show(), $("#addbutton").hide(), $("#seePricebutton").show(), $(".roof_main_type").show()) :
            ($("#seePricebutton").hide(), $(".roof_main_type").hide(), $(".area").hide(), $("#addbutton").show(), $("#editbutton").hide());
        draw.changeMode("static")
    });

    function updateArea(a) {
        a = draw.getAll();
        if (0 < a.features.length) {
            $(".area").show();
            var b = turf.area(a);
            b = Math.round(100 * b / 100 * 10.76);
            $("#areaofroof").text(b)
        } else $(".area").hide(), $(".delete-polygon-icon").addClass("disable_trash_icon"), $(".map_notes").show(), $(".map_notes").find("span").text("Select area of your roof"), $("#areaofroof").text("00");
        return a
    }
    $(".delete-polygon-icon").on("click", function () {
        $(".delete-polygon-icon").addClass("disable_trash_icon");
        draw.trash();
        0 < draw.getSelected().features.length && $(".delete-polygon-icon").removeClass("disable_trash_icon");
        if ("direct_select" === draw.getMode()) {
            var a = draw.getAll();
            draw.changeMode("simple_select", {
                featureIds: [a.features[0].id]
            })
        }
    });
    $(".add-polygon-icon").on("click", function () {
        draw.changeMode("draw_polygon");
        $(".map_notes").show();
        $(".map_notes").find("span").text("Click to start drawing a roof");
        $(".delete-polygon-icon").addClass("disable_trash_icon")
    });

});