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

function updateTimelineLabel() {
  const selectedDate = getDateFromSlider(slider.value);
  selectedDateLabel.textContent = formatDate(selectedDate);
}

slider.addEventListener("input", updateTimelineLabel);

todayButton.addEventListener("click", () => {
  slider.value = 0;
  selectedDateLabel.textContent = "Today";
});

  view.when(() => {
    view.ui.add(new Home({ view }), "top-left");

    const legend = new Legend({ view });

    view.ui.add(new Expand({
      view,
      content: legend,
      expanded: false
    }), "top-right");

    updateTractorPulse();

    view.watch("extent", updateTractorPulse);
    view.watch("stationary", updateTractorPulse);
  });

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
