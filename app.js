require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/widgets/Expand"
], function(WebMap, MapView, Home, Legend, Expand) {

  const webmap = new WebMap({
    portalItem: {
      id: "a21cf93379e24254be6f18b715b30887",
      portal: {
        url: "https://iopbuilding.maps.arcgis.com"
      }
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: webmap,
    center: [-79.765331, 32.792202],
    scale: 36111.909643
  });

  const tractorPulse = document.getElementById("tractorPulse");
  const slider = document.getElementById("dateSlider");
  const selectedDateLabel = document.getElementById("selectedDateLabel");
  const todayButton = document.getElementById("todayButton");

  const projectStart = new Date("2026-07-01T00:00:00");
  const projectEnd = new Date("2026-10-01T00:00:00");

  const forecastWaypoints = [
    { date: new Date("2026-07-01T00:00:00"), lon: -79.7518, lat: 32.8019 },
    { date: new Date("2026-07-15T00:00:00"), lon: -79.7595, lat: 32.7978 },
    { date: new Date("2026-08-01T00:00:00"), lon: -79.7685, lat: 32.7934 },
    { date: new Date("2026-08-15T00:00:00"), lon: -79.7800, lat: 32.7868 },
    { date: new Date("2026-09-01T00:00:00"), lon: -79.7945, lat: 32.7788 },
    { date: new Date("2026-10-01T00:00:00"), lon: -79.8155, lat: 32.7628 }
  ];

  view.when(() => {
    view.ui.add(new Home({ view }), "top-left");

    const legend = new Legend({ view });

    view.ui.add(new Expand({
      view,
      content: legend,
      expanded: false
    }), "top-right");

    slider.addEventListener("input", updateTimeline);
    todayButton.addEventListener("click", () => {
      slider.value = 0;
      updateTimeline();
    });

    view.watch("extent", updateTimeline);
    view.watch("stationary", updateTimeline);

    updateTimeline();
  });

  function getDateFromSlider(value) {
    const start = projectStart.getTime();
    const end = projectEnd.getTime();
    const percent = Number(value) / 100;
    return new Date(start + (end - start) * percent);
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    });
  }

  function getForecastPosition(selectedDate) {
    for (let i = 0; i < forecastWaypoints.length - 1; i++) {
      const a = forecastWaypoints[i];
      const b = forecastWaypoints[i + 1];

      if (selectedDate >= a.date && selectedDate <= b.date) {
        const span = b.date.getTime() - a.date.getTime();
        const progress = (selectedDate.getTime() - a.date.getTime()) / span;

        return {
          longitude: a.lon + (b.lon - a.lon) * progress,
          latitude: a.lat + (b.lat - a.lat) * progress
        };
      }
    }

    const last = forecastWaypoints[forecastWaypoints.length - 1];
    return {
      longitude: last.lon,
      latitude: last.lat
    };
  }

  function updateTimeline() {
    const selectedDate = getDateFromSlider(slider.value);
    selectedDateLabel.textContent = formatDate(selectedDate);

    const position = getForecastPosition(selectedDate);

    const screenPoint = view.toScreen({
      type: "point",
      longitude: position.longitude,
      latitude: position.latitude,
      spatialReference: { wkid: 4326 }
    });

    tractorPulse.style.display = "block";
    tractorPulse.style.left = `${screenPoint.x}px`;
    tractorPulse.style.top = `${screenPoint.y}px`;
  }

});  });

  tractorPulse.style.display = "block";
  tractorPulse.style.left = `${screenPoint.x}px`;
  tractorPulse.style.top = `${screenPoint.y}px`;
}

slider.addEventListener("input", updateTimelineLabel);

todayButton.addEventListener("click", () => {
  slider.value = 0;
  updateTimelineLabel();
});

  view.when(() => {
    view.ui.add(new Home({ view }), "top-left");

    const legend = new Legend({ view });

    view.ui.add(new Expand({
      view,
      content: legend,
      expanded: false
    }), "top-right");

    updateTimelineLabel();

view.watch("extent", updateTimelineLabel);
view.watch("stationary", updateTimelineLabel);
  });

  function getForecastPosition(selectedDate) {
  for (let i = 0; i < forecastWaypoints.length - 1; i++) {
    const a = forecastWaypoints[i];
    const b = forecastWaypoints[i + 1];

    if (selectedDate >= a.date && selectedDate <= b.date) {
      const span = b.date.getTime() - a.date.getTime();
      const progress = (selectedDate.getTime() - a.date.getTime()) / span;

      return {
        longitude: a.lon + (b.lon - a.lon) * progress,
        latitude: a.lat + (b.lat - a.lat) * progress
      };
    }
  }

  const last = forecastWaypoints[forecastWaypoints.length - 1];
  return {
    longitude: last.lon,
    latitude: last.lat
  };
}

  function updateTractorPulse() {
    const tractorLayer = webmap.layers.find(layer =>
      layer.title &&
      layer.title.toLowerCase().includes("current")
    );

    if (!tractorLayer || !tractorLayer.queryFeatures) {
      tractorPulse.style.display = "none";
      return;
    }

    tractorLayer.queryFeatures({
      where: "1=1",
      returnGeometry: true,
      outFields: ["*"],
      num: 1
    }).then(results => {
      if (!results.features.length) {
        tractorPulse.style.display = "none";
        return;
      }

      const point = results.features[0].geometry;
      const screenPoint = view.toScreen(point);

      tractorPulse.style.display = "block";
      tractorPulse.style.left = `${screenPoint.x}px`;
      tractorPulse.style.top = `${screenPoint.y}px`;
    });
  }

});
